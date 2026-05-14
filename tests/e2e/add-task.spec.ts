import { test } from '@playwright/test';
import { TodoPage } from './pages/TodoPage';

test.describe('Add Task Journey', () => {
  test.beforeEach(async ({ page }) => {
    const todo = new TodoPage(page);
    await todo.goto();
  });

  test('adds a task with title only', async ({ page }) => {
    const todo = new TodoPage(page);
    const taskTitle = `E2E add title ${Date.now()}`;

    await todo.addTask(taskTitle);
    await todo.expectTaskVisible(taskTitle);
  });
});
