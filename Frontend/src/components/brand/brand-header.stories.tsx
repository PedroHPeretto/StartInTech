import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { BrandHeader } from './brand-header';

const meta = {
  title: 'Brand/BrandHeader',
  component: BrandHeader,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'compact', 'icon-only'],
    },
    theme: {
      control: 'radio',
      options: ['light', 'dark'],
    },
    showTagline: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof BrandHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultLight: Story = {
  args: {
    variant: 'default',
    theme: 'light',
    showTagline: true,
  },
  play: async ({ canvas }) => {
    const brand = canvas.getByTestId('brand-header');
    await expect(brand).toBeInTheDocument();
    await expect(brand).toHaveTextContent('StartInTech');
  },
};

export const DefaultDark: Story = {
  args: {
    variant: 'default',
    theme: 'dark',
    showTagline: true,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  render: (args) => (
    <div className="bg-brand-midnight rounded-xl p-6">
      <BrandHeader {...args} />
    </div>
  ),
};

export const Compact: Story = {
  args: {
    variant: 'compact',
    theme: 'light',
  },
  play: async ({ canvas }) => {
    const brand = canvas.getByTestId('brand-header');
    await expect(brand).toHaveTextContent('StartInTech');
  },
};

export const IconOnly: Story = {
  args: {
    variant: 'icon-only',
    theme: 'light',
  },
  play: async ({ canvas }) => {
    const badge = canvas.getByTestId('brand-logo-badge');
    await expect(badge).toBeInTheDocument();
  },
};
