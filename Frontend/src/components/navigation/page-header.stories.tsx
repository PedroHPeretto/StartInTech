import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { PageHeader } from './page-header';

const meta = {
  title: 'Navigation/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  args: {
    userName: 'Gabriel Teixeira',
    onMenuClick: fn(),
    onNotificationClick: fn(),
    onSearchChange: fn(),
    notificationCount: 3,
  },
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DesktopHeader: Story = {
  args: {
    userName: 'Gabriel Teixeira',
    notificationCount: 3,
  },
  play: async ({ canvas }) => {
    const header = canvas.getByTestId('page-header');
    await expect(header).toBeInTheDocument();
    const bellBadge = canvas.getByTestId('page-header-bell-badge');
    await expect(bellBadge).toHaveTextContent('3');
  },
};

export const MobileHeaderWithHamburger: Story = {
  args: {
    userName: 'Gabriel',
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  play: async ({ canvas }) => {
    const menuBtn = canvas.getByTestId('page-header-menu-btn');
    await expect(menuBtn).toBeInTheDocument();
  },
};
