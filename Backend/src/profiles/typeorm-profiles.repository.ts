import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CareerTrack } from '../career-tracks/career-track.entity.js';
import type { User } from '../users/user.entity.js';
import { Profile } from './profile.entity.js';
import {
  ProfileAlreadyExistsError,
  type CareerTrackRecord,
  type CreateProfileParams,
  type ProfileRecord,
  type ProfilesRepository,
} from './profiles.repository.js';

const UNIQUE_VIOLATION = '23505';

@Injectable()
export class TypeOrmProfilesRepository implements ProfilesRepository {
  constructor(
    @InjectRepository(Profile)
    private readonly profiles: Repository<Profile>,
    @InjectRepository(CareerTrack)
    private readonly careerTracks: Repository<CareerTrack>,
  ) {}

  async findCareerTrackById(id: string): Promise<CareerTrackRecord | null> {
    const track = await this.careerTracks.findOne({ where: { id } });
    if (!track) {
      return null;
    }
    return {
      id: track.id,
      slug: track.slug,
      name: track.name,
      description: track.description,
    };
  }

  async findByUserId(userId: string): Promise<ProfileRecord | null> {
    const profile = await this.profiles
      .createQueryBuilder('profile')
      .innerJoinAndSelect('profile.careerTrack', 'careerTrack')
      .where('profile.user_id = :userId', { userId })
      .getOne();
    if (!profile) {
      return null;
    }
    return this.toRecord(profile, userId);
  }

  async create(params: CreateProfileParams): Promise<ProfileRecord> {
    const careerTrack = await this.careerTracks.findOne({
      where: { id: params.careerTrackId },
    });
    if (!careerTrack) {
      throw new Error('Career track missing');
    }

    try {
      const saved = await this.profiles.save(
        this.profiles.create({
          fullName: params.fullName,
          seniorityLevel: params.seniorityLevel,
          bio: params.bio,
          user: { id: params.userId } as User,
          careerTrack: { id: params.careerTrackId } as CareerTrack,
        }),
      );
      return {
        id: saved.id,
        userId: params.userId,
        fullName: saved.fullName,
        seniorityLevel: saved.seniorityLevel,
        bio: saved.bio,
        careerTrack: {
          id: careerTrack.id,
          name: careerTrack.name,
          slug: careerTrack.slug,
        },
      };
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ProfileAlreadyExistsError();
      }
      throw error;
    }
  }

  private toRecord(profile: Profile, userId: string): ProfileRecord {
    return {
      id: profile.id,
      userId,
      fullName: profile.fullName,
      seniorityLevel: profile.seniorityLevel,
      bio: profile.bio,
      careerTrack: {
        id: profile.careerTrack.id,
        name: profile.careerTrack.name,
        slug: profile.careerTrack.slug,
      },
    };
  }
}

function isUniqueViolation(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }
  const driverError = error.driverError as { code?: string };
  return driverError.code === UNIQUE_VIOLATION;
}
