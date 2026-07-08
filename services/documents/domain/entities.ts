import { DocumentInvariantViolationError, InvalidDocumentValueError } from './errors.js';
import { Lifecycle } from './lifecycle.js';
import type {
  DocumentArchived,
  DocumentApproved,
  DocumentDomainEvent,
  DocumentRejected,
  LifecycleChanged,
} from './events.js';
import {
  type ApprovalDecision,
  type ApprovalId,
  type AttachmentId,
  type ClauseReference,
  type ClauseMappingId,
  type Classification,
  type CommentId,
  type ControlledInformationId,
  type ControlledInformationType,
  type DocumentNumber,
  type ElectronicSignatureId,
  type EvidenceLinkId,
  type EvidenceReference,
  type LifecycleState,
  type Metadata,
  type OrganisationId,
  type ProcessLinkId,
  type ProcessReference,
  type RelationshipId,
  type RelationshipType,
  type RetentionPeriod,
  type ReviewId,
  type RevisionId,
  type RevisionNumber,
  type TenantMetadata,
  type UserId,
  type WorkflowReferenceId,
  DocumentId,
} from './value-objects.js';

export interface Owner {
  readonly userId: UserId;
  readonly role: string;
}

export interface Category {
  readonly name: string;
  readonly active: boolean;
}

export interface AccessPolicy {
  readonly canViewDraftUserIds: readonly UserId[];
  readonly canApproveUserIds: readonly UserId[];
  readonly externalAccessAllowed: boolean;
}

export interface RetentionRule {
  readonly period: RetentionPeriod;
  readonly legalHold: boolean;
}

export interface Archive {
  readonly archivedAt: Date;
  readonly archivedBy: UserId;
  readonly reason: string;
}

export interface Comment {
  readonly id: CommentId;
  readonly authorId: UserId;
  readonly body: string;
  readonly resolved: boolean;
}

export interface Review {
  readonly id: ReviewId;
  readonly reviewerId: UserId;
  readonly completed: boolean;
  readonly unresolvedMandatoryCommentCount: number;
}

export interface Attachment {
  readonly id: AttachmentId;
  readonly filename: string;
  readonly checksum: string;
  readonly accepted: boolean;
}

export interface ElectronicSignature {
  readonly id: ElectronicSignatureId;
  readonly signerId: UserId;
  readonly meaning: string;
  readonly signedAt: Date;
  readonly revisionContentHash: string;
}

export interface ClauseMapping {
  readonly id: ClauseMappingId;
  readonly clause: ClauseReference;
  readonly coverageType: 'FULL' | 'PARTIAL' | 'SUPPORTING';
}

export interface ProcessLink {
  readonly id: ProcessLinkId;
  readonly process: ProcessReference;
  readonly relationship: 'OWNS' | 'SUPPORTS' | 'GENERATES_RECORD' | 'REQUIRES_TRAINING';
}

export interface WorkflowReference {
  readonly id: WorkflowReferenceId;
  readonly externalReference: string;
  readonly status: 'NOT_STARTED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface EvidenceLinkProperties {
  readonly id: EvidenceLinkId;
  readonly controlledInformationId: ControlledInformationId;
  readonly organisationId: OrganisationId;
  readonly evidenceReference: EvidenceReference;
  readonly relationshipType: 'SUPPORTS' | 'GENERATED_BY' | 'VERIFIES' | 'SUPERSEDES';
  readonly verified: boolean;
}

export class EvidenceLink {
  private constructor(private readonly properties: EvidenceLinkProperties) {}

  static create(properties: EvidenceLinkProperties): EvidenceLink {
    return new EvidenceLink(properties);
  }

  get id(): EvidenceLinkId {
    return this.properties.id;
  }

  get organisationId(): OrganisationId {
    return this.properties.organisationId;
  }

  get controlledInformationId(): ControlledInformationId {
    return this.properties.controlledInformationId;
  }
}

export interface RelationshipProperties {
  readonly id: RelationshipId;
  readonly organisationId: OrganisationId;
  readonly sourceId: ControlledInformationId;
  readonly targetId: string;
  readonly type: RelationshipType;
  readonly rationale: string;
}

export class Relationship {
  private constructor(private readonly properties: RelationshipProperties) {}

