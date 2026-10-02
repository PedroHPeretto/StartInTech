import type { SeniorityLevel } from '@startintech/shared';

export interface CareerTrackRecord {
  id: string;
  slug: string;
  name: string;
  description: string;
}

export interface ProfileRecord {
  id: string;
  userId: string;
  fullName: string;
  seniorityLevel: SeniorityLevel;
  bio: string | null;
  careerTrack: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface CreateProfileParams {
  userId: string;
  fullName: string;
  careerTrackId: string;
  seniorityLevel: SeniorityLevel;
  bio: string | null;
}

export interface ProfilesRepository {
  findCareerTrackById(id: string): Promise<CareerTrackRecord | null>;
  findByUserId(userId: string): Promise<ProfileRecord | null>;
  create(params: CreateProfileParams): Promise<ProfileRecord>;
}

export class ProfileAlreadyExistsError extends Error {
  constructor() {
    super('Profile already exists for this user');
    this.name = 'ProfileAlreadyExistsError';
  }
}

export const PROFILES_REPOSITORY = Symbol('PROFILES_REPOSITORY');
