import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../users/user.entity.js';

@Entity('resume_analyses')
export class ResumeAnalysis {
  @PrimaryColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'file_url', type: 'text', nullable: true })
  fileUrl!: string | null;

  @Column({ name: 'raw_text', type: 'text', nullable: true })
  rawText!: string | null;

  @Column({ name: 'ats_score', type: 'int', nullable: true })
  atsScore!: number | null;

  @Column({ name: 'feedback_report', type: 'jsonb', nullable: true })
  feedbackReport!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
