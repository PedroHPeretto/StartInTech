export class InvalidGoogleIdTokenError extends Error {
  constructor(message = 'Invalid or expired Google ID token') {
    super(message);
    this.name = 'InvalidGoogleIdTokenError';
  }
}

export class EmailCollisionError extends Error {
  constructor(
    message = 'Email already registered with a different Google account',
  ) {
    super(message);
    this.name = 'EmailCollisionError';
  }
}

export class GoogleAuthUnavailableError extends Error {
  constructor(message = 'Unable to verify Google ID token') {
    super(message);
    this.name = 'GoogleAuthUnavailableError';
  }
}
