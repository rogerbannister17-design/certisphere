import { Module } from '@nestjs/common';

import { AuthenticationGuard } from './authentication.guard.js';
import { AuthorisationGuard } from './authorisation.guard.js';

@Module({
  providers: [AuthenticationGuard, AuthorisationGuard],
  exports: [AuthenticationGuard, AuthorisationGuard],
})
export class AuthenticationModule {}
