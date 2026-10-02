import {
  RESUME_MAX_FILE_SIZE_BYTES,
  RESUME_RAW_TEXT_MAX_LENGTH,
  RESUME_RAW_TEXT_MIN_LENGTH,
  ResumeAnalysisSkillStatus,
  ResumeSubmissionMode,
  type GenerateUploadUrlDto,
  type ResumeEvaluationResponseDto,
  type ResumeHistoryItemDto,
  type ResumeSubmissionResponseDto,
  type ResumeUploadFileType,
  type SkillsExtractionResponseDto,
  type SubmitResumeDto,
  type UploadUrlResponseDto,
} from '@startintech/shared';
import { randomUUID } from 'node:crypto';
import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { AiService } from '../ai/ai.service.js';
import { AtsScoringService } from './ats-scoring.service.js';
import {
  PROFILES_REPOSITORY,
  type ProfilesRepository,
} from '../profiles/profiles.repository.js';
import { GcsStorageService } from './gcs-storage.service.js';
import {
  extractTextFromDocx,
  extractTextFromPdf,
} from './resume-text-extractor.js';
import {
  dedupeSkillsByNormalizedName,
  sanitizeSkillName,
} from './skill-name.util.js';
import {
  RESUMES_REPOSITORY,
  type ResumesRepository,
  type SkillLinkInput,
} from './resumes.repository.js';

const PDF_MIME = 'application/pdf' as const;
const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' as const;

const FILE_KEY_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(pdf|docx)$/i;

@Injectable()
export class ResumesService {
  constructor(
    @Inject(RESUMES_REPOSITORY)
    private readonly resumes: ResumesRepository,
    @Inject(PROFILES_REPOSITORY)
    private readonly profiles: ProfilesRepository,
    private readonly gcs: GcsStorageService,
    private readonly ai: AiService,
    private readonly atsScoring: AtsScoringService,
  ) {}

  async generateUploadUrl(
    userId: string,
    dto: GenerateUploadUrlDto,
  ): Promise<UploadUrlResponseDto> {
    if (
      dto.fileSizeBytes < 1 ||
      dto.fileSizeBytes > RESUME_MAX_FILE_SIZE_BYTES
    ) {
      throw new BadRequestException('Invalid file size');
    }

    if (dto.fileType !== PDF_MIME && dto.fileType !== DOCX_MIME) {
      throw new BadRequestException('Unsupported file type');
    }

    const analysisId = randomUUID();
    const extension = dto.fileType === PDF_MIME ? 'pdf' : 'docx';
    const fileKey = `resumes/${userId}/${analysisId}.${extension}`;

    try {
      const signed = await this.gcs.createSignedUploadUrl({
        fileKey,
        contentType: dto.fileType,
        fileSizeBytes: dto.fileSizeBytes,
      });
      return {
        uploadUrl: signed.uploadUrl,
        fileKey,
        expiresInSeconds: signed.expiresInSeconds,
      };
    } catch {
      throw new BadGatewayException('Failed to generate upload URL');
    }
  }

  async submit(
    userId: string,
    dto: SubmitResumeDto,
  ): Promise<ResumeSubmissionResponseDto> {
    if (dto.mode === ResumeSubmissionMode.FILE_UPLOAD) {
      return this.submitFileUpload(userId, dto.fileKey);
    }
    if (dto.mode === ResumeSubmissionMode.RAW_TEXT) {
      return this.submitRawText(userId, dto.rawText);
    }
    throw new BadRequestException('Invalid submission mode');
  }

