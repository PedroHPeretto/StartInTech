import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  RoadmapDetailResponseDto,
  RoadmapProgressResponseDto,
} from '@startintech/shared';
import { ProfilesService } from '../profiles/profiles.service.js';
import { ResumesService } from '../resumes/resumes.service.js';
import { buildRoadmapTree } from './build-roadmap-tree.js';
import { buildDynamicRoadmapProgress } from './enrich-roadmap-progress.js';
import {
  ROADMAPS_REPOSITORY,
  type RoadmapsRepository,
} from './roadmaps.repository.js';

@Injectable()
export class RoadmapsService {
  constructor(
    private readonly profiles: ProfilesService,
    private readonly resumes: ResumesService,
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

  async getMyTrackProgress(userId: string): Promise<RoadmapProgressResponseDto> {
    const profile = await this.profiles.getByUserId(userId);
    const roadmap = await this.roadmaps.findWithNodesByCareerTrackId(
      profile.careerTrack.id,
    );
    if (!roadmap) {
      throw new NotFoundException('Career roadmap not found');
    }

    const { hasResumeAnalyzed, presentSkillIds } =
      await this.resumes.findLatestPresentSkills(userId);
    const baseNodes = buildRoadmapTree(roadmap.nodes);
    const presentSkillIdSet = new Set(presentSkillIds);
    const { nodes, metrics } = buildDynamicRoadmapProgress(
      baseNodes,
      presentSkillIdSet,
      hasResumeAnalyzed,
    );

    return {
      id: roadmap.id,
      title: roadmap.title,
      careerTrack: {
        id: profile.careerTrack.id,
        name: profile.careerTrack.name,
        slug: profile.careerTrack.slug,
      },
      hasResumeAnalyzed,
      metrics,
      nodes,
    };
  }
}
