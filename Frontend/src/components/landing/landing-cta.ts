import type { AuthContextValue } from '@/auth/auth-context-state';
import { getPostAuthRoute } from '@/auth/redirect-after-auth';

export interface LandingCtaConfig {
  eyebrow: string;
  primaryCta: {
    label: string;
    to: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  };
  navActions: {
    showLoginLink: boolean;
    primaryLabel: string;
    primaryTo: string;
    userInitials?: string;
  };
}

export function getLandingCta(
  auth: Pick<
    AuthContextValue,
    'isAuthenticated' | 'isProfileComplete' | 'user'
  >,
): LandingCtaConfig {
  if (auth.isAuthenticated) {
    const postAuthRoute = getPostAuthRoute(auth.isProfileComplete);
    const userEmail = auth.user?.email ?? '';
    const userInitials = userEmail ? userEmail.slice(0, 2).toUpperCase() : 'ST';

    return {
      eyebrow: '👋 Bem-vindo(a) de volta',
      primaryCta: {
        label: 'Ir para o painel',
        to: postAuthRoute,
      },
      secondaryCta: {
        label: 'Ver como funciona',
        href: '#como-funciona',
      },
      navActions: {
        showLoginLink: false,
        primaryLabel: 'Ir para o painel',
        primaryTo: postAuthRoute,
        userInitials,
      },
    };
  }

  return {
    eyebrow: '✨ Gratuito para estudantes',
    primaryCta: {
      label: 'Começar grátis com Google',
      to: '/login',
    },
    secondaryCta: {
      label: 'Ver como funciona',
      href: '#como-funciona',
    },
    navActions: {
      showLoginLink: true,
      primaryLabel: 'Criar conta grátis',
      primaryTo: '/login',
    },
  };
}
