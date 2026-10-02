import { SeniorityLevel } from '@startintech/shared';

const seniorityValues = Object.values(SeniorityLevel);

export const OPENROUTER_FEEDBACK_JSON_SCHEMA = {
  name: 'resume_pedagogical_feedback',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      summary: { type: 'string' },
      strengths: {
        type: 'array',
        items: { type: 'string' },
      },
      improvements: {
        type: 'array',
        items: { type: 'string' },
      },
      actionPlan: {
        type: 'array',
        items: { type: 'string' },
      },
      marketReadiness: { type: 'string', enum: seniorityValues },
    },
    required: [
      'summary',
      'strengths',
      'improvements',
      'actionPlan',
      'marketReadiness',
    ],
    additionalProperties: false,
  },
} as const;
