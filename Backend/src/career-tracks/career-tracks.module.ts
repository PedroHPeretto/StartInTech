import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareerTrack } from './career-track.entity.js';
import { CareerTracksController } from './career-tracks.controller.js';
import { CareerTracksService } from './career-tracks.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([CareerTrack])],
  controllers: [CareerTracksController],
  providers: [CareerTracksService],
})
export class CareerTracksModule {}
