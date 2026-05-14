const request = require('supertest');
const { app, db } = require('../src/app');

// Close the database connection after all tests
afterAll(() => {
  if (db) {
    db.close();
  }
});

// Test helpers
const createTask = async ({ title = 'Temp Task to Delete', dueDate = null } = {}) => {
  const response = await request(app)
    .post('/api/tasks')
    .send({ title, dueDate })
    .set('Accept', 'application/json');

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  return response.body;
};

describe('API Endpoints', () => {
  describe('GET /api/tasks', () => {
    it('should return all tasks', async () => {
      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const task = response.body[0];
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('completed');
      expect(task).toHaveProperty('dueDate');
    });

    it('should return 400 for unsupported sort field', async () => {
      const response = await request(app).get('/api/tasks?sortBy=invalid');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const payload = { title: 'Test Task', dueDate: '2026-06-01' };
      const response = await request(app)
        .post('/api/tasks')
        .send(payload)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(payload.title);
      expect(response.body.dueDate).toBe(payload.dueDate);
      expect(response.body.completed).toBe(false);
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({})
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Task title is required');
    });

    it('should return 400 if title is empty', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Task title is required');
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    it('should update task title, due date and completion state', async () => {
      const task = await createTask();

      const response = await request(app)
        .patch(`/api/tasks/${task.id}`)
        .send({ title: 'Updated title', dueDate: '2027-01-20', completed: true });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated title');
      expect(response.body.dueDate).toBe('2027-01-20');
      expect(response.body.completed).toBe(true);
    });

    it('should return 400 when no fields are provided', async () => {
      const task = await createTask();

      const response = await request(app)
        .patch(`/api/tasks/${task.id}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'At least one editable field is required');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete an existing task', async () => {
      const task = await createTask({ title: 'Task To Be Deleted' });

      const deleteResponse = await request(app).delete(`/api/tasks/${task.id}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toEqual({ message: 'Task deleted successfully', id: task.id });

      const deleteAgain = await request(app).delete(`/api/tasks/${task.id}`);
      expect(deleteAgain.status).toBe(404);
      expect(deleteAgain.body).toHaveProperty('error', 'Task not found');
    });

    it('should return 404 when task does not exist', async () => {
      const response = await request(app).delete('/api/tasks/999999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Task not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).delete('/api/tasks/abc');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Valid task ID is required');
    });
  });
});