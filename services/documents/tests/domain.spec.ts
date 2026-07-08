import { describe, expect, it } from 'vitest';

import {
  Approval,
  ApprovalId,
  AttachmentId,
  ClauseMappingId,
  ClauseReference,
  Classification,
  CommentId,
  ControlledInformation,
  ControlledInformationId,
  Document,
  DocumentId,
  DocumentInvariantViolationError,
  DocumentNumber,
  ElectronicSignatureId,
  EvidenceLink,
  EvidenceLinkId,
  EvidenceReference,
  InvalidDocumentIdentifierError,
  InvalidDocumentStateTransitionError,
  InvalidDocumentValueError,
  Lifecycle,
  Metadata,
  OrganisationId,
  ProcessLinkId,
  ProcessReference,
  Relationship,
  RelationshipId,
  RetentionPeriod,
  ReviewId,
  Revision,
  RevisionId,
  RevisionNumber,
  UserId,
  WorkflowReferenceId,
  type AccessPolicy,
  type Category,
  type ElectronicSignature,
  type Owner,
  type RetentionRule,
} from '../index.js';

const organisationId = OrganisationId.from('11111111-1111-4111-8111-111111111111');
const otherOrganisationId = OrganisationId.from('22222222-2222-4222-8222-222222222222');
const authorId = UserId.from('33333333-3333-4333-8333-333333333333');
const approverId = UserId.from('44444444-4444-4444-8444-444444444444');
const reviewerId = UserId.from('55555555-5555-4555-8555-555555555555');
const now = new Date('2026-07-08T12:00:00.000Z');
const contentHash = '0123456789abcdef0123456789abcdef';

describe('KCIP value objects', () => {
  it('validates identifiers, document numbers, revision numbers, clause references, metadata, and retention', () => {
    expect(() => DocumentId.from('not-a-uuid')).toThrow(InvalidDocumentIdentifierError);
    expect(() => DocumentNumber.from('ci')).toThrow(InvalidDocumentValueError);
    expect(() => DocumentNumber.from('CI--001')).toThrow(InvalidDocumentValueError);
    expect(DocumentNumber.from('QMS-PROC-001').value).toBe('QMS-PROC-001');
    expect(RevisionNumber.from('1.0').nextMinor().value).toBe('1.1');
    expect(RevisionNumber.from('1.1').nextMajor().value).toBe('2.0');
    expect(() => RevisionNumber.from('v1')).toThrow(InvalidDocumentValueError);
    expect(ClauseReference.from('iso 9001', '2015', '7.5').standard).toBe('ISO 9001');
    expect(() => ClauseReference.from('BS 9999', '2020', '1')).toThrow(InvalidDocumentValueError);
    expect(
      Metadata.from(new Map([['process_owner', 'Quality Manager']])).get('process_owner'),
    ).toBe('Quality Manager');
    expect(() => Metadata.from(new Map([['Process Owner', 'Quality Manager']]))).toThrow(
      InvalidDocumentValueError,
    );
    expect(RetentionPeriod.days(365).days).toBe(365);
    expect(() => RetentionPeriod.days(0)).toThrow(InvalidDocumentValueError);
  });

  it('models classification and all requested identifier value objects', () => {
    expect(Classification.from('PUBLIC').permitsExternalAccess()).toBe(true);
    expect(Classification.from('RESTRICTED').permitsExternalAccess()).toBe(false);
    expect(ApprovalId.from('66666666-6666-4666-8666-666666666666').value).toContain('6666');
    expect(RelationshipId.from('77777777-7777-4777-8777-777777777777').value).toContain('7777');
    expect(EvidenceLinkId.from('88888888-8888-4888-8888-888888888888').value).toContain('8888');
    expect(CommentId.from('99999999-9999-4999-8999-999999999999').value).toContain('9999');
    expect(ReviewId.from('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa').value).toContain('aaaa');
    expect(AttachmentId.from('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb').value).toContain('bbbb');
    expect(ElectronicSignatureId.from('cccccccc-cccc-4ccc-8ccc-cccccccccccc').value).toContain(
      'cccc',
    );
    expect(ClauseMappingId.from('dddddddd-dddd-4ddd-8ddd-dddddddddddd').value).toContain('dddd');
    expect(ProcessLinkId.from('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee').value).toContain('eeee');
    expect(WorkflowReferenceId.from('ffffffff-ffff-4fff-8fff-ffffffffffff').value).toContain(
      'ffff',
    );
    expect(ProcessReference.from('PROC-QUALITY').value).toBe('PROC-QUALITY');
    expect(EvidenceReference.from('EV-2026-0001').value).toBe('EV-2026-0001');
  });
});

