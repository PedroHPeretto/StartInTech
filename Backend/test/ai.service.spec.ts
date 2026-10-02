import { BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/nestjs';
import { SkillCategory } from '@startintech/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AiService } from '../src/ai/ai.service.js';
import { OPENROUTER_SKILL_EXTRACTION_JSON_SCHEMA } from '../src/ai/openrouter-skill-extraction.schema.js';

vi.mock('@sentry/nestjs', () => ({
  captureException: vi.fn(),
}));

function createConfig(): ConfigService {
  return {
    get: (key: string) => {
      if (key === 'OPENROUTER_API_KEY') {
        return 'test-api-key';
      }
      if (key === 'OPENROUTER_MODEL') {
        return 'openai/gpt-4o-mini';
      }
      return undefined;
    },
  } as ConfigService;
}

function modelResponseBody() {
  return {
    choices: [
      {
        message: {
          content: JSON.stringify({
            detectedSkills: [
              { name: 'TypeScript', category: SkillCategory.LANGUAGE },
            ],
            missingSkills: [
              { name: 'Kubernetes', category: SkillCategory.TOOL },
            ],
            insufficientText: false,
          }),
        },
      },
    ],
  };
}

describe('AiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends strict json_schema payload and maps a valid response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => modelResponseBody(),
    });
    const service = new AiService(createConfig());
    service.fetchImpl = fetchMock;

    const result = await service.extractSkillsFromResume('resume body text', {
      name: 'Full Stack',
      slug: 'full-stack',
      description: 'Build web apps',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, requestInit] = fetchMock.mock.calls[0] as [
      string,
      { body: string },
    ];
    const payload = JSON.parse(requestInit.body) as {
      response_format: { json_schema: unknown };
    };
    expect(payload.response_format.json_schema).toEqual(
      OPENROUTER_SKILL_EXTRACTION_JSON_SCHEMA,
    );
    expect(result.detectedSkills).toEqual([
      { name: 'TypeScript', category: SkillCategory.LANGUAGE },
    ]);
    expect(result.missingSkills).toEqual([
      { name: 'Kubernetes', category: SkillCategory.TOOL },
    ]);
    expect(result.insufficientText).toBe(false);
  });

  it('retries once on HTTP 500 then succeeds', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => modelResponseBody(),
      });
    const service = new AiService(createConfig());
    service.fetchImpl = fetchMock;

    await service.extractSkillsFromResume('resume body text', {
      name: 'Full Stack',
      slug: 'full-stack',
      description: 'Build web apps',
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('maps a second HTTP 500 to gateway error and reports to Sentry', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    const service = new AiService(createConfig());
    service.fetchImpl = fetchMock;

    await expect(
      service.extractSkillsFromResume('resume body text', {
        name: 'Full Stack',
        slug: 'full-stack',
        description: 'Build web apps',
      }),
    ).rejects.toBeInstanceOf(BadGatewayException);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(Sentry.captureException).toHaveBeenCalled();
  });
});
