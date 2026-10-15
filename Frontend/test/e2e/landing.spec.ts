import { expect, test } from '@playwright/test';

test.describe('Landing Page (rota raiz /)', () => {
  test('exibe a landing page para visitante anônimo sem redirecionar', async ({
    page,
  }) => {
    await page.goto('/');

    // Confirma que permaneceu na rota raiz
    await expect(page).toHaveURL(/\/$/);
    await expect(page).toHaveTitle(/startintech/i);

    // Valida hero principal e badges
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /Seu primeiro emprego em tech começa aqui/i,
      }),
    ).toBeVisible();
    await expect(page.getByTestId('hero-eyebrow')).toContainText(
      'Gratuito para estudantes',
    );
    await expect(page.getByTestId('product-mockup')).toBeVisible();

    // Valida seções principais
    await expect(page.getByTestId('pain-points-section')).toBeVisible();
    await expect(page.getByTestId('features-section')).toBeVisible();
    await expect(page.getByTestId('how-it-works-section')).toBeVisible();
    await expect(page.getByTestId('career-tracks-section')).toBeVisible();
    await expect(page.getByTestId('faq-section')).toBeVisible();
    await expect(page.getByTestId('final-cta-section')).toBeVisible();

    // Clicar em "Criar conta grátis" leva a /login
    await page.getByTestId('hero-primary-cta').click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('exibe landing page com botão "Ir para o painel" para usuário autenticado', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.__STARTINTECH_E2E__ = true;
    });

    await page.route('**/api/v1/auth/google', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'e2e-access-token',
          user: { id: 'user-e2e', email: 'aluno@startintech.test' },
          isProfileComplete: true,
        }),
      });
    });

    // Faz login inicial
    await page.goto('/login');
    await page.getByTestId('google-login-button').click();
    await expect(page).toHaveURL(/\/dashboard$/);

    // Navega para a Landing Page
    await page.goto('/');
    await expect(page).toHaveURL(/\/$/);

    // Valida eyebrow e botão de retorno ao painel
    await expect(page.getByTestId('hero-eyebrow')).toContainText(
      'Bem-vindo(a) de volta',
    );
    const painelCta = page.getByTestId('hero-primary-cta');
    await expect(painelCta).toContainText('Ir para o painel');

    await painelCta.click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('permite interação com o Accordion de FAQ', async ({ page }) => {
    await page.goto('/');

    const questionButton = page.getByRole('button', {
      name: /A StartInTech é realmente gratuita/i,
    });
    await expect(questionButton).toBeVisible();

    // Clica para expandir/verificar
    await questionButton.click();
    await expect(
      page.getByText(/O diagnóstico de currículo via ATS, o roadmap/i),
    ).toBeVisible();
  });

  test('comportamento responsivo no mobile abre o menu lateral', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const mobileMenuTrigger = page.getByTestId('mobile-menu-trigger');
    await expect(mobileMenuTrigger).toBeVisible();

    await mobileMenuTrigger.click();
    await expect(
      page.getByRole('navigation', { name: 'Menu móvel' }),
    ).toBeVisible();
    await expect(page.getByTestId('mobile-navbar-cta')).toBeVisible();
  });
});
