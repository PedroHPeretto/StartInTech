import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { ProcessingSteps, type StepItem } from './processing-steps';

const meta = {
  title: 'Feedback/ProcessingSteps',
  component: ProcessingSteps,
  tags: ['autodocs'],
} satisfies Meta<typeof ProcessingSteps>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleSteps: StepItem[] = [
  {
    id: '1',
    title: 'Lendo documento',
    subtitle: 'Extraindo texto e seções do currículo',
    status: 'done',
  },
  {
    id: '2',
    title: 'Comparando com vagas',
    subtitle: 'Cruzando com requisitos de TI em aberto',
    status: 'active',
  },
  {
    id: '3',
    title: 'Gerando recomendações',
    subtitle: 'Mapeando lacunas e plano de ação',
    status: 'pending',
  },
];

export const InProgressAnalysis: Story = {
  args: {
    steps: sampleSteps,
  },
  play: async ({ canvas }) => {
    const container = canvas.getByTestId('processing-steps');
    await expect(container).toBeInTheDocument();
    const activeStep = canvas.getByTestId('processing-step-2');
    await expect(activeStep).toHaveTextContent('Em andamento...');
  },
};

export const AllDone: Story = {
  args: {
    steps: sampleSteps.map((s) => ({ ...s, status: 'done' })),
  },
  play: async ({ canvas }) => {
    const container = canvas.getByTestId('processing-steps');
    await expect(container).toBeInTheDocument();
  },
};
