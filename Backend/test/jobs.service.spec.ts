import { BadGatewayException } from '@nestjs/common';
import { JobSortBy, SeniorityLevel, WorkplaceType } from '@startintech/shared';
import * as Sentry from '@sentry/nestjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  ProfileRecord,
  ProfilesRepository,
} from '../src/profiles/profiles.repository.js';
import { ProfilesService } from '../src/profiles/profiles.service.js';
import type { AdzunaJobListingInput } from '../src/jobs/adzuna-job.adapter.js';
import { AdzunaJobAdapter } from '../src/jobs/adzuna-job.adapter.js';
import { JobMatchingService } from '../src/jobs/job-matching.service.js';
import type {
  JobListingRecord,
  JobsRepository,
  ListJobsFilterParams,
} from '../src/jobs/jobs.repository.js';
import { JobsService } from '../src/jobs/jobs.service.js';
import type { ResumesService } from '../src/resumes/resumes.service.js';

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

function jobRecord(
  id: string,
  title: string,
  options?: {
    createdAt?: Date;
    requirements?: JobListingRecord['requirements'];
  },
): JobListingRecord {
  return {
    id,
    title,
    company: 'Acme',
    location: 'São Paulo',
    workplaceType: WorkplaceType.ON_SITE,
    description: 'Desc',
    applicationUrl: `https://example.com/${id}`,
    createdAt: options?.createdAt ?? new Date('2025-01-01T00:00:00.000Z'),
    careerTrack: {
      id: CAREER_TRACK.id,
      name: CAREER_TRACK.name,
    },
    requirements: options?.requirements ?? [],
  };
}

class FakeJobsRepository implements JobsRepository {
  findAllCalls = 0;
  upsertCalls = 0;
  lastUpsertListings: AdzunaJobListingInput[] = [];

  constructor(
    private readonly sequences: JobListingRecord[][],
    private readonly cachedCount = 0,
  ) {}

  countActiveByCareerTrack(): Promise<number> {
    return Promise.resolve(this.cachedCount);
  }

  findAllForListing(
    _params: ListJobsFilterParams,
  ): Promise<JobListingRecord[]> {
    this.findAllCalls += 1;
    const next = this.sequences.shift();
    return Promise.resolve(next ?? []);
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

class FakeResumesService {
  constructor(
    private readonly result: {
      hasResumeAnalyzed: boolean;
      presentSkillIds: string[];
    },
  ) {}

  findLatestPresentSkills() {
    return Promise.resolve(this.result);
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
  resumes: FakeResumesService = new FakeResumesService({
    hasResumeAnalyzed: false,
    presentSkillIds: [],
  }),
): JobsService {
  return new JobsService(
    profilesService(),
    resumes as unknown as ResumesService,
    new JobMatchingService(),
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
      Array.from({ length: 12 }, (_, index) =>
        jobRecord(`job-${index}`, `Role ${index}`),
      ),
    ]);
    const adzuna = new FakeAdzunaAdapter();
    const service = jobsService(repository, adzuna);

    const response = await service.listJobs(USER_ID, { page: 1, limit: 10 });

    expect(adzuna.searchCalls).toBe(0);
    expect(repository.upsertCalls).toBe(0);
    expect(repository.findAllCalls).toBe(1);
    expect(response.items).toHaveLength(10);
    expect(response.meta).toEqual({
      total: 12,
      page: 1,
      limit: 10,
      totalPages: 2,
      hasNextPage: true,
    });
    expect(response.items[0]?.match).toBeNull();
    expect(response.items[0]?.requirements).toEqual([]);
  });

  it('calls Adzuna on cache miss, upserts listings, and re-queries', async () => {
    const repository = new FakeJobsRepository(
      [
        [jobRecord('job-1', 'Junior Dev')],
        [jobRecord('job-2', 'Frontend Dev')],
      ],
      15,
    );
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
    expect(repository.findAllCalls).toBe(2);
    expect(response.meta.total).toBe(1);
    expect(response.items[0]?.title).toBe('Frontend Dev');
  });

