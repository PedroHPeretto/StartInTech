import type { JobQueryDto, JobSearchResponseDto } from '@startintech/shared';
import { apiClient } from '@/lib/api-client';

export async function fetchJobs(
  query: JobQueryDto,
  signal?: AbortSignal,
): Promise<JobSearchResponseDto> {
  const params = new URLSearchParams();
  if (query.technology) {
    params.set('technology', query.technology);
  }
  if (query.location) {
    params.set('location', query.location);
  }
  if (query.workplaceType) {
    params.set('workplaceType', query.workplaceType);
  }
  const queryString = params.toString();
  const path = queryString
    ? `/api/v1/jobs?${queryString}`
    : '/api/v1/jobs';
  const { data } = await apiClient.get<JobSearchResponseDto>(path, { signal });
  return data;
}
