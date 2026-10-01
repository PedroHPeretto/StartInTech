import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { CareerTrailProgress } from './career-progress';

const meta = {
  title: 'Metrics/CareerTrailProgress',
  component: CareerTrailProgress,
  tags: ['autodocs'],
  args: {
    completedTopics: 5,
    totalTopics: 13,
    title: 'Trilha: Desenvolvedor Full Stack',
  },
} satisfies Meta<typeof CareerTrailProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LinearProgress: Story = {
  args: {
    variant: 'linear',
  },
  play: async ({ canvas }) => {
    const card = canvas.getByTestId('career-progress-linear');
    await expect(card).toBeInTheDocument();
    const pct = canvas.getByTestId('career-progress-percentage');
    await expect(pct).toHaveTextContent('38%');
  },
};

export const RingProgress: Story = {
  args: {
    variant: 'ring',
  },
  play: async ({ canvas }) => {
    const ring = canvas.getByTestId('career-progress-ring');
    await expect(ring).toBeInTheDocument();
  },
};
