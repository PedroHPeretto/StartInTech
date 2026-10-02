import { NotFoundException } from '@nestjs/common';
import {
  SeniorityLevel,
  SkillPriority,
  type RoadmapNodeResponseDto,
} from '@startintech/shared';
import { describe, expect, it } from 'vitest';
import type {
  ProfileRecord,
  ProfilesRepository,
} from '../src/profiles/profiles.repository.js';
import { ProfilesService } from '../src/profiles/profiles.service.js';
import type {
  CareerRoadmapRecord,
  RoadmapNodeRecord,
  RoadmapsRepository,
} from '../src/roadmaps/roadmaps.repository.js';
import { RoadmapsService } from '../src/roadmaps/roadmaps.service.js';

const USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

const SOFTWARE_TRACK = {
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
  careerTrack: SOFTWARE_TRACK,
};

class FakeRoadmapsRepository implements RoadmapsRepository {
  calls = 0;
  lastCareerTrackId: string | null = null;

  constructor(private readonly roadmap: CareerRoadmapRecord | null) {}

  findWithNodesByCareerTrackId(
    careerTrackId: string,
  ): Promise<CareerRoadmapRecord | null> {
    this.calls += 1;
    this.lastCareerTrackId = careerTrackId;
    return Promise.resolve(this.roadmap);
  }
}

function profilesService(profile: ProfileRecord | null): ProfilesService {
  const repository: ProfilesRepository = {
    findCareerTrackById: () => Promise.resolve(null),
    findByUserId: () => Promise.resolve(profile),
    create: () => Promise.reject(new Error('not used')),
  };
  return new ProfilesService(repository);
}

function node(
  id: string,
  parentNodeId: string | null,
  sequenceOrder: number,
  priority: SkillPriority,
  title: string,
): RoadmapNodeRecord {
  return {
    id,
    parentNodeId,
    sequenceOrder,
    priority,
    title,
    description: null,
    skillId: null,
  };
}

function collectIds(nodes: RoadmapNodeResponseDto[]): string[] {
  const ids: string[] = [];
  const visit = (items: RoadmapNodeResponseDto[]) => {
    for (const item of items) {
      ids.push(item.id);
      visit(item.children);
    }
  };
  visit(nodes);
  return ids;
}

function hasEdge(
  nodes: RoadmapNodeResponseDto[],
  parentId: string,
  childId: string,
): boolean {
  for (const item of nodes) {
    if (
      item.id === parentId &&
      item.children.some((child) => child.id === childId)
    ) {
      return true;
    }
    if (hasEdge(item.children, parentId, childId)) {
      return true;
    }
  }
  return false;
}

