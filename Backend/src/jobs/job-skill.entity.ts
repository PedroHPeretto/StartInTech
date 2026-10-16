import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';
import { Skill } from '../resumes/skill.entity.js';
import { JobOpportunity } from './job-opportunity.entity.js';

@Entity('job_skills')
export class JobSkill {
  @PrimaryColumn({ name: 'job_id', type: 'uuid' })
  jobId!: string;

  @PrimaryColumn({ name: 'skill_id', type: 'uuid' })
  skillId!: string;

  @ManyToOne(() => JobOpportunity, (job) => job.jobSkills, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'job_id' })
  job!: Relation<JobOpportunity>;

  @ManyToOne(() => Skill, { nullable: false })
  @JoinColumn({ name: 'skill_id' })
  skill!: Relation<Skill>;

  @Column({ name: 'is_mandatory', type: 'boolean' })
  isMandatory!: boolean;
}
