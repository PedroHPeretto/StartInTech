import {
  BadGatewayException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthResponseDto } from '@startintech/shared';
import {
  EmailCollisionError,
  GoogleAuthUnavailableError,
  InvalidGoogleIdTokenError,
} from './auth.errors.js';
import { AuthenticateGoogleUserUseCase } from './authenticate-google-user.use-case.js';
import { GoogleIdTokenVerifier } from './google-id-token.verifier.js';
import { JwtSignerService } from './jwt-signer.service.js';
import { ProfileCompletionReader } from './profile-completion.reader.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class AuthService {
  private readonly authenticateGoogleUser: AuthenticateGoogleUserUseCase;

  constructor(
    googleVerifier: GoogleIdTokenVerifier,
    usersService: UsersService,
    profileReader: ProfileCompletionReader,
    jwtSigner: JwtSignerService,
  ) {
    this.authenticateGoogleUser = new AuthenticateGoogleUserUseCase(
      googleVerifier,
      usersService,
      profileReader,
      jwtSigner,
    );
  }

  async authenticateWithGoogle(idToken: string): Promise<AuthResponseDto> {
    try {
      return await this.authenticateGoogleUser.execute({ idToken });
    } catch (error) {
      if (error instanceof InvalidGoogleIdTokenError) {
        throw new UnauthorizedException(error.message);
      }
      if (error instanceof EmailCollisionError) {
        throw new ConflictException(error.message);
      }
      if (error instanceof GoogleAuthUnavailableError) {
        throw new BadGatewayException(error.message);
      }
      throw error;
    }
  }
}
