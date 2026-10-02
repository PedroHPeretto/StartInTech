import { describe, expect, it } from 'vitest';
import { buildHistoryPillLabel } from '@/resumes/resume-history-label';

describe('buildHistoryPillLabel', () => {
  it('formats date, score, and delta versus the older version', () => {
    const label = buildHistoryPillLabel(
      {
        id: 'new',
        atsScore: 82,
        fileUrl: null,
        createdAt: '2026-03-20T12:00:00.000Z',
        isLatest: true,
      },
      {
        id: 'old',
        atsScore: 70,
        fileUrl: null,
        createdAt: '2026-03-10T12:00:00.000Z',
        isLatest: false,
      },
    );

    expect(label).toContain('82');
    expect(label).toContain('(+12)');
  });

  it('omits delta when the older score is missing', () => {
    const label = buildHistoryPillLabel(
      {
        id: 'new',
        atsScore: 55,
        fileUrl: null,
        createdAt: '2026-03-20T12:00:00.000Z',
        isLatest: true,
      },
      {
        id: 'old',
        atsScore: null,
        fileUrl: null,
        createdAt: '2026-03-10T12:00:00.000Z',
        isLatest: false,
      },
    );

    expect(label).toContain('55');
    expect(label).not.toContain('(');
  });
});
