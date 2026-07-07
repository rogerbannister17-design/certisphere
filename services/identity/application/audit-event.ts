export interface IdentityAuditEvent {
  readonly organisationId: string;
  readonly actorUserId: string;
  readonly action: string;
  readonly resource: string;
  readonly resourceId?: string;
  readonly metadata?: Record<string, string | number | boolean | null>;
}

export interface IdentityAuditEventSink {
  record(event: IdentityAuditEvent): Promise<void>;
}

export const IDENTITY_AUDIT_EVENT_SINK = Symbol('IDENTITY_AUDIT_EVENT_SINK');
