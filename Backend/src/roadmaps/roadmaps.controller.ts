import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type {
  RoadmapDetailResponseDto,
  RoadmapProgressResponseDto,
} from '@startintech/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RoadmapsService } from './roadmaps.service.js';

interface AuthenticatedRequest {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('api/v1/roadmaps')
export class RoadmapsController {
  constructor(private readonly roadmapsService: RoadmapsService) {}

  @Get('my-track')
  @UseGuards(JwtAuthGuard)
  getMyTrack(
    @Req() request: AuthenticatedRequest,
  ): Promise<RoadmapDetailResponseDto> {
    return this.roadmapsService.getMyTrack(request.user.userId);
  }

  @Get('my-track/progress')
  @UseGuards(JwtAuthGuard)
  getMyTrackProgress(
    @Req() request: AuthenticatedRequest,
  ): Promise<RoadmapProgressResponseDto> {
    return this.roadmapsService.getMyTrackProgress(request.user.userId);
  }
}
