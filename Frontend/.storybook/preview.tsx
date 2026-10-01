import type { Preview } from '@storybook/react-vite';
import { INITIAL_VIEWPORTS, MINIMAL_VIEWPORTS } from 'storybook/viewport';
import { mswLoader } from 'msw-storybook-addon/csf3';
import { mswHandlers } from './msw-handlers';
import '../src/index.css';

const preview: Preview = {
  parameters: {
    viewport: {
      options: {
        ...INITIAL_VIEWPORTS,
        ...MINIMAL_VIEWPORTS,
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
    msw: {
      handlers: mswHandlers,
    },
  },
  loaders: [mswLoader()],
};

export default preview;
