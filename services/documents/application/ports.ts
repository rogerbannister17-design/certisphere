import type { DocumentDomainEvent } from '../domain/events.js';
import type {
  ControlledInformationId,
  DocumentId,
  EvidenceLinkId,
  LifecycleState,
  OrganisationId,
  RevisionId,
  UserId,
} from '../domain/value-objects.js';

export const DOCUMENT_TRANSACTION_MANAGER = Symbol('DOCUMENT_TRANSACTION_MANAGER');
export const DOCUMENT_DOMAIN_EVENT_PUBLISHER = Symbol('DOCUMENT_DOMAIN_EVENT_PUBLISHER');
export const DOCUMENT_APPLICATION_LOGGER = Symbol('DOCUMENT_APPLICATION_LOGGER');
export const DOCUMENT_SEARCH_PORT = Symbol('DOCUMENT_SEARCH_PORT');
export const DOCUMENT_DISTRIBUTION_PORT = Symbol('DOCUMENT_DISTRIBUTION_PORT');
export const EVIDENCE_LINK_REMOVAL_PORT = Symbol('EVIDENCE_LINK_REMOVAL_PORT');

export interface ApplicationTransactionManager {
  execute<TResult>(operation: () => Promise<TResult>): Promise<TResult>;
}

export class ImmediateApplicationTransactionManager implements ApplicationTransactionManager {
  execute<TResult>(operation: () => Promise<TResult>): Promise<TResult> {
    return operation();
  }
}

export interface DocumentDomainEventPublisher {
  publishAll(events: readonly DocumentDomainEvent[]): Promise<void>;
}

export interface DocumentApplicationLogger {
  info(message: string, context: Readonly<Record<string, string>>): void;
  warn(message: string, context: Readonly<Record<string, string>>): void;
  error(message: string, context: Readonly<Record<string, string>>): void;
}

export interface ApplicationActor {
  readonly organisationId: OrganisationId;
  readonly userId: UserId;
}

export interface DocumentSearchCriteria {
  readonly organisationId: OrganisationId;
  readonly documentNumber?: string;
  readonly title?: string;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly isoClause?: string;
  readonly process?: string;
  readonly category?: string;
  readonly status?: LifecycleState;
  readonly ownerId?: UserId;
  readonly revision?: string;
  readonly limit: number;
}

export interface DocumentSearchResult {
  readonly controlledInformationId: ControlledInformationId;
  readonly documentId: DocumentId;
  readonly title: string;
  readonly documentNumber: string;
  readonly lifecycle: LifecycleState;
  readonly ownerId: UserId;
  readonly revisionId?: RevisionId;
}

export interface DocumentSearchPort {
  search(criteria: DocumentSearchCriteria): Promise<readonly DocumentSearchResult[]>;
}

export interface DistributionRequest {
  readonly organisationId: OrganisationId;
  readonly documentId: DocumentId;
  readonly revisionId: RevisionId;
  readonly actorId: UserId;
  readonly recipientUserIds: readonly UserId[];
}

export interface DocumentDistributionPort {
  distribute(request: DistributionRequest): Promise<void>;
}

export interface EvidenceLinkRemovalPort {
  removeLink(request: {
    readonly organisationId: OrganisationId;
    readonly controlledInformationId: ControlledInformationId;
    readonly evidenceLinkId: EvidenceLinkId;
    readonly actorId: UserId;
  }): Promise<void>;
}
