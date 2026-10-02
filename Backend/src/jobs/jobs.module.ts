import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { ProfilesModule } from '../profiles/profiles.module.js';
import { JobOpportunity } from './job-opportunity.entity.js';
import { JobsController } from './jobs.controller.js';
import { JobsService } from './jobs.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobOpportunity]),
    AuthModule,
    ProfilesModule,
  ],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
