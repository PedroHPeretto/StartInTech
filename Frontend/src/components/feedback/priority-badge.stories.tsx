import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { PriorityBadge } from './priority-badge';

const meta = {
  title: 'Feedback/PriorityBadge',
  component: PriorityBadge,
  tags: ['autodocs'],
  argTypes: {
    priority: {
      control: 'select',
      options: ['high', 'medium', 'low', 'excellent'],
    },
  },
} satisfies Meta<typeof PriorityBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HighPriority: Story = {
  args: {
    priority: 'high',
  },
  play: async ({ canvas }) => {
    const badge = canvas.getByTestId('priority-badge');
    await expect(badge).toBeInTheDocument();
    await expect(badge).toHaveTextContent('Alta Prioridade');
  },
};

export const MediumPriority: Story = {
  args: {
    priority: 'medium',
  },
  play: async ({ canvas }) => {
    const badge = canvas.getByTestId('priority-badge');
    await expect(badge).toHaveTextContent('Média Prioridade');
  },
};

export const Excellent: Story = {
  args: {
    priority: 'excellent',
  },
  play: async ({ canvas }) => {
    const badge = canvas.getByTestId('priority-badge');
    await expect(badge).toHaveTextContent('Excelente');
  },
};
