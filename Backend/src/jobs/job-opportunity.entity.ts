import { WorkplaceType } from '@startintech/shared';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { JobSkill } from './job-skill.entity.js';
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

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @OneToMany(() => JobSkill, (jobSkill) => jobSkill.job)
  jobSkills!: JobSkill[];
}
