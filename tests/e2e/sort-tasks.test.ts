import { expect, test } from '@playwright/test';
import { TodoPage } from './pages/TodoPage';

test.describe('Sort Tasks Journey', () => {
  test.beforeEach(async ({ page }) => {
    const todo = new TodoPage(page);
    await todo.goto();
  });

  test('sorts tasks by title ascending', async ({ page }) => {
    const todo = new TodoPage(page);
    const lowTitle = `AAA Sort ${Date.now()}`;
    const highTitle = `ZZZ Sort ${Date.now()}`;

    await todo.addTask(highTitle);
    await todo.addTask(lowTitle);
    await todo.chooseSort('Title (A-Z)');

    const titles = await todo.listTaskTitles();
    expect(titles.indexOf(lowTitle)).toBeGreaterThanOrEqual(0);
    expect(titles.indexOf(highTitle)).toBeGreaterThanOrEqual(0);
    expect(titles.indexOf(lowTitle)).toBeLessThan(titles.indexOf(highTitle));
  });
});