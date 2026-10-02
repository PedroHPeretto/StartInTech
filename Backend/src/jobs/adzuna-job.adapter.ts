import { WorkplaceType } from '@startintech/shared';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { buildAdzunaSearchWhat } from '../career-tracks/career-track-job-search.js';

const ADZUNA_BASE_URL = 'https://api.adzuna.com';
const REQUEST_TIMEOUT_MS = 15_000;
const ADZUNA_RESULTS_PER_PAGE = 50;

export type FetchFn = typeof fetch;

export interface AdzunaJobListingInput {
  title: string;
  company: string;
  location: string;
  workplaceType: WorkplaceType;
  description: string;
  applicationUrl: string;
}

export interface AdzunaSearchContext {
  careerTrackName: string;
  careerTrackSlug: string;
  page?: number;
}

interface AdzunaApiJob {
  title?: string;
  description?: string;
  redirect_url?: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
}

interface AdzunaApiResponse {
  results?: AdzunaApiJob[];
}

const HYBRID_PATTERN = /\b(h[ií]brido|hybrid)\b/i;
const REMOTE_PATTERN =
  /\b(remoto|remote|home\s*office|trabalho\s*remoto)\b/i;

export function stripHtmlTags(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function mapWorkplaceTypeFromText(
  location: string,
  title: string,
): WorkplaceType {
  const combined = `${location} ${title}`;
  if (HYBRID_PATTERN.test(combined)) {
    return WorkplaceType.HYBRID;
  }
  if (REMOTE_PATTERN.test(combined)) {
    return WorkplaceType.REMOTE;
  }
  return WorkplaceType.ON_SITE;
}

@Injectable()
export class AdzunaJobAdapter {
  fetchImpl: FetchFn;

  constructor(private readonly config: ConfigService) {
    this.fetchImpl = fetch.bind(globalThis);
  }

  buildSearchWhat(careerTrackName: string, careerTrackSlug: string): string {
    return buildAdzunaSearchWhat(careerTrackName, careerTrackSlug);
  }

  async searchJobs(context: AdzunaSearchContext): Promise<AdzunaJobListingInput[]> {
    const appId =
      this.config.get<string>('ADZUNA_APP_ID') ?? process.env.ADZUNA_APP_ID;
    const appKey =
      this.config.get<string>('ADZUNA_APP_KEY') ?? process.env.ADZUNA_APP_KEY;

    if (!appId?.trim() || !appKey?.trim()) {
      throw new Error('Adzuna credentials are not configured');
    }

    const page = context.page ?? 1;
    const what = this.buildSearchWhat(
      context.careerTrackName,
      context.careerTrackSlug,
    );
    const url = new URL(
      `${ADZUNA_BASE_URL}/v1/api/jobs/br/search/${page}`,
    );
    url.searchParams.set('app_id', appId);
    url.searchParams.set('app_key', appKey);
    url.searchParams.set('what', what);
    url.searchParams.set('results_per_page', String(ADZUNA_RESULTS_PER_PAGE));

    const response = await this.fetchImpl(url.toString(), {
      method: 'GET',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`Adzuna responded with status ${response.status}`);
    }

    const payload = (await response.json()) as AdzunaApiResponse;
    const results = payload.results ?? [];

    return results
      .map((job) => this.mapJob(job))
      .filter((job): job is AdzunaJobListingInput => job !== null);
  }

  private mapJob(job: AdzunaApiJob): AdzunaJobListingInput | null {
    const title = job.title?.trim();
    const applicationUrl = job.redirect_url?.trim();
    const company = job.company?.display_name?.trim();
    const location = job.location?.display_name?.trim() ?? '';
    const rawDescription = job.description ?? '';

    if (!title || !applicationUrl || !company) {
      return null;
    }

    const description = stripHtmlTags(rawDescription);
    const workplaceType = mapWorkplaceTypeFromText(location, title);

    return {
      title,
      company,
      location: location || 'Brasil',
      workplaceType,
      description,
      applicationUrl,
    };
  }
}
