import type { AuthResponseDto } from '@startintech/shared';
import { EmailCollisionError } from './auth.errors.js';
import type {
  GoogleIdTokenVerifierPort,
  JwtSignerPort,
  ProfileCompletionReaderPort,
  UsersPort,
} from './auth.ports.js';

export class AuthenticateGoogleUserUseCase {
  constructor(
    private readonly googleVerifier: GoogleIdTokenVerifierPort,
    private readonly users: UsersPort,
    private readonly profileReader: ProfileCompletionReaderPort,
    private readonly jwtSigner: JwtSignerPort,
  ) {}

  async execute(input: { idToken: string }): Promise<AuthResponseDto> {
    const payload = await this.googleVerifier.verify(input.idToken);

    let user = await this.users.findByGoogleId(payload.googleId);

    if (user) {
      user = await this.users.touchUpdatedAt(user.id);
    } else {
      const byEmail = await this.users.findByEmail(payload.email);
      if (byEmail && byEmail.googleId !== payload.googleId) {
        throw new EmailCollisionError();
      }
      user = await this.users.create({
        email: payload.email,
        googleId: payload.googleId,
      });
    }

    const isProfileComplete = await this.profileReader.isProfileComplete(
      user.id,
    );
    const accessToken = await this.jwtSigner.sign({
      id: user.id,
      email: user.email,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
      },
      isProfileComplete,
    };
  }
}