  static create(properties: RelationshipProperties): Relationship {
    if (properties.targetId.trim().length === 0 || properties.rationale.trim().length < 5) {
      throw new InvalidDocumentValueError('Relationship target and rationale are required.');
    }

    return new Relationship(properties);
  }

  get id(): RelationshipId {
    return this.properties.id;
  }

  get organisationId(): OrganisationId {
    return this.properties.organisationId;
  }

  get sourceId(): ControlledInformationId {
    return this.properties.sourceId;
  }

  get targetId(): string {
    return this.properties.targetId;
  }
}

export interface RevisionProperties {
  readonly id: RevisionId;
  readonly organisationId: OrganisationId;
  readonly number: RevisionNumber;
  readonly authorId: UserId;
  readonly contentHash: string;
  readonly changeSummary: string;
  readonly lifecycle: LifecycleState;
  readonly approvedAt: Date | null;
  readonly publishedAt: Date | null;
}

export class Revision {
  private constructor(private readonly properties: RevisionProperties) {}

  static draft(
    properties: Omit<RevisionProperties, 'lifecycle' | 'approvedAt' | 'publishedAt'>,
  ): Revision {
    if (properties.contentHash.trim().length < 16) {
      throw new InvalidDocumentValueError('Revision content hash must be at least 16 characters.');
    }

    if (properties.changeSummary.trim().length < 5) {
      throw new InvalidDocumentValueError('Revision change summary is required.');
    }

    return new Revision({ ...properties, lifecycle: 'DRAFT', approvedAt: null, publishedAt: null });
  }

  get id(): RevisionId {
    return this.properties.id;
  }

  get organisationId(): OrganisationId {
    return this.properties.organisationId;
  }

  get number(): RevisionNumber {
    return this.properties.number;
  }

  get lifecycle(): LifecycleState {
    return this.properties.lifecycle;
  }

  get authorId(): UserId {
    return this.properties.authorId;
  }

  get contentHash(): string {
    return this.properties.contentHash;
  }

  submitForReview(): Revision {
    return this.transition('IN_REVIEW');
  }

  approve(): Revision {
    return new Revision({ ...this.transition('APPROVED').properties, approvedAt: new Date() });
  }

  publish(): Revision {
    if (this.properties.lifecycle !== 'APPROVED') {
      throw new DocumentInvariantViolationError('Only approved revisions can be published.');
    }

    return new Revision({ ...this.properties, lifecycle: 'PUBLISHED', publishedAt: new Date() });
  }

  supersede(): Revision {
    return this.transition('SUPERSEDED');
  }

  assertMutable(): void {
    if (
      this.properties.lifecycle === 'APPROVED' ||
      this.properties.lifecycle === 'PUBLISHED' ||
      this.properties.lifecycle === 'SUPERSEDED'
    ) {
      throw new DocumentInvariantViolationError(
        'Approved, published, and superseded revisions are immutable.',
      );
    }
  }

  private transition(next: LifecycleState): Revision {
    const lifecycle = Lifecycle.from(this.properties.lifecycle).transitionTo(next);
    return new Revision({ ...this.properties, lifecycle: lifecycle.state });
  }
}

export interface ApprovalProperties {
  readonly id: ApprovalId;
  readonly organisationId: OrganisationId;
  readonly revisionId: RevisionId;
  readonly requestedBy: UserId;
  readonly approverId: UserId;
  readonly decision: ApprovalDecision | null;
  readonly signature: ElectronicSignature | null;
  readonly completedAt: Date | null;
}

export class Approval {
  private constructor(private readonly properties: ApprovalProperties) {}

  static request(
    properties: Omit<ApprovalProperties, 'decision' | 'signature' | 'completedAt'>,
  ): Approval {
    if (properties.requestedBy.equals(properties.approverId)) {
      throw new DocumentInvariantViolationError('Approver must be independent from requester.');
    }

    return new Approval({ ...properties, decision: null, signature: null, completedAt: null });
  }

  get id(): ApprovalId {
    return this.properties.id;
  }

  get requestedBy(): UserId {
    return this.properties.requestedBy;
  }

  get revisionId(): RevisionId {
    return this.properties.revisionId;
  }

  get decision(): ApprovalDecision | null {
    return this.properties.decision;
  }

