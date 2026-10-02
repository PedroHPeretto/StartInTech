import { Controller, Get, UseGuards } from '@nestjs/common';
import type { PaginatedJobsResponseDto } from '@startintech/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { JobsService } from './jobs.service.js';

@Controller('api/v1/jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  listJobs(): Promise<PaginatedJobsResponseDto> {
    return this.jobsService.listJobs();
  }
}
