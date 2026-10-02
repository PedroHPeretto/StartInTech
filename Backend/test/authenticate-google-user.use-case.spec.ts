import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthenticateGoogleUserUseCase } from '../src/auth/authenticate-google-user.use-case.js';
import {
  EmailCollisionError,
  GoogleAuthUnavailableError,
  InvalidGoogleIdTokenError,
} from '../src/auth/auth.errors.js';
import type {
  GoogleIdTokenVerifierPort,
  JwtSignerPort,
  ProfileCompletionReaderPort,
  UsersPort,
} from '../src/auth/auth.ports.js';

describe('AuthenticateGoogleUserUseCase', () => {
  let googleVerifier: GoogleIdTokenVerifierPort;
  let users: UsersPort;
  let profileReader: ProfileCompletionReaderPort;
  let jwtSigner: JwtSignerPort;
  let useCase: AuthenticateGoogleUserUseCase;

  const verifiedPayload = {
    googleId: 'google-sub-123',
    email: 'user@example.com',
  };

  beforeEach(() => {
    googleVerifier = {
      verify: vi.fn().mockResolvedValue(verifiedPayload),
    };
    users = {
      findByGoogleId: vi.fn().mockResolvedValue(null),
      findByEmail: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(async ({ email, googleId }) => ({
        id: 'new-user-uuid',
        email,
        googleId,
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
        updatedAt: new Date('2025-01-01T00:00:00.000Z'),
      })),
      touchUpdatedAt: vi.fn(),
    };
    profileReader = {
      isProfileComplete: vi.fn().mockResolvedValue(false),
    };
    jwtSigner = {
      sign: vi.fn().mockResolvedValue('signed-jwt-token'),
    };
    useCase = new AuthenticateGoogleUserUseCase(
      googleVerifier,
      users,
      profileReader,
      jwtSigner,
    );
  });

  it('inserts a new user when google_id is unknown', async () => {
    const result = await useCase.execute({ idToken: 'valid-token' });

    expect(googleVerifier.verify).toHaveBeenCalledWith('valid-token');
    expect(users.findByGoogleId).toHaveBeenCalledWith('google-sub-123');
    expect(users.create).toHaveBeenCalledWith({
      email: 'user@example.com',
      googleId: 'google-sub-123',
    });
    expect(users.touchUpdatedAt).not.toHaveBeenCalled();
    expect(result.accessToken).toBe('signed-jwt-token');
    expect(result.user).toEqual({
      id: 'new-user-uuid',
      email: 'user@example.com',
    });
    expect(result.isProfileComplete).toBe(false);
  });

  it('updates existing user by google_id without creating a second row', async () => {
    const existing = {
      id: 'existing-uuid',
      email: 'user@example.com',
      googleId: 'google-sub-123',
      createdAt: new Date('2024-06-01T00:00:00.000Z'),
      updatedAt: new Date('2024-06-01T00:00:00.000Z'),
    };
    const touched = {
      ...existing,
      updatedAt: new Date('2025-06-01T12:00:00.000Z'),
    };
    vi.mocked(users.findByGoogleId).mockResolvedValue(existing);
    vi.mocked(users.touchUpdatedAt).mockResolvedValue(touched);

    const result = await useCase.execute({ idToken: 'valid-token' });

    expect(users.create).not.toHaveBeenCalled();
    expect(users.touchUpdatedAt).toHaveBeenCalledWith('existing-uuid');
    expect(result.user.id).toBe('existing-uuid');
    expect(jwtSigner.sign).toHaveBeenCalledWith({
      id: 'existing-uuid',
      email: 'user@example.com',
    });
  });

  it('returns isProfileComplete false for a new user', async () => {
    vi.mocked(profileReader.isProfileComplete).mockResolvedValue(false);

    const result = await useCase.execute({ idToken: 'valid-token' });

    expect(profileReader.isProfileComplete).toHaveBeenCalledWith(
      'new-user-uuid',
    );
    expect(result.isProfileComplete).toBe(false);
  });

  it('rejects invalid Google tokens with InvalidGoogleIdTokenError', async () => {
    vi.mocked(googleVerifier.verify).mockRejectedValue(
      new InvalidGoogleIdTokenError(),
    );

    await expect(
      useCase.execute({ idToken: 'bad-token' }),
    ).rejects.toBeInstanceOf(InvalidGoogleIdTokenError);
    expect(users.create).not.toHaveBeenCalled();
  });

  it('rejects email collision with EmailCollisionError', async () => {
    vi.mocked(users.findByEmail).mockResolvedValue({
      id: 'other-uuid',
      email: 'user@example.com',
      googleId: 'different-google-id',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      useCase.execute({ idToken: 'valid-token' }),
    ).rejects.toBeInstanceOf(EmailCollisionError);
    expect(users.create).not.toHaveBeenCalled();
  });

  it('surfaces Google unreachable as GoogleAuthUnavailableError', async () => {
    vi.mocked(googleVerifier.verify).mockRejectedValue(
      new GoogleAuthUnavailableError(),
    );

    await expect(
      useCase.execute({ idToken: 'valid-token' }),
    ).rejects.toBeInstanceOf(GoogleAuthUnavailableError);
  });
});
