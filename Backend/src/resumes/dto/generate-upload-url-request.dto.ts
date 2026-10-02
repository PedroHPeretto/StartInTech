import {
  RESUME_MAX_FILE_SIZE_BYTES,
  type GenerateUploadUrlDto,
  type ResumeUploadFileType,
} from '@startintech/shared';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
} from 'class-validator';

const ALLOWED_FILE_TYPES: ResumeUploadFileType[] = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export class GenerateUploadUrlRequestDto implements GenerateUploadUrlDto {
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsIn(ALLOWED_FILE_TYPES)
  fileType!: ResumeUploadFileType;

  @IsInt()
  @Min(1)
  @Max(RESUME_MAX_FILE_SIZE_BYTES)
  fileSizeBytes!: number;
}
