import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

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
  Metadata,
  OrganisationId,
  PrismaDocumentRepository,
  PrismaEvidenceRepository,
  PrismaRelationshipRepository,
  Relationship,
  RelationshipId,
  RetentionPeriod,
  Revision,
  RevisionId,
  RevisionNumber,
  UserId,
  type AccessPolicy,
  type Category,
  type ElectronicSignature,
  type Owner,
  type RetentionRule,
} from '../index.js';
import {
  controlledInformationData,
  mapDocumentRow,
} from '../infrastructure/prisma-document.mapper.js';
import type {
  ControlledInformationRow,
  DocumentApprovalRow,
  DocumentEvidenceLinkRow,
  DocumentRelationshipRow,
  DocumentRevisionRow,
  KcipDelegate,
  KcipDocumentRow,
  KcipPrismaClient,
  KcipPrismaTransaction,
} from '../infrastructure/prisma-documents.types.js';

const organisationId = OrganisationId.from('11111111-1111-4111-8111-111111111111');
const authorId = UserId.from('33333333-3333-4333-8333-333333333333');
const approverId = UserId.from('44444444-4444-4444-8444-444444444444');
const reviewerId = UserId.from('55555555-5555-4555-8555-555555555555');
const now = new Date('2026-07-08T12:00:00.000Z');
const contentHash = '0123456789abcdef0123456789abcdef';

describe('KCIP persistence schema', () => {
  it('defines tenant isolation, audit metadata, optimistic concurrency, indexes, rollback, and seed data', () => {
    const schema = readWorkspaceFile('packages/database/prisma/schema.prisma');
    const migration = readWorkspaceFile(
      'packages/database/prisma/migrations/20260708130000_release_0_2_sprint_2_2_kcip_persistence/migration.sql',
    );
    const rollback = readWorkspaceFile(
      'packages/database/prisma/migrations/20260708130000_release_0_2_sprint_2_2_kcip_persistence/rollback.sql',
    );
    const seed = readWorkspaceFile('packages/database/prisma/seed.sql');

    for (const model of [
      'ControlledInformation',
      'KcipDocument',
      'DocumentRevision',
      'DocumentApproval',
      'DocumentRelationship',
      'DocumentEvidenceLink',
    ]) {
      expect(schema).toContain(`model ${model}`);
    }

    for (const field of [
      'createdAt',
      'createdBy',
      'modifiedAt',
      'modifiedBy',
      'tenantId',
      'version',
    ]) {
      expect(schema).toContain(field);
    }

    expect(migration).toContain('CHECK ("tenantId" = "organisationId")');
    expect(migration).toContain(
      'CREATE UNIQUE INDEX "controlled_information_organisationId_documentNumber_key"',
    );
    expect(migration).toContain('CREATE INDEX "document_revisions_tenantId_lifecycle_idx"');
    expect(migration).toContain('CONSTRAINT "document_approvals_independent_check"');
    expect(rollback).toContain('DROP TABLE IF EXISTS "controlled_information"');
    expect(seed).toContain('QMS-MAN-001');
  });
});

describe('KCIP Prisma mapping', () => {
  it('round-trips aggregate rows into domain objects and persistence data', () => {
    const document = mapDocumentRow(documentRow());

    expect(document.id.value).toBe(controlledInformationId().value);
    expect(document.organisationId.value).toBe(organisationId.value);
    expect(document.revisions[0]?.number.value).toBe('1.0');
    expect(document.approvals[0]?.decision).toBe('APPROVED');

    const data = controlledInformationData(document.controlledInformation);
    expect(data.tenantId).toBe(organisationId.value);
    expect(data.documentNumber).toBe('QMS-MAN-001');
    expect(data.metadata).toEqual({ process_owner: 'Quality Manager' });
  });
});

describe('KCIP Prisma repositories', () => {
  it('persists documents inside a transaction with tenant-scoped child rows', async () => {
    const prisma = new RecordingPrismaClient();
    const revision = createRevision('1.0');
    const approval = Approval.request({
      id: approvalId(),
      organisationId,
      revisionId: revision.id,
      requestedBy: authorId,
      approverId,
    }).complete('APPROVED', signature(approverId, contentHash));
    const document = createDocument().createRevision(revision, authorId).requestApproval(approval);

    await new PrismaDocumentRepository(prisma).save(document);

    expect(prisma.transactionCount).toBe(1);
    expect(prisma.documentRevision.createdMany[0]?.data).toEqual([
      expect.objectContaining({
        tenantId: organisationId.value,
        revisionId: revision.id.value,
        revisionNumber: '1.0',
      }),
    ]);
    expect(prisma.documentApproval.createdMany[0]?.data).toEqual([
      expect.objectContaining({
        tenantId: organisationId.value,
        revisionId: revision.id.value,
        decision: 'APPROVED',
      }),
    ]);
  });

  it('persists relationships and evidence links with repository audit metadata', async () => {
    const prisma = new RecordingPrismaClient();
    const relationship = Relationship.create({
      id: RelationshipId.from('77777777-7777-4777-8777-777777777777'),
      organisationId,
      sourceId: controlledInformationId(),
      targetId: 'ISO 9001:2015:7.5',
      type: 'CLAUSE_SUPPORTS_DOCUMENT',
      rationale: 'Maps document control requirements.',
    });
    const evidenceLink = EvidenceLink.create({
      id: EvidenceLinkId.from('88888888-8888-4888-8888-888888888888'),
      organisationId,
      controlledInformationId: controlledInformationId(),
      evidenceReference: EvidenceReference.from('EV-2026-0001'),
      relationshipType: 'SUPPORTS',
      verified: false,
    });

    await new PrismaRelationshipRepository(prisma).save(relationship);
    await new PrismaEvidenceRepository(prisma).saveLink(evidenceLink);

    expect(prisma.documentRelationship.upserts[0]?.create).toEqual(
      expect.objectContaining({
        tenantId: organisationId.value,
        type: 'CLAUSE_SUPPORTS_DOCUMENT',
      }),
    );
    expect(prisma.documentEvidenceLink.upserts[0]?.create).toEqual(
      expect.objectContaining({
        tenantId: organisationId.value,
        evidenceReference: 'EV-2026-0001',
      }),
    );
  });
});

