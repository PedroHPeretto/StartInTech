import type {
  RoadmapDetailResponseDto,
  RoadmapProgressResponseDto,
} from '@startintech/shared';
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

export async function fetchMyTrackProgress(
  signal?: AbortSignal,
): Promise<RoadmapProgressResponseDto> {
  const { data } = await apiClient.get<RoadmapProgressResponseDto>(
    '/api/v1/roadmaps/my-track/progress',
    { signal },
  );
  return data;
}
