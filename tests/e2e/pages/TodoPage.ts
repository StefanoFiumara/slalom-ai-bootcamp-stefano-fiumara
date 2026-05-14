import { expect, Locator, Page } from '@playwright/test';

export class TodoPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await expect(this.page.getByRole('heading', { name: 'TODO App' })).toBeVisible();
  }

  async addTask(title: string, dueDate?: string): Promise<void> {
    await this.page.getByLabel('Task title').fill(title);
    if (dueDate) {
      await this.page.getByLabel('Due date').first().fill(dueDate);
    }
    await this.page.getByRole('button', { name: 'Add' }).click();
    await expect(this.page.getByText(title)).toBeVisible();
  }

  async openEditDialog(taskTitle: string): Promise<void> {
    await this.page.getByLabel(`Edit ${taskTitle}`).click();
    await expect(this.page.getByRole('dialog')).toBeVisible();
  }

  async saveEdit(title: string, dueDate?: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await dialog.getByLabel('Task title').fill(title);
    if (dueDate !== undefined) {
      await dialog.getByLabel('Due date').fill(dueDate);
    }
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).toBeHidden();
  }

  async toggleTaskCompletion(title: string): Promise<void> {
    await this.page.getByLabel(`Mark ${title} as complete`).click();
  }

  async deleteTask(title: string): Promise<void> {
    await this.page.getByLabel(`Delete ${title}`).click();
  }

  async chooseSort(label: string): Promise<void> {
    await this.page.getByLabel('Sort tasks').click();
    await this.page.getByRole('option', { name: label }).click();
  }

  taskRow(title: string): Locator {
    return this.page.locator('li', { hasText: title });
  }

  async expectTaskVisible(title: string): Promise<void> {
    await expect(this.page.getByText(title)).toBeVisible();
  }

  async expectTaskHidden(title: string): Promise<void> {
    await expect(this.page.getByText(title)).toHaveCount(0);
  }

  async expectTaskCompleted(title: string): Promise<void> {
    await expect(this.taskRow(title)).toContainText('Completed');
  }

  async listTaskTitles(): Promise<string[]> {
    const taskTexts = await this.page.locator('li .MuiListItemText-primary').allTextContents();
    return taskTexts.map(text => text.trim());
  }
}