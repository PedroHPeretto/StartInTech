import { Injectable } from '@nestjs/common';

const CANONICAL_SECTION_COUNT = 5;

const SECTION_HEADING_PATTERNS: RegExp[] = [
  /^(contact|contato|dados\s+pessoais)\b/i,
  /^(experience|experi[eê]ncia(\s+profissional)?|work\s+history)\b/i,
  /^(education|formação|educação|academic)\b/i,
  /^(skills|habilidades|compet[eê]ncias|technical\s+skills)\b/i,
  /^(projects|projetos|portfolio)\b/i,
];

export interface AtsScoreInput {
  presentSkillCount: number;
  missingSkillCount: number;
  resumeText: string;
}

@Injectable()
export class AtsScoringService {
  computeAtsScore(input: AtsScoreInput): number {
    const coverage = this.skillCoverage(
      input.presentSkillCount,
      input.missingSkillCount,
    );
    const clarity =
      this.countDetectedSections(input.resumeText) / CANONICAL_SECTION_COUNT;
    const raw = 100 * (0.7 * coverage + 0.3 * clarity);
    return Math.min(100, Math.max(0, Math.round(raw)));
  }

  countDetectedSections(resumeText: string): number {
    const lines = resumeText.split(/\r?\n/);
    let matched = 0;
    for (const pattern of SECTION_HEADING_PATTERNS) {
      if (lines.some((line) => pattern.test(line.trim()))) {
        matched += 1;
      }
    }
    return matched;
  }

  private skillCoverage(present: number, missing: number): number {
    const total = present + missing;
    if (total === 0) {
      return 0;
    }
    return present / total;
  }
}
