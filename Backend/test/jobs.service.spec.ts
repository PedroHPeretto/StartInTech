import { BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EmploymentType,
  SeniorityLevel,
  WorkplaceType,
} from '@startintech/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as Sentry from '@sentry/nestjs';
import type { ProfilesRepository } from '../src/profiles/profiles.repository.js';
import { ProfilesService } from '../src/profiles/profiles.service.js';
import {
  inferEmploymentType,
  inferWorkplaceType,
  JobsService,
  mapAdzunaJob,
} from '../src/jobs/jobs.service.js';

vi.mock('@sentry/nestjs', () => ({
  captureException: vi.fn(),
}));

const USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

const PROFILE = {
  id: 'profile-1',
  userId: USER_ID,
  fullName: 'Ana Silva',
  seniorityLevel: SeniorityLevel.JUNIOR,
  bio: null,
  careerTrack: {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Desenvolvimento de Software',
    slug: 'software-development',
  },
  isProfileComplete: true,
};

function createConfig(
  overrides: Partial<{ appId: string; appKey: string }> = {},
): ConfigService {
  return {
    get: (key: string) => {
      if (key === 'ADZUNA_APP_ID') {
        return overrides.appId ?? 'test-app-id';
      }
      if (key === 'ADZUNA_APP_KEY') {
        return overrides.appKey ?? 'test-app-key';
      }
      return undefined;
    },
  } as ConfigService;
}

function profilesService(): ProfilesService {
  const repository: ProfilesRepository = {
    findCareerTrackById: () => Promise.resolve(null),
    findByUserId: () => Promise.resolve(PROFILE),
    create: () => Promise.reject(new Error('not used')),
  };
  return new ProfilesService(repository);
}

const ADZUNA_FIXTURE = {
  results: [
    {
      id: '12345',
      title: 'Desenvolvedor JavaScript Junior',
      description: 'Vaga remota para desenvolvimento web.',
      created: '2026-01-15T00:00:00Z',
      redirect_url: 'https://example.com/apply/12345',
      salary_min: 4000,
      salary_max: 6000,
      contract_time: 'full_time',
      contract_type: 'permanent',
      company: { display_name: 'Acme Tech' },
      location: { display_name: 'São Paulo, SP' },
    },
    {
      id: '67890',
      title: 'Estágio em QA',
      description: 'Presencial em Curitiba.',
      created: '2026-01-10T00:00:00Z',
      redirect_url: 'https://example.com/apply/67890',
      company: { display_name: 'QA Corp' },
      location: { display_name: 'Curitiba, PR' },
    },
  ],
};

describe('JobsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps Adzuna results to shared job DTOs', () => {
    const mapped = mapAdzunaJob(ADZUNA_FIXTURE.results[0]);
    expect(mapped).toEqual({
      id: '12345',
      title: 'Desenvolvedor JavaScript Junior',
      company: 'Acme Tech',
      location: 'São Paulo, SP',
      workplaceType: WorkplaceType.REMOTE,
      employmentType: EmploymentType.FULL_TIME,
      salaryMin: 4000,
      salaryMax: 6000,
      description: 'Vaga remota para desenvolvimento web.',
      applyUrl: 'https://example.com/apply/12345',
      postedAt: '2026-01-15T00:00:00Z',
    });
  });

  it('detects internship roles from Portuguese keywords', () => {
    const job = ADZUNA_FIXTURE.results[1];
    const text = `${job.title} ${job.description}`;
    expect(inferEmploymentType(job, text)).toBe(EmploymentType.INTERNSHIP);
    expect(inferWorkplaceType(text)).toBe(WorkplaceType.ON_SITE);
  });

  it('throws BadGateway when credentials are missing', async () => {
    const service = new JobsService(
      createConfig({ appId: '', appKey: '' }),
      profilesService(),
    );

    await expect(service.search(USER_ID, {})).rejects.toThrow(
      BadGatewayException,
    );
    expect(Sentry.captureException).toHaveBeenCalled();
  });

  it('throws BadGateway when Adzuna responds with an error', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
    });
    const service = new JobsService(createConfig(), profilesService());
    service.fetchImpl = fetchMock;

    await expect(service.search(USER_ID, {})).rejects.toThrow(
      BadGatewayException,
    );
  });

  it('builds a junior keyword from the career slug and filters workplace type', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ADZUNA_FIXTURE,
    });
    const service = new JobsService(createConfig(), profilesService());
    service.fetchImpl = fetchMock;

    const result = await service.search(USER_ID, {
      workplaceType: WorkplaceType.REMOTE,
    });

    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('what=desenvolvedor');
    expect(calledUrl).toContain('junior');
    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0]?.id).toBe('12345');
  });

  it('uses estágio for internship seniority in the default keyword', async () => {
    const internshipProfile = {
      ...PROFILE,
      seniorityLevel: SeniorityLevel.INTERNSHIP,
    };
    const repository: ProfilesRepository = {
      findCareerTrackById: () => Promise.resolve(null),
      findByUserId: () => Promise.resolve(internshipProfile),
      create: () => Promise.reject(new Error('not used')),
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ results: [] }),
    });
    const service = new JobsService(
      createConfig(),
      new ProfilesService(repository),
    );
    service.fetchImpl = fetchMock;

    await service.search(USER_ID, {});

    const calledUrl = decodeURIComponent(fetchMock.mock.calls[0]?.[0] as string);
    expect(calledUrl).toContain('estágio');
  });
});
