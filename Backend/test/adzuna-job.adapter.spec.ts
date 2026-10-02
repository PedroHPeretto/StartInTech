import { WorkplaceType } from '@startintech/shared';
import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AdzunaJobAdapter,
  mapWorkplaceTypeFromText,
  stripHtmlTags,
} from '../src/jobs/adzuna-job.adapter.js';

function createConfig(): ConfigService {
  return {
    get: (key: string) => {
      if (key === 'ADZUNA_APP_ID') {
        return 'test-app-id';
      }
      if (key === 'ADZUNA_APP_KEY') {
        return 'test-app-key';
      }
      return undefined;
    },
  } as ConfigService;
}

describe('Adzuna job adapter helpers', () => {
  it('strips HTML tags from descriptions', () => {
    expect(stripHtmlTags('<p>Hello <strong>world</strong></p>')).toBe(
      'Hello world',
    );
  });

  it('maps workplace types from location and title text', () => {
    expect(mapWorkplaceTypeFromText('São Paulo', 'Dev híbrido')).toBe(
      WorkplaceType.HYBRID,
    );
    expect(mapWorkplaceTypeFromText('Brasil', 'Engenheiro hybrid')).toBe(
      WorkplaceType.HYBRID,
    );
    expect(mapWorkplaceTypeFromText('Remoto', 'Analista')).toBe(
      WorkplaceType.REMOTE,
    );
    expect(mapWorkplaceTypeFromText('SP', 'Home office developer')).toBe(
      WorkplaceType.REMOTE,
    );
    expect(mapWorkplaceTypeFromText('São Paulo', 'Desenvolvedor')).toBe(
      WorkplaceType.ON_SITE,
    );
  });
});

describe('AdzunaJobAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls Adzuna BR search with credentials and maps results', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        results: [
          {
            title: 'Dev Junior',
            company: { display_name: 'Acme' },
            location: { display_name: 'Remoto' },
            description: '<p>Build APIs</p>',
            redirect_url: 'https://example.com/apply/1',
          },
        ],
      }),
    });

    const adapter = new AdzunaJobAdapter(createConfig());
    adapter.fetchImpl = fetchMock;

    const listings = await adapter.searchJobs({
      careerTrackName: 'Desenvolvimento de Software',
      careerTrackSlug: 'software-development',
      page: 2,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toContain('/v1/api/jobs/br/search/2');
    expect(url).toContain('app_id=test-app-id');
    expect(url).toContain('app_key=test-app-key');
    const parsedUrl = new URL(url);
    expect(parsedUrl.searchParams.get('what')).toBe(
      'Desenvolvimento de Software desenvolvedor junior estágio',
    );

    expect(listings).toEqual([
      {
        title: 'Dev Junior',
        company: 'Acme',
        location: 'Remoto',
        workplaceType: WorkplaceType.REMOTE,
        description: 'Build APIs',
        applicationUrl: 'https://example.com/apply/1',
      },
    ]);
  });

  it('throws when Adzuna responds with an error status', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
    });
    const adapter = new AdzunaJobAdapter(createConfig());
    adapter.fetchImpl = fetchMock;

    await expect(
      adapter.searchJobs({
        careerTrackName: 'Análise de Dados',
        careerTrackSlug: 'data-analysis',
      }),
    ).rejects.toThrow('Adzuna responded with status 503');
  });
});
