import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { PageFooter } from './page-footer';

const meta = {
  title: 'Navigation/PageFooter',
  component: PageFooter,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PageFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DesktopFooter: Story = {
  play: async ({ canvas }) => {
    const footer = canvas.getByTestId('page-footer');
    await expect(footer).toBeInTheDocument();
    const links = canvas.getByTestId('footer-links');
    await expect(links).toBeInTheDocument();
  },
};

export const MobileFooter: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  play: async ({ canvas }) => {
    const footer = canvas.getByTestId('page-footer');
    await expect(footer).toBeInTheDocument();
  },
};
