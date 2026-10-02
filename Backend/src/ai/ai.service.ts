import { SkillCategory } from '@startintech/shared';
import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/nestjs';
import { OPENROUTER_SKILL_EXTRACTION_JSON_SCHEMA } from './openrouter-skill-extraction.schema.js';

const OPENROUTER_CHAT_URL = 'https://openrouter.ai/api/v1/chat/completions';
const REQUEST_TIMEOUT_MS = 15_000;
const DEFAULT_OPENROUTER_MODEL = 'openai/gpt-4o-mini';

export interface CareerContextForExtraction {
  name: string;
  slug: string;
  description: string;
}

export interface RawExtractedSkill {
  name: string;
  category: SkillCategory;
}

export interface AiSkillExtractionResult {
  detectedSkills: RawExtractedSkill[];
  missingSkills: RawExtractedSkill[];
  insufficientText: boolean;
}

export type FetchFn = typeof fetch;

@Injectable()
export class AiService {
  fetchImpl: FetchFn;

  constructor(private readonly config: ConfigService) {
    this.fetchImpl = fetch.bind(globalThis);
  }

  async extractSkillsFromResume(
    resumeText: string,
    career: CareerContextForExtraction,
  ): Promise<AiSkillExtractionResult> {
    const apiKey =
      this.config.get<string>('OPENROUTER_API_KEY') ??
      process.env.OPENROUTER_API_KEY;
    if (!apiKey?.trim()) {
      this.reportAndThrowGateway(new Error('OPENROUTER_API_KEY is not configured'));
    }

    const model =
      this.config.get<string>('OPENROUTER_MODEL') ??
      process.env.OPENROUTER_MODEL ??
      DEFAULT_OPENROUTER_MODEL;

    const body = {
      model,
      messages: [
        {
          role: 'system',
          content: [
            'You compare a candidate resume against a target career track.',
            'Return structured JSON only.',
            'detectedSkills: skills evidenced in the resume.',
            'missingSkills: important skills for the career track that are not evidenced in the resume.',
            'Set insufficientText to true when the resume text is too sparse to analyze reliably.',
          ].join(' '),
        },
        {
          role: 'user',
          content: [
            `Career track: ${career.name} (${career.slug})`,
            `Career description: ${career.description}`,
            'Resume text:',
            resumeText,
          ].join('\n\n'),
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: OPENROUTER_SKILL_EXTRACTION_JSON_SCHEMA,
      },
    };

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await this.fetchImpl(OPENROUTER_CHAT_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });

        if (response.status === 500 && attempt === 0) {
          await delay(1_000);
          continue;
        }

        if (!response.ok) {
          this.reportAndThrowGateway(
            new Error(`OpenRouter responded with status ${response.status}`),
          );
        }

        const payload = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = payload.choices?.[0]?.message?.content;
        if (!content) {
          this.reportAndThrowGateway(
            new Error('OpenRouter response missing message content'),
          );
        }

        return this.parseModelContent(content);
      } catch (error) {
        if (error instanceof BadGatewayException) {
          throw error;
        }
        this.reportAndThrowGateway(error);
      }
    }

    this.reportAndThrowGateway(new Error('OpenRouter request failed after retry'));
  }

  private parseModelContent(content: string): AiSkillExtractionResult {
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (error) {
      this.reportAndThrowGateway(error);
    }

    const record = parsed as {
      detectedSkills?: RawExtractedSkill[];
      missingSkills?: RawExtractedSkill[];
      insufficientText?: boolean;
    };

    if (
      !Array.isArray(record.detectedSkills) ||
      !Array.isArray(record.missingSkills) ||
      typeof record.insufficientText !== 'boolean'
    ) {
      this.reportAndThrowGateway(new Error('OpenRouter JSON schema mismatch'));
    }

    return {
      detectedSkills: record.detectedSkills,
      missingSkills: record.missingSkills,
      insufficientText: record.insufficientText,
    };
  }

  private reportAndThrowGateway(error: unknown): never {
    Sentry.captureException(error);
    throw new BadGatewayException('Skill extraction provider unavailable');
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
