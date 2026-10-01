import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { LayoutDashboard, Briefcase, Map, FileText } from 'lucide-react';
import { MenuItem } from './menu-item';

const meta = {
  title: 'Navigation/MenuItem',
  component: MenuItem,
  tags: ['autodocs'],
  args: {
    onClick: fn(),
    icon: <LayoutDashboard size={20} />,
    label: 'Dashboard',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="bg-brand-midnight w-72 rounded-2xl p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MenuItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Dashboard',
    icon: <LayoutDashboard size={20} />,
    isActive: false,
  },
  play: async ({ canvas }) => {
    const item = canvas.getByTestId('menu-item');
    await expect(item).toBeInTheDocument();
    await expect(item).toHaveTextContent('Dashboard');
  },
};

export const Active: Story = {
  args: {
    label: 'Vagas Compatíveis',
    icon: <Briefcase size={20} />,
    isActive: true,
    badge: 12,
  },
  play: async ({ canvas }) => {
    const item = canvas.getByTestId('menu-item');
    await expect(item).toHaveTextContent('Vagas Compatíveis');
    const badge = canvas.getByTestId('menu-item-badge');
    await expect(badge).toHaveTextContent('12');
  },
};

export const MenuList: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5">
      <MenuItem
        label="Dashboard"
        icon={<LayoutDashboard size={20} />}
        isActive={true}
      />
      <MenuItem
        label="Vagas"
        icon={<Briefcase size={20} />}
        isActive={false}
        badge={8}
      />
      <MenuItem
        label="Trilha de Carreira"
        icon={<Map size={20} />}
        isActive={false}
      />
      <MenuItem
        label="Meu Currículo"
        icon={<FileText size={20} />}
        isActive={false}
      />
    </div>
  ),
};
