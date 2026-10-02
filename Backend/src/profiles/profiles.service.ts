import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreateProfileDto, ProfileResponseDto } from '@startintech/shared';
import {
  PROFILES_REPOSITORY,
  ProfileAlreadyExistsError,
  type ProfilesRepository,
} from './profiles.repository.js';

@Injectable()
export class ProfilesService {
  constructor(
    @Inject(PROFILES_REPOSITORY)
    private readonly profiles: ProfilesRepository,
  ) {}

  async create(
    userId: string,
    dto: CreateProfileDto,
  ): Promise<ProfileResponseDto> {
    const careerTrack = await this.profiles.findCareerTrackById(
      dto.careerTrackId,
    );
    if (!careerTrack) {
      throw new NotFoundException('Career track not found');
    }

    const existing = await this.profiles.findByUserId(userId);
    if (existing) {
      throw new ConflictException('Profile already exists for this user');
    }

    try {
      const created = await this.profiles.create({
        userId,
        fullName: dto.fullName,
        careerTrackId: dto.careerTrackId,
        seniorityLevel: dto.seniorityLevel,
        bio: dto.bio ?? null,
      });
      return {
        id: created.id,
        userId: created.userId,
        fullName: created.fullName,
        seniorityLevel: created.seniorityLevel,
        bio: created.bio,
        careerTrack: {
          id: created.careerTrack.id,
          name: created.careerTrack.name,
          slug: created.careerTrack.slug,
        },
        isProfileComplete: true,
      };
    } catch (error) {
      if (error instanceof ProfileAlreadyExistsError) {
        throw new ConflictException('Profile already exists for this user');
      }
      throw error;
    }
  }
}