  async extractSkills(
    userId: string,
    resumeId: string,
  ): Promise<SkillsExtractionResponseDto> {
    const analysis = await this.resumes.findByIdForUser(resumeId, userId);
    if (!analysis) {
      throw new NotFoundException('Resume analysis not found');
    }

    const profile = await this.profiles.findByUserId(userId);
    if (!profile) {
      throw new UnprocessableEntityException(
        'Complete your profile before analyzing',
      );
    }

    const careerTrack = await this.profiles.findCareerTrackById(
      profile.careerTrack.id,
    );
    if (!careerTrack) {
      throw new UnprocessableEntityException('Career track not found');
    }

    const resumeText = await this.resolveResumeText(analysis);
    const trimmedText = resumeText.trim();
    if (trimmedText.length < RESUME_RAW_TEXT_MIN_LENGTH) {
      throw new UnprocessableEntityException(
        'Resume text is too short to analyze',
      );
    }

    const aiResult = await this.ai.extractSkillsFromResume(trimmedText, {
      name: careerTrack.name,
      slug: careerTrack.slug,
      description: careerTrack.description,
    });

    if (aiResult.insufficientText) {
      throw new UnprocessableEntityException(
        'Resume text is insufficient for skill extraction',
      );
    }

    const detected = dedupeSkillsByNormalizedName(aiResult.detectedSkills)
      .map((skill) => ({
        name: sanitizeSkillName(skill.name),
        category: skill.category,
        status: ResumeAnalysisSkillStatus.PRESENT,
      }))
      .filter((skill) => skill.name.length > 0);

    const missing = dedupeSkillsByNormalizedName(aiResult.missingSkills)
      .map((skill) => ({
        name: sanitizeSkillName(skill.name),
        category: skill.category,
        status: ResumeAnalysisSkillStatus.MISSING_GAP,
      }))
      .filter((skill) => skill.name.length > 0);

    const links: SkillLinkInput[] = [...detected, ...missing];
    const persisted = await this.resumes.persistSkillExtraction(
      analysis.id,
      links,
    );

    return {
      resumeId: analysis.id,
      careerTrack: {
        id: careerTrack.id,
        name: careerTrack.name,
        slug: careerTrack.slug,
      },
      skills: {
        detected: persisted.detected,
        missing: persisted.missing,
      },
      totalDetected: persisted.detected.length,
      totalMissing: persisted.missing.length,
    };
  }

  private async resolveResumeText(analysis: {
    rawText: string | null;
    fileUrl: string | null;
  }): Promise<string> {
    if (analysis.rawText?.trim()) {
      return analysis.rawText;
    }

    if (!analysis.fileUrl) {
      return '';
    }

    let fileKey: string;
    try {
      fileKey = this.gcs.parseFileKeyFromGsUrl(analysis.fileUrl);
    } catch {
      throw new BadGatewayException('Failed to read resume file');
    }

    let buffer: Buffer;
    try {
      buffer = await this.gcs.downloadObject(fileKey);
    } catch {
      throw new BadGatewayException('Failed to download resume file');
    }

    const lowerKey = fileKey.toLowerCase();
    if (lowerKey.endsWith('.pdf')) {
      return extractTextFromPdf(buffer);
    }
    if (lowerKey.endsWith('.docx')) {
      return extractTextFromDocx(buffer);
    }

    throw new BadRequestException('Unsupported resume file type');
  }

  private async submitFileUpload(
    userId: string,
    fileKey: string | undefined,
  ): Promise<ResumeSubmissionResponseDto> {
    if (!fileKey?.trim()) {
      throw new BadRequestException('fileKey is required for file upload');
    }

    const expectedPrefix = `resumes/${userId}/`;
    if (!fileKey.startsWith(expectedPrefix)) {
      throw new BadRequestException('Invalid file key');
    }

    const suffix = fileKey.slice(expectedPrefix.length);
    if (!FILE_KEY_PATTERN.test(suffix)) {
      throw new BadRequestException('Invalid file key format');
    }

    const analysisId = suffix.replace(/\.(pdf|docx)$/i, '');

    let exists: boolean;
    try {
      exists = await this.gcs.objectExists(fileKey);
    } catch {
      throw new BadGatewayException('Failed to verify uploaded file');
    }

    if (!exists) {
      throw new NotFoundException('Uploaded file not found');
    }

    const { record, purgedFileUrls } = await this.resumes.create({
      id: analysisId,
      userId,
      fileUrl: this.gcs.buildFileUrl(fileKey),
      rawText: null,
    });

    await this.purgeStorageUrls(purgedFileUrls);

    return this.toSubmissionResponse(record);
  }

  private async submitRawText(
    userId: string,
    rawText: string | undefined,
  ): Promise<ResumeSubmissionResponseDto> {
    const trimmed = rawText?.trim() ?? '';
    if (trimmed.length < RESUME_RAW_TEXT_MIN_LENGTH) {
      throw new BadRequestException('Raw text is too short');
    }
    if (trimmed.length > RESUME_RAW_TEXT_MAX_LENGTH) {
      throw new BadRequestException('Raw text is too long');
    }

    const { record, purgedFileUrls } = await this.resumes.create({
      id: randomUUID(),
      userId,
      fileUrl: null,
      rawText: trimmed,
    });

    await this.purgeStorageUrls(purgedFileUrls);

    return this.toSubmissionResponse(record);
  }