class RecordingPrismaClient implements KcipPrismaClient {
  readonly controlledInformation = new RecordingDelegate<ControlledInformationRow>(
    controlledInformationRow(),
  );
  readonly kcipDocument = new RecordingDelegate<KcipDocumentRow>(documentRow());
  readonly documentRevision = new RecordingDelegate<DocumentRevisionRow>(revisionRow());
  readonly documentApproval = new RecordingDelegate<DocumentApprovalRow>(approvalRow());
  readonly documentRelationship = new RecordingDelegate<DocumentRelationshipRow>(relationshipRow());
  readonly documentEvidenceLink = new RecordingDelegate<DocumentEvidenceLinkRow>(evidenceLinkRow());
  transactionCount = 0;

  async $transaction<TResult>(
    handler: (transaction: KcipPrismaTransaction) => Promise<TResult>,
  ): Promise<TResult> {
    this.transactionCount += 1;
    return handler(this);
  }
}

class RecordingDelegate<TRow> implements KcipDelegate<TRow> {
  readonly upserts: { readonly create: unknown; readonly update: unknown }[] = [];
  readonly createdMany: { readonly data: readonly unknown[] }[] = [];
  readonly deletedMany: unknown[] = [];

  constructor(private readonly row: TRow) {}

  findFirst(): Promise<TRow | null> {
    return Promise.resolve(this.row);
  }

  findUnique(): Promise<TRow | null> {
    return Promise.resolve(this.row);
  }

  upsert(args: unknown): Promise<TRow> {
    const record = asRecord(args);
    this.upserts.push({
      create: record.create,
      update: record.update,
    });
    return Promise.resolve(this.row);
  }

  update(): Promise<TRow> {
    return Promise.resolve(this.row);
  }

  deleteMany(args: unknown): Promise<{ readonly count: number }> {
    this.deletedMany.push(args);
    return Promise.resolve({ count: 1 });
  }

  createMany(args: unknown): Promise<{ readonly count: number }> {
    const record = asRecord(args);
    const data = Array.isArray(record.data) ? record.data : [];
    this.createdMany.push({ data });
    return Promise.resolve({ count: data.length });
  }
}

function readWorkspaceFile(path: string): string {
  return readFileSync(join(process.cwd(), '../..', path), 'utf8');
}

function createDocument(): Document {
  const controlledInformation = ControlledInformation.create({
    id: controlledInformationId(),
    type: 'DOCUMENT',
    title: 'Quality Manual',
    documentNumber: DocumentNumber.from('QMS-MAN-001'),
    classification: Classification.from('INTERNAL'),
    category: activeCategory(),
    owner: owner(),
    accessPolicy: accessPolicy(),
    retentionRule: retentionRule(),
    metadata: Metadata.from(new Map([['process_owner', 'Quality Manager']])),
    organisationId,
    createdBy: authorId,
    updatedBy: authorId,
    createdAt: now,
    updatedAt: now,
  });

  return Document.create(
    {
      controlledInformation,
      documentId: DocumentId.from(controlledInformation.id.value),
    },
    authorId,
  );
}

function createRevision(value: string): Revision {
  return Revision.draft({
    id: revisionId(),
    organisationId,
    number: RevisionNumber.from(value),
    authorId,
    contentHash,
    changeSummary: 'Initial controlled release.',
  });
}

function signature(signerId: UserId, revisionContentHash: string): ElectronicSignature {
  return {
    id: ElectronicSignatureId.from('cccccccc-cccc-4ccc-8ccc-cccccccccccc'),
    signerId,
    meaning: 'I approve this controlled revision.',
    signedAt: now,
    revisionContentHash,
  };
}

