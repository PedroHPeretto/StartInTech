import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import type { PaginatedJobsResponseDto } from '@startintech/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { GetJobsQueryDto } from './dto/get-jobs-query.dto.js';
import { JobsService } from './jobs.service.js';

interface AuthenticatedRequest {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('api/v1/jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  listJobs(
    @Req() request: AuthenticatedRequest,
    @Query() query: GetJobsQueryDto,
  ): Promise<PaginatedJobsResponseDto> {
    return this.jobsService.listJobs(request.user.userId, query);
  }
}
