import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { MobileBottomNav } from './mobile-bottom-nav';

const meta = {
  title: 'Navigation/MobileBottomNav',
  component: MobileBottomNav,
  tags: ['autodocs'],
  args: {
    activeItem: 'dashboard',
    onSelect: fn(),
  },
  parameters: {
    layout: 'centered',
    viewport: { defaultViewport: 'mobile1' },
  },
  globals: {
    viewport: { value: 'mobile1' },
  },
  decorators: [
    (Story) => (
      <div className="relative mx-auto h-36 w-[375px] max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm [transform:translateZ(0)]">
        <div className="flex h-20 items-center justify-center text-xs text-slate-400 font-sans">
          Pré-visualização mobile
        </div>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MobileBottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    activeItem: 'dashboard',
  },
  play: async ({ canvas }) => {
    const nav = canvas.getByTestId('mobile-bottom-nav');
    await expect(nav).toBeInTheDocument();
    const activePill = canvas.getByTestId('mobile-nav-active-pill');
    await expect(activePill).toBeInTheDocument();
  },
};

export const JobsActive: Story = {
  args: {
    activeItem: 'jobs',
  },
  play: async ({ canvas }) => {
    const item = canvas.getByTestId('mobile-nav-jobs');
    await expect(item).toHaveAttribute('aria-current', 'page');
  },
};
