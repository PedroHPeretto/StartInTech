import { Injectable, NotFoundException } from '@nestjs/common';
import type { RoadmapDetailResponseDto } from '@startintech/shared';
import { ProfilesService } from '../profiles/profiles.service.js';
import { RoadmapShClient } from './roadmap-sh.client.js';

@Injectable()
export class RoadmapsService {
  constructor(
    private readonly profiles: ProfilesService,
    private readonly roadmapSh: RoadmapShClient,
  ) {}

  async getMyTrack(userId: string): Promise<RoadmapDetailResponseDto> {
    const profile = await this.profiles.getByUserId(userId);
    const roadmapSlug = this.roadmapSh.resolveRoadmapSlug(
      profile.careerTrack.slug,
    );
    if (!roadmapSlug) {
      throw new NotFoundException('Career roadmap not found');
    }

    let track: Awaited<ReturnType<RoadmapShClient['fetchTrack']>>;
    try {
      track = await this.roadmapSh.fetchTrack(roadmapSlug);
    } catch {
      throw new NotFoundException('Career roadmap not found');
    }

    if (!track) {
      throw new NotFoundException('Career roadmap not found');
    }

    return {
      id: track.id,
      title: track.title,
      description: track.description,
      careerTrack: {
        id: profile.careerTrack.id,
        name: profile.careerTrack.name,
        slug: profile.careerTrack.slug,
      },
      nodes: track.nodes,
    };
  }
}
