import { test } from '@playwright/test';
import { TodoPage } from './pages/TodoPage';

test.describe('Add Task With Due Date Journey', () => {
  test.beforeEach(async ({ page }) => {
    const todo = new TodoPage(page);
    await todo.goto();
  });

  test('adds a task with an explicit due date', async ({ page }) => {
    const todo = new TodoPage(page);
    const taskTitle = `E2E due date ${Date.now()}`;

    await todo.addTask(taskTitle, '2026-12-25');
    await todo.expectTaskVisible(taskTitle);
    await todo.taskRow(taskTitle).getByText('Due:').waitFor();
  });
});
