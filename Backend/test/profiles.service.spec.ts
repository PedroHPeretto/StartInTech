import { ConflictException, NotFoundException } from '@nestjs/common';
import { SeniorityLevel } from '@startintech/shared';
import { describe, expect, it } from 'vitest';
import { ProfileAlreadyExistsError } from '../src/profiles/profiles.repository.js';
import type {
  CareerTrackRecord,
  CreateProfileParams,
  ProfileRecord,
  ProfilesRepository,
} from '../src/profiles/profiles.repository.js';
import { ProfilesService } from '../src/profiles/profiles.service.js';

const SOFTWARE_TRACK: CareerTrackRecord = {
  id: '11111111-1111-4111-8111-111111111111',
  slug: 'software-development',
  name: 'Desenvolvimento de Software',
  description: 'Frontend, Backend, Full Stack e Mobile',
};

const AUTHENTICATED_USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

class InMemoryProfilesRepository implements ProfilesRepository {
  private readonly careerTracks = new Map<string, CareerTrackRecord>();
  private readonly profilesByUserId = new Map<string, ProfileRecord>();
  private nextId = 1;

  constructor(careerTracks: CareerTrackRecord[]) {
    for (const track of careerTracks) {
      this.careerTracks.set(track.id, track);
    }
  }

  findCareerTrackById(id: string): Promise<CareerTrackRecord | null> {
    return Promise.resolve(this.careerTracks.get(id) ?? null);
  }

  findByUserId(userId: string): Promise<ProfileRecord | null> {
    return Promise.resolve(this.profilesByUserId.get(userId) ?? null);
  }

  create(params: CreateProfileParams): Promise<ProfileRecord> {
    if (this.profilesByUserId.has(params.userId)) {
      return Promise.reject(new ProfileAlreadyExistsError());
    }
    const careerTrack = this.careerTracks.get(params.careerTrackId);
    if (!careerTrack) {
      return Promise.reject(new Error('Career track missing'));
    }
    const record: ProfileRecord = {
      id: `profile-${this.nextId}`,
      userId: params.userId,
      fullName: params.fullName,
      seniorityLevel: params.seniorityLevel,
      bio: params.bio,
      careerTrack: {
        id: careerTrack.id,
        name: careerTrack.name,
        slug: careerTrack.slug,
      },
    };
    this.nextId += 1;
    this.profilesByUserId.set(params.userId, record);
    return Promise.resolve(record);
  }
}

describe('ProfilesService', () => {
  it('creates a profile bound to the authenticated user and selected career', async () => {
    const repository = new InMemoryProfilesRepository([SOFTWARE_TRACK]);
    const service = new ProfilesService(repository);

    const result = await service.create(AUTHENTICATED_USER_ID, {
      fullName: 'Ana Silva',
      careerTrackId: SOFTWARE_TRACK.id,
      seniorityLevel: SeniorityLevel.JUNIOR,
      bio: 'Estudante de computação',
    });

    expect(result).toEqual({
      id: 'profile-1',
      userId: AUTHENTICATED_USER_ID,
      fullName: 'Ana Silva',
      seniorityLevel: SeniorityLevel.JUNIOR,
      bio: 'Estudante de computação',
      careerTrack: {
        id: SOFTWARE_TRACK.id,
        name: 'Desenvolvimento de Software',
        slug: 'software-development',
      },
      isProfileComplete: true,
    });
    expect(await repository.findByUserId(AUTHENTICATED_USER_ID)).toEqual({
      id: 'profile-1',
      userId: AUTHENTICATED_USER_ID,
      fullName: 'Ana Silva',
      seniorityLevel: SeniorityLevel.JUNIOR,
      bio: 'Estudante de computação',
      careerTrack: {
        id: SOFTWARE_TRACK.id,
        name: 'Desenvolvimento de Software',
        slug: 'software-development',
      },
    });
  });

  it('rejects an unknown career and does not persist a profile', async () => {
    const repository = new InMemoryProfilesRepository([SOFTWARE_TRACK]);
    const service = new ProfilesService(repository);

    await expect(
      service.create(AUTHENTICATED_USER_ID, {
        fullName: 'Ana Silva',
        careerTrackId: '22222222-2222-4222-8222-222222222222',
        seniorityLevel: SeniorityLevel.INTERNSHIP,
        bio: null,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(await repository.findByUserId(AUTHENTICATED_USER_ID)).toBeNull();
  });

  it('rejects when the user already has a profile', async () => {
    const repository = new InMemoryProfilesRepository([SOFTWARE_TRACK]);
    const service = new ProfilesService(repository);
    await service.create(AUTHENTICATED_USER_ID, {
      fullName: 'Ana Silva',
      careerTrackId: SOFTWARE_TRACK.id,
      seniorityLevel: SeniorityLevel.JUNIOR,
    });

    await expect(
      service.create(AUTHENTICATED_USER_ID, {
        fullName: 'Ana Souza',
        careerTrackId: SOFTWARE_TRACK.id,
        seniorityLevel: SeniorityLevel.INTERNSHIP,
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    const stored = await repository.findByUserId(AUTHENTICATED_USER_ID);
    expect(stored?.fullName).toBe('Ana Silva');
    expect(stored?.bio).toBeNull();
  });

  it('maps a concurrent unique violation to a conflict', async () => {
    const repository: ProfilesRepository = {
      findCareerTrackById: () => Promise.resolve(SOFTWARE_TRACK),
      findByUserId: () => Promise.resolve(null),
      create: () => Promise.reject(new ProfileAlreadyExistsError()),
    };
    const service = new ProfilesService(repository);

    await expect(
      service.create(AUTHENTICATED_USER_ID, {
        fullName: 'Ana Silva',
        careerTrackId: SOFTWARE_TRACK.id,
        seniorityLevel: SeniorityLevel.JUNIOR,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
