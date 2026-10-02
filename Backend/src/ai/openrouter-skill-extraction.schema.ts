import { SkillCategory } from '@startintech/shared';

const skillCategoryValues = Object.values(SkillCategory);

export const OPENROUTER_SKILL_EXTRACTION_JSON_SCHEMA = {
  name: 'skill_extraction',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      detectedSkills: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            category: { type: 'string', enum: skillCategoryValues },
          },
          required: ['name', 'category'],
          additionalProperties: false,
        },
      },
      missingSkills: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            category: { type: 'string', enum: skillCategoryValues },
          },
          required: ['name', 'category'],
          additionalProperties: false,
        },
      },
      insufficientText: { type: 'boolean' },
    },
    required: ['detectedSkills', 'missingSkills', 'insufficientText'],
    additionalProperties: false,
  },
} as const;
