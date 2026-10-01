import { Controller, Get } from '@nestjs/common';
import type { HealthCheckResponse } from '@startintech/shared';

@Controller()
export class AppController {
  @Get()
  getRoot(): HealthCheckResponse {
    return this.getHealth();
  }

  @Get('health')
  getHealth(): HealthCheckResponse {
    return {
      status: 'ok',
      service: 'startintech-api',
      version: '0.0.1',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
