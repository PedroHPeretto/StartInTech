import { SeniorityLevel, type CreateProfileDto } from '@startintech/shared';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProfileRequestDto implements CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(120)
  fullName!: string;

  @IsUUID()
  careerTrackId!: string;

  @IsEnum(SeniorityLevel)
  seniorityLevel!: SeniorityLevel;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string | null;
}
