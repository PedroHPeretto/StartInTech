import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { AtsVerdictBadge } from './ats-verdict-badge';

const meta = {
  title: 'Feedback/AtsVerdictBadge',
  component: AtsVerdictBadge,
  tags: ['autodocs'],
  argTypes: {
    verdict: {
      control: 'select',
      options: ['excellent', 'recommended', 'attention'],
    },
  },
} satisfies Meta<typeof AtsVerdictBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ExcellentCompatibility: Story = {
  args: {
    verdict: 'excellent',
  },
  play: async ({ canvas }) => {
    const badge = canvas.getByTestId('ats-verdict-badge');
    await expect(badge).toBeInTheDocument();
    await expect(badge).toHaveTextContent('EXCELENTE COMPATIBILIDADE');
  },
};

export const HighlyRecommended: Story = {
  args: {
    verdict: 'recommended',
  },
  play: async ({ canvas }) => {
    const badge = canvas.getByTestId('ats-verdict-badge');
    await expect(badge).toBeInTheDocument();
    await expect(badge).toHaveTextContent('Altamente Recomendado');
  },
};

export const AttentionNeeded: Story = {
  args: {
    verdict: 'attention',
  },
  play: async ({ canvas }) => {
    const badge = canvas.getByTestId('ats-verdict-badge');
    await expect(badge).toBeInTheDocument();
    await expect(badge).toHaveTextContent('Atenção Necessária');
  },
};
