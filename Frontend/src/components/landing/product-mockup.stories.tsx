import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { ProductMockup } from './product-mockup';

const meta = {
  title: 'Landing/ProductMockup',
  component: ProductMockup,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ProductMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="max-w-2xl p-6 bg-slate-50 rounded-2xl">
      <ProductMockup />
    </div>
  ),
  play: async ({ canvas }) => {
    const mockup = canvas.getByTestId('product-mockup');
    await expect(mockup).toBeInTheDocument();
  },
};
