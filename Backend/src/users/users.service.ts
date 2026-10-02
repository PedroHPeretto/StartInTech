import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthUserRecord, UsersPort } from '../auth/auth.ports.js';
import { User } from './user.entity.js';

@Injectable()
export class UsersService implements UsersPort {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByGoogleId(googleId: string): Promise<AuthUserRecord | null> {
    const user = await this.userRepository.findOne({ where: { googleId } });
    return user ? this.toRecord(user) : null;
  }

  async findByEmail(email: string): Promise<AuthUserRecord | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user ? this.toRecord(user) : null;
  }

  async create(params: {
    email: string;
    googleId: string;
  }): Promise<AuthUserRecord> {
    const user = this.userRepository.create({
      email: params.email,
      googleId: params.googleId,
    });
    const saved = await this.userRepository.save(user);
    return this.toRecord(saved);
  }

  async touchUpdatedAt(id: string): Promise<AuthUserRecord> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new Error(`User ${id} not found`);
    }
    const saved = await this.userRepository.save(user);
    return this.toRecord(saved);
  }

  private toRecord(user: User): AuthUserRecord {
    return {
      id: user.id,
      email: user.email,
      googleId: user.googleId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
