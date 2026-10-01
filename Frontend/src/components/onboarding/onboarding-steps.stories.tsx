import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { OnboardingSteps } from './onboarding-steps';

const meta = {
  title: 'Onboarding/OnboardingSteps',
  component: OnboardingSteps,
  tags: ['autodocs'],
  args: {
    steps: ['Dados Pessoais', 'Carreira', 'Competências'],
    currentStep: 2,
    onStepClick: fn(),
  },
} satisfies Meta<typeof OnboardingSteps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Step2Active: Story = {
  args: {
    currentStep: 2,
  },
  play: async ({ canvas }) => {
    const steps = canvas.getByTestId('onboarding-steps');
    await expect(steps).toBeInTheDocument();
    const step2 = canvas.getByTestId('onboarding-step-2');
    await expect(step2).toBeInTheDocument();
  },
};

export const Step1Active: Story = {
  args: {
    currentStep: 1,
  },
};

export const AllDone: Story = {
  args: {
    currentStep: 4,
  },
};

export const MobileDotsView: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  args: {
    currentStep: 2,
  },
  play: async ({ canvas }) => {
    const mobileDots = canvas.getByTestId('onboarding-steps-mobile');
    await expect(mobileDots).toBeInTheDocument();
  },
};
