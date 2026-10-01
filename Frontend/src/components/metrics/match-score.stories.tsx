import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { MatchScore } from './match-score';

const meta = {
  title: 'Metrics/MatchScore',
  component: MatchScore,
  tags: ['autodocs'],
  argTypes: {
    score: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
    variant: {
      control: 'select',
      options: ['badge', 'metric', 'compact'],
    },
    showIcon: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof MatchScore>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HighMatch95: Story = {
  args: {
    score: 95,
    variant: 'badge',
  },
  play: async ({ canvas }) => {
    const badge = canvas.getByTestId('match-score-badge');
    await expect(badge).toBeInTheDocument();
    await expect(badge).toHaveTextContent('95%');
  },
};

export const MediumMatch75: Story = {
  args: {
    score: 75,
    variant: 'badge',
  },
  play: async ({ canvas }) => {
    const badge = canvas.getByTestId('match-score-badge');
    await expect(badge).toHaveTextContent('75%');
  },
};

export const MetricDisplay: Story = {
  args: {
    score: 82,
    variant: 'metric',
  },
  play: async ({ canvas }) => {
    const metric = canvas.getByTestId('match-score-metric');
    await expect(metric).toBeInTheDocument();
    await expect(metric).toHaveTextContent('82%');
    await expect(metric).toHaveTextContent('Altamente Compatível');
  },
};

export const CompactBadge: Story = {
  args: {
    score: 90,
    variant: 'compact',
  },
  play: async ({ canvas }) => {
    const compact = canvas.getByTestId('match-score-compact');
    await expect(compact).toHaveTextContent('90%');
  },
};
