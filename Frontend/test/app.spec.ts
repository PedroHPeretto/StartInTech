import { describe, expect, it } from 'vitest';
import App from '../src/App';

describe('Frontend App', () => {
  it('should export the App component', () => {
    expect(App).toBeDefined();
    expect(typeof App).toBe('function');
  });
});