  complete(decision: ApprovalDecision, signature: ElectronicSignature): Approval {
    if (this.properties.completedAt !== null) {
      throw new DocumentInvariantViolationError('Approval is already completed.');
    }

    if (!signature.signerId.equals(this.properties.approverId)) {
      throw new DocumentInvariantViolationError('Signature signer must match approver.');
    }

    return new Approval({ ...this.properties, decision, signature, completedAt: new Date() });
  }
}

export interface ControlledInformationProperties extends TenantMetadata {
  readonly id: ControlledInformationId;
  readonly type: ControlledInformationType;
  readonly title: string;
  readonly documentNumber: DocumentNumber;
  readonly classification: Classification;
  readonly category: Category;
  readonly owner: Owner;
  readonly accessPolicy: AccessPolicy;
  readonly retentionRule: RetentionRule;
  readonly metadata: Metadata;
  readonly lifecycle: LifecycleState;
  readonly archive: Archive | null;
}

export class ControlledInformation {
  protected constructor(private readonly properties: ControlledInformationProperties) {}

  static create(
    properties: Omit<ControlledInformationProperties, 'lifecycle' | 'archive' | 'deletedAt'>,
  ): ControlledInformation {
    validateControlledInformation(properties);
    return new ControlledInformation({
      ...properties,
      lifecycle: 'DRAFT',
      archive: null,
      deletedAt: null,
    });
  }

  get id(): ControlledInformationId {
    return this.properties.id;
  }

  get organisationId(): OrganisationId {
    return this.properties.organisationId;
  }

  get documentNumber(): DocumentNumber {
    return this.properties.documentNumber;
  }

  get lifecycle(): LifecycleState {
    return this.properties.lifecycle;
  }

  get classification(): Classification {
    return this.properties.classification;
  }

  transitionTo(
    next: LifecycleState,
    actorId: UserId,
  ): { readonly entity: ControlledInformation; readonly event: LifecycleChanged } {
    const lifecycle = Lifecycle.from(this.properties.lifecycle).transitionTo(next);
    const entity = new ControlledInformation({
      ...this.properties,
      lifecycle: lifecycle.state,
      updatedBy: actorId,
      updatedAt: new Date(),
    });
    return {
      entity,
      event: {
        type: 'LifecycleChanged',
        occurredAt: entity.properties.updatedAt,
        actorId,
        organisationId: this.properties.organisationId.value,
        controlledInformationId: this.properties.id,
        from: this.properties.lifecycle,
        to: lifecycle.state,
      },
    };
  }

  archive(
    actorId: UserId,
    reason: string,
  ): { readonly entity: ControlledInformation; readonly event: DocumentArchived } {
    if (reason.trim().length < 5) {
      throw new InvalidDocumentValueError('Archive reason is required.');
    }

    const archived = this.transitionTo('ARCHIVED', actorId).entity;
    const entity = new ControlledInformation({
      ...archived.properties,
      archive: { archivedAt: new Date(), archivedBy: actorId, reason },
    });

    return {
      entity,
      event: {
        type: 'DocumentArchived',
        occurredAt: entity.properties.archive?.archivedAt ?? new Date(),
        actorId,
        organisationId: this.properties.organisationId.value,
        documentId: DocumentId.from(this.properties.id.value),
        reason,
      },
    };
  }
}

export interface DocumentProperties {
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

export class Document {
  private readonly domainEvents: DocumentDomainEvent[] = [];

  private constructor(private readonly properties: DocumentProperties) {}

  static create(
    properties: Omit<
      DocumentProperties,
      | 'revisions'
      | 'approvals'
      | 'relationships'
      | 'evidenceLinks'
      | 'comments'
      | 'reviews'
      | 'attachments'
      | 'clauseMappings'
      | 'processLinks'
      | 'workflowReferences'
    >,
    actorId: UserId,
  ): Document {
    const document = new Document({
      ...properties,
      revisions: [],
      approvals: [],
      relationships: [],
      evidenceLinks: [],
      comments: [],
      reviews: [],
      attachments: [],
      clauseMappings: [],
      processLinks: [],
      workflowReferences: [],
    });
    document.record({
      type: 'DocumentCreated',
      occurredAt: new Date(),
      actorId,
      organisationId: document.organisationId.value,
      documentId: properties.documentId,
    });
    return document;
  }

