import {
  RESUME_RAW_TEXT_MAX_LENGTH,
  RESUME_RAW_TEXT_MIN_LENGTH,
  ResumeSubmissionMode,
  type SubmitResumeDto,
} from '@startintech/shared';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class SubmitResumeRequestDto implements SubmitResumeDto {
  @IsEnum(ResumeSubmissionMode)
  mode!: ResumeSubmissionMode;

  @ValidateIf((dto: SubmitResumeRequestDto) =>
    dto.mode === ResumeSubmissionMode.FILE_UPLOAD,
  )
  @IsString()
  @IsOptional()
  fileKey?: string;

  @ValidateIf((dto: SubmitResumeRequestDto) =>
    dto.mode === ResumeSubmissionMode.RAW_TEXT,
  )
  @IsString()
  @MinLength(RESUME_RAW_TEXT_MIN_LENGTH)
  @MaxLength(RESUME_RAW_TEXT_MAX_LENGTH)
  @IsOptional()
  rawText?: string;
}
