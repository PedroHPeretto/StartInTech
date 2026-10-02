import { SkillPriority } from '@startintech/shared';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CareerRoadmap } from './career-roadmap.entity.js';

@Entity('roadmap_nodes')
export class RoadmapNode {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => CareerRoadmap, { nullable: false })
  @JoinColumn({ name: 'career_roadmap_id' })
  careerRoadmap!: CareerRoadmap;

  @Column({ name: 'parent_node_id', type: 'uuid', nullable: true })
  parentNodeId!: string | null;

  @Column({ name: 'skill_id', type: 'uuid', nullable: true })
  skillId!: string | null;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    type: 'enum',
    enum: SkillPriority,
    enumName: 'roadmap_node_priority',
  })
  priority!: SkillPriority;

  @Column({ name: 'sequence_order', type: 'int' })
  sequenceOrder!: number;
}