describe('KCIP lifecycle state machine', () => {
  it('permits approved lifecycle transitions and rejects invalid transitions', () => {
    const lifecycle = Lifecycle.draft()
      .transitionTo('IN_REVIEW')
      .transitionTo('APPROVED')
      .transitionTo('PUBLISHED');
    expect(lifecycle.state).toBe('PUBLISHED');
    expect(() => Lifecycle.from('DRAFT').transitionTo('PUBLISHED')).toThrow(
      InvalidDocumentStateTransitionError,
    );
    expect(() => Lifecycle.from('ARCHIVED').transitionTo('PUBLISHED')).toThrow(
      InvalidDocumentStateTransitionError,
    );
  });
});

describe('KCIP document aggregate', () => {
  it('creates controlled information and emits document creation events', () => {
    const document = createDocument();

    expect(document.lifecycle).toBe('DRAFT');
    expect(document.events.map((event) => event.type)).toEqual(['DocumentCreated']);
  });

  it('enforces revision numbering, lifecycle, approval, publication, and event rules', () => {
    const draftRevision = createRevision('1.0');
    const document = createDocument().createRevision(draftRevision, authorId);
    expect(document.revisions).toHaveLength(1);
    expect(() => document.createRevision(createRevision('1.0'), authorId)).toThrow(
      DocumentInvariantViolationError,
    );

    const inReview = document.submitForReview(draftRevision.id, authorId);
    expect(inReview.lifecycle).toBe('IN_REVIEW');
    expect(inReview.events.map((event) => event.type)).toContain('DocumentSubmittedForReview');

    const approval = Approval.request({
      id: ApprovalId.from('12345678-1234-4234-8234-123456789abc'),
      organisationId,
      revisionId: draftRevision.id,
      requestedBy: authorId,
      approverId,
    });
    const awaitingApproval = inReview.requestApproval(approval);
    const approved = awaitingApproval.completeApproval(
      approval.id,
      'APPROVED',
      signature(approverId, contentHash),
      approverId,
    );
    expect(approved.lifecycle).toBe('APPROVED');
    expect(approved.approvals[0]?.decision).toBe('APPROVED');

    const published = approved.publish(draftRevision.id, approverId);
    expect(published.lifecycle).toBe('PUBLISHED');
    expect(published.events.map((event) => event.type)).toContain('DocumentPublished');
    expect(published.revisions[0]?.lifecycle).toBe('PUBLISHED');
  });

  it('rejects self approval, mismatched signatures, and publishing without completed approval', () => {
    const revision = createRevision('1.0');
    const inReview = createDocument()
      .createRevision(revision, authorId)
      .submitForReview(revision.id, authorId);

    expect(() =>
      Approval.request({
        id: ApprovalId.from('12345678-1234-4234-8234-123456789abc'),
        organisationId,
        revisionId: revision.id,
        requestedBy: authorId,
        approverId: authorId,
      }),
    ).toThrow(DocumentInvariantViolationError);

    const approval = Approval.request({
      id: ApprovalId.from('12345678-1234-4234-8234-123456789abc'),
      organisationId,
      revisionId: revision.id,
      requestedBy: authorId,
      approverId,
    });
    const awaitingApproval = inReview.requestApproval(approval);

    expect(() => {
      awaitingApproval.completeApproval(
        approval.id,
        'APPROVED',
        signature(approverId, 'wrong-hash-value'),
        approverId,
      );
    }).toThrow(DocumentInvariantViolationError);
    expect(() => inReview.publish(revision.id, approverId)).toThrow(
      DocumentInvariantViolationError,
    );
  });

  it('keeps approved revisions immutable and returns rejected approvals to draft', () => {
    const revision = createRevision('1.0');
    const approval = Approval.request({
      id: ApprovalId.from('12345678-1234-4234-8234-123456789abc'),
      organisationId,
      revisionId: revision.id,
      requestedBy: authorId,
      approverId,
    });
    const awaitingApproval = createDocument()
      .createRevision(revision, authorId)
      .submitForReview(revision.id, authorId)
      .requestApproval(approval);

    const rejected = awaitingApproval.completeApproval(
      approval.id,
      'REJECTED',
      signature(approverId, contentHash),
      approverId,
    );
    expect(rejected.lifecycle).toBe('DRAFT');
    expect(rejected.events.map((event) => event.type)).toContain('DocumentRejected');

    const approvedRevision = revision.submitForReview().approve();
    expect(() => {
      approvedRevision.assertMutable();
    }).toThrow(DocumentInvariantViolationError);
  });

  it('validates relationship and evidence tenant ownership', () => {
    const document = createDocument();
    const relationship = Relationship.create({
      id: RelationshipId.from('77777777-7777-4777-8777-777777777777'),
      organisationId,
      sourceId: controlledInformationId(),
      targetId: 'ISO 9001:2015:7.5',
      type: 'CLAUSE_SUPPORTS_DOCUMENT',
      rationale: 'Maps document control requirements.',
    });
    expect(
      document.addRelationship(relationship, authorId).events.map((event) => event.type),
    ).toContain('RelationshipCreated');

    const otherTenantRelationship = Relationship.create({
      ...relationshipProperties(),
      organisationId: otherOrganisationId,
    });
    expect(() => document.addRelationship(otherTenantRelationship, authorId)).toThrow(
      DocumentInvariantViolationError,
    );

    const wrongSourceRelationship = Relationship.create({
      ...relationshipProperties(),
      sourceId: ControlledInformationId.from('12121212-1212-4121-8121-121212121212'),
    });
    expect(() => document.addRelationship(wrongSourceRelationship, authorId)).toThrow(
      DocumentInvariantViolationError,
    );

    const evidenceLink = EvidenceLink.create({
      id: EvidenceLinkId.from('88888888-8888-4888-8888-888888888888'),
      organisationId,
      controlledInformationId: controlledInformationId(),
      evidenceReference: EvidenceReference.from('EV-2026-0001'),
      relationshipType: 'SUPPORTS',
      verified: false,
    });
    expect(
      document.linkEvidence(evidenceLink, reviewerId).events.map((event) => event.type),
    ).toContain('EvidenceLinked');

    const otherTenantEvidence = EvidenceLink.create({
      ...evidenceLinkProperties(),
      organisationId: otherOrganisationId,
    });
    expect(() => document.linkEvidence(otherTenantEvidence, reviewerId)).toThrow(
      DocumentInvariantViolationError,
    );
  });
});

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
    id: RevisionId.from('aaaaaaaa-1111-4111-8111-111111111111'),
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

function controlledInformationId(): ControlledInformationId {
  return ControlledInformationId.from('99999999-9999-4999-8999-999999999999');
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

function relationshipProperties() {
  return {
    id: RelationshipId.from('77777777-7777-4777-8777-777777777777'),
    organisationId,
    sourceId: controlledInformationId(),
    targetId: 'ISO 9001:2015:7.5',
    type: 'CLAUSE_SUPPORTS_DOCUMENT' as const,
    rationale: 'Maps document control requirements.',
  };
}

function evidenceLinkProperties() {
  return {
    id: EvidenceLinkId.from('88888888-8888-4888-8888-888888888888'),
    organisationId,
    controlledInformationId: controlledInformationId(),
    evidenceReference: EvidenceReference.from('EV-2026-0001'),
    relationshipType: 'SUPPORTS' as const,
    verified: false,
  };
}
