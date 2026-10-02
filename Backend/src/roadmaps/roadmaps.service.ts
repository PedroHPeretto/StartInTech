import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { RoadmapDetailResponseDto } from '@startintech/shared';
import { ProfilesService } from '../profiles/profiles.service.js';
import { buildRoadmapTree } from './build-roadmap-tree.js';
import {
  ROADMAPS_REPOSITORY,
  type RoadmapsRepository,
} from './roadmaps.repository.js';

@Injectable()
export class RoadmapsService {
  constructor(
    private readonly profiles: ProfilesService,
    @Inject(ROADMAPS_REPOSITORY)
    private readonly roadmaps: RoadmapsRepository,
  ) {}

  async getMyTrack(userId: string): Promise<RoadmapDetailResponseDto> {
    const profile = await this.profiles.getByUserId(userId);
    const roadmap = await this.roadmaps.findWithNodesByCareerTrackId(
      profile.careerTrack.id,
    );
    if (!roadmap) {
      throw new NotFoundException('Career roadmap not found');
    }

    return {
      id: roadmap.id,
      title: roadmap.title,
      description: roadmap.description,
      careerTrack: {
        id: profile.careerTrack.id,
        name: profile.careerTrack.name,
        slug: profile.careerTrack.slug,
      },
      nodes: buildRoadmapTree(roadmap.nodes),
    };
  }
}