  it('returns stale cache and reports to Sentry when Adzuna fails but rows exist', async () => {
    const repository = new FakeJobsRepository(
      [[jobRecord('job-1', 'Cached role')]],
      3,
    );
    const adzuna = new FakeAdzunaAdapter();
    adzuna.error = new Error('Adzuna responded with status 503');

    const service = jobsService(repository, adzuna);
    const response = await service.listJobs(USER_ID, { page: 1, limit: 10 });

    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    expect(response.meta.total).toBe(1);
    expect(response.items).toHaveLength(1);
  });

  it('throws 502 when Adzuna fails and there is no cached data', async () => {
    const repository = new FakeJobsRepository([[]], 0);
    const adzuna = new FakeAdzunaAdapter();
    adzuna.error = new Error('Adzuna responded with status 503');

    const service = jobsService(repository, adzuna);

    await expect(
      service.listJobs(USER_ID, { page: 1, limit: 10 }),
    ).rejects.toBeInstanceOf(BadGatewayException);
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
  });

  it('sorts by match score descending and keeps null matches last', async () => {
    const skillA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001';
    const skillB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb001';
    const skillC = 'cccccccc-cccc-4ccc-8ccc-cccccccc0001';
    const repository = new FakeJobsRepository([
      [
        jobRecord('low', 'Low Match', {
          requirements: [
            { id: skillA, name: 'A', isMandatory: true },
            { id: skillC, name: 'C', isMandatory: false },
          ],
        }),
        jobRecord('high', 'High Match', {
          requirements: [{ id: skillA, name: 'A', isMandatory: true }],
        }),
      ],
    ]);
    const resumes = new FakeResumesService({
      hasResumeAnalyzed: true,
      presentSkillIds: [skillA, skillB],
    });
    const service = jobsService(repository, new FakeAdzunaAdapter(), resumes);

    const response = await service.listJobs(USER_ID, {
      sortBy: JobSortBy.MATCH_SCORE,
      limit: 2,
    });

    expect(response.items.map((item) => item.title)).toEqual([
      'High Match',
      'Low Match',
    ]);
    expect(response.items[0]?.match?.score).toBe(100);
    expect(response.items[1]?.match?.score).toBe(75);
  });

  it('filters to only high-compatibility jobs when requested', async () => {
    const skillMandatory = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001';
    const skillGap = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbb001';
    const repository = new FakeJobsRepository([
      [
        jobRecord('seal', 'Seal Job', {
          requirements: [
            { id: skillMandatory, name: 'Core', isMandatory: true },
          ],
        }),
        jobRecord('no-seal', 'No Seal Job', {
          requirements: [
            { id: skillMandatory, name: 'Core', isMandatory: true },
            { id: skillGap, name: 'Gap', isMandatory: true },
          ],
        }),
      ],
    ]);
    const resumes = new FakeResumesService({
      hasResumeAnalyzed: true,
      presentSkillIds: [skillMandatory],
    });
    const service = jobsService(repository, new FakeAdzunaAdapter(), resumes);

    const response = await service.listJobs(USER_ID, {
      onlyHighCompatibility: true,
      limit: 2,
    });

    expect(response.items).toHaveLength(1);
    expect(response.items[0]?.title).toBe('Seal Job');
    expect(response.items[0]?.match?.isHighCompatibility).toBe(true);
  });

  it('returns an empty page for high-compatibility filter without resume analysis', async () => {
    const repository = new FakeJobsRepository([
      [jobRecord('job-1', 'Any Job')],
    ]);
    const service = jobsService(repository, new FakeAdzunaAdapter());

    const response = await service.listJobs(USER_ID, {
      onlyHighCompatibility: true,
    });

    expect(response.items).toHaveLength(0);
    expect(response.meta.total).toBe(0);
  });
});
