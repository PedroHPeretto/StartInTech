import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { GapSkillBadge } from './gap-skill-badge';

const meta = {
  title: 'Feedback/GapSkillBadge',
  component: GapSkillBadge,
  tags: ['autodocs'],
  args: {
    skillName: 'Docker & Containers',
    onExplore: fn(),
  },
} satisfies Meta<typeof GapSkillBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SkillFound: Story = {
  args: {
    skillName: 'React',
    type: 'found',
    variant: 'badge',
  },
  play: async ({ canvas }) => {
    const badge = canvas.getByTestId('gap-skill-badge');
    await expect(badge).toBeInTheDocument();
    await expect(badge).toHaveTextContent('React');
  },
};

export const SkillGap: Story = {
  args: {
    skillName: 'AWS & Cloud',
    type: 'gap',
    variant: 'badge',
  },
  play: async ({ canvas }) => {
    const badge = canvas.getByTestId('gap-skill-badge');
    await expect(badge).toBeInTheDocument();
    await expect(badge).toHaveTextContent('AWS & Cloud');
  },
};

export const GapRowItem: Story = {
  args: {
    skillName: 'Docker & Containerização',
    type: 'gap',
    variant: 'row',
    demandPercentage: 45,
  },
  play: async ({ canvas }) => {
    const row = canvas.getByTestId('gap-skill-row');
    await expect(row).toBeInTheDocument();
    await expect(row).toHaveTextContent('Requisitado em 45% das vagas');
  },
};
