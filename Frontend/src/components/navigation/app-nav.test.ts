import { describe, expect, it } from 'vitest';
import {
  navRouteFor,
  resolveActiveNavId,
} from '@/components/navigation/app-nav';

describe('resolveActiveNavId', () => {
  it('marks the dashboard item on the dashboard', () => {
    expect(resolveActiveNavId('/dashboard')).toBe('dashboard');
  });

  it('marks the jobs item on the jobs board', () => {
    expect(resolveActiveNavId('/jobs')).toBe('jobs');
  });

  it('marks the career track item on the roadmap', () => {
    expect(resolveActiveNavId('/roadmap')).toBe('roadmaps');
  });

  it('marks the resume item on upload and analysis', () => {
    expect(resolveActiveNavId('/curriculum/upload')).toBe('resume');
    expect(
      resolveActiveNavId(
        '/curriculum/analysis/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
      ),
    ).toBe('resume');
  });

  it('leaves every item inactive on onboarding and login', () => {
    expect(resolveActiveNavId('/onboarding')).toBe('');
    expect(resolveActiveNavId('/login')).toBe('');
  });
});

describe('navRouteFor', () => {
  it('returns the page for each shell destination', () => {
    expect(navRouteFor('dashboard')).toBe('/dashboard');
    expect(navRouteFor('jobs')).toBe('/jobs');
    expect(navRouteFor('roadmaps')).toBe('/roadmap');
    expect(navRouteFor('resume')).toBe('/curriculum/upload');
  });

  it('ignores destinations that do not have a page', () => {
    expect(navRouteFor('settings')).toBeNull();
  });
});
