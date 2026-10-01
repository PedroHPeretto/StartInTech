import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { SearchBar } from './search-bar';

const meta = {
  title: 'UI/SearchBar',
  component: SearchBar,
  tags: ['autodocs'],
  args: {
    onChange: fn(),
    onSearch: fn(),
  },
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Buscar por cargo, tecnologia ou empresa...',
  },
  play: async ({ canvas }) => {
    const input = canvas.getByTestId('search-bar-input');
    await expect(input).toBeInTheDocument();
    await expect(input).toHaveAttribute(
      'placeholder',
      'Buscar por cargo, tecnologia ou empresa...',
    );
  },
};

export const WithValue: Story = {
  args: {
    value: 'Desenvolvedor Frontend',
  },
  play: async ({ canvas }) => {
    const clearBtn = canvas.getByTestId('search-bar-clear-btn');
    await expect(clearBtn).toBeInTheDocument();
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'Busca desativada',
  },
  play: async ({ canvas }) => {
    const input = canvas.getByTestId('search-bar-input');
    await expect(input).toBeDisabled();
  },
};
