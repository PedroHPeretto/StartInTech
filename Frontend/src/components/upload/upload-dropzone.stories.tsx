import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { UploadDropzone } from './upload-dropzone';

const meta = {
  title: 'Upload/UploadDropzone',
  component: UploadDropzone,
  tags: ['autodocs'],
  args: {
    onFileSelect: fn(),
  },
} satisfies Meta<typeof UploadDropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultDropzone: Story = {
  play: async ({ canvas }) => {
    const dropzone = canvas.getByTestId('upload-dropzone');
    await expect(dropzone).toBeInTheDocument();
    const btn = canvas.getByTestId('upload-dropzone-browse-btn');
    await expect(btn).toHaveTextContent('Selecionar arquivo');
  },
};

export const WithError: Story = {
  args: {
    error: 'O arquivo selecionado não é um PDF válido ou está corrompido.',
  },
  play: async ({ canvas }) => {
    const err = canvas.getByTestId('upload-dropzone-error');
    await expect(err).toBeInTheDocument();
    await expect(err).toHaveTextContent('não é um PDF válido');
  },
};