  async getHistory(userId: string): Promise<ResumeHistoryItemDto[]> {
    return this.resumes.listHistoryForUser(userId);
  }

  async evaluate(
    userId: string,
    resumeId: string,
  ): Promise<ResumeEvaluationResponseDto> {
    await this.retryPendingStoragePurges();

    const analysis = await this.resumes.findForEvaluation(resumeId, userId);
    if (!analysis) {
      throw new NotFoundException('Resume analysis not found');
    }

    const activeVersionsCount = (await this.resumes.listHistoryForUser(userId))
      .length;

    if (
      analysis.atsScore !== null &&
      analysis.atsScore !== undefined &&
      analysis.feedbackReport
    ) {
      return {
        id: analysis.id,
        atsScore: analysis.atsScore,
        report: analysis.feedbackReport,
        createdAt: analysis.createdAt.toISOString(),
        activeVersionsCount,
      };
    }

    if (analysis.presentSkillCount + analysis.missingSkillCount === 0) {
      throw new ConflictException(
        'Extract skills before evaluating this resume',
      );
    }

    const profile = await this.profiles.findByUserId(userId);
    if (!profile) {
      throw new UnprocessableEntityException(
        'Complete your profile before analyzing',
      );
    }

    const careerTrack = await this.profiles.findCareerTrackById(
      profile.careerTrack.id,
    );
    if (!careerTrack) {
      throw new UnprocessableEntityException('Career track not found');
    }

    const resumeText = await this.resolveResumeText(analysis);
    const trimmedText = resumeText.trim();
    if (trimmedText.length < RESUME_RAW_TEXT_MIN_LENGTH) {
      throw new UnprocessableEntityException(
        'Resume text is too short to analyze',
      );
    }

    const atsScore = this.atsScoring.computeAtsScore({
      presentSkillCount: analysis.presentSkillCount,
      missingSkillCount: analysis.missingSkillCount,
      resumeText: trimmedText,
    });

    const report = await this.ai.generatePedagogicalFeedback({
      career: {
        name: careerTrack.name,
        slug: careerTrack.slug,
        description: careerTrack.description,
      },
      resumeText: trimmedText,
      presentSkills: analysis.presentSkillNames,
      missingSkills: analysis.missingSkillNames,
    });

    const { activeVersionsCount: countAfterPersist } =
      await this.resumes.persistEvaluation({
        analysisId: resumeId,
        userId,
        atsScore,
        feedbackReport: report,
      });

    return {
      id: analysis.id,
      atsScore,
      report,
      createdAt: analysis.createdAt.toISOString(),
      activeVersionsCount: countAfterPersist,
    };
  }

  private toSubmissionResponse(record: {
    id: string;
    userId: string;
    createdAt: Date;
  }): ResumeSubmissionResponseDto {
    return {
      id: record.id,
      userId: record.userId,
      status: 'RECEIVED',
      createdAt: record.createdAt.toISOString(),
    };
  }

  private async purgeStorageUrls(fileUrls: string[]): Promise<void> {
    await this.retryPendingStoragePurges();
    for (const fileUrl of fileUrls) {
      await this.tryDeleteStorageObject(fileUrl);
    }
  }

  private async retryPendingStoragePurges(): Promise<void> {
    const pending = await this.resumes.listPendingStoragePurges();
    for (const row of pending) {
      try {
        const fileKey = this.gcs.parseFileKeyFromGsUrl(row.fileUrl);
        await this.gcs.deleteObject(fileKey);
        await this.resumes.deletePendingStoragePurge(row.id);
      } catch (error) {
        Sentry.captureException(error);
      }
    }
  }

  private async tryDeleteStorageObject(fileUrl: string): Promise<void> {
    try {
      const fileKey = this.gcs.parseFileKeyFromGsUrl(fileUrl);
      await this.gcs.deleteObject(fileKey);
    } catch (error) {
      Sentry.captureException(error);
      await this.resumes.recordPendingStoragePurge(fileUrl);
    }
  }
}

/**
 * Resolves the file extension ('pdf' | 'docx') for a supported resume MIME type.
 *
 * @param fileType - The MIME type of the uploaded file
 * @returns The corresponding file extension
 */
export function fileExtensionForType(
  fileType: ResumeUploadFileType,
): 'pdf' | 'docx' {
  return fileType === PDF_MIME ? 'pdf' : 'docx';
}
