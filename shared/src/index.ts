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

export interface AuthResponseDto {
  accessToken: string;
  user: UserDto;
  profileStatus: ProfileStatus;
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
  structuralScore: number;
  formattingScore: number;
  technicalKeywordsScore: number;
  summaryFeedback: string;
  actionableImprovements: string[];
  recommendedStudyTopics: string[];
}

export interface ResumeAnalysisDto {
  id: string;
  userId: string;
  targetRole: string;
  overallScore: number;
  detectedSkills: SkillDto[];
  missingSkills: SkillDto[];
  feedbackReport: FeedbackReportDto | Record<string, unknown>;
  createdAt: string;
}

export interface GetUploadUrlDto {
  filename: string;
  contentType: string;
}

export interface UploadUrlResponseDto {
  uploadUrl: string;
  fileKey: string;
}

export interface AnalyzeResumeDto {
  fileKey?: string;
  rawText?: string;
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
