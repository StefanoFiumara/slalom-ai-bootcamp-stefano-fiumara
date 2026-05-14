import { test } from '@playwright/test';
import { TodoPage } from './pages/TodoPage';

test.describe('Edit Task Journey', () => {
  test.beforeEach(async ({ page }) => {
    const todo = new TodoPage(page);
    await todo.goto();
  });

  test('edits existing task title and due date', async ({ page }) => {
    const todo = new TodoPage(page);
    const original = `E2E edit original ${Date.now()}`;
    const updated = `${original} updated`;

    await todo.addTask(original);
    await todo.openEditDialog(original);
    await todo.saveEdit(updated, '2027-01-15');
    await todo.expectTaskVisible(updated);
    await todo.expectTaskHidden(original);
  });
});