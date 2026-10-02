export enum SkillPriority {
  ESSENTIAL = "ESSENTIAL",
  RECOMMENDED = "RECOMMENDED",
  ADVANCED = "ADVANCED",
}

export enum WorkplaceType {
  REMOTE = "REMOTE",
  HYBRID = "HYBRID",
  ON_SITE = "ON_SITE",
}

export enum EmploymentType {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  INTERNSHIP = "INTERNSHIP",
  CONTRACT = "CONTRACT",
}

export enum RoadmapNodeStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export enum UserRole {
  CANDIDATE = "CANDIDATE",
  ADMIN = "ADMIN",
  RECRUITER = "RECRUITER",
}

export enum SeniorityLevel {
  INTERNSHIP = "INTERNSHIP",
  JUNIOR = "JUNIOR",
}

export enum SkillCategory {
  LANGUAGE = "LANGUAGE",
  FRAMEWORK = "FRAMEWORK",
  DATABASE = "DATABASE",
  TOOL = "TOOL",
  SOFT_SKILL = "SOFT_SKILL",
}

export enum ResumeAnalysisSkillStatus {
  PRESENT = "PRESENT",
  MISSING_GAP = "MISSING_GAP",
}

export enum ProfileStatus {
  COMPLETE = "COMPLETE",
  INCOMPLETE = "INCOMPLETE",
}

export enum RoadmapStatus {
  MASTERED = "MASTERED",
  TO_LEARN = "TO_LEARN",
}

