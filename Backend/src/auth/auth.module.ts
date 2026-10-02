import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { GoogleIdTokenVerifier } from './google-id-token.verifier.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { JwtSignerService } from './jwt-signer.service.js';
import { ProfileCompletionReader } from './profile-completion.reader.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') ?? '4h';
        const secret =
          configService.get<string>('JWT_SECRET') ||
          process.env.JWT_SECRET ||
          'startintech-jwt-secret-production-token-fallback';
        return {
          secret,
          signOptions: { expiresIn: expiresIn as `${number}h` },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleIdTokenVerifier,
    ProfileCompletionReader,
    JwtSignerService,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [PassportModule, JwtModule, JwtStrategy, JwtAuthGuard],
})
export class AuthModule {}
