import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { RecommendationCard } from './recommendation-card';

const meta = {
  title: 'Cards/RecommendationCard',
  component: RecommendationCard,
  tags: ['autodocs'],
  args: {
    stepNumber: 1,
    title: 'Adicione projetos práticos',
    description:
      'Inclua links de projetos no GitHub com descrição das tecnologias para destacar suas competências práticas.',
    priority: 'high',
    onAction: fn(),
  },
} satisfies Meta<typeof RecommendationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HighPriorityRecommendation: Story = {
  play: async ({ canvas }) => {
    const card = canvas.getByTestId('recommendation-card');
    await expect(card).toBeInTheDocument();
    const num = canvas.getByTestId('recommendation-number-badge');
    await expect(num).toHaveTextContent('1');
    const title = canvas.getByTestId('recommendation-title');
    await expect(title).toHaveTextContent('Adicione projetos práticos');
  },
};

export const MediumPriorityRecommendation: Story = {
  args: {
    stepNumber: 2,
    title: 'Inclua mais palavras-chave',
    description:
      'Adicione termos como Docker, AWS e REST API para aumentar a aderência aos filtros dos ATS.',
    priority: 'medium',
  },
};

export const MobileRecommendation: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  play: async ({ canvas }) => {
    const card = canvas.getByTestId('recommendation-card');
    await expect(card).toBeInTheDocument();
  },
};
