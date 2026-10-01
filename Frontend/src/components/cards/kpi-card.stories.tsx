import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Target, Briefcase, Award, AlertCircle } from 'lucide-react';
import { KpiCard } from './kpi-card';

const meta = {
  title: 'Cards/KpiCard',
  component: KpiCard,
  tags: ['autodocs'],
  args: {
    title: 'Match médio do perfil',
    value: '78%',
    icon: <Target size={20} />,
  },
} satisfies Meta<typeof KpiCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AverageMatchCard: Story = {
  args: {
    title: 'Match médio do perfil',
    value: '78%',
    icon: <Target size={20} />,
    trend: {
      value: '+12%',
      isPositive: true,
      period: 'desde a última análise',
    },
  },
  play: async ({ canvas }) => {
    const card = canvas.getByTestId('kpi-card');
    await expect(card).toBeInTheDocument();
    const val = canvas.getByTestId('kpi-card-value');
    await expect(val).toHaveTextContent('78%');
  },
};

export const CompatibleJobsCard: Story = {
  args: {
    title: 'Vagas compatíveis',
    value: '24',
    icon: <Briefcase size={20} />,
    subtitle: 'Novas oportunidades hoje',
  },
};

export const AtsScoreCard: Story = {
  args: {
    title: 'Currículo (ATS Score)',
    value: '82/100',
    icon: <Award size={20} />,
    trend: {
      value: 'Muito bom',
      isPositive: true,
      period: 'pronto para envio',
    },
  },
};

export const KeyGapsCard: Story = {
  args: {
    title: 'Lacunas principais',
    value: '5',
    icon: <AlertCircle size={20} />,
    subtitle: 'Competências a desenvolver',
  },
};

export const DashboardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl">
      <KpiCard
        title="Match Médio"
        value="78%"
        icon={<Target size={20} />}
        trend={{ value: '+12%', period: 'este mês' }}
      />
      <KpiCard
        title="Vagas Compatíveis"
        value="24"
        icon={<Briefcase size={20} />}
        subtitle="14 com match > 80%"
      />
      <KpiCard
        title="ATS Score"
        value="82/100"
        icon={<Award size={20} />}
        subtitle="Excelente formatação"
      />
      <KpiCard
        title="Lacunas Mapeadas"
        value="5"
        icon={<AlertCircle size={20} />}
        subtitle="3 recomendadas na trilha"
      />
    </div>
  ),
};
