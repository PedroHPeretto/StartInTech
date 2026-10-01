import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { SkillNode } from './skill-node';

const meta = {
  title: 'Roadmap/SkillNode',
  component: SkillNode,
  tags: ['autodocs'],
  args: {
    id: 'skill-1',
    title: 'HTML & CSS',
    category: 'Fundamentos Web',
    onClick: fn(),
  },
} satisfies Meta<typeof SkillNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CompletedNode: Story = {
  args: {
    status: 'completed',
    title: 'HTML & CSS',
  },
  play: async ({ canvas }) => {
    const node = canvas.getByTestId('skill-node');
    await expect(node).toBeInTheDocument();
    await expect(node).toHaveAttribute('data-status', 'completed');
  },
};

export const InProgressNode: Story = {
  args: {
    status: 'in-progress',
    title: 'Testes Front-end',
    category: 'Qualidade de Software',
  },
  play: async ({ canvas }) => {
    const node = canvas.getByTestId('skill-node');
    await expect(node).toHaveAttribute('data-status', 'in-progress');
  },
};

export const LockedNode: Story = {
  args: {
    status: 'locked',
    title: 'CI/CD Pipelines',
    category: 'DevOps & Deploy',
  },
  play: async ({ canvas }) => {
    const node = canvas.getByTestId('skill-node');
    await expect(node).toHaveAttribute('data-status', 'locked');
  },
};

export const RoadmapTrackFlow: Story = {
  render: () => (
    <div className="flex flex-col gap-3 max-w-sm">
      <SkillNode
        id="1"
        title="Fundamentos de TypeScript"
        status="completed"
        category="Linguagens"
      />
      <SkillNode
        id="2"
        title="React & Componentização"
        status="completed"
        category="Frontend"
      />
      <SkillNode
        id="3"
        title="Gerenciamento de Estado"
        status="in-progress"
        category="Frontend"
      />
      <SkillNode
        id="4"
        title="Next.js & Server Components"
        status="locked"
        category="Frontend Avançado"
      />
    </div>
  ),
};
