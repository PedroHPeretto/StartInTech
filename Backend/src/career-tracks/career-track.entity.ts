import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
