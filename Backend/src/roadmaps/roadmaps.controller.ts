import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { RoadmapDetailResponseDto } from '@startintech/shared';
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
}
