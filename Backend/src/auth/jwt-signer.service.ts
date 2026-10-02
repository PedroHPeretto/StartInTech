import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignerPort } from './auth.ports.js';

@Injectable()
export class JwtSignerService implements JwtSignerPort {
  constructor(private readonly jwtService: JwtService) {}

  async sign(user: { id: string; email: string }): Promise<string> {
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });
  }
}
