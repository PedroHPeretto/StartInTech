export interface GoogleIdTokenPayload {
  googleId: string;
  email: string;
}

export interface GoogleIdTokenVerifierPort {
  verify(idToken: string): Promise<GoogleIdTokenPayload>;
}

export interface AuthUserRecord {
  id: string;
  email: string;
  googleId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsersPort {
  findByGoogleId(googleId: string): Promise<AuthUserRecord | null>;
  findByEmail(email: string): Promise<AuthUserRecord | null>;
  create(params: { email: string; googleId: string }): Promise<AuthUserRecord>;
  touchUpdatedAt(id: string): Promise<AuthUserRecord>;
}

export interface ProfileCompletionReaderPort {
  isProfileComplete(userId: string): Promise<boolean>;
}

export interface JwtSignerPort {
  sign(user: { id: string; email: string }): Promise<string>;
}
