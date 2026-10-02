import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from '../ai/ai.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { ProfilesModule } from '../profiles/profiles.module.js';
import { GcsStorageService } from './gcs-storage.service.js';
import { ResumeAnalysisSkill } from './resume-analysis-skill.entity.js';
import { ResumeAnalysis } from './resume-analysis.entity.js';
import { ResumesController } from './resumes.controller.js';
import { RESUMES_REPOSITORY } from './resumes.repository.js';
import { ResumesService } from './resumes.service.js';
import { Skill } from './skill.entity.js';
import { TypeOrmResumesRepository } from './typeorm-resumes.repository.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([ResumeAnalysis, Skill, ResumeAnalysisSkill]),
    AuthModule,
    ProfilesModule,
    AiModule,
  ],
  controllers: [ResumesController],
  providers: [
    ResumesService,
    GcsStorageService,
    TypeOrmResumesRepository,
    {
      provide: RESUMES_REPOSITORY,
      useExisting: TypeOrmResumesRepository,
    },
  ],
})
export class ResumesModule {}
