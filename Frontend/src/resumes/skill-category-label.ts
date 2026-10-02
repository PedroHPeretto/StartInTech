import { SkillCategory } from '@startintech/shared';

const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  [SkillCategory.LANGUAGE]: 'Linguagem',
  [SkillCategory.FRAMEWORK]: 'Framework',
  [SkillCategory.DATABASE]: 'Banco de Dados',
  [SkillCategory.TOOL]: 'Ferramenta',
  [SkillCategory.SOFT_SKILL]: 'Soft skill',
};

export function getSkillCategoryLabel(category: SkillCategory): string {
  return SKILL_CATEGORY_LABELS[category];
}
