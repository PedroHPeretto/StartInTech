import { WorkplaceType } from '@startintech/shared';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CareerTrack } from '../career-tracks/career-track.entity.js';

@Entity('job_opportunities')
export class JobOpportunity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text' })
  company!: string;

  @Column({ type: 'text' })
  location!: string;

  @Column({
    name: 'workplace_type',
    type: 'enum',
    enum: WorkplaceType,
    enumName: 'workplace_type',
  })
  workplaceType!: WorkplaceType;

  @ManyToOne(() => CareerTrack, { nullable: false })
  @JoinColumn({ name: 'career_track_id' })
  careerTrack!: CareerTrack;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'application_url', type: 'text', unique: true })
  applicationUrl!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
