import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { CareerTrack } from '../career-tracks/career-track.entity.js';
import { Profile } from './profile.entity.js';
import { ProfilesController } from './profiles.controller.js';
import { PROFILES_REPOSITORY } from './profiles.repository.js';
import { ProfilesService } from './profiles.service.js';
import { TypeOrmProfilesRepository } from './typeorm-profiles.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, CareerTrack]), AuthModule],
  controllers: [ProfilesController],
  providers: [
    ProfilesService,
    TypeOrmProfilesRepository,
    {
      provide: PROFILES_REPOSITORY,
      useExisting: TypeOrmProfilesRepository,
    },
  ],
  exports: [PROFILES_REPOSITORY, ProfilesService],
})
export class ProfilesModule {}
