import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { Button } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'outline',
        'secondary',
        'ghost',
        'destructive',
        'link',
      ],
    },
    size: {
      control: 'select',
      options: [
        'default',
        'xs',
        'sm',
        'lg',
        'icon',
        'icon-xs',
        'icon-sm',
        'icon-lg',
      ],
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Click me',
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /click me/i });
    await expect(button).toHaveTextContent('Click me');
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Destructive',
    variant: 'destructive',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost',
    variant: 'ghost',
  },
};

export const Link: Story = {
  args: {
    children: 'Link',
    variant: 'link',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /disabled/i });
    await expect(button).toBeDisabled();
  },
};

export const CssCheck: Story = {
  args: {
    children: 'CssCheck',
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /csscheck/i });
    await expect(getComputedStyle(button).display).toBe('inline-flex');
    await expect(getComputedStyle(button).cursor).toBe('pointer');
    // Button uses bg-primary — verifies Tailwind and index.css loaded
    await expect(getComputedStyle(button).backgroundColor).toBe(
      'rgb(2, 132, 199)',
    );
  },
};
