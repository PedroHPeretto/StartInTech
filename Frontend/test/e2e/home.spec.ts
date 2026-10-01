import { test, expect } from '@playwright/test';

test('deve carregar a aplicação com sucesso', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/startintech/i);
});

