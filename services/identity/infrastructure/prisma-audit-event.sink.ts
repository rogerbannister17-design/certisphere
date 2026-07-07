import { Inject, Injectable } from '@nestjs/common';

import type { IdentityAuditEvent, IdentityAuditEventSink } from '../application/audit-event.js';
import { PRISMA_CLIENT, type CertispherePrismaClient } from './prisma-tokens.js';

@Injectable()
export class PrismaAuditEventSink implements IdentityAuditEventSink {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: CertispherePrismaClient) {}

  async record(event: IdentityAuditEvent): Promise<void> {
    await this.prisma.auditEvent.create({
      data: {
        organisationId: event.organisationId,
        actorUserId: event.actorUserId,
        action: event.action,
        resource: event.resource,
        ...(event.resourceId === undefined ? {} : { resourceId: event.resourceId }),
        ...(event.metadata === undefined ? {} : { metadata: event.metadata }),
        createdBy: event.actorUserId,
        updatedBy: event.actorUserId,
      },
    });
  }
}
