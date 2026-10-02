import { Controller, Get } from '@nestjs/common';
import type { CareerTrackResponseDto } from '@startintech/shared';
import { CareerTracksService } from './career-tracks.service.js';

@Controller('api/v1/career-tracks')
export class CareerTracksController {
  constructor(private readonly careerTracksService: CareerTracksService) {}

  @Get()
  list(): Promise<CareerTrackResponseDto[]> {
    return this.careerTracksService.list();
  }
}
