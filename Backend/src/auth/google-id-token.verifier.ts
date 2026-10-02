import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import {
  GoogleAuthUnavailableError,
  InvalidGoogleIdTokenError,
} from './auth.errors.js';
import type {
  GoogleIdTokenPayload,
  GoogleIdTokenVerifierPort,
} from './auth.ports.js';

const CLOCK_SKEW_SECONDS = 60;

@Injectable()
export class GoogleIdTokenVerifier implements GoogleIdTokenVerifierPort {
  private readonly client: OAuth2Client;
  private readonly audience: string;

  constructor(private readonly configService: ConfigService) {
    this.audience = this.configService.getOrThrow<string>('OAUTH_CLIENT_ID');
    this.client = new OAuth2Client(this.audience);
  }

  async verify(idToken: string): Promise<GoogleIdTokenPayload> {
    const oauth2ClientCtor = OAuth2Client as unknown as {
      CLOCK_SKEW_SECS_: number;
    };
    const previousSkew = oauth2ClientCtor.CLOCK_SKEW_SECS_;
    oauth2ClientCtor.CLOCK_SKEW_SECS_ = CLOCK_SKEW_SECONDS;
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.audience,
      });
      const payload = ticket.getPayload();
      if (!payload?.sub || !payload.email) {
        throw new InvalidGoogleIdTokenError();
      }
      return {
        googleId: payload.sub,
        email: payload.email,
      };
    } catch (error) {
      if (error instanceof InvalidGoogleIdTokenError) {
        throw error;
      }
      if (this.isGoogleUnreachable(error)) {
        throw new GoogleAuthUnavailableError();
      }
      throw new InvalidGoogleIdTokenError();
    } finally {
      oauth2ClientCtor.CLOCK_SKEW_SECS_ = previousSkew;
    }
  }

  private isGoogleUnreachable(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('econnrefused') ||
      message.includes('enotfound') ||
      message.includes('fetch failed') ||
      message.includes('unable to verify')
    );
  }
}
