import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { CareerTrackResponseDto } from '@startintech/shared';
import { Repository } from 'typeorm';
import { CareerTrack } from './career-track.entity.js';

@Injectable()
export class CareerTracksService {
  constructor(
    @InjectRepository(CareerTrack)
    private readonly careerTracks: Repository<CareerTrack>,
  ) {}

  async list(): Promise<CareerTrackResponseDto[]> {
    const tracks = await this.careerTracks.find({
      order: { slug: 'ASC' },
    });
    return tracks.map((track) => ({
      id: track.id,
      slug: track.slug,
      name: track.name,
      description: track.description,
    }));
  }
}
