import { test } from '@playwright/test';
import { TodoPage } from './pages/TodoPage';

test.describe('Complete Task Journey', () => {
  test.beforeEach(async ({ page }) => {
    const todo = new TodoPage(page);
    await todo.goto();
  });

  test('marks task complete and then incomplete', async ({ page }) => {
    const todo = new TodoPage(page);
    const taskTitle = `E2E toggle ${Date.now()}`;

    await todo.addTask(taskTitle);
    await todo.toggleTaskCompletion(taskTitle);
    await todo.expectTaskCompleted(taskTitle);

    await todo.toggleTaskCompletion(taskTitle);
    await todo.taskRow(taskTitle).getByText('Incomplete').waitFor();
  });
});