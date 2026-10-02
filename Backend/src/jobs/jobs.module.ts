import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { ProfilesModule } from '../profiles/profiles.module.js';
import { AdzunaJobAdapter } from './adzuna-job.adapter.js';
import { JobOpportunity } from './job-opportunity.entity.js';
import { JobsController } from './jobs.controller.js';
import { JOBS_REPOSITORY } from './jobs.repository.js';
import { JobsService } from './jobs.service.js';
import { TypeOrmJobsRepository } from './typeorm-jobs.repository.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobOpportunity]),
    AuthModule,
    ProfilesModule,
  ],
  controllers: [JobsController],
  providers: [
    JobsService,
    AdzunaJobAdapter,
    TypeOrmJobsRepository,
    {
      provide: JOBS_REPOSITORY,
      useExisting: TypeOrmJobsRepository,
    },
  ],
})
export class JobsModule {}