export interface HealthCheckResponse {
  status: "ok" | "error";
  service: string;
  version: string;
  timestamp: string;
  uptime: number;
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoogleAuthDto {
  idToken: string;
}

export interface AuthUserDto {
  id: string;
  email: string;
}

export interface AuthResponseDto {
  accessToken: string;
  user: AuthUserDto;
  isProfileComplete: boolean;
}

export interface UpdateProfileDto {
  fullName: string;
  careerTrackId: string;
  seniorityLevel: SeniorityLevel;
  bio?: string;
}

export interface ProfileDto {
  id: string;
  userId: string;
  fullName: string;
  careerTrackId: string;
  seniorityLevel: SeniorityLevel;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CareerTrackDto {
  id: string;
  slug: string;
  name: string;
  description?: string;
}

export interface CreateProfileDto {
  fullName: string;
  careerTrackId: string;
  seniorityLevel: SeniorityLevel;
  bio?: string | null;
}

export interface CareerTrackResponseDto {
  id: string;
  slug: string;
  name: string;
  description: string;
}

export interface CareerTrackSummaryDto {
  id: string;
  name: string;
  slug: string;
}

export interface ProfileResponseDto {
  id: string;
  userId: string;
  fullName: string;
  seniorityLevel: SeniorityLevel;
  bio: string | null;
  careerTrack: CareerTrackSummaryDto;
  isProfileComplete: true;
}

export interface SkillDto {
  id: string;
  name: string;
  category?: SkillCategory;
  priority: SkillPriority;
}

export interface RoadmapNodeDto {
  id: string;
  title: string;
  description: string;
  status: RoadmapNodeStatus;
  order: number;
  resources?: Array<{ title: string; url: string }>;
}

export interface CareerRoadmapDto {
  id: string;
  userId: string;
  targetRole: string;
  matchScore: number;
  nodes: RoadmapNodeDto[];
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackReportDto {
  summary: string;
  strengths: string[];
  improvements: string[];
  actionPlan: string[];
  marketReadiness: SeniorityLevel;
}

export interface ResumeEvaluationResponseDto {
  id: string;
  atsScore: number;
  report: FeedbackReportDto;
  createdAt: string;
  activeVersionsCount: number;
}

export interface ResumeHistoryItemDto {
  id: string;
  atsScore: number | null;
  fileUrl: string | null;
  createdAt: string;
  isLatest: boolean;
}

export interface ResumeAnalysisDto {
  id: string;
  userId: string;
  targetRole: string;
  overallScore: number;
  detectedSkills: SkillDto[];
  missingSkills: SkillDto[];
  feedbackReport: FeedbackReportDto;
  createdAt: string;
}

export interface ExtractedSkillDto {
  id: string;
  name: string;
  category: SkillCategory;
}

export interface SkillsExtractionResponseDto {
  resumeId: string;
  careerTrack: CareerTrackSummaryDto;
  skills: {
    detected: ExtractedSkillDto[];
    missing: ExtractedSkillDto[];
  };
  totalDetected: number;
  totalMissing: number;
}

export enum ResumeSubmissionMode {
  FILE_UPLOAD = "FILE_UPLOAD",
  RAW_TEXT = "RAW_TEXT",
}

export const RESUME_MAX_FILE_SIZE_BYTES = 5_242_880;

export const RESUME_RAW_TEXT_MIN_LENGTH = 100;

export const RESUME_RAW_TEXT_MAX_LENGTH = 50_000;

export const RESUME_UPLOAD_URL_EXPIRES_IN_SECONDS = 300;

export type ResumeUploadFileType =
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export interface GenerateUploadUrlDto {
  fileName: string;
  fileType: ResumeUploadFileType;
  fileSizeBytes: number;
}

export interface UploadUrlResponseDto {
  uploadUrl: string;
  fileKey: string;
  expiresInSeconds: number;
}

export interface SubmitResumeDto {
  mode: ResumeSubmissionMode;
  fileKey?: string;
  rawText?: string;
}

export interface ResumeSubmissionResponseDto {
  id: string;
  userId: string;
  status: "RECEIVED";
  createdAt: string;
}

export interface JobOpportunityDto {
  id: string;
  title: string;
  company: string;
  location: string;
  workplaceType: WorkplaceType;
  employmentType: EmploymentType;
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  applyUrl: string;
  matchScore?: number;
  postedAt: string;
}

export interface JobQueryDto {
  careerTrackId?: string;
  workplaceType?: WorkplaceType;
  location?: string;
  technology?: string;
}

export interface JobRecommendationCardDto extends JobOpportunityDto {
  isHighMatch: boolean;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface RoadmapGraphNodeDto {
  id: string;
  title: string;
  priority: SkillPriority;
  sequenceOrder: number;
  status: RoadmapStatus;
  skillId?: string;
  parentNodeId?: string;
  children?: RoadmapGraphNodeDto[];
}

export interface RoadmapGraphDto {
  careerTrack: CareerTrackDto;
  nodes: RoadmapGraphNodeDto[];
}

export interface RoadmapNodeResponseDto {
  id: string;
  title: string;
  description: string | null;
  priority: SkillPriority;
  sequenceOrder: number;
  skillId: string | null;
  children: RoadmapNodeResponseDto[];
}

export interface RoadmapDetailResponseDto {
  id: string;
  title: string;
  description: string | null;
  careerTrack: CareerTrackSummaryDto;
  nodes: RoadmapNodeResponseDto[];
}

export enum DynamicRoadmapNodeStatus {
  MASTERED = "MASTERED",
  PENDING = "PENDING",
  NEUTRAL = "NEUTRAL",
}

export interface DynamicRoadmapNodeDto {
  id: string;
  title: string;
  description: string | null;
  priority: SkillPriority;
  sequenceOrder: number;
  skillId: string | null;
  status: DynamicRoadmapNodeStatus;
  children: DynamicRoadmapNodeDto[];
}

export interface RoadmapProgressMetricsDto {
  totalTrackableNodes: number;
  masteredNodesCount: number;
  overallProgressPercentage: number;
  essentialProgressPercentage: number;
}

export interface RoadmapProgressResponseDto {
  id: string;
  title: string;
  careerTrack: CareerTrackSummaryDto;
  hasResumeAnalyzed: boolean;
  metrics: RoadmapProgressMetricsDto;
  nodes: DynamicRoadmapNodeDto[];
}
