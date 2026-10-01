import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { Code2, BarChart3, ShieldCheck, Palette } from 'lucide-react';
import { CareerCard } from './career-card';

const meta = {
  title: 'Cards/CareerCard',
  component: CareerCard,
  tags: ['autodocs'],
  args: {
    id: 'software-dev',
    title: 'Desenvolvimento de Software',
    icon: <Code2 size={24} />,
    description: 'Frontend, Backend, Full Stack e Mobile',
    isSelected: false,
    onSelect: fn(),
  },
} satisfies Meta<typeof CareerCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UnselectedState: Story = {
  args: {
    isSelected: false,
  },
  play: async ({ canvas }) => {
    const card = canvas.getByTestId('career-card');
    await expect(card).toBeInTheDocument();
    await expect(card).toHaveAttribute('aria-pressed', 'false');
  },
};

export const SelectedState: Story = {
  args: {
    isSelected: true,
  },
  play: async ({ canvas }) => {
    const card = canvas.getByTestId('career-card');
    await expect(card).toHaveAttribute('aria-pressed', 'true');
  },
};

export const CareerTrackSelection: Story = {
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
      <CareerCard
        id="dev"
        title="Desenvolvimento de Software"
        icon={<Code2 size={24} />}
        description="Frontend, Backend e Full Stack"
        isSelected={true}
        onSelect={fn()}
      />
      <CareerCard
        id="data"
        title="Análise e Ciência de Dados"
        icon={<BarChart3 size={24} />}
        description="SQL, Python, PowerBI e Machine Learning"
        isSelected={false}
        onSelect={fn()}
      />
      <CareerCard
        id="security"
        title="Segurança da Informação"
        icon={<ShieldCheck size={24} />}
        description="Defesa cibernética e compliance"
        isSelected={false}
        onSelect={fn()}
      />
      <CareerCard
        id="design"
        title="Design UI/UX"
        icon={<Palette size={24} />}
        description="Prototipação, usabilidade e design system"
        isSelected={false}
        onSelect={fn()}
      />
    </div>
  ),
};
