import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SentryModule } from '@sentry/nestjs/setup';
import 'reflect-metadata';
import { AppController } from './app.controller.js';
import { dataSourceOptions } from './database/data-source.js';

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
        ]),
  ],
  controllers: [AppController],
})
export class AppModule {}
