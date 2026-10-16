import { describe, expect, it } from 'vitest';
import { getLandingCta } from './landing-cta';

describe('getLandingCta', () => {
  it('returns anonymous CTA configuration when user is not authenticated', () => {
    const cta = getLandingCta({
      isAuthenticated: false,
      isProfileComplete: false,
      user: null,
    });

    expect(cta.eyebrow).toBe('✨ Gratuito para estudantes');
    expect(cta.primaryCta).toEqual({
      label: 'Começar grátis com Google',
      to: '/login',
    });
    expect(cta.secondaryCta).toEqual({
      label: 'Ver como funciona',
      href: '#como-funciona',
    });
    expect(cta.navActions).toEqual({
      showLoginLink: true,
      primaryLabel: 'Criar conta grátis',
      primaryTo: '/login',
    });
  });

  it('returns authenticated CTA configuration redirecting to dashboard when profile is complete', () => {
    const cta = getLandingCta({
      isAuthenticated: true,
      isProfileComplete: true,
      user: { id: 'user-1', email: 'pedro@example.com' },
    });

    expect(cta.eyebrow).toBe('👋 Bem-vindo(a) de volta');
    expect(cta.primaryCta).toEqual({
      label: 'Ir para o painel',
      to: '/dashboard',
    });
    expect(cta.navActions.showLoginLink).toBe(false);
    expect(cta.navActions.primaryLabel).toBe('Ir para o painel');
    expect(cta.navActions.primaryTo).toBe('/dashboard');
    expect(cta.navActions.userInitials).toBe('PE');
  });

  it('returns authenticated CTA configuration redirecting to onboarding when profile is incomplete', () => {
    const cta = getLandingCta({
      isAuthenticated: true,
      isProfileComplete: false,
      user: { id: 'user-2', email: 'aluno@tech.com' },
    });

    expect(cta.primaryCta.to).toBe('/onboarding');
    expect(cta.navActions.primaryTo).toBe('/onboarding');
  });
});
