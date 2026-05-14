import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import './App.css';

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest first' },
  { value: 'createdAt-asc', label: 'Oldest first' },
  { value: 'dueDate-asc', label: 'Due date (earliest)' },
  { value: 'dueDate-desc', label: 'Due date (latest)' },
  { value: 'completionStatus-asc', label: 'Incomplete first' },
  { value: 'completionStatus-desc', label: 'Complete first' },
  { value: 'title-asc', label: 'Title (A-Z)' },
  { value: 'title-desc', label: 'Title (Z-A)' },
];

const toInputDate = isoDate => {
  if (!isoDate) {
    return '';
  }

  return isoDate.slice(0, 10);
};

const formatDueDate = isoDate => {
  if (!isoDate) {
    return 'No due date';
  }

  return new Date(isoDate).toLocaleDateString();
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [sortValue, setSortValue] = useState('createdAt-desc');
  const [mode, setMode] = useState('dark');
  const [announcement, setAnnouncement] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState('');

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  const getSortParams = () => {
    const [sortBy, sortDirection] = sortValue.split('-');
    return new URLSearchParams({ sortBy, sortDirection }).toString();
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tasks?${getSortParams()}`);

      if (!response.ok) {
        throw new Error('Could not load tasks');
      }

      const result = await response.json();
      setTasks(result);
      setError('');
    } catch (err) {
      setError(`Failed to load tasks: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [sortValue]);

  const handleCreateTask = async event => {
    event.preventDefault();

    if (!newTitle.trim()) {
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          dueDate: newDueDate || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Task could not be created');
      }

      setNewTitle('');
      setNewDueDate('');
      setAnnouncement('Task added');
      await fetchTasks();
    } catch (err) {
      setError(`Failed to add task: ${err.message}`);
    }
  };

  const handleDeleteTask = async id => {
    try {
      const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Task could not be deleted');
      }

      setAnnouncement('Task deleted');
      await fetchTasks();
    } catch (err) {
      setError(`Failed to delete task: ${err.message}`);
    }
  };

  const handleToggleCompleted = async task => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (!response.ok) {
        throw new Error('Task completion could not be updated');
      }

      setAnnouncement(task.completed ? 'Task marked incomplete' : 'Task completed');
      await fetchTasks();
    } catch (err) {
      setError(`Failed to update task: ${err.message}`);
    }
  };

  const openEditDialog = task => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDueDate(toInputDate(task.dueDate));
  };

  const handleSaveEdit = async () => {
    if (!editingTask || !editTitle.trim()) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          dueDate: editDueDate || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Task could not be updated');
      }

      setEditingTask(null);
      setAnnouncement('Task updated');
      await fetchTasks();
    } catch (err) {
      setError(`Failed to update task: ${err.message}`);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
              <Box>
                <Typography variant="h4" component="h1">
                  TODO App
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Track, edit, and complete tasks with optional due dates.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                onClick={() => setMode(prev => (prev === 'dark' ? 'light' : 'dark'))}
                aria-label="Toggle dark mode"
              >
                {mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              </Button>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Add task
            </Typography>
            <Box component="form" onSubmit={handleCreateTask}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Task title"
                  value={newTitle}
                  onChange={event => setNewTitle(event.target.value)}
                  required
                />
                <TextField
                  label="Due date"
                  type="date"
                  value={newDueDate}
                  onChange={event => setNewDueDate(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <Button type="submit" variant="contained">
                  Add
                </Button>
              </Stack>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
              <Typography variant="h6">Tasks</Typography>
              <FormControl sx={{ minWidth: 220 }}>
                <InputLabel id="sort-label">Sort tasks</InputLabel>
                <Select
                  labelId="sort-label"
                  label="Sort tasks"
                  value={sortValue}
                  onChange={event => setSortValue(event.target.value)}
                >
                  {SORT_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {loading && <Typography sx={{ mt: 2 }}>Loading tasks...</Typography>}
            {!loading && !tasks.length && <Typography sx={{ mt: 2 }}>No tasks yet. Add one above.</Typography>}

            <List aria-live="polite" aria-label="Task list">
              {tasks.map(task => (
                <ListItem
                  key={task.id}
                  divider
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        aria-label={`Edit ${task.title}`}
                        onClick={() => openEditDialog(task)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        aria-label={`Delete ${task.title}`}
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  }
                >
                  <Checkbox
                    checked={task.completed}
                    onChange={() => handleToggleCompleted(task)}
                    inputProps={{ 'aria-label': `Mark ${task.title} as complete` }}
                  />
                  <ListItemText
                    primary={task.title}
                    secondary={`Due: ${formatDueDate(task.dueDate)}${task.completed ? ' • Completed' : ' • Incomplete'}`}
                    sx={{
                      textDecoration: task.completed ? 'line-through' : 'none',
                      color: task.completed ? 'text.secondary' : 'text.primary',
                      pr: 12,
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Stack>

        {error && (
          <Alert sx={{ mt: 2 }} severity="error" role="alert">
            {error}
          </Alert>
        )}

        <Snackbar
          open={Boolean(announcement)}
          autoHideDuration={2000}
          onClose={() => setAnnouncement('')}
          message={announcement}
        />

        <Dialog open={Boolean(editingTask)} onClose={() => setEditingTask(null)}>
          <DialogTitle>Edit task</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="Task title"
                value={editTitle}
                onChange={event => setEditTitle(event.target.value)}
                required
              />
              <TextField
                label="Due date"
                type="date"
                value={editDueDate}
                onChange={event => setEditDueDate(event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingTask(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}

export default App;