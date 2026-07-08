import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  Argon2PasswordHasher,
  IDENTITY_AUDIT_EVENT_SINK,
  IDENTITY_REPOSITORY,
  InvitationService,
  JoseTokenService,
  LoginService,
  PASSWORD_HASHER,
  PRISMA_CLIENT,
  PrismaAuditEventSink,
  PrismaIdentityRepository,
  RefreshSessionService,
  RegisterOrganisationService,
  TOKEN_SERVICE,
  type CertispherePrismaClient,
} from '@certisphere/identity';

import { IdentityController } from './identity.controller.js';
import { BootstrapRegistrationGuard } from './bootstrap-registration.guard.js';

const PrismaClientConstructor = PrismaClient as unknown as new () => CertispherePrismaClient;

const PrismaProvider = {
  provide: PRISMA_CLIENT,
  useFactory: (): CertispherePrismaClient => new PrismaClientConstructor(),
};

@Module({
  controllers: [IdentityController],
  providers: [
    PrismaProvider,
    BootstrapRegistrationGuard,
    RegisterOrganisationService,
    LoginService,
    RefreshSessionService,
    InvitationService,
    { provide: IDENTITY_REPOSITORY, useClass: PrismaIdentityRepository },
    { provide: IDENTITY_AUDIT_EVENT_SINK, useClass: PrismaAuditEventSink },
    { provide: PASSWORD_HASHER, useClass: Argon2PasswordHasher },
    { provide: TOKEN_SERVICE, useClass: JoseTokenService },
  ],
})
export class IdentityModule {}
