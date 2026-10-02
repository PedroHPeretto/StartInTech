import type { GoogleAuthDto } from '@startintech/shared';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleAuthRequestDto implements GoogleAuthDto {
  @IsString()
  @IsNotEmpty()
  idToken!: string;
}
