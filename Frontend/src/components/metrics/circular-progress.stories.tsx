import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { CircularProgress } from './circular-progress';

const meta = {
  title: 'Metrics/CircularProgress',
  component: CircularProgress,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
    variant: {
      control: 'radio',
      options: ['light', 'dark'],
    },
    size: {
      control: 'number',
    },
  },
} satisfies Meta<typeof CircularProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Score82Light: Story = {
  args: {
    value: 82,
    label: 'Muito bom',
    variant: 'light',
    size: 140,
  },
  play: async ({ canvas }) => {
    const progress = canvas.getByTestId('circular-progress');
    await expect(progress).toBeInTheDocument();
    const value = canvas.getByTestId('circular-progress-value');
    await expect(value).toHaveTextContent('82');
  },
};

export const ProcessingDark: Story = {
  args: {
    value: 58,
    label: 'Processando',
    variant: 'dark',
    size: 140,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  play: async ({ canvas }) => {
    const value = canvas.getByTestId('circular-progress-value');
    await expect(value).toHaveTextContent('58');
  },
};
