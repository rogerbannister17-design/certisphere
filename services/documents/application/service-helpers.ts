import type {
  AccessPolicy,
  Approval,
  Attachment,
  Category,
  ClauseMapping,
  Comment,
  ControlledInformation,
  Document,
  EvidenceLink,
  ProcessLink,
  Relationship,
  RetentionRule,
  Review,
  Revision,
  WorkflowReference,
} from '../domain/entities.js';
import { ControlledInformation as ControlledInformationEntity, Document as DocumentEntity } from '../domain/entities.js';
import type { DocumentDomainEvent } from '../domain/events.js';
import type {
  ControlledInformationId,
  ControlledInformationType,
  DocumentId,
  DocumentNumber,
  LifecycleState,
  Metadata,
  OrganisationId,
  UserId,
} from '../domain/value-objects.js';
import type {
  ApplicationActor,
  ApplicationTransactionManager,
  DocumentApplicationLogger,
  DocumentDomainEventPublisher,
} from './ports.js';
import { DocumentResourceNotFoundError, DocumentTenantMismatchError } from './service-errors.js';

export function ensureOrganisation(
  resourceOrganisationId: OrganisationId,
  actor: ApplicationActor,
): void {
  if (resourceOrganisationId.value !== actor.organisationId.value) {
    throw new DocumentTenantMismatchError();
  }
}

export function requireFound<TEntity>(entity: TEntity | null, resource: string): TEntity {
  if (entity === null) {
    throw new DocumentResourceNotFoundError(resource);
  }

  return entity;
}

export async function commitAndPublish<TResult>(
  transactionManager: ApplicationTransactionManager,
  eventPublisher: DocumentDomainEventPublisher,
  logger: DocumentApplicationLogger,
  context: Readonly<Record<string, string>>,
  operation: () => Promise<{ readonly result: TResult; readonly events: readonly DocumentDomainEvent[] }>,
): Promise<TResult> {
  const outcome = await transactionManager.execute(operation);
  await eventPublisher.publishAll(outcome.events);
  logger.info('documents.application_service.completed', context);
  return outcome.result;
}

export function rebuildControlledInformation(
  controlledInformation: ControlledInformation,
  overrides: {
    readonly type?: ControlledInformationType;
    readonly title?: string;
    readonly documentNumber?: DocumentNumber;
    readonly metadata?: Metadata;
    readonly lifecycle?: LifecycleState;
    readonly updatedBy: UserId;
    readonly updatedAt: Date;
  },
): ControlledInformation {
  return ControlledInformationEntity.rehydrate({
    id: controlledInformation.id,
    type: overrides.type ?? controlledInformation.type,
    title: overrides.title ?? controlledInformation.title,
    documentNumber: overrides.documentNumber ?? controlledInformation.documentNumber,
    classification: controlledInformation.classification,
    category: controlledInformation.category,
    owner: controlledInformation.owner,
    accessPolicy: controlledInformation.accessPolicy,
    retentionRule: controlledInformation.retentionRule,
    metadata: overrides.metadata ?? controlledInformation.metadata,
    lifecycle: overrides.lifecycle ?? controlledInformation.lifecycle,
    archive: controlledInformation.archiveRecord,
    organisationId: controlledInformation.organisationId,
    createdBy: controlledInformation.createdBy,
    updatedBy: overrides.updatedBy,
    createdAt: controlledInformation.createdAt,
    updatedAt: overrides.updatedAt,
    deletedAt: controlledInformation.deletedAt,
  });
}

export function rebuildDocumentWithControlledInformation(
  document: Document,
  controlledInformation: ControlledInformation,
): Document {
  return DocumentEntity.rehydrate({
    controlledInformation,
    documentId: document.id,
    revisions: document.revisions,
    approvals: document.approvals,
    relationships: document.relationships,
    evidenceLinks: document.evidenceLinks,
    comments: document.comments,
    reviews: document.reviews,
    attachments: document.attachments,
    clauseMappings: document.clauseMappings,
    processLinks: document.processLinks,
    workflowReferences: document.workflowReferences,
  });
}

export interface ControlledInformationDraft {
  readonly id: ControlledInformationId;
  readonly type: ControlledInformationType;
  readonly title: string;
  readonly documentNumber: DocumentNumber;
  readonly classification: ControlledInformation['classification'];
  readonly category: Category;
  readonly owner: ControlledInformation['owner'];
  readonly accessPolicy: AccessPolicy;
  readonly retentionRule: RetentionRule;
  readonly metadata: Metadata;
  readonly organisationId: OrganisationId;
  readonly createdBy: UserId;
  readonly updatedBy: UserId;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export function createControlledInformation(draft: ControlledInformationDraft): ControlledInformation {
  return ControlledInformationEntity.create(draft);
}

export interface DocumentSnapshot {
  readonly controlledInformation: ControlledInformation;
  readonly documentId: DocumentId;
  readonly revisions: readonly Revision[];
  readonly approvals: readonly Approval[];
  readonly relationships: readonly Relationship[];
  readonly evidenceLinks: readonly EvidenceLink[];
  readonly comments: readonly Comment[];
  readonly reviews: readonly Review[];
  readonly attachments: readonly Attachment[];
  readonly clauseMappings: readonly ClauseMapping[];
  readonly processLinks: readonly ProcessLink[];
  readonly workflowReferences: readonly WorkflowReference[];
}
