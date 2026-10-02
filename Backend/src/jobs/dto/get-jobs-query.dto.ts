import {
  JobSortBy,
  WorkplaceType,
  type GetJobsQueryDto as SharedGetJobsQueryDto,
} from '@startintech/shared';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

function parseOptionalBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (value === true || value === 'true') {
    return true;
  }
  if (value === false || value === 'false') {
    return false;
  }
  return value as boolean;
}

export class GetJobsQueryDto implements SharedGetJobsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @IsOptional()
  @IsEnum(WorkplaceType)
  workplaceType?: WorkplaceType;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @Transform(({ value }) => parseOptionalBoolean(value))
  @IsBoolean()
  onlyHighCompatibility?: boolean;

  @IsOptional()
  @IsEnum(JobSortBy)
  sortBy?: JobSortBy;
}
