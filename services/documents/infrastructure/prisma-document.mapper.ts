import {
  Approval,
  ApprovalId,
  Classification,
  ControlledInformation,
  ControlledInformationId,
  Document,
  DocumentId,
  DocumentNumber,
  ElectronicSignatureId,
  EvidenceLink,
  EvidenceLinkId,
  EvidenceReference,
  InvalidDocumentValueError,
  Metadata,
  OrganisationId,
  Relationship,
  RelationshipId,
  RetentionPeriod,
  Revision,
  RevisionId,
  RevisionNumber,
  UserId,
  type AccessPolicy,
  type ApprovalDecision,
  type ClassificationLevel,
  type ControlledInformationType,
  type ElectronicSignature,
  type EvidenceLinkProperties,
  type LifecycleState,
  type RelationshipType,
} from '../index.js';
import type {
  ControlledInformationRow,
  DocumentApprovalRow,
  DocumentEvidenceLinkRow,
  DocumentRelationshipRow,
  DocumentRevisionRow,
  KcipDocumentRow,
} from './prisma-documents.types.js';

type JsonRecord = Readonly<Record<string, unknown>>;

export function mapDocumentRow(row: KcipDocumentRow): Document {
  return Document.rehydrate({
    controlledInformation: mapControlledInformationRow(row.controlledInformation),
    documentId: DocumentId.from(row.id),
    revisions: row.revisions.filter(active).map(mapRevisionRow),
    approvals: row.approvals.filter(active).map(mapApprovalRow),
    relationships: [],
    evidenceLinks: [],
    comments: [],
    reviews: [],
    attachments: [],
    clauseMappings: [],
    processLinks: [],
    workflowReferences: [],
  });
}

export function mapControlledInformationRow(row: ControlledInformationRow): ControlledInformation {
  return ControlledInformation.rehydrate({
    id: ControlledInformationId.from(row.id),
    type: row.type as ControlledInformationType,
    title: row.title,
    documentNumber: DocumentNumber.from(row.documentNumber),
    classification: Classification.from(row.classification as ClassificationLevel),
    category: {
      name: row.categoryName,
      active: row.categoryActive,
    },
    owner: {
      userId: UserId.from(row.ownerUserId),
      role: row.ownerRole,
    },
    accessPolicy: mapAccessPolicy(row.accessPolicy),
    retentionRule: {
      period: RetentionPeriod.days(row.retentionDays),
      legalHold: row.legalHold,
    },
    metadata: Metadata.from(
      new Map(Object.entries(asRecord(row.metadata)).map(([key, value]) => [key, String(value)])),
    ),
    lifecycle: row.lifecycle as LifecycleState,
    archive:
      row.archivedAt === null || row.archivedBy === null || row.archiveReason === null
        ? null
        : {
            archivedAt: row.archivedAt,
            archivedBy: UserId.from(row.archivedBy),
            reason: row.archiveReason,
          },
    organisationId: OrganisationId.from(row.organisationId),
    createdBy: UserId.from(row.createdBy),
    updatedBy: UserId.from(row.modifiedBy),
    createdAt: row.createdAt,
    updatedAt: row.modifiedAt,
    deletedAt: row.deletedAt,
  });
}

export function mapRevisionRow(row: DocumentRevisionRow): Revision {
  return Revision.rehydrate({
    id: RevisionId.from(row.id),
    organisationId: OrganisationId.from(row.organisationId),
    number: RevisionNumber.from(row.revisionNumber),
    authorId: UserId.from(row.authorId),
    contentHash: row.contentHash,
    changeSummary: row.changeSummary,
    lifecycle: row.lifecycle as LifecycleState,
    approvedAt: row.approvedAt,
    publishedAt: row.publishedAt,
  });
}

export function mapApprovalRow(row: DocumentApprovalRow): Approval {
  return Approval.rehydrate({
    id: ApprovalId.from(row.id),
    organisationId: OrganisationId.from(row.organisationId),
    revisionId: RevisionId.from(row.revisionId),
    requestedBy: UserId.from(row.requestedBy),
    approverId: UserId.from(row.approverId),
    decision: row.decision as ApprovalDecision | null,
    signature: row.signature === null ? null : mapSignature(row.signature),
    completedAt: row.completedAt,
  });
}

export function mapRelationshipRow(row: DocumentRelationshipRow): Relationship {
  return Relationship.rehydrate({
    id: RelationshipId.from(row.id),
    organisationId: OrganisationId.from(row.organisationId),
    sourceId: ControlledInformationId.from(row.controlledInformationId),
    targetId: row.targetId,
    type: row.type as RelationshipType,
    rationale: row.rationale,
  });
}

export function mapEvidenceLinkRow(row: DocumentEvidenceLinkRow): EvidenceLink {
  return EvidenceLink.rehydrate({
    id: EvidenceLinkId.from(row.id),
    organisationId: OrganisationId.from(row.organisationId),
    controlledInformationId: ControlledInformationId.from(row.controlledInformationId),
    evidenceReference: EvidenceReference.from(row.evidenceReference),
    relationshipType: row.relationshipType as EvidenceLinkProperties['relationshipType'],
    verified: row.verified,
  });
}