  get id(): DocumentId {
    return this.properties.documentId;
  }

  get organisationId(): OrganisationId {
    return this.properties.controlledInformation.organisationId;
  }

  get lifecycle(): LifecycleState {
    return this.properties.controlledInformation.lifecycle;
  }

  get revisions(): readonly Revision[] {
    return this.properties.revisions;
  }

  get approvals(): readonly Approval[] {
    return this.properties.approvals;
  }

  get events(): readonly DocumentDomainEvent[] {
    return [...this.domainEvents];
  }

  createRevision(revision: Revision, actorId: UserId): Document {
    this.ensureSameTenant(revision);
    if (this.properties.revisions.some((existing) => existing.number.equals(revision.number))) {
      throw new DocumentInvariantViolationError('Revision number must be unique for a document.');
    }

    const document = this.copy({ revisions: [...this.properties.revisions, revision] });
    document.record({
      type: 'RevisionCreated',
      occurredAt: new Date(),
      actorId,
      organisationId: this.organisationId.value,
      documentId: this.id,
      revisionId: revision.id,
    });
    return document;
  }

  submitForReview(revisionId: RevisionId, actorId: UserId): Document {
    const revision = this.findRevision(revisionId).submitForReview();
    const document = this.replaceRevision(revision).transition('IN_REVIEW', actorId);
    document.record({
      type: 'DocumentSubmittedForReview',
      occurredAt: new Date(),
      actorId,
      organisationId: this.organisationId.value,
      documentId: this.id,
      revisionId,
    });
    return document;
  }

  requestApproval(approval: Approval): Document {
    if (!this.findRevision(approval.revisionId).authorId.equals(approval.requestedBy)) {
      throw new DocumentInvariantViolationError('Approval requester must be the revision author.');
    }

    return this.copy({ approvals: [...this.properties.approvals, approval] });
  }

  completeApproval(
    approvalId: ApprovalId,
    decision: ApprovalDecision,
    signature: ElectronicSignature,
    actorId: UserId,
  ): Document {
    const approval = this.findApproval(approvalId).complete(decision, signature);
    const revision = this.findRevision(approval.revisionId);
    const approvals = this.properties.approvals.map((item) =>
      item.id.equals(approvalId) ? approval : item,
    );

    if (signature.revisionContentHash !== revision.contentHash) {
      throw new DocumentInvariantViolationError(
        'Approval signature must bind to the exact revision content hash.',
      );
    }

    if (decision === 'REJECTED') {
      const document = this.copy({ approvals }).transition('DRAFT', actorId);
      document.record(rejectedEvent(this, approval, revision, actorId, 'Approval rejected.'));
      return document;
    }

    const approvedRevision = revision.approve();
    const document = this.copy({ approvals })
      .replaceRevision(approvedRevision)
      .transition('APPROVED', actorId);
    document.record(approvedEvent(this, approval, approvedRevision, actorId));
    document.record({
      type: 'ApprovalCompleted',
      occurredAt: new Date(),
      actorId,
      organisationId: this.organisationId.value,
      approvalId,
      revisionId: revision.id,
    });
    return document;
  }

  publish(revisionId: RevisionId, actorId: UserId): Document {
    const revision = this.findRevision(revisionId);
    const approval = this.properties.approvals.find(
      (item) => item.revisionId.equals(revisionId) && item.decision === 'APPROVED',
    );
    if (approval === undefined) {
      throw new DocumentInvariantViolationError('Published documents require completed approval.');
    }

    const publishedRevision = revision.publish();
    const document = this.replaceRevision(publishedRevision).transition('PUBLISHED', actorId);
    document.record({
      type: 'DocumentPublished',
      occurredAt: new Date(),
      actorId,
      organisationId: this.organisationId.value,
      documentId: this.id,
      revisionId,
    });
    return document;
  }

