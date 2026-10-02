import { NotFoundException } from '@nestjs/common';
import {
  SeniorityLevel,
  SkillPriority,
  type RoadmapNodeResponseDto,
} from '@startintech/shared';
import { describe, expect, it, vi } from 'vitest';
import type { ProfilesRepository } from '../src/profiles/profiles.repository.js';
import { ProfilesService } from '../src/profiles/profiles.service.js';
import { RoadmapShClient } from '../src/roadmaps/roadmap-sh.client.js';
import { RoadmapsService } from '../src/roadmaps/roadmaps.service.js';

const USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

const SOFTWARE_TRACK = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Desenvolvimento de Software',
  slug: 'software-development',
};

const PROFILE = {
  id: 'profile-1',
  userId: USER_ID,
  fullName: 'Ana Silva',
  seniorityLevel: SeniorityLevel.JUNIOR,
  bio: null,
  careerTrack: SOFTWARE_TRACK,
  isProfileComplete: true,
};

function profilesService(profile: typeof PROFILE | null): ProfilesService {
  const repository: ProfilesRepository = {
    findCareerTrackById: () => Promise.resolve(null),
    findByUserId: () => Promise.resolve(profile),
    create: () => Promise.reject(new Error('not used')),
  };
  return new ProfilesService(repository);
}

function findNodeById(
  nodes: RoadmapNodeResponseDto[],
  id: string,
): RoadmapNodeResponseDto | undefined {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    const nested = findNodeById(node.children, id);
    if (nested) {
      return nested;
    }
  }
  return undefined;
}

describe('RoadmapsService', () => {
  it('loads nested nodes and attaches lessons only on the pack owner topic', async () => {
    const client = new RoadmapShClient();
    client.fetchImpl = vi.fn(async (url: string) => {
      if (url.includes('v1-official-roadmap/full-stack')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            _id: 'roadmap-1',
            description: 'Full stack path',
            title: { page: 'Full Stack Developer' },
          }),
        };
      }
      if (url.includes('v1-roadmap-tree-mapping/full-stack')) {
        return {
          ok: true,
          status: 200,
          json: async () => [
            {
              nodeId: 'internet',
              text: 'Full Stack > Internet',
              isOptional: false,
              lessonPacks: [{ packId: 'pack-internet' }],
            },
            {
              nodeId: 'http',
              text: 'Full Stack > Internet > HTTP',
              isOptional: true,
              lessonPacks: [{ packId: 'pack-internet' }],
            },
            {
              nodeId: 'html',
              text: 'Full Stack > HTML',
              isOptional: false,
            },
          ],
        };
      }
      if (url.includes('v1-list-lesson-packs')) {
        return {
          ok: true,
          status: 200,
          json: async () => [
            { _id: 'pack-internet', slug: 'internet' },
          ],
        };
      }
      if (url.includes('v1-lesson-pack/internet')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            _id: 'pack-internet',
            slug: 'internet',
            freeLessonIds: ['lesson-1'],
            lessons: [
              {
                _id: 'lesson-1',
                title: 'What is HTTP?',
                slug: 'what-is-http',
                description: 'HTTP basics',
                readingTime: { computed: 8 },
                isFree: true,
              },
            ],
          }),
        };
      }
      return { ok: false, status: 404 };
    }) as RoadmapShClient['fetchImpl'];

    const service = new RoadmapsService(profilesService(PROFILE), client);
    const result = await service.getMyTrack(USER_ID);

    expect(result.title).toBe('Full Stack Developer');
    expect(result.careerTrack).toEqual(SOFTWARE_TRACK);

    const internet = findNodeById(result.nodes, 'internet');
    const http = findNodeById(result.nodes, 'http');
    const html = findNodeById(result.nodes, 'html');

    expect(internet?.children.map((child) => child.id)).toEqual(['http']);
    expect(internet?.lessons).toHaveLength(1);
    expect(internet?.lessons[0]?.url).toBe(
      'https://roadmap.sh/packs/internet/what-is-http',
    );
    expect(http?.lessons).toEqual([]);
    expect(html?.priority).toBe(SkillPriority.ESSENTIAL);
    expect(http?.priority).toBe(SkillPriority.RECOMMENDED);
  });

  it('throws not found when the career slug has no Roadmap.sh mapping', async () => {
    const unknownProfile = {
      ...PROFILE,
      careerTrack: {
        ...SOFTWARE_TRACK,
        slug: 'unknown-career',
      },
    };
    const service = new RoadmapsService(
      profilesService(unknownProfile),
      new RoadmapShClient(),
    );

    await expect(service.getMyTrack(USER_ID)).rejects.toThrow(
      new NotFoundException('Career roadmap not found'),
    );
  });

  it('throws not found when Roadmap.sh returns 404', async () => {
    const client = new RoadmapShClient();
    client.fetchImpl = vi.fn(async () => ({
      ok: false,
      status: 404,
    })) as RoadmapShClient['fetchImpl'];
    const service = new RoadmapsService(profilesService(PROFILE), client);

    await expect(service.getMyTrack(USER_ID)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws not found when the user has no profile', async () => {
    const service = new RoadmapsService(
      profilesService(null),
      new RoadmapShClient(),
    );

    await expect(service.getMyTrack(USER_ID)).rejects.toThrow(
      new NotFoundException('Profile not found'),
    );
  });
});