describe('RoadmapsService', () => {
  it('nests flat nodes more than one level deep for the profile career', async () => {
    const repository = new FakeRoadmapsRepository({
      id: 'roadmap-1',
      title: 'Trilha de Desenvolvimento de Software',
      description: 'Da lógica até a primeira aplicação web',
      nodes: [
        node('fundamentos', null, 1, SkillPriority.ESSENTIAL, 'Fundamentos'),
        node('logica', 'fundamentos', 1, SkillPriority.ESSENTIAL, 'Lógica'),
        node(
          'estruturas',
          'logica',
          1,
          SkillPriority.RECOMMENDED,
          'Estruturas de dados',
        ),
      ],
    });
    const service = new RoadmapsService(profilesService(PROFILE), repository);

    const result = await service.getMyTrack(USER_ID);

    expect(repository.lastCareerTrackId).toBe(SOFTWARE_TRACK.id);
    expect(result).toEqual({
      id: 'roadmap-1',
      title: 'Trilha de Desenvolvimento de Software',
      description: 'Da lógica até a primeira aplicação web',
      careerTrack: SOFTWARE_TRACK,
      nodes: [
        {
          id: 'fundamentos',
          title: 'Fundamentos',
          description: null,
          priority: SkillPriority.ESSENTIAL,
          sequenceOrder: 1,
          skillId: null,
          lessons: [],
          children: [
            {
              id: 'logica',
              title: 'Lógica',
              description: null,
              priority: SkillPriority.ESSENTIAL,
              sequenceOrder: 1,
              skillId: null,
              lessons: [],
              children: [
                {
                  id: 'estruturas',
                  title: 'Estruturas de dados',
                  description: null,
                  priority: SkillPriority.RECOMMENDED,
                  sequenceOrder: 1,
                  skillId: null,
                  lessons: [],
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('orders siblings by sequence and breaks ties with priority', async () => {
    const repository = new FakeRoadmapsRepository({
      id: 'roadmap-1',
      title: 'Trilha',
      description: null,
      nodes: [
        node('root', null, 1, SkillPriority.ESSENTIAL, 'Root'),
        node(
          'advanced-late',
          'root',
          2,
          SkillPriority.ADVANCED,
          'Advanced late',
        ),
        node(
          'essential-tie',
          'root',
          2,
          SkillPriority.ESSENTIAL,
          'Essential tie',
        ),
        node(
          'recommended-tie',
          'root',
          2,
          SkillPriority.RECOMMENDED,
          'Recommended tie',
        ),
        node('first', 'root', 1, SkillPriority.ADVANCED, 'First'),
      ],
    });
    const service = new RoadmapsService(profilesService(PROFILE), repository);

    const result = await service.getMyTrack(USER_ID);

    expect(result.nodes[0]?.children.map((child) => child.id)).toEqual([
      'first',
      'essential-tie',
      'recommended-tie',
      'advanced-late',
    ]);
  });

  it('places a node whose parent is missing at the root', async () => {
    const repository = new FakeRoadmapsRepository({
      id: 'roadmap-1',
      title: 'Trilha',
      description: null,
      nodes: [
        node('root', null, 2, SkillPriority.ESSENTIAL, 'Root'),
        node(
          'orphan',
          'missing-parent',
          1,
          SkillPriority.RECOMMENDED,
          'Orphan',
        ),
      ],
    });
    const service = new RoadmapsService(profilesService(PROFILE), repository);

    const result = await service.getMyTrack(USER_ID);

    expect(result.nodes.map((item) => item.id)).toEqual(['orphan', 'root']);
    expect(result.nodes[0]?.children).toEqual([]);
    expect(result.nodes[1]?.children).toEqual([]);
  });

  it('returns when a parent reference is circular', async () => {
    const repository = new FakeRoadmapsRepository({
      id: 'roadmap-1',
      title: 'Trilha',
      description: null,
      nodes: [
        node('node-a', 'node-b', 1, SkillPriority.ESSENTIAL, 'A'),
        node('node-b', 'node-a', 2, SkillPriority.RECOMMENDED, 'B'),
      ],
    });
    const service = new RoadmapsService(profilesService(PROFILE), repository);

    const result = await service.getMyTrack(USER_ID);
    const ids = collectIds(result.nodes);

    expect(ids).toHaveLength(2);
    expect(new Set(ids)).toEqual(new Set(['node-a', 'node-b']));
    expect(
      hasEdge(result.nodes, 'node-a', 'node-b') ||
        hasEdge(result.nodes, 'node-b', 'node-a'),
    ).toBe(true);
  });

  it('throws not found when the user has no profile', async () => {
    const repository = new FakeRoadmapsRepository(null);
    const service = new RoadmapsService(profilesService(null), repository);

    await expect(service.getMyTrack(USER_ID)).rejects.toThrow(
      new NotFoundException('Profile not found'),
    );
    expect(repository.calls).toBe(0);
  });

  it('throws not found when the career has no roadmap', async () => {
    const repository = new FakeRoadmapsRepository(null);
    const service = new RoadmapsService(profilesService(PROFILE), repository);

    await expect(service.getMyTrack(USER_ID)).rejects.toThrow(
      new NotFoundException('Career roadmap not found'),
    );
  });

  it('loads roadmap nodes in a single repository read', async () => {
    const repository = new FakeRoadmapsRepository({
      id: 'roadmap-1',
      title: 'Trilha',
      description: null,
      nodes: [
        node('root', null, 1, SkillPriority.ESSENTIAL, 'Root'),
        node('child-a', 'root', 1, SkillPriority.ESSENTIAL, 'Child A'),
        node('child-b', 'root', 2, SkillPriority.RECOMMENDED, 'Child B'),
        node('grandchild', 'child-a', 1, SkillPriority.ADVANCED, 'Grandchild'),
      ],
    });
    const service = new RoadmapsService(profilesService(PROFILE), repository);

    await service.getMyTrack(USER_ID);

    expect(repository.calls).toBe(1);
  });
});
