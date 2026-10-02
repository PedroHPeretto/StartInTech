import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SentryModule } from '@sentry/nestjs/setup';
import 'reflect-metadata';
import { AppController } from './app.controller.js';
import { AuthModule } from './auth/auth.module.js';
import { CareerTracksModule } from './career-tracks/career-tracks.module.js';
import { dataSourceOptions } from './database/data-source.js';
import { ProfilesModule } from './profiles/profiles.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SentryModule.forRoot(),
    ...(process.env.NODE_ENV === 'test'
      ? []
      : [
          TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: () => ({
              ...dataSourceOptions,
              autoLoadEntities: true,
            }),
          }),
          UsersModule,
          AuthModule,
          CareerTracksModule,
          ProfilesModule,
        ]),
  ],
  controllers: [AppController],
})
export class AppModule {}
