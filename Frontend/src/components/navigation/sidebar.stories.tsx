import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { Sidebar } from './sidebar';

const meta = {
  title: 'Navigation/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  args: {
    activeRoute: 'dashboard',
    onNavigate: fn(),
    onLogout: fn(),
    onClose: fn(),
    user: {
      name: 'Gabriel Teixeira',
      email: 'gabriel.teixeira@email.com',
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DesktopView: Story = {
  args: {
    activeRoute: 'dashboard',
  },
  play: async ({ canvas }) => {
    const sidebar = canvas.getByTestId('sidebar');
    await expect(sidebar).toBeInTheDocument();
    const nav = canvas.getByTestId('sidebar-nav');
    await expect(nav).toBeInTheDocument();
    const user = canvas.getByTestId('sidebar-user');
    await expect(user).toHaveTextContent('Gabriel Teixeira');
  },
};

export const ActiveJobsRoute: Story = {
  args: {
    activeRoute: 'jobs',
  },
  play: async ({ canvas }) => {
    const sidebar = canvas.getByTestId('sidebar');
    await expect(sidebar).toBeInTheDocument();
  },
};

export const MobileDrawerOpen: Story = {
  args: {
    activeRoute: 'dashboard',
    isOpen: true,
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  globals: {
    viewport: { value: 'mobile1' },
  },
  play: async ({ canvas }) => {
    const drawer = canvas.getByTestId('sidebar-mobile-drawer');
    await expect(drawer).toBeInTheDocument();
  },
};
