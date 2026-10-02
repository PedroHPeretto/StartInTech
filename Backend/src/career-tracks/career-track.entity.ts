import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Profile } from '../profiles/profile.entity.js';

@Entity('career_tracks')
export class CareerTrack {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', unique: true })
  slug!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @OneToMany('Profile', 'careerTrack')
  profiles!: Profile[];
}
