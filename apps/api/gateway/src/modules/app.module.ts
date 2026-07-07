import { Module } from '@nestjs/common';

import { AuthenticationModule } from './auth/authentication.module.js';
import { ErrorHandlingModule } from './errors/error-handling.module.js';
import { HealthModule } from './health/health.module.js';
import { IdentityModule } from './identity/identity.module.js';
import { ObservabilityModule } from './observability/observability.module.js';

@Module({
  imports: [
    AuthenticationModule,
    ErrorHandlingModule,
    HealthModule,
    IdentityModule,
    ObservabilityModule,
  ],
})
export class AppModule {}
