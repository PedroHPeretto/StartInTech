import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { AlertBanner } from './alert-banner';

const meta = {
  title: 'Feedback/AlertBanner',
  component: AlertBanner,
  tags: ['autodocs'],
  args: {
    message:
      'Seu perfil está 80% completo. Adicione suas competências e conquiste mais atenção dos recrutadores.',
    actionLabel: 'Completar Perfil',
    onAction: fn(),
    onDismiss: fn(),
  },
} satisfies Meta<typeof AlertBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ProfileCompletionAlert: Story = {
  args: {
    variant: 'info',
  },
  play: async ({ canvas }) => {
    const banner = canvas.getByTestId('alert-banner');
    await expect(banner).toBeInTheDocument();
    const actionBtn = canvas.getByTestId('alert-banner-action-btn');
    await expect(actionBtn).toHaveTextContent('Completar Perfil');
  },
};

export const WarningAlert: Story = {
  args: {
    variant: 'warning',
    message:
      'Faltam palavras-chave essenciais em seu currículo para a vaga de Desenvolvedor React.',
    actionLabel: 'Ver Recomendações',
  },
};

export const SuccessAlert: Story = {
  args: {
    variant: 'success',
    message:
      'Parabéns! Seu currículo foi analisado com sucesso e obteve nota 85/100.',
    actionLabel: 'Ver Diagnóstico',
  },
};
