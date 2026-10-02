import { describe, expect, it } from 'vitest';
import { AtsScoringService } from '../src/resumes/ats-scoring.service.js';

describe('AtsScoringService', () => {
  const scoring = new AtsScoringService();

  it('scores 0 when five skills are missing and no sections are detected', () => {
    expect(
      scoring.computeAtsScore({
        presentSkillCount: 0,
        missingSkillCount: 5,
        resumeText: 'Unstructured resume body without headings.',
      }),
    ).toBe(0);
  });

  it('scores 100 when all skills are present and all five sections are detected', () => {
    const resumeText = [
      'Contact',
      'john@example.com',
      'Experience',
      'Built apps',
      'Education',
      'BS CS',
      'Skills',
      'TypeScript',
      'Projects',
      'Portfolio site',
    ].join('\n');

    expect(
      scoring.computeAtsScore({
        presentSkillCount: 5,
        missingSkillCount: 0,
        resumeText,
      }),
    ).toBe(100);
  });

  it('scores 35 when one skill is present, one missing, and no sections', () => {
    expect(
      scoring.computeAtsScore({
        presentSkillCount: 1,
        missingSkillCount: 1,
        resumeText: 'Plain paragraph without section headings.',
      }),
    ).toBe(35);
  });

  it('scores 47 when two skills are present, two missing, and two sections', () => {
    const resumeText = ['Experience', 'Worked here', 'Skills', 'Go'].join('\n');

    expect(
      scoring.computeAtsScore({
        presentSkillCount: 2,
        missingSkillCount: 2,
        resumeText,
      }),
    ).toBe(47);
  });

  it('detects Portuguese section headings', () => {
    const resumeText = [
      'Contato',
      'email@test.com',
      'Experiência',
      'Empresa X',
      'Formação',
      'Universidade',
      'Habilidades',
      'Java',
      'Projetos',
      'App mobile',
    ].join('\n');

    expect(scoring.countDetectedSections(resumeText)).toBe(5);
  });
});
