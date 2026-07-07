import { Controller, Get, HttpCode, HttpStatus, Inject, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BRAND } from '@certisphere/design-system/branding';

import { AuthenticationGuard } from '../auth/authentication.guard.js';
import { AuthorisationGuard } from '../auth/authorisation.guard.js';
import { RequiredPermissions } from '../auth/required-permissions.decorator.js';
import { HealthResponseDto } from './dto/health-response.dto.js';
import { HealthService } from './health.service.js';

@ApiTags('Health')
@Controller({
  path: 'health',
  version: '1',
})
@UseGuards(AuthenticationGuard, AuthorisationGuard)
@RequiredPermissions('platform.health.read')
@ApiBearerAuth()
export class HealthController {
  constructor(@Inject(HealthService) private readonly healthService: HealthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Read API gateway health',
    description: `Returns the operational health status of the ${BRAND.applications.api}.`,
  })
  @ApiOkResponse({
    type: HealthResponseDto,
    description: 'The API gateway is reachable and able to evaluate its own status.',
  })
  getHealth(): HealthResponseDto {
    return this.healthService.getHealth();
  }
}