  addRelationship(relationship: Relationship, actorId: UserId): Document {
    if (relationship.organisationId.value !== this.organisationId.value) {
      throw new DocumentInvariantViolationError(
        'Relationship must belong to the same organisation as the document.',
      );
    }

    if (!relationship.sourceId.equals(this.properties.controlledInformation.id)) {
      throw new DocumentInvariantViolationError(
        'Relationship must originate from the document controlled information.',
      );
    }

    const document = this.copy({ relationships: [...this.properties.relationships, relationship] });
    document.record({
      type: 'RelationshipCreated',
      occurredAt: new Date(),
      actorId,
      organisationId: this.organisationId.value,
      relationshipId: relationship.id,
      sourceId: this.properties.controlledInformation.id,
      targetId: relationship.targetId,
    });
    return document;
  }

  linkEvidence(evidenceLink: EvidenceLink, actorId: UserId): Document {
    if (evidenceLink.organisationId.value !== this.organisationId.value) {
      throw new DocumentInvariantViolationError(
        'Evidence link must belong to the same organisation as the document.',
      );
    }

    if (!evidenceLink.controlledInformationId.equals(this.properties.controlledInformation.id)) {
      throw new DocumentInvariantViolationError(
        'Evidence link must target the document controlled information.',
      );
    }

    const document = this.copy({ evidenceLinks: [...this.properties.evidenceLinks, evidenceLink] });
    document.record({
      type: 'EvidenceLinked',
      occurredAt: new Date(),
      actorId,
      organisationId: this.organisationId.value,
      evidenceLinkId: evidenceLink.id,
      controlledInformationId: this.properties.controlledInformation.id,
    });
    return document;
  }

  private transition(next: LifecycleState, actorId: UserId): Document {
    const result = this.properties.controlledInformation.transitionTo(next, actorId);
    const document = this.copy({ controlledInformation: result.entity });
    document.record(result.event);
    return document;
  }

  private replaceRevision(revision: Revision): Document {
    return this.copy({
      revisions: this.properties.revisions.map((existing) =>
        existing.id.equals(revision.id) ? revision : existing,
      ),
    });
  }

  private findRevision(revisionId: RevisionId): Revision {
    const revision = this.properties.revisions.find((item) => item.id.equals(revisionId));
    if (revision === undefined) {
      throw new DocumentInvariantViolationError('Revision does not belong to this document.');
    }

    return revision;
  }

  private findApproval(approvalId: ApprovalId): Approval {
    const approval = this.properties.approvals.find((item) => item.id.equals(approvalId));
    if (approval === undefined) {
      throw new DocumentInvariantViolationError('Approval does not belong to this document.');
    }

    return approval;
  }

  private ensureSameTenant(revision: Revision): void {
    if (revision.organisationId.value !== this.organisationId.value) {
      throw new DocumentInvariantViolationError(
        'Revision must belong to the same organisation as the document.',
      );
    }
  }

  private copy(overrides: Partial<DocumentProperties>): Document {
    const document = new Document({ ...this.properties, ...overrides });
    document.domainEvents.push(...this.domainEvents);
    return document;
  }

  private record(event: DocumentDomainEvent): void {
    this.domainEvents.push(event);
  }
}

function validateControlledInformation(
  properties: Omit<ControlledInformationProperties, 'lifecycle' | 'archive' | 'deletedAt'>,
): void {
  if (properties.title.trim().length < 3) {
    throw new InvalidDocumentValueError(
      'Controlled information title must be at least 3 characters.',
    );
  }

  if (!properties.category.active) {
    throw new DocumentInvariantViolationError('Controlled information category must be active.');
  }

  if (properties.retentionRule.legalHold && properties.type === 'TEMPLATE') {
    throw new DocumentInvariantViolationError(
      'Template legal hold must be applied through controlled records or archives.',
    );
  }
}

function approvedEvent(
  document: Document,
  approval: Approval,
  revision: Revision,
  actorId: UserId,
): DocumentApproved {
  return {
    type: 'DocumentApproved',
    occurredAt: new Date(),
    actorId,
    organisationId: document.organisationId.value,
    documentId: document.id,
    approvalId: approval.id,
    revisionId: revision.id,
  };
}

function rejectedEvent(
  document: Document,
  approval: Approval,
  revision: Revision,
  actorId: UserId,
  reason: string,
): DocumentRejected {
  return {
    type: 'DocumentRejected',
    occurredAt: new Date(),
    actorId,
    organisationId: document.organisationId.value,
    documentId: document.id,
    approvalId: approval.id,
    revisionId: revision.id,
    reason,
  };
}
