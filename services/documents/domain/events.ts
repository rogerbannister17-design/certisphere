import type {
  ApprovalId,
  ControlledInformationId,
  DocumentId,
  EvidenceLinkId,
  LifecycleState,
  RelationshipId,
  RevisionId,
  UserId,
} from './value-objects.js';

export type DocumentDomainEvent =
  | DocumentCreated
  | DocumentSubmittedForReview
  | DocumentApproved
  | DocumentRejected
  | DocumentPublished
  | DocumentArchived
  | RevisionCreated
  | RelationshipCreated
  | EvidenceLinked
  | ApprovalCompleted
  | LifecycleChanged;

export interface BaseDocumentDomainEvent {
  readonly occurredAt: Date;
  readonly actorId: UserId;
  readonly organisationId: string;
}

export interface DocumentCreated extends BaseDocumentDomainEvent {
  readonly type: 'DocumentCreated';
  readonly documentId: DocumentId;
}

export interface DocumentSubmittedForReview extends BaseDocumentDomainEvent {
  readonly type: 'DocumentSubmittedForReview';
  readonly documentId: DocumentId;
  readonly revisionId: RevisionId;
}

export interface DocumentApproved extends BaseDocumentDomainEvent {
  readonly type: 'DocumentApproved';
  readonly documentId: DocumentId;
  readonly approvalId: ApprovalId;
  readonly revisionId: RevisionId;
}

export interface DocumentRejected extends BaseDocumentDomainEvent {
  readonly type: 'DocumentRejected';
  readonly documentId: DocumentId;
  readonly approvalId: ApprovalId;
  readonly revisionId: RevisionId;
  readonly reason: string;
}

export interface DocumentPublished extends BaseDocumentDomainEvent {
  readonly type: 'DocumentPublished';
  readonly documentId: DocumentId;
  readonly revisionId: RevisionId;
}

export interface DocumentArchived extends BaseDocumentDomainEvent {
  readonly type: 'DocumentArchived';
  readonly documentId: DocumentId;
  readonly reason: string;
}

export interface RevisionCreated extends BaseDocumentDomainEvent {
  readonly type: 'RevisionCreated';
  readonly documentId: DocumentId;
  readonly revisionId: RevisionId;
}

export interface RelationshipCreated extends BaseDocumentDomainEvent {
  readonly type: 'RelationshipCreated';
  readonly relationshipId: RelationshipId;
  readonly sourceId: ControlledInformationId;
  readonly targetId: string;
}

export interface EvidenceLinked extends BaseDocumentDomainEvent {
  readonly type: 'EvidenceLinked';
  readonly evidenceLinkId: EvidenceLinkId;
  readonly controlledInformationId: ControlledInformationId;
}

export interface ApprovalCompleted extends BaseDocumentDomainEvent {
  readonly type: 'ApprovalCompleted';
  readonly approvalId: ApprovalId;
  readonly revisionId: RevisionId;
}

export interface LifecycleChanged extends BaseDocumentDomainEvent {
  readonly type: 'LifecycleChanged';
  readonly controlledInformationId: ControlledInformationId;
  readonly from: LifecycleState;
  readonly to: LifecycleState;
}
