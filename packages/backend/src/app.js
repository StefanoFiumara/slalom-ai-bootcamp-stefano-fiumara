const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize in-memory SQLite database
const db = new Database(':memory:');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    due_date TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

const insertTaskStmt = db.prepare(
  `INSERT INTO tasks (title, due_date) VALUES (?, ?)`
);

const updateTaskStmt = db.prepare(`
  UPDATE tasks
  SET
    title = COALESCE(@title, title),
    due_date = @due_date,
    completed = COALESCE(@completed, completed),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = @id
`);

// Insert some initial data
const initialTasks = ['Pay utility bill', 'Prepare demo', 'Book dentist'];

initialTasks.forEach(title => {
  insertTaskStmt.run(title, null);
});

const mapTask = task => ({
  ...task,
  completed: Boolean(task.completed),
  dueDate: task.due_date,
});

const getTaskById = id => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  return task ? mapTask(task) : null;
};

const sortSqlMap = {
  dueDate: 'ORDER BY due_date IS NULL, due_date',
  completionStatus: 'ORDER BY completed, created_at DESC',
  createdAt: 'ORDER BY created_at',
  title: 'ORDER BY title COLLATE NOCASE',
};

const parseSortOptions = query => {
  const sortBy = query.sortBy || 'createdAt';
  const sortDirection = query.sortDirection === 'asc' ? 'ASC' : 'DESC';

  if (!sortSqlMap[sortBy]) {
    return null;
  }

  return {
    clause: `${sortSqlMap[sortBy]} ${sortDirection}`,
  };
};

console.log('In-memory tasks database initialized with sample data');

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

// API Routes
app.get('/api/tasks', (req, res) => {
  try {
    const sort = parseSortOptions(req.query);

    if (!sort) {
      return res.status(400).json({
        error:
          'Invalid sortBy value. Expected one of: dueDate, completionStatus, createdAt, title',
      });
    }

    const tasks = db.prepare(`SELECT * FROM tasks ${sort.clause}`).all().map(mapTask);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', (req, res) => {
  try {
    const { title, dueDate = null } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Task title is required' });
    }

    if (dueDate !== null && typeof dueDate !== 'string') {
      return res.status(400).json({ error: 'Due date must be a valid ISO date string or null' });
    }

    const result = insertTaskStmt.run(title.trim(), dueDate);
    const id = result.lastInsertRowid;

    const newTask = getTaskById(id);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.patch('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, dueDate, completed } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    const hasAnyField = [title, dueDate, completed].some(v => v !== undefined);
    if (!hasAnyField) {
      return res.status(400).json({ error: 'At least one editable field is required' });
    }

    const existingTask = getTaskById(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
      return res.status(400).json({ error: 'Task title cannot be empty' });
    }

    if (dueDate !== undefined && dueDate !== null && typeof dueDate !== 'string') {
      return res.status(400).json({ error: 'Due date must be a valid ISO date string or null' });
    }

    if (completed !== undefined && typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'Completed must be a boolean' });
    }

    updateTaskStmt.run({
      id: parseInt(id, 10),
      title: title !== undefined ? title.trim() : null,
      due_date: dueDate !== undefined ? dueDate : existingTask.dueDate,
      completed: completed !== undefined ? Number(completed) : null,
    });

    const updatedTask = getTaskById(id);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    const existingTask = getTaskById(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const deleteStmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = deleteStmt.run(id);

    if (result.changes > 0) {
      res.json({ message: 'Task deleted successfully', id: parseInt(id, 10) });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = { app, db, insertTaskStmt };