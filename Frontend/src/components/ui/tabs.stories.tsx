import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { Tabs } from './tabs';

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleTabs = [
  { id: 'all', label: 'Todas as Vagas', badge: 24 },
  { id: 'compatible', label: 'Altamente Compatíveis', badge: 8 },
  { id: 'saved', label: 'Salvas', badge: 3 },
];

export const Underlined: Story = {
  args: {
    tabs: sampleTabs,
    activeTab: 'all',
    variant: 'underlined',
  },
  play: async ({ canvas }) => {
    const activeTab = canvas.getByTestId('tab-all');
    await expect(activeTab).toHaveAttribute('aria-selected', 'true');
    const indicator = canvas.getByTestId('active-tab-indicator');
    await expect(indicator).toBeInTheDocument();
  },
};

export const Pills: Story = {
  args: {
    tabs: sampleTabs,
    activeTab: 'compatible',
    variant: 'pills',
  },
  play: async ({ canvas }) => {
    const activeTab = canvas.getByTestId('tab-compatible');
    await expect(activeTab).toHaveAttribute('aria-selected', 'true');
  },
};
