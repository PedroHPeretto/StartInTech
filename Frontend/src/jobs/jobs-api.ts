import {
  type JobSortBy,
  type PaginatedJobsResponseDto,
  type WorkplaceType,
} from '@startintech/shared';
import { apiClient } from '@/lib/api-client';

export interface FetchJobsParams {
  page?: number;
  limit?: number;
  workplaceType?: WorkplaceType;
  search?: string;
  onlyHighCompatibility?: boolean;
  sortBy?: JobSortBy;
}

export async function fetchJobs(
  params: FetchJobsParams,
  signal?: AbortSignal,
): Promise<PaginatedJobsResponseDto> {
  const { data } = await apiClient.get<PaginatedJobsResponseDto>(
    '/api/v1/jobs',
    { params, signal },
  );
  return data;
}
