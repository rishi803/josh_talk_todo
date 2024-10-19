'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Select,
  MenuItem,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Container,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { SelectChangeEvent } from '@mui/material';
import './styles.css'; // Import the CSS file

interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'completed'>>({
    title: '',
    description: '',
    priority: 'low',
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);

  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      try {
        const parsedTasks: Task[] = JSON.parse(storedTasks);
        setTasks(parsedTasks);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newTask.title || !newTask.description) return;

    if (isEditing && currentTaskId !== null) {
      setTasks(tasks.map(task =>
        task.id === currentTaskId ? { ...newTask, id: currentTaskId, completed: false } : task
      ));
      setIsEditing(false);
      setCurrentTaskId(null);
    } else {
      setTasks([...tasks, { ...newTask, id: Date.now(), completed: false }]);
    }

    setNewTask({ title: '', description: '', priority: 'low' });
  };

  const toggleCompleted = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  const handlePriorityChange = (e: SelectChangeEvent<'high' | 'medium' | 'low'>) => {
    setNewTask({ ...newTask, priority: e.target.value as 'high' | 'medium' | 'low' });
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const startEditTask = (task: Task) => {
    setNewTask({ title: task.title, description: task.description, priority: task.priority });
    setIsEditing(true);
    setCurrentTaskId(task.id);
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedTasks = filteredTasks.sort((a, b) => {
    const priorities = { high: 3, medium: 2, low: 1 };
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return priorities[b.priority] - priorities[a.priority];
  });

  return (
    <Container maxWidth="lg" className="container">
      <AppBar position="static" sx={{ marginBottom: 4 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Task Manager
          </Typography>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ backgroundColor: 'white', borderRadius: 1, marginLeft: 2 }}
          />
        </Toolbar>
      </AppBar>

      <Typography variant="h4" gutterBottom>Task Manager</Typography>

      <div className="mb-4">
        <TextField
          name="title"
          label="Title"
          value={newTask.title}
          onChange={handleInputChange}
          fullWidth
          className="mb-2"
        />
        <TextField
          name="description"
          label="Description"
          value={newTask.description}
          onChange={handleInputChange}
          fullWidth
          className="mb-2"
        />
        <Select
          value={newTask.priority}
          onChange={handlePriorityChange}
          fullWidth
          className="mb-2"
        >
          <MenuItem value="high">High</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="low">Low</MenuItem>
        </Select>
        <Button variant="contained" color="primary" onClick={addTask} fullWidth>
          {isEditing ? 'Update Task' : 'Add Task'}
        </Button>
      </div>

      <List>
        {sortedTasks.map((task) => (
          <ListItem
            key={task.id}
            className={`list-item fade-in ${task.priority === 'high' ? 'bg-red-500' : 
              task.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-500'} 
              ${task.completed ? 'line-through' : ''}`}
          >
            <ListItemText 
              primary={task.title} 
              secondary={`${task.description} - ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} priority`} 
              className="text-black"
            />
            <Button className="edit mr-2" onClick={() => startEditTask(task)}>Edit</Button>
            <Button className={`complete mr-2`} onClick={() => toggleCompleted(task.id)}>
              {task.completed ? 'Undo' : 'Complete'}
            </Button>
            <Button className="delete" onClick={() => deleteTask(task.id)}>Delete</Button>
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
