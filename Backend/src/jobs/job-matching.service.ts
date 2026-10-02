import { Injectable } from '@nestjs/common';
import type { JobMatchDto, JobMatchSkillDto } from '@startintech/shared';
import type { JobSkillRequirement } from './jobs.repository.js';

export function calculateJobMatch(
  requirements: JobSkillRequirement[],
  presentSkillIds: ReadonlySet<string>,
): JobMatchDto {
  if (requirements.length === 0) {
    return {
      score: 0,
      isHighCompatibility: false,
      matchedSkills: [],
      missingSkills: [],
    };
  }

  const hasMandatory = requirements.some((requirement) => requirement.isMandatory);
  const skillWeight = (requirement: JobSkillRequirement): number => {
    if (!hasMandatory) {
      return 1;
    }
    return requirement.isMandatory ? 3 : 1;
  };

  let matchedWeight = 0;
  let totalWeight = 0;
  const matchedSkills: JobMatchSkillDto[] = [];
  const missingSkills: JobMatchSkillDto[] = [];

  for (const requirement of requirements) {
    const weight = skillWeight(requirement);
    totalWeight += weight;
    const dto: JobMatchSkillDto = {
      id: requirement.id,
      name: requirement.name,
      isMandatory: requirement.isMandatory,
    };
    if (presentSkillIds.has(requirement.id)) {
      matchedWeight += weight;
      matchedSkills.push(dto);
    } else {
      missingSkills.push(dto);
    }
  }

  const rawScore = (100 * matchedWeight) / totalWeight;
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  return {
    score,
    isHighCompatibility: score >= 80,
    matchedSkills,
    missingSkills,
  };
}

@Injectable()
export class JobMatchingService {
  calculateMatch(
    requirements: JobSkillRequirement[],
    presentSkillIds: ReadonlySet<string>,
  ): JobMatchDto {
    return calculateJobMatch(requirements, presentSkillIds);
  }
}
