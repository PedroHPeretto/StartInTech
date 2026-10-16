import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './card';
import { Button } from './button';

const meta = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-80" data-testid="story-card">
      <CardHeader>
        <CardTitle>Título do Card</CardTitle>
        <CardDescription>
          Descrição auxiliar detalhando a funcionalidade.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600">
          Conteúdo interno do card com informações relevantes.
        </p>
      </CardContent>
      <CardFooter>
        <Button size="sm">Ação Principal</Button>
      </CardFooter>
    </Card>
  ),
  play: async ({ canvas }) => {
    const card = canvas.getByTestId('story-card');
    await expect(card).toBeInTheDocument();
  },
};
