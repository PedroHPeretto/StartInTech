import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type {
  ResumeSubmissionResponseDto,
  UploadUrlResponseDto,
} from '@startintech/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { GenerateUploadUrlRequestDto } from './dto/generate-upload-url-request.dto.js';
import { SubmitResumeRequestDto } from './dto/submit-resume-request.dto.js';
import { ResumesService } from './resumes.service.js';

interface AuthenticatedRequest {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('api/v1/resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post('upload-url')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  generateUploadUrl(
    @Req() request: AuthenticatedRequest,
    @Body() body: GenerateUploadUrlRequestDto,
  ): Promise<UploadUrlResponseDto> {
    return this.resumesService.generateUploadUrl(request.user.userId, body);
  }

  @Post('submit')
  @UseGuards(JwtAuthGuard)
  submit(
    @Req() request: AuthenticatedRequest,
    @Body() body: SubmitResumeRequestDto,
  ): Promise<ResumeSubmissionResponseDto> {
    return this.resumesService.submit(request.user.userId, body);
  }
}
