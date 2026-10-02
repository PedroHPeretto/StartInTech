import type {
  CareerTrackResponseDto,
  CreateProfileDto,
  ProfileResponseDto,
} from '@startintech/shared';
import { apiClient } from '@/lib/api-client';

export async function listCareerTracks(
  signal?: AbortSignal,
): Promise<CareerTrackResponseDto[]> {
  const { data } = await apiClient.get<CareerTrackResponseDto[]>(
    '/api/v1/career-tracks',
    { signal },
  );
  return data;
}

export async function createProfile(
  body: CreateProfileDto,
): Promise<ProfileResponseDto> {
  const { data } = await apiClient.post<ProfileResponseDto>(
    '/api/v1/profiles',
    body,
  );
  return data;
}
