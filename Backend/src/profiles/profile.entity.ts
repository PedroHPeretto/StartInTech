import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { SeniorityLevel } from '@startintech/shared';
import { CareerTrack } from '../career-tracks/career-track.entity.js';
import { User } from '../users/user.entity.js';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'full_name', type: 'text' })
  fullName!: string;

  @ManyToOne(() => CareerTrack, { nullable: false })
  @JoinColumn({ name: 'career_track_id' })
  careerTrack!: CareerTrack;

  @Column({ name: 'seniority_level', type: 'text' })
  seniorityLevel!: SeniorityLevel;

  @Column({ name: 'bio', type: 'text', nullable: true })
  bio!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
