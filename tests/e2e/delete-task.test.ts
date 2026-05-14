import { test } from '@playwright/test';
import { TodoPage } from './pages/TodoPage';

test.describe('Delete Task Journey', () => {
  test.beforeEach(async ({ page }) => {
    const todo = new TodoPage(page);
    await todo.goto();
  });

  test('deletes an existing task', async ({ page }) => {
    const todo = new TodoPage(page);
    const taskTitle = `E2E delete ${Date.now()}`;

    await todo.addTask(taskTitle);
    await todo.deleteTask(taskTitle);
    await todo.expectTaskHidden(taskTitle);
  });
});