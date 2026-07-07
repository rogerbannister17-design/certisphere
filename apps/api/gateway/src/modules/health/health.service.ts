import { Injectable } from '@nestjs/common';

import { HealthResponseDto } from './dto/health-response.dto.js';

@Injectable()
export class HealthService {
  getHealth(): HealthResponseDto {
    return {
      status: 'ok',
      checkedAt: new Date().toISOString(),
      version: '0.1.0',
    };
  }
}
