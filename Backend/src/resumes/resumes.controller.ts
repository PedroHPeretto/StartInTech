import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type {
  ResumeEvaluationResponseDto,
  ResumeHistoryItemDto,
  ResumeSubmissionResponseDto,
  SkillsExtractionResponseDto,
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

  @Get('history')
  @UseGuards(JwtAuthGuard)
  getHistory(
    @Req() request: AuthenticatedRequest,
  ): Promise<ResumeHistoryItemDto[]> {
    return this.resumesService.getHistory(request.user.userId);
  }

  @Post(':id/extract-skills')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  extractSkills(
    @Req() request: AuthenticatedRequest,
    @Param('id') resumeId: string,
  ): Promise<SkillsExtractionResponseDto> {
    return this.resumesService.extractSkills(request.user.userId, resumeId);
  }

  @Post(':id/evaluate')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  evaluate(
    @Req() request: AuthenticatedRequest,
    @Param('id') resumeId: string,
  ): Promise<ResumeEvaluationResponseDto> {
    return this.resumesService.evaluate(request.user.userId, resumeId);
  }
}
