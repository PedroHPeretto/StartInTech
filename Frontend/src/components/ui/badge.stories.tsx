import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Badge, WorkModeBadge } from './badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'secondary',
        'outline',
        'remoto',
        'hibrido',
        'presencial',
        'success',
        'warning',
        'destructive',
      ],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    removable: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'React',
    variant: 'default',
  },
  play: async ({ canvas }) => {
    const badge = canvas.getByTestId('badge');
    await expect(badge).toHaveTextContent('React');
  },
};

export const TechTags: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>TypeScript</Badge>
      <Badge>React</Badge>
      <Badge>Node.js</Badge>
      <Badge>PostgreSQL</Badge>
      <Badge>Docker</Badge>
    </div>
  ),
};

export const WorkModes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <WorkModeBadge mode="REMOTE" />
      <WorkModeBadge mode="HYBRID" />
      <WorkModeBadge mode="ON_SITE" />
    </div>
  ),
  play: async ({ canvas }) => {
    const badges = canvas.getAllByTestId('work-mode-badge');
    await expect(badges).toHaveLength(3);
    await expect(badges[0]).toHaveTextContent('Remoto');
  },
};

export const Removable: Story = {
  args: {
    children: 'Removable Tag',
    removable: true,
  },
  play: async ({ canvas }) => {
    const btn = canvas.getByTestId('badge-remove-btn');
    await expect(btn).toBeInTheDocument();
  },
};
