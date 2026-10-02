import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { GcsStorageService } from './gcs-storage.service.js';
import { ResumeAnalysis } from './resume-analysis.entity.js';
import { ResumesController } from './resumes.controller.js';
import { RESUMES_REPOSITORY } from './resumes.repository.js';
import { ResumesService } from './resumes.service.js';
import { TypeOrmResumesRepository } from './typeorm-resumes.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([ResumeAnalysis]), AuthModule],
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
