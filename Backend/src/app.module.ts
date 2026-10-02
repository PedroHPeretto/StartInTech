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
import { ResumesModule } from './resumes/resumes.module.js';
import { RoadmapsModule } from './roadmaps/roadmaps.module.js';
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
            useFactory: (config: ConfigService) => {
              const url =
                config.get<string>('DATABASE_URL') || process.env.DATABASE_URL;

              if (url) {
                return {
                  type: 'postgres',
                  url,
                  synchronize: false,
                  logging: process.env.NODE_ENV === 'development',
                  autoLoadEntities: true,
                  retryAttempts: 5,
                  retryDelay: 2000,
                };
              }

              return {
                ...dataSourceOptions,
                autoLoadEntities: true,
                retryAttempts: 5,
                retryDelay: 2000,
              };
            },
          }),
          UsersModule,
          AuthModule,
          CareerTracksModule,
          ProfilesModule,
          RoadmapsModule,
          ResumesModule,
        ]),
  ],
  controllers: [AppController],
})
export class AppModule {}
