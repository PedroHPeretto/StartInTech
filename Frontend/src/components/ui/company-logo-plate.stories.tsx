import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { CompanyLogoPlate } from './company-logo-plate';

const meta = {
  title: 'UI/CompanyLogoPlate',
  component: CompanyLogoPlate,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    companyName: {
      control: 'text',
    },
  },
} satisfies Meta<typeof CompanyLogoPlate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithInitials: Story = {
  args: {
    companyName: 'TOTVS Brasil',
    size: 'md',
  },
  play: async ({ canvas }) => {
    const plate = canvas.getByTestId('company-logo-plate');
    await expect(plate).toBeInTheDocument();
    await expect(plate).toHaveTextContent('TB');
  },
};

export const AllSizes: Story = {
  args: {
    companyName: 'Nubank',
    size: 'md',
  },
  render: () => (
    <div className="flex items-center gap-4">
      <CompanyLogoPlate companyName="Nubank" size="sm" />
      <CompanyLogoPlate companyName="Nubank" size="md" />
      <CompanyLogoPlate companyName="Nubank" size="lg" />
    </div>
  ),
  play: async ({ canvas }) => {
    const plates = canvas.getAllByTestId('company-logo-plate');
    await expect(plates).toHaveLength(3);
  },
};