function documentRow(): KcipDocumentRow {
  return {
    id: controlledInformationId().value,
    organisationId: organisationId.value,
    controlledInformationId: controlledInformationId().value,
    createdAt: now,
    createdBy: authorId.value,
    modifiedAt: now,
    modifiedBy: authorId.value,
    tenantId: organisationId.value,
    deletedAt: null,
    version: 1,
    controlledInformation: controlledInformationRow(),
    revisions: [revisionRow()],
    approvals: [approvalRow()],
  };
}

function controlledInformationRow(): ControlledInformationRow {
  return {
    id: controlledInformationId().value,
    organisationId: organisationId.value,
    type: 'DOCUMENT',
    title: 'Quality Manual',
    documentNumber: 'QMS-MAN-001',
    classification: 'INTERNAL',
    categoryName: 'Quality Manual',
    categoryActive: true,
    ownerUserId: authorId.value,
    ownerRole: 'Quality Manager',
    accessPolicy: {
      canViewDraftUserIds: [authorId.value, reviewerId.value],
      canApproveUserIds: [approverId.value],
      externalAccessAllowed: false,
    },
    retentionDays: 2555,
    legalHold: false,
    metadata: { process_owner: 'Quality Manager' },
    lifecycle: 'APPROVED',
    archivedAt: null,
    archivedBy: null,
    archiveReason: null,
    createdAt: now,
    createdBy: authorId.value,
    modifiedAt: now,
    modifiedBy: authorId.value,
    tenantId: organisationId.value,
    deletedAt: null,
    version: 1,
  };
}

function revisionRow(): DocumentRevisionRow {
  return {
    id: revisionId().value,
    organisationId: organisationId.value,
    documentId: controlledInformationId().value,
    controlledInformationId: controlledInformationId().value,
    revisionNumber: '1.0',
    authorId: authorId.value,
    contentHash,
    changeSummary: 'Initial controlled release.',
    lifecycle: 'APPROVED',
    approvedAt: now,
    publishedAt: null,
    createdAt: now,
    createdBy: authorId.value,
    modifiedAt: now,
    modifiedBy: authorId.value,
    tenantId: organisationId.value,
    revisionId: revisionId().value,
    deletedAt: null,
    version: 1,
  };
}

function approvalRow(): DocumentApprovalRow {
  return {
    id: approvalId().value,
    organisationId: organisationId.value,
    documentId: controlledInformationId().value,
    revisionId: revisionId().value,
    requestedBy: authorId.value,
    approverId: approverId.value,
    decision: 'APPROVED',
    signature: {
      id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      signerId: approverId.value,
      meaning: 'I approve this controlled revision.',
      signedAt: now.toISOString(),
      revisionContentHash: contentHash,
    },
    completedAt: now,
    createdAt: now,
    createdBy: authorId.value,
    modifiedAt: now,
    modifiedBy: approverId.value,
    tenantId: organisationId.value,
    deletedAt: null,
    version: 1,
  };
}

function relationshipRow(): DocumentRelationshipRow {
  return {
    id: '77777777-7777-4777-8777-777777777777',
    organisationId: organisationId.value,
    controlledInformationId: controlledInformationId().value,
    targetId: 'ISO 9001:2015:7.5',
    type: 'CLAUSE_SUPPORTS_DOCUMENT',
    rationale: 'Maps document control requirements.',
    createdAt: now,
    createdBy: authorId.value,
    modifiedAt: now,
    modifiedBy: authorId.value,
    tenantId: organisationId.value,
    deletedAt: null,
    version: 1,
  };
}

function evidenceLinkRow(): DocumentEvidenceLinkRow {
  return {
    id: '88888888-8888-4888-8888-888888888888',
    organisationId: organisationId.value,
    controlledInformationId: controlledInformationId().value,
    evidenceReference: 'EV-2026-0001',
    relationshipType: 'SUPPORTS',
    verified: false,
    createdAt: now,
    createdBy: authorId.value,
    modifiedAt: now,
    modifiedBy: authorId.value,
    tenantId: organisationId.value,
    deletedAt: null,
    version: 1,
  };
}

function controlledInformationId(): ControlledInformationId {
  return ControlledInformationId.from('99999999-9999-4999-8999-999999999999');
}

function revisionId(): RevisionId {
  return RevisionId.from('aaaaaaaa-1111-4111-8111-111111111111');
}

function approvalId(): ApprovalId {
  return ApprovalId.from('12345678-1234-4234-8234-123456789abc');
}

function activeCategory(): Category {
  return {
    name: 'Quality Manual',
    active: true,
  };
}

function owner(): Owner {
  return {
    userId: authorId,
    role: 'Quality Manager',
  };
}

function accessPolicy(): AccessPolicy {
  return {
    canViewDraftUserIds: [authorId, reviewerId],
    canApproveUserIds: [approverId],
    externalAccessAllowed: false,
  };
}

function retentionRule(): RetentionRule {
  return {
    period: RetentionPeriod.days(2555),
    legalHold: false,
  };
}

function asRecord(value: unknown): Readonly<Record<string, unknown>> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError('Expected a record.');
  }

  return value as Readonly<Record<string, unknown>>;
}