export function controlledInformationData(entity: ControlledInformation): Record<string, unknown> {
  return {
    id: entity.id.value,
    organisationId: entity.organisationId.value,
    type: entity.type,
    title: entity.title,
    documentNumber: entity.documentNumber.value,
    classification: entity.classification.level,
    categoryName: entity.category.name,
    categoryActive: entity.category.active,
    ownerUserId: entity.owner.userId.value,
    ownerRole: entity.owner.role,
    accessPolicy: {
      canViewDraftUserIds: entity.accessPolicy.canViewDraftUserIds.map((userId) => userId.value),
      canApproveUserIds: entity.accessPolicy.canApproveUserIds.map((userId) => userId.value),
      externalAccessAllowed: entity.accessPolicy.externalAccessAllowed,
    },
    retentionDays: entity.retentionRule.period.days,
    legalHold: entity.retentionRule.legalHold,
    metadata: Object.fromEntries(entity.metadata.entries()),
    lifecycle: entity.lifecycle,
    archivedAt: entity.archiveRecord?.archivedAt ?? null,
    archivedBy: entity.archiveRecord?.archivedBy.value ?? null,
    archiveReason: entity.archiveRecord?.reason ?? null,
    createdAt: entity.createdAt,
    createdBy: entity.createdBy.value,
    modifiedAt: entity.updatedAt,
    modifiedBy: entity.updatedBy.value,
    tenantId: entity.organisationId.value,
    deletedAt: entity.deletedAt,
  };
}

export function documentData(document: Document): Record<string, unknown> {
  return {
    id: document.id.value,
    organisationId: document.organisationId.value,
    controlledInformationId: document.controlledInformation.id.value,
    createdBy: document.controlledInformation.createdBy.value,
    modifiedBy: document.controlledInformation.updatedBy.value,
    tenantId: document.organisationId.value,
    deletedAt: document.controlledInformation.deletedAt,
  };
}

export function revisionData(document: Document, revision: Revision): Record<string, unknown> {
  return revisionDataForDocument(
    document.id.value,
    document.controlledInformation.id.value,
    revision,
  );
}

export function revisionDataForDocument(
  documentId: string,
  controlledInformationId: string,
  revision: Revision,
): Record<string, unknown> {
  return {
    id: revision.id.value,
    organisationId: revision.organisationId.value,
    documentId,
    controlledInformationId,
    revisionNumber: revision.number.value,
    authorId: revision.authorId.value,
    contentHash: revision.contentHash,
    changeSummary: revision.changeSummary,
    lifecycle: revision.lifecycle,
    approvedAt: revision.approvedAt,
    publishedAt: revision.publishedAt,
    createdBy: revision.authorId.value,
    modifiedBy: revision.authorId.value,
    tenantId: revision.organisationId.value,
    revisionId: revision.id.value,
  };
}

export function approvalData(documentId: string, approval: Approval): Record<string, unknown> {
  return {
    id: approval.id.value,
    organisationId: approval.organisationId.value,
    documentId,
    revisionId: approval.revisionId.value,
    requestedBy: approval.requestedBy.value,
    approverId: approval.approverId.value,
    decision: approval.decision,
    signature: approval.signature === null ? null : signatureData(approval.signature),
    completedAt: approval.completedAt,
    createdBy: approval.requestedBy.value,
    modifiedBy: approval.approverId.value,
    tenantId: approval.organisationId.value,
  };
}

export function relationshipData(
  relationship: Relationship,
  actorId: UserId,
): Record<string, unknown> {
  return {
    id: relationship.id.value,
    organisationId: relationship.organisationId.value,
    controlledInformationId: relationship.sourceId.value,
    targetId: relationship.targetId,
    type: relationship.type,
    rationale: relationship.rationale,
    createdBy: actorId.value,
    modifiedBy: actorId.value,
    tenantId: relationship.organisationId.value,
  };
}

export function evidenceLinkData(
  evidenceLink: EvidenceLink,
  actorId: UserId,
): Record<string, unknown> {
  return {
    id: evidenceLink.id.value,
    organisationId: evidenceLink.organisationId.value,
    controlledInformationId: evidenceLink.controlledInformationId.value,
    evidenceReference: evidenceLink.evidenceReference.value,
    relationshipType: evidenceLink.relationshipType,
    verified: evidenceLink.verified,
    createdBy: actorId.value,
    modifiedBy: actorId.value,
    tenantId: evidenceLink.organisationId.value,
  };
}

function mapAccessPolicy(value: unknown): AccessPolicy {
  const record = asRecord(value);
  return {
    canViewDraftUserIds: stringArray(record.canViewDraftUserIds).map((value) => UserId.from(value)),
    canApproveUserIds: stringArray(record.canApproveUserIds).map((value) => UserId.from(value)),
    externalAccessAllowed: record.externalAccessAllowed === true,
  };
}

function mapSignature(value: unknown): ElectronicSignature {
  const record = asRecord(value);
  return {
    id: ElectronicSignatureId.from(requiredString(record.id, 'signature.id')),
    signerId: UserId.from(requiredString(record.signerId, 'signature.signerId')),
    meaning: requiredString(record.meaning, 'signature.meaning'),
    signedAt: new Date(requiredString(record.signedAt, 'signature.signedAt')),
    revisionContentHash: requiredString(
      record.revisionContentHash,
      'signature.revisionContentHash',
    ),
  };
}

function signatureData(signature: ElectronicSignature): Record<string, string> {
  return {
    id: signature.id.value,
    signerId: signature.signerId.value,
    meaning: signature.meaning,
    signedAt: signature.signedAt.toISOString(),
    revisionContentHash: signature.revisionContentHash,
  };
}

function asRecord(value: unknown): JsonRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new InvalidDocumentValueError('Persisted JSON value must be an object.');
  }

  return value as JsonRecord;
}

function stringArray(value: unknown): readonly string[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new InvalidDocumentValueError('Persisted JSON value must be a string array.');
  }

  return value;
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new InvalidDocumentValueError(`Persisted ${field} must be a non-empty string.`);
  }

  return value;
}

function active(row: { readonly deletedAt: Date | null }): boolean {
  return row.deletedAt === null;
}
