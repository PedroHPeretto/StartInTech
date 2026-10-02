import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  WorkplaceType,
  type JobQueryDto,
  type JobSearchResponseDto,
} from '@startintech/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
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
  search(
    @Req() request: AuthenticatedRequest,
    @Query('technology') technology?: string,
    @Query('location') location?: string,
    @Query('workplaceType') workplaceType?: string,
  ): Promise<JobSearchResponseDto> {
    const query: JobQueryDto = {
      technology,
      location,
      workplaceType: parseWorkplaceType(workplaceType),
    };
    return this.jobsService.search(request.user.userId, query);
  }
}

function parseWorkplaceType(
  value?: string,
): WorkplaceType | undefined {
  if (!value) {
    return undefined;
  }
  if (Object.values(WorkplaceType).includes(value as WorkplaceType)) {
    return value as WorkplaceType;
  }
  return undefined;
}
