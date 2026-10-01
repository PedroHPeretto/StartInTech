import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { UserAvatar } from './avatar';

const meta = {
  title: 'UI/Avatar',
  component: UserAvatar,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    status: {
      control: 'select',
      options: [undefined, 'online', 'offline', 'busy'],
    },
  },
} satisfies Meta<typeof UserAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithInitialsFallback: Story = {
  args: {
    name: 'Gabriel Teixeira',
    size: 'md',
  },
  play: async ({ canvas }) => {
    const avatar = canvas.getByTestId('user-avatar');
    await expect(avatar).toBeInTheDocument();
    await expect(avatar).toHaveTextContent('GT');
  },
};

export const WithOnlineStatus: Story = {
  args: {
    name: 'Gabriel Teixeira',
    size: 'lg',
    status: 'online',
  },
  play: async ({ canvas }) => {
    const status = canvas.getByTestId('user-avatar-status');
    await expect(status).toBeInTheDocument();
  },
};

export const AllSizes: Story = {
  args: {
    name: 'Pedro Peretto',
    size: 'md',
  },
  render: () => (
    <div className="flex items-center gap-4">
      <UserAvatar name="Pedro Peretto" size="sm" status="online" />
      <UserAvatar name="Pedro Peretto" size="md" status="online" />
      <UserAvatar name="Pedro Peretto" size="lg" status="online" />
      <UserAvatar name="Pedro Peretto" size="xl" status="online" />
    </div>
  ),
};
