import { describe, expect, it } from 'vitest';
import { getSemanticStrokeColor } from '@/components/metrics/circular-progress-semantic';

describe('getSemanticStrokeColor', () => {
  it('uses red below 50', () => {
    expect(getSemanticStrokeColor(0)).toBe('#EF4444');
    expect(getSemanticStrokeColor(49)).toBe('#EF4444');
  });

  it('uses amber from 50 to 79', () => {
    expect(getSemanticStrokeColor(50)).toBe('#F59E0B');
    expect(getSemanticStrokeColor(79)).toBe('#F59E0B');
  });

  it('uses emerald from 80 to 100', () => {
    expect(getSemanticStrokeColor(80)).toBe('#10B981');
    expect(getSemanticStrokeColor(100)).toBe('#10B981');
  });
});
