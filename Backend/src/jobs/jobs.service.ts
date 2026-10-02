import {
  EmploymentType,
  SeniorityLevel,
  WorkplaceType,
  type JobOpportunityDto,
  type JobQueryDto,
  type JobSearchResponseDto,
} from '@startintech/shared';
import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/nestjs';
import { ProfilesService } from '../profiles/profiles.service.js';

const ADZUNA_SEARCH_URL = 'https://api.adzuna.com/v1/api/jobs/br/search';
const RESULTS_PER_PAGE = 20;

const CAREER_SEARCH_KEYWORDS: Record<string, string> = {
  'software-development': 'desenvolvedor de software',
  'data-analysis': 'analista de dados',
  'data-science': 'cientista de dados',
  'ui-ux-design': 'designer ui ux',
  'devops': 'engenheiro devops',
  'product-management': 'product manager',
  'quality-assurance': 'analista de qualidade',
  'cybersecurity': 'analista de segurança',
};

export type FetchFn = typeof fetch;

interface AdzunaJobResult {
  id: string;
  title: string;
  description: string;
  created: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  contract_time?: string;
  contract_type?: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
}

interface AdzunaSearchResponse {
  results?: AdzunaJobResult[];
}

@Injectable()
export class JobsService {
  fetchImpl: FetchFn;

  constructor(
    private readonly config: ConfigService,
    private readonly profiles: ProfilesService,
  ) {
    this.fetchImpl = fetch.bind(globalThis);
  }

  async search(
    userId: string,
    query: JobQueryDto,
  ): Promise<JobSearchResponseDto> {
    const profile = await this.profiles.getByUserId(userId);
    const keyword = this.resolveKeyword(profile, query.technology);
    const jobs = await this.fetchFromAdzuna(keyword, query.location);
    const mapped = jobs.map((job) => mapAdzunaJob(job));
    const filtered = query.workplaceType
      ? mapped.filter((job) => job.workplaceType === query.workplaceType)
      : mapped;
    return { jobs: filtered };
  }

  private resolveKeyword(
    profile: Awaited<ReturnType<ProfilesService['getByUserId']>>,
    technology?: string,
  ): string {
    if (technology?.trim()) {
      return technology.trim();
    }
    const base =
      CAREER_SEARCH_KEYWORDS[profile.careerTrack.slug] ??
      profile.careerTrack.name.toLowerCase();
    const seniorityWord =
      profile.seniorityLevel === SeniorityLevel.INTERNSHIP
        ? 'estágio'
        : 'junior';
    return `${base} ${seniorityWord}`;
  }

  private async fetchFromAdzuna(
    what: string,
    where?: string,
  ): Promise<AdzunaJobResult[]> {
    const appId =
      this.config.get<string>('ADZUNA_APP_ID') ?? process.env.ADZUNA_APP_ID;
    const appKey =
      this.config.get<string>('ADZUNA_APP_KEY') ?? process.env.ADZUNA_APP_KEY;
    if (!appId?.trim() || !appKey?.trim()) {
      this.reportAndThrowGateway(new Error('Adzuna credentials are not configured'));
    }

    const params = new URLSearchParams({
      app_id: appId,
      app_key: appKey,
      what,
      results_per_page: String(RESULTS_PER_PAGE),
      'content-type': 'application/json',
    });
    if (where?.trim()) {
      params.set('where', where.trim());
    }

    const url = `${ADZUNA_SEARCH_URL}/1?${params.toString()}`;
    let response: Response;
    try {
      response = await this.fetchImpl(url);
    } catch (error) {
      this.reportAndThrowGateway(error);
    }

    if (!response.ok) {
      this.reportAndThrowGateway(
        new Error(`Adzuna search failed with status ${response.status}`),
      );
    }

    let body: AdzunaSearchResponse;
    try {
      body = (await response.json()) as AdzunaSearchResponse;
    } catch (error) {
      this.reportAndThrowGateway(error);
    }

    return body.results ?? [];
  }

  private reportAndThrowGateway(error: unknown): never {
    Sentry.captureException(error);
    throw new BadGatewayException('Job search provider unavailable');
  }
}

export function mapAdzunaJob(job: AdzunaJobResult): JobOpportunityDto {
  const text = `${job.title} ${job.description} ${job.location?.display_name ?? ''}`;
  return {
    id: String(job.id),
    title: job.title,
    company: job.company?.display_name ?? 'Empresa não informada',
    location: job.location?.display_name ?? 'Brasil',
    workplaceType: inferWorkplaceType(text),
    employmentType: inferEmploymentType(job, text),
    salaryMin: job.salary_min,
    salaryMax: job.salary_max,
    description: job.description,
    applyUrl: job.redirect_url,
    postedAt: job.created,
  };
}

export function inferWorkplaceType(text: string): WorkplaceType {
  const normalized = text.toLowerCase();
  if (
    /\b(remot[oa]|remote|home office|trabalho remoto)\b/.test(normalized)
  ) {
    return WorkplaceType.REMOTE;
  }
  if (/\b(h[ií]brido|hybrid)\b/.test(normalized)) {
    return WorkplaceType.HYBRID;
  }
  return WorkplaceType.ON_SITE;
}

export function inferEmploymentType(
  job: AdzunaJobResult,
  text: string,
): EmploymentType {
  const normalized = text.toLowerCase();
  if (
    /\b(est[aá]gio|internship|trainee)\b/.test(normalized) ||
    job.contract_type?.toLowerCase() === 'internship'
  ) {
    return EmploymentType.INTERNSHIP;
  }
  if (
    job.contract_time === 'part_time' ||
    /\b(meio período|part[- ]time)\b/.test(normalized)
  ) {
    return EmploymentType.PART_TIME;
  }
  if (
    job.contract_type === 'contract' ||
    /\b(pj|contrato|freelance)\b/.test(normalized)
  ) {
    return EmploymentType.CONTRACT;
  }
  return EmploymentType.FULL_TIME;
}
