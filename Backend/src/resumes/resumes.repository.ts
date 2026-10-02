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
}

export interface ResumesRepository {
  create(params: CreateResumeAnalysisParams): Promise<ResumeAnalysisRecord>;
}

export const RESUMES_REPOSITORY = Symbol('RESUMES_REPOSITORY');
