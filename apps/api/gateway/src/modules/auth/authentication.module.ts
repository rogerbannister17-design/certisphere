import { Module } from '@nestjs/common';

import { AuthenticationGuard } from './authentication.guard.js';
import { AuthorisationGuard } from './authorisation.guard.js';
import { OrganisationAccessGuard } from './organisation-access.guard.js';

@Module({
  providers: [AuthenticationGuard, AuthorisationGuard, OrganisationAccessGuard],
  exports: [AuthenticationGuard, AuthorisationGuard, OrganisationAccessGuard],
})
export class AuthenticationModule {}
