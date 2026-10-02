import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { ProfileResponseDto } from '@startintech/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CreateProfileRequestDto } from './dto/create-profile-request.dto.js';
import { ProfilesService } from './profiles.service.js';

interface AuthenticatedRequest {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('api/v1/profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateProfileRequestDto,
  ): Promise<ProfileResponseDto> {
    return this.profilesService.create(request.user.userId, body);
  }
}
