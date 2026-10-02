import { describe, expect, it } from 'vitest';
import { calculateJobMatch } from '../src/jobs/job-matching.service.js';
import type { JobSkillRequirement } from '../src/jobs/jobs.repository.js';

function requirement(
  id: string,
  name: string,
  isMandatory: boolean,
): JobSkillRequirement {
  return { id, name, isMandatory };
}

describe('calculateJobMatch', () => {
  it('returns 100 and high compatibility when every requirement is matched', () => {
    const requirements = [
      requirement('skill-1', 'JavaScript', true),
      requirement('skill-2', 'React', false),
    ];

    const result = calculateJobMatch(
      requirements,
      new Set(['skill-1', 'skill-2']),
    );

    expect(result).toEqual({
      score: 100,
      isHighCompatibility: true,
      matchedSkills: [
        { id: 'skill-1', name: 'JavaScript', isMandatory: true },
        { id: 'skill-2', name: 'React', isMandatory: false },
      ],
      missingSkills: [],
    });
  });

  it('returns 80 when one mandatory and two desirable skills match 4 of 5 weight', () => {
    const requirements = [
      requirement('mandatory', 'TypeScript', true),
      requirement('desirable-a', 'React', false),
      requirement('desirable-b', 'Node.js', false),
    ];

    const result = calculateJobMatch(
      requirements,
      new Set(['mandatory', 'desirable-a']),
    );

    expect(result.score).toBe(80);
    expect(result.isHighCompatibility).toBe(true);
    expect(result.matchedSkills).toHaveLength(2);
    expect(result.missingSkills).toEqual([
      { id: 'desirable-b', name: 'Node.js', isMandatory: false },
    ]);
  });

  it('returns 79 when 15 of 19 equal-weight skills match', () => {
    const requirements = Array.from({ length: 19 }, (_, index) =>
      requirement(`skill-${index}`, `Skill ${index}`, false),
    );
    const present = new Set(
      requirements.slice(0, 15).map((item) => item.id),
    );

    const result = calculateJobMatch(requirements, present);

    expect(result.score).toBe(79);
    expect(result.isHighCompatibility).toBe(false);
    expect(result.matchedSkills).toHaveLength(15);
    expect(result.missingSkills).toHaveLength(4);
  });

  it('returns 0 when there is no skill overlap', () => {
    const requirements = [
      requirement('skill-1', 'Go', true),
      requirement('skill-2', 'Rust', false),
    ];

    const result = calculateJobMatch(requirements, new Set(['other-skill']));

    expect(result).toEqual({
      score: 0,
      isHighCompatibility: false,
      matchedSkills: [],
      missingSkills: [
        { id: 'skill-1', name: 'Go', isMandatory: true },
        { id: 'skill-2', name: 'Rust', isMandatory: false },
      ],
    });
  });

  it('returns zero score and empty lists when the job has no skills', () => {
    const result = calculateJobMatch([], new Set(['skill-1']));

    expect(result).toEqual({
      score: 0,
      isHighCompatibility: false,
      matchedSkills: [],
      missingSkills: [],
    });
  });
});
