import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

const initialTasks = [
  { id: 1, title: 'Test Task 1', completed: false, dueDate: '2026-05-20' },
  { id: 2, title: 'Test Task 2', completed: true, dueDate: null },
];

let fetchMock;

beforeEach(() => {
  fetchMock = jest.spyOn(global, 'fetch').mockImplementation((url, options = {}) => {
    if (url.startsWith('/api/tasks?')) {
      return Promise.resolve({ ok: true, json: async () => initialTasks });
    }

    if (url === '/api/tasks' && options.method === 'POST') {
      return Promise.resolve({
        ok: true,
        json: async () => ({ id: 3, title: 'New Task', completed: false, dueDate: null }),
      });
    }

    if (url === '/api/tasks/1' && options.method === 'PATCH') {
      return Promise.resolve({
        ok: true,
        json: async () => ({ id: 1, title: 'Test Task 1', completed: true, dueDate: '2026-05-20' }),
      });
    }

    if (url === '/api/tasks/1' && options.method === 'DELETE') {
      return Promise.resolve({ ok: true, json: async () => ({ message: 'Task deleted successfully', id: 1 }) });
    }

    return Promise.resolve({ ok: true, json: async () => [] });
  });
});

afterEach(() => {
  fetchMock.mockRestore();
});

describe('App Component', () => {
  test('renders header and loads tasks', async () => {
    render(<App />);

    expect(screen.getByText('TODO App')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    });
  });

  test('adds a new task', async () => {
    const user = userEvent.setup();

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    await user.type(screen.getByRole('textbox', { name: /task title/i }), 'New Task');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/tasks', expect.objectContaining({ method: 'POST' }));
    });
  });

  test('toggles completion', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText('Mark Test Task 1 as complete'));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/tasks/1', expect.objectContaining({ method: 'PATCH' }));
    });
  });
});