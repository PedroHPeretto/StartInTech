import { SkillCategory } from '@startintech/shared';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('skills')
export class Skill {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({
    type: 'enum',
    enum: SkillCategory,
    enumName: 'skill_category',
  })
  category!: SkillCategory;
}
