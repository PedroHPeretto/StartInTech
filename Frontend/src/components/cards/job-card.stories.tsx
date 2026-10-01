import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { JobCard } from './job-card';

const meta = {
  title: 'Cards/JobCard',
  component: JobCard,
  tags: ['autodocs'],
  args: {
    id: 'job-1',
    title: 'Estágio em Desenvolvimento Front-end',
    company: 'TOTVS',
    location: 'São Paulo, SP',
    workMode: 'REMOTE',
    skills: ['JavaScript', 'React', 'HTML', 'CSS', 'Git'],
    matchScore: 92,
    onBookmarkToggle: fn(),
    onViewDetails: fn(),
  },
} satisfies Meta<typeof JobCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DesktopJobCard: Story = {
  play: async ({ canvas }) => {
    const card = canvas.getByTestId('job-card');
    await expect(card).toBeInTheDocument();
    const title = canvas.getByTestId('job-card-title');
    await expect(title).toHaveTextContent(
      'Estágio em Desenvolvimento Front-end',
    );
    const company = canvas.getByTestId('job-card-company');
    await expect(company).toHaveTextContent('TOTVS');
    const match = canvas.getByTestId('job-card-match');
    await expect(match).toHaveTextContent('92%');
  },
};

export const BookmarkedJobCard: Story = {
  args: {
    isBookmarked: true,
  },
  play: async ({ canvas }) => {
    const bookmarkBtn = canvas.getByTestId('job-card-bookmark-btn');
    await expect(bookmarkBtn).toBeInTheDocument();
  },
};

export const MobileJobCard: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  play: async ({ canvas }) => {
    const card = canvas.getByTestId('job-card');
    await expect(card).toBeInTheDocument();
  },
};
