import { ResumeAnalysisSkillStatus } from '@startintech/shared';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ResumeAnalysis } from './resume-analysis.entity.js';
import { Skill } from './skill.entity.js';

@Entity('resume_analysis_skills')
export class ResumeAnalysisSkill {
  @PrimaryColumn('uuid', { name: 'resume_analysis_id' })
  resumeAnalysisId!: string;

  @PrimaryColumn('uuid', { name: 'skill_id' })
  skillId!: string;

  @PrimaryColumn({
    type: 'enum',
    enum: ResumeAnalysisSkillStatus,
    enumName: 'resume_skill_status',
    name: 'status',
  })
  status!: ResumeAnalysisSkillStatus;

  @ManyToOne(() => ResumeAnalysis, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resume_analysis_id' })
  resumeAnalysis!: ResumeAnalysis;

  @ManyToOne(() => Skill, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skill_id' })
  skill!: Skill;
}
