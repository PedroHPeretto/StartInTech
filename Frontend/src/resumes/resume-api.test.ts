import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  evaluateResume,
  extractResumeSkills,
  fetchResumeHistory,
} from '@/resumes/resume-api';

const postMock = vi.fn();
const getMock = vi.fn();

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    post: (...args: unknown[]) => postMock(...args),
    get: (...args: unknown[]) => getMock(...args),
  },
}));

describe('resume-api ATS endpoints', () => {
  beforeEach(() => {
    postMock.mockReset();
    getMock.mockReset();
  });

  it('posts to evaluate endpoint', async () => {
    postMock.mockResolvedValueOnce({
      data: {
        id: 'resume-1',
        atsScore: 72,
        report: {
          summary: 'Resumo',
          strengths: [],
          improvements: [],
          actionPlan: [],
          marketReadiness: 'JUNIOR',
        },
        createdAt: '2026-03-20T12:00:00.000Z',
        activeVersionsCount: 2,
      },
    });

    const result = await evaluateResume('resume-1');

    expect(postMock).toHaveBeenCalledWith(
      '/api/v1/resumes/resume-1/evaluate',
      {},
    );
    expect(result.atsScore).toBe(72);
  });

  it('gets resume history', async () => {
    getMock.mockResolvedValueOnce({ data: [{ id: 'resume-1' }] });

    const result = await fetchResumeHistory();

    expect(getMock).toHaveBeenCalledWith('/api/v1/resumes/history');
    expect(result).toHaveLength(1);
  });

  it('posts to extract-skills endpoint', async () => {
    postMock.mockResolvedValueOnce({
      data: {
        resumeId: 'resume-1',
        careerTrack: { id: 'track', name: 'Track', slug: 'track' },
        skills: { detected: [], missing: [] },
        totalDetected: 0,
        totalMissing: 0,
      },
    });

    await extractResumeSkills('resume-1');

    expect(postMock).toHaveBeenCalledWith(
      '/api/v1/resumes/resume-1/extract-skills',
      {},
    );
  });
});
