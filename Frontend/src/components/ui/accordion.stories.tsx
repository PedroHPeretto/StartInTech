import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from './accordion';

const meta = {
  title: 'UI/Accordion',
  component: Accordion,
  tags: ['autodocs'],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div
      className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4"
      data-testid="story-accordion"
    >
      <Accordion defaultValue={['item-1']}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Como funciona o diagnóstico?</AccordionTrigger>
          <AccordionPanel>
            Nosso sistema analisa a compatibilidade do seu currículo com
            sistemas ATS em segundos.
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>A plataforma é gratuita?</AccordionTrigger>
          <AccordionPanel>
            Sim, 100% gratuita para estudantes e profissionais em início de
            carreira.
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </div>
  ),
  play: async ({ canvas }) => {
    const accordion = canvas.getByTestId('story-accordion');
    await expect(accordion).toBeInTheDocument();
  },
};
