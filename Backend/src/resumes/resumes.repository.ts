import type {
  ExtractedSkillDto,
  FeedbackReportDto,
  ResumeAnalysisSkillStatus,
  ResumeHistoryItemDto,
  SkillCategory,
} from '@startintech/shared';

export interface CreateResumeAnalysisParams {
  id: string;
  userId: string;
  fileUrl: string | null;
  rawText: string | null;
}

export interface ResumeAnalysisRecord {
  id: string;
  userId: string;
  fileUrl: string | null;
  rawText: string | null;
  createdAt: Date;
  atsScore?: number | null;
  feedbackReport?: FeedbackReportDto | null;
}

export interface CreateResumeAnalysisResult {
  record: ResumeAnalysisRecord;
  purgedFileUrls: string[];
}

export interface ResumeAnalysisEvaluationRecord extends ResumeAnalysisRecord {
  atsScore: number | null;
  feedbackReport: FeedbackReportDto | null;
  presentSkillCount: number;
  missingSkillCount: number;
  presentSkillNames: string[];
  missingSkillNames: string[];
}

export interface PersistEvaluationParams {
  analysisId: string;
  userId: string;
  atsScore: number;
  feedbackReport: FeedbackReportDto;
}

export interface PersistEvaluationResult {
  activeVersionsCount: number;
}

export interface PendingStoragePurgeRecord {
  id: string;
  fileUrl: string;
}

export interface SkillLinkInput {
  name: string;
  category: SkillCategory;
  status: ResumeAnalysisSkillStatus;
}

export interface PersistedSkillExtraction {
  detected: ExtractedSkillDto[];
  missing: ExtractedSkillDto[];
}

export interface ResumesRepository {
  create(params: CreateResumeAnalysisParams): Promise<CreateResumeAnalysisResult>;
  findByIdForUser(
    id: string,
    userId: string,
  ): Promise<ResumeAnalysisRecord | null>;
  findForEvaluation(
    id: string,
    userId: string,
  ): Promise<ResumeAnalysisEvaluationRecord | null>;
  listHistoryForUser(userId: string): Promise<ResumeHistoryItemDto[]>;
  persistSkillExtraction(
    resumeAnalysisId: string,
    links: SkillLinkInput[],
  ): Promise<PersistedSkillExtraction>;
  persistEvaluation(
    params: PersistEvaluationParams,
  ): Promise<PersistEvaluationResult>;
  listPendingStoragePurges(): Promise<PendingStoragePurgeRecord[]>;
  recordPendingStoragePurge(fileUrl: string): Promise<void>;
  deletePendingStoragePurge(id: string): Promise<void>;
}

export const RESUMES_REPOSITORY = Symbol('RESUMES_REPOSITORY');
