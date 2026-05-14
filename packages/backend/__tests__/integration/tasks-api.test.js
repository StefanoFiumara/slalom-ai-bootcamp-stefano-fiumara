const request = require('supertest');
const { app, db } = require('../../src/app');

const createTask = async ({ title = 'Sample Task', dueDate = null } = {}) => {
  const response = await request(app)
    .post('/api/tasks')
    .send({ title, dueDate })
    .set('Accept', 'application/json');

  expect(response.status).toBe(201);
  return response.body;
};

beforeEach(() => {
  db.exec('DELETE FROM tasks');
});

afterAll(() => {
  if (db) {
    db.close();
  }
});

describe('Tasks API Integration', () => {
  it('creates and fetches tasks through HTTP endpoints', async () => {
    const createdTask = await createTask({ title: 'Write integration tests', dueDate: '2026-05-30' });

    const response = await request(app).get('/api/tasks?sortBy=createdAt&sortDirection=desc');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      id: createdTask.id,
      title: 'Write integration tests',
      completed: false,
      dueDate: '2026-05-30',
    });
  });

  it('updates title, due date, and completion state', async () => {
    const task = await createTask({ title: 'Original title' });

    const patchResponse = await request(app)
      .patch(`/api/tasks/${task.id}`)
      .send({
        title: 'Updated title',
        dueDate: '2026-06-15',
        completed: true,
      });

    expect(patchResponse.status).toBe(200);
    expect(patchResponse.body).toMatchObject({
      id: task.id,
      title: 'Updated title',
      dueDate: '2026-06-15',
      completed: true,
    });
  });

  it('deletes a task and returns not found on repeat delete', async () => {
    const task = await createTask({ title: 'Delete me' });

    const deleteResponse = await request(app).delete(`/api/tasks/${task.id}`);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toEqual({ message: 'Task deleted successfully', id: task.id });

    const secondDelete = await request(app).delete(`/api/tasks/${task.id}`);
    expect(secondDelete.status).toBe(404);
    expect(secondDelete.body).toEqual({ error: 'Task not found' });
  });

  it('sorts tasks by title ascending', async () => {
    await createTask({ title: 'Zulu' });
    await createTask({ title: 'Alpha' });
    await createTask({ title: 'Mike' });

    const response = await request(app).get('/api/tasks?sortBy=title&sortDirection=asc');
    expect(response.status).toBe(200);
    expect(response.body.map(task => task.title)).toEqual(['Alpha', 'Mike', 'Zulu']);
  });

  it('returns 400 for invalid sort field', async () => {
    const response = await request(app).get('/api/tasks?sortBy=priority&sortDirection=asc');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});