import { Body, Controller, Post } from '@nestjs/common';
import type { AuthResponseDto } from '@startintech/shared';
import { AuthService } from './auth.service.js';
import { GoogleAuthRequestDto } from './dto/google-auth-request.dto.js';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  authenticateWithGoogle(
    @Body() body: GoogleAuthRequestDto,
  ): Promise<AuthResponseDto> {
    return this.authService.authenticateWithGoogle(body.idToken);
  }
}
