import type { RoadmapDetailResponseDto } from '@startintech/shared';
import { apiClient } from '@/lib/api-client';

export async function fetchMyTrackRoadmap(
  signal?: AbortSignal,
): Promise<RoadmapDetailResponseDto> {
  const { data } = await apiClient.get<RoadmapDetailResponseDto>(
    '/api/v1/roadmaps/my-track',
    { signal },
  );
  return data;
}
