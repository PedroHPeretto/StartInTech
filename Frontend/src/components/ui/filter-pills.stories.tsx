import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { FilterPills } from './filter-pills';

const meta = {
  title: 'UI/FilterPills',
  component: FilterPills,
  tags: ['autodocs'],
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof FilterPills>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleOptions = [
  { id: 'all', label: 'Todas', count: 48 },
  { id: 'remote', label: 'Remoto', count: 32 },
  { id: 'hybrid', label: 'Híbrido', count: 12 },
  { id: 'frontend', label: 'Frontend', count: 18 },
  { id: 'backend', label: 'Backend', count: 15 },
];

export const SingleSelect: Story = {
  args: {
    options: sampleOptions,
    selected: 'all',
    multiSelect: false,
  },
  play: async ({ canvas }) => {
    const pill = canvas.getByTestId('filter-pill-all');
    await expect(pill).toHaveAttribute('aria-pressed', 'true');
  },
};

export const MultiSelect: Story = {
  args: {
    options: sampleOptions,
    selected: ['remote', 'frontend'],
    multiSelect: true,
  },
  play: async ({ canvas }) => {
    const remote = canvas.getByTestId('filter-pill-remote');
    const frontend = canvas.getByTestId('filter-pill-frontend');
    await expect(remote).toHaveAttribute('aria-pressed', 'true');
    await expect(frontend).toHaveAttribute('aria-pressed', 'true');
  },
};
