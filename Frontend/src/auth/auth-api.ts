import type { AuthResponseDto, GoogleAuthDto } from '@startintech/shared';
import { apiClient } from '@/lib/api-client';

export async function authenticateWithGoogle(
  idToken: string,
): Promise<AuthResponseDto> {
  const body: GoogleAuthDto = { idToken };
  const { data } = await apiClient.post<AuthResponseDto>(
    '/api/v1/auth/google',
    body,
  );
  return data;
}
