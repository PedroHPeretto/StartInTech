import { describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';
import { AppController } from '../src/app.controller.js';

describe('AppModule', () => {
  it('should compile the app module', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(moduleRef).toBeDefined();
    expect(moduleRef.get(AppModule)).toBeInstanceOf(AppModule);
  });

  it('should return health check status from AppController', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const controller = moduleRef.get(AppController);
    expect(controller).toBeDefined();

    const health = controller.getHealth();
    expect(health.status).toBe('ok');
    expect(health.service).toBe('startintech-api');
    expect(health.version).toBe('0.0.1');
    expect(typeof health.timestamp).toBe('string');
    expect(typeof health.uptime).toBe('number');

    const root = controller.getRoot();
    expect(root.status).toBe('ok');
  });
});
