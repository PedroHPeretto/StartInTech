import { expect, test } from '@playwright/test';

const VALID_RAW_TEXT = 'a'.repeat(120);

test.describe('curriculum upload', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.__STARTINTECH_E2E__ = true;
    });

    await page.route('**/api/v1/auth/google', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'e2e-access-token',
          user: { id: 'user-e2e', email: 'e2e@startintech.test' },
          isProfileComplete: true,
        }),
      });
    });
  });

  test('rejects files over 5MB without calling upload-url', async ({ page }) => {
    let uploadUrlCalls = 0;
    await page.route('**/api/v1/resumes/upload-url', async (route) => {
      uploadUrlCalls += 1;
      await route.fulfill({ status: 500, body: 'should not be called' });
    });

    await page.goto('/login');
    await page.getByTestId('google-login-button').click();
    await page.goto('/curriculum/upload');

    await expect(
      page.getByRole('heading', { name: 'Enviar currículo' }),
    ).toBeVisible();

    const oversized = {
      name: 'curriculum.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.alloc(6 * 1024 * 1024, 1),
    };

    await page.getByTestId('upload-dropzone-input').setInputFiles(oversized);

    await expect(page.getByTestId('upload-dropzone-error')).toContainText(
      '5MB',
    );
    expect(uploadUrlCalls).toBe(0);
  });

  test('submits pasted text and shows received panel', async ({ page }) => {
    await page.route('**/api/v1/resumes/submit', async (route) => {
      const payload = route.request().postDataJSON() as {
        mode?: string;
        rawText?: string;
      };
      expect(payload.mode).toBe('RAW_TEXT');
      expect(payload.rawText).toBe(VALID_RAW_TEXT);

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '44444444-4444-4444-8444-444444444444',
          userId: 'user-e2e',
          status: 'RECEIVED',
          createdAt: '2026-01-01T00:00:00.000Z',
        }),
      });
    });

    await page.goto('/login');
    await page.getByTestId('google-login-button').click();
    await page.goto('/curriculum/upload');

    await page.getByTestId('tab-text').click();
    await page.getByTestId('resume-raw-text').fill(VALID_RAW_TEXT);
    await page.getByTestId('resume-text-submit').click();

    await expect(page.getByTestId('resume-received')).toBeVisible();
    await expect(page.getByTestId('resume-received')).toContainText(
      'aguardando processamento',
    );
  });
});
