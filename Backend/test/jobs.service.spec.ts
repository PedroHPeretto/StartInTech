import { BadGatewayException } from '@nestjs/common';
import { SeniorityLevel, WorkplaceType } from '@startintech/shared';
import * as Sentry from '@sentry/nestjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  ProfileRecord,
  ProfilesRepository,
} from '../src/profiles/profiles.repository.js';
import { ProfilesService } from '../src/profiles/profiles.service.js';
import type { AdzunaJobListingInput } from '../src/jobs/adzuna-job.adapter.js';
import { AdzunaJobAdapter } from '../src/jobs/adzuna-job.adapter.js';
import type {
  JobListingRecord,
  JobsRepository,
  ListJobsParams,
} from '../src/jobs/jobs.repository.js';
import { JobsService } from '../src/jobs/jobs.service.js';

vi.mock('@sentry/nestjs', () => ({
  captureException: vi.fn(),
}));

const USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const CAREER_TRACK = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Desenvolvimento de Software',
  slug: 'software-development',
};

const PROFILE: ProfileRecord = {
  id: 'profile-1',
  userId: USER_ID,
  fullName: 'Ana Silva',
  seniorityLevel: SeniorityLevel.JUNIOR,
  bio: null,
  careerTrack: CAREER_TRACK,
};

function jobRecord(id: string, title: string): JobListingRecord {
  return {
    id,
    title,
    company: 'Acme',
    location: 'São Paulo',
    workplaceType: WorkplaceType.ON_SITE,
    description: 'Desc',
    applicationUrl: `https://example.com/${id}`,
    careerTrack: {
      id: CAREER_TRACK.id,
      name: CAREER_TRACK.name,
    },
  };
}

class FakeJobsRepository implements JobsRepository {
  findPaginatedCalls = 0;
  upsertCalls = 0;
  lastUpsertListings: AdzunaJobListingInput[] = [];

  constructor(
    private readonly sequences: Array<{
      total: number;
      items: JobListingRecord[];
    }>,
    private readonly cachedCount = 0,
  ) {}

  countActiveByCareerTrack(): Promise<number> {
    return Promise.resolve(this.cachedCount);
  }

  findPaginated(params: ListJobsParams): Promise<{
    items: JobListingRecord[];
    total: number;
  }> {
    this.findPaginatedCalls += 1;
    const next = this.sequences.shift();
    if (!next) {
      return Promise.resolve({ items: [], total: 0 });
    }
    return Promise.resolve({
      items: next.items.slice(0, params.limit),
      total: next.total,
    });
  }

  upsertMany(
    _careerTrackId: string,
    listings: AdzunaJobListingInput[],
  ): Promise<void> {
    this.upsertCalls += 1;
    this.lastUpsertListings = listings;
    return Promise.resolve();
  }
}

class FakeAdzunaAdapter {
  searchCalls = 0;
  listings: AdzunaJobListingInput[] = [];
  error: Error | null = null;

  searchJobs(): Promise<AdzunaJobListingInput[]> {
    this.searchCalls += 1;
    if (this.error) {
      return Promise.reject(this.error);
    }
    return Promise.resolve(this.listings);
  }
}

function profilesService(): ProfilesService {
  const repository: ProfilesRepository = {
    findCareerTrackById: () => Promise.resolve(null),
    findByUserId: () => Promise.resolve(PROFILE),
    create: () => Promise.reject(new Error('not used')),
  };
  return new ProfilesService(repository);
}

function jobsService(
  repository: FakeJobsRepository,
  adzuna: FakeAdzunaAdapter,
): JobsService {
  return new JobsService(
    profilesService(),
    adzuna as unknown as AdzunaJobAdapter,
    repository,
  );
}

describe('JobsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns cached results without calling Adzuna when the page is fully covered', async () => {
    const repository = new FakeJobsRepository([
      {
        total: 12,
        items: [jobRecord('job-1', 'Backend Dev')],
      },
    ]);
    const adzuna = new FakeAdzunaAdapter();
    const service = jobsService(repository, adzuna);

    const response = await service.listJobs(USER_ID, { page: 1, limit: 10 });

    expect(adzuna.searchCalls).toBe(0);
    expect(repository.upsertCalls).toBe(0);
    expect(repository.findPaginatedCalls).toBe(1);
    expect(response.items).toHaveLength(1);
    expect(response.meta).toEqual({
      total: 12,
      page: 1,
      limit: 10,
      totalPages: 2,
      hasNextPage: true,
    });
  });

  it('calls Adzuna on cache miss, upserts listings, and re-queries', async () => {
    const repository = new FakeJobsRepository([
      { total: 2, items: [jobRecord('job-1', 'Junior Dev')] },
      { total: 15, items: [jobRecord('job-2', 'Frontend Dev')] },
    ]);
    const adzuna = new FakeAdzunaAdapter();
    adzuna.listings = [
      {
        title: 'Frontend Dev',
        company: 'Beta',
        location: 'Remoto',
        workplaceType: WorkplaceType.REMOTE,
        description: 'React',
        applicationUrl: 'https://example.com/job-2',
      },
    ];

    const service = jobsService(repository, adzuna);
    const response = await service.listJobs(USER_ID, { page: 1, limit: 10 });

    expect(adzuna.searchCalls).toBe(1);
    expect(repository.upsertCalls).toBe(1);
    expect(repository.lastUpsertListings).toEqual(adzuna.listings);
    expect(repository.findPaginatedCalls).toBe(2);
    expect(response.meta.total).toBe(15);
    expect(response.items[0]?.title).toBe('Frontend Dev');
  });

  it('returns stale cache and reports to Sentry when Adzuna fails but rows exist', async () => {
    const repository = new FakeJobsRepository(
      [{ total: 3, items: [jobRecord('job-1', 'Cached role')] }],
      3,
    );
    const adzuna = new FakeAdzunaAdapter();
    adzuna.error = new Error('Adzuna responded with status 503');

    const service = jobsService(repository, adzuna);
    const response = await service.listJobs(USER_ID, { page: 1, limit: 10 });

    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    expect(response.meta.total).toBe(3);
    expect(response.items).toHaveLength(1);
  });

  it('throws 502 when Adzuna fails and there is no cached data', async () => {
    const repository = new FakeJobsRepository([{ total: 0, items: [] }], 0);
    const adzuna = new FakeAdzunaAdapter();
    adzuna.error = new Error('Adzuna responded with status 503');

    const service = jobsService(repository, adzuna);

    await expect(
      service.listJobs(USER_ID, { page: 1, limit: 10 }),
    ).rejects.toBeInstanceOf(BadGatewayException);
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
  });
});
