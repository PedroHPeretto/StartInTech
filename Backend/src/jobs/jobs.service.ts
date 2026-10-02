import { Injectable, NotImplementedException } from '@nestjs/common';
import type { PaginatedJobsResponseDto } from '@startintech/shared';

@Injectable()
export class JobsService {
  listJobs(): Promise<PaginatedJobsResponseDto> {
    throw new NotImplementedException('GET /api/v1/jobs is not implemented yet');
  }
}
