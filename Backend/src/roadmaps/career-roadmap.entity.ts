import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CareerTrack } from '../career-tracks/career-track.entity.js';

@Entity('career_roadmaps')
export class CareerRoadmap {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => CareerTrack, { nullable: false })
  @JoinColumn({ name: 'career_track_id' })
  careerTrack!: CareerTrack;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;
}
