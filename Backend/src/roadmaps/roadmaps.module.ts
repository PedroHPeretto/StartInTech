import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { ProfilesModule } from '../profiles/profiles.module.js';
import { CareerRoadmap } from './career-roadmap.entity.js';
import { RoadmapNode } from './roadmap-node.entity.js';
import { RoadmapsController } from './roadmaps.controller.js';
import { ROADMAPS_REPOSITORY } from './roadmaps.repository.js';
import { RoadmapsService } from './roadmaps.service.js';
import { TypeOrmRoadmapsRepository } from './typeorm-roadmaps.repository.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([CareerRoadmap, RoadmapNode]),
    AuthModule,
    ProfilesModule,
  ],
  controllers: [RoadmapsController],
  providers: [
    RoadmapsService,
    TypeOrmRoadmapsRepository,
    {
      provide: ROADMAPS_REPOSITORY,
      useExisting: TypeOrmRoadmapsRepository,
    },
  ],
})
export class RoadmapsModule {}
