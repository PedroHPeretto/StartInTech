import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ProfilesModule } from '../profiles/profiles.module.js';
import { JobsController } from './jobs.controller.js';
import { JobsService } from './jobs.service.js';

@Module({
  imports: [AuthModule, ProfilesModule],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
