import { describe, expect, it } from 'vitest';

import {
  ApprovalId,
  Approval as ApprovalEntity,
  ApprovalService,
  Classification,
  ControlledInformation,
  ControlledInformationId,
  ControlledInformationService,
  DOCUMENT_APPLICATION_SERVICE_PROVIDERS,
  Document,
  DocumentId,
  DocumentInvariantViolationError,
  DocumentNumber,
  DocumentOwnershipMismatchError,
  DocumentSearchLimitError,
  DuplicateDocumentNumberError,
  ElectronicSignatureId,
  EvidenceLinkId,
  EvidenceReference,
  EvidenceService,
  LifecycleService,
  Metadata,
  OrganisationId,
  PublicationService,
  RelationshipId,
  RelationshipService,
  RetentionPeriod,
  Revision,
  RevisionId,
  RevisionNumber,
  RevisionService,
  SearchService,
  UserId,
  type ApplicationActor,
  type ApplicationTransactionManager,
  type ApprovalRepository,
  type ControlledInformationRepository,
  type DocumentApplicationLogger,
  type DocumentDistributionPort,
  type DocumentDomainEvent,
  type DocumentDomainEventPublisher,
  type DocumentRepository,
  type DocumentSearchCriteria,
  type DocumentSearchPort,
  type DocumentSearchResult,
  type EvidenceLink,
  type EvidenceLinkRemovalPort,
  type EvidenceRepository,
  type Relationship,
  type RelationshipRepository,
  type Revision as RevisionEntity,
  type RevisionRepository,
} from '../index.js';

const organisationId = OrganisationId.from('11111111-1111-4111-8111-111111111111');
const otherOrganisationId = OrganisationId.from('22222222-2222-4222-8222-222222222222');
const authorId = UserId.from('33333333-3333-4333-8333-333333333333');
const approverId = UserId.from('44444444-4444-4444-8444-444444444444');
const otherUserId = UserId.from('55555555-5555-4555-8555-555555555555');
const now = new Date('2026-07-10T09:00:00.000Z');
const contentHash = '0123456789abcdef0123456789abcdef';
const actor: ApplicationActor = { organisationId, userId: authorId };
const approverActor: ApplicationActor = { organisationId, userId: approverId };

describe('KCIP application services', () => {
  it('registers, retrieves, updates, archives, restores, and validates controlled information', async () => {
    const harness = createHarness();
    const service = harness.controlledInformationService;

    const registered = await service.register({
      ...controlledInformationDraft(),
      actor,
    });
    expect(registered.lifecycle).toBe('DRAFT');
    expect(harness.controlledInformation.saved).toHaveLength(1);

    await expect(service.register({ ...controlledInformationDraft(), actor })).rejects.toThrow(
      DuplicateDocumentNumberError,
    );

    const updated = await service.updateMetadata({
      id: registered.id,
      metadata: Metadata.from(new Map([['process_owner', 'Operations Manager']])),
      actor,
    });
    expect(updated.metadata.get('process_owner')).toBe('Operations Manager');

    await expect(
      service.validateOwnership({ id: registered.id, ownerId: otherUserId, actor }),
    ).rejects.toThrow(DocumentOwnershipMismatchError);

    const archived = await service.archive({
      id: registered.id,
      reason: 'Retained for controlled archive.',
      actor,
    });
    expect(archived.lifecycle).toBe('ARCHIVED');
    expect(harness.events.types()).toContain('DocumentArchived');

    const restored = await service.restore({ id: registered.id, actor });
    expect(restored.lifecycle).toBe('DRAFT');
    expect(harness.events.types()).toContain('LifecycleChanged');
  });

  it('rejects tenant mismatches before persistence writes', async () => {
    const harness = createHarness();
    const document = createDocument();
    harness.documents.store(document);

    await expect(
      harness.revisionService.createRevision({
        documentId: document.id,
        revisionId: revisionId('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
        number: RevisionNumber.from('1.0'),
        contentHash,
        changeSummary: 'Initial controlled draft.',
        actor: { organisationId: otherOrganisationId, userId: authorId },
      }),
    ).rejects.toThrow();
    expect(harness.documents.saved).toHaveLength(0);
  });

  it('creates, restores, supersedes, compares, and lists revisions through repositories', async () => {
    const harness = createHarness();
    const document = createDocument();
    harness.documents.store(document);

    const withRevision = await harness.revisionService.createRevision({
      documentId: document.id,
      revisionId: revisionId('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
      number: RevisionNumber.from('1.0'),
      contentHash,
      changeSummary: 'Initial controlled draft.',
      actor,
    });
    expect(withRevision.revisions).toHaveLength(1);
    expect(harness.events.types()).toContain('RevisionCreated');

    const restored = await harness.revisionService.restoreRevision({
      documentId: document.id,
      sourceRevisionId: revisionId('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
      newRevisionId: revisionId('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
      newRevisionNumber: RevisionNumber.from('2.0'),
      changeSummary: 'Restore previous version as controlled draft.',
      actor,
    });
    expect(restored.revisions).toHaveLength(2);
    for (const revision of restored.revisions) {
      harness.revisions.store(revision);
    }

    const comparison = await harness.revisionService.compareRevisions({
      firstRevisionId: revisionId('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
      secondRevisionId: revisionId('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
      actor,
    });
    expect(comparison.contentHashMatches).toBe(true);

    const history = await harness.revisionService.retrieveRevisionHistory({
      documentId: document.id,
      actor,
    });
    expect(history.map((revision: RevisionEntity) => revision.number.value)).toEqual(['1.0', '2.0']);

    const publishedRevision = Revision.rehydrate({
      id: revisionId('cccccccc-cccc-4ccc-8ccc-cccccccccccc'),
      organisationId,
      number: RevisionNumber.from('3.0'),
      authorId,
      contentHash,
      changeSummary: 'Published revision.',
      lifecycle: 'PUBLISHED',
      approvedAt: now,
      publishedAt: now,
    });
    harness.revisions.store(publishedRevision);
    const superseded = await harness.revisionService.supersedeRevision({
      revisionId: publishedRevision.id,
      actor,
    });
    expect(superseded.lifecycle).toBe('SUPERSEDED');
  });

  it('submits approvals, validates independence, records approval, and publishes', async () => {
    const harness = createHarness();
    const revision = createRevision('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '1.0');
    const document = createDocument().createRevision(revision, authorId);
    harness.documents.store(document);

    expect(() => {
      harness.approvalService.validateApprovalIndependence({
        documentId: document.id,
        revisionId: revision.id,
        approvalId: approvalId(),
        approverId: authorId,
        actor,
      });
    }).toThrow(DocumentInvariantViolationError);

    const awaitingApproval = await harness.approvalService.submitForApproval({
      documentId: document.id,
      revisionId: revision.id,
      approvalId: approvalId(),
      approverId,
      actor,
    });
    expect(awaitingApproval.lifecycle).toBe('IN_REVIEW');
    expect(harness.events.types()).toContain('DocumentSubmittedForReview');

    const approved = await harness.approvalService.recordApproval({
      documentId: document.id,
      approvalId: approvalId(),
      signatureId: ElectronicSignatureId.from('dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
      signatureMeaning: 'Approved for publication.',
      revisionContentHash: contentHash,
      actor: approverActor,
    });
    expect(approved.lifecycle).toBe('APPROVED');
    expect(harness.events.types()).toContain('ApprovalCompleted');

    const published = await harness.publicationService.publish({
      documentId: document.id,
      revisionId: revision.id,
      actor: approverActor,
    });
    expect(published.lifecycle).toBe('PUBLISHED');
    expect(await harness.publicationService.verifyPublicationState({
      documentId: document.id,
      revisionId: revision.id,
      actor: approverActor,
    })).toBe(true);
  });

  it('records rejection and supports lifecycle withdrawal and archive transitions', async () => {
    const harness = createHarness();
    const revision = createRevision('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '1.0');
    const document = createDocument().createRevision(revision, authorId);
    harness.documents.store(document);
    await harness.approvalService.submitForApproval({
      documentId: document.id,
      revisionId: revision.id,
      approvalId: approvalId(),
      approverId,
      actor,
    });

    const rejected = await harness.approvalService.recordRejection({
      documentId: document.id,
      approvalId: approvalId(),
      signatureId: ElectronicSignatureId.from('dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
      signatureMeaning: 'Rejected with changes required.',
      revisionContentHash: contentHash,
      actor: approverActor,
    });
    expect(rejected.lifecycle).toBe('DRAFT');
    expect(harness.events.types()).toContain('DocumentRejected');

    const published = createPublishedDocument();
    harness.documents.store(published);
    const withdrawn = await harness.publicationService.withdraw({
      documentId: published.id,
      actor: approverActor,
    });
    expect(withdrawn.lifecycle).toBe('WITHDRAWN');

    harness.controlledInformation.store(withdrawn.controlledInformation);
    const archived = await harness.lifecycleService.transition({
      controlledInformationId: withdrawn.controlledInformation.id,
      targetState: 'ARCHIVED',
      actor: approverActor,
    });
    expect(archived.lifecycle).toBe('ARCHIVED');
  });

  it('distributes only through the distribution port after publication state verification', async () => {
    const harness = createHarness();
    const document = createPublishedDocument();
    const revision = document.revisions[0];
    if (revision === undefined) {
      throw new Error('Expected published revision fixture.');
    }
    harness.documents.store(document);

    await harness.publicationService.distribute({
      documentId: document.id,
      revisionId: revision.id,
      recipientUserIds: [otherUserId],
      actor: approverActor,
    });

    expect(harness.distribution.requests).toHaveLength(1);
    expect(harness.distribution.requests[0]?.recipientUserIds[0]?.value).toBe(otherUserId.value);
  });

  it('creates relationships and evidence links through aggregate validation', async () => {
    const harness = createHarness();
    const document = createDocument();
    harness.documents.store(document);

    const related = await harness.relationshipService.createRelationship({
      documentId: document.id,
      relationshipId: RelationshipId.from('77777777-7777-4777-8777-777777777777'),
      sourceId: controlledInformationId(),
      targetId: 'ISO 9001:2015:7.5',
      type: 'CLAUSE_SUPPORTS_DOCUMENT',
      rationale: 'Maps document control requirements.',
      actor,
    });
    expect(related.relationships).toHaveLength(1);
    expect(harness.events.types()).toContain('RelationshipCreated');

    const linked = await harness.evidenceService.attachEvidence({
      documentId: document.id,
      evidenceLinkId: EvidenceLinkId.from('88888888-8888-4888-8888-888888888888'),
      controlledInformationId: controlledInformationId(),
      evidenceReference: EvidenceReference.from('EV-2026-0001'),
      relationshipType: 'SUPPORTS',
      verified: false,
      actor,
    });
    expect(linked.evidenceLinks).toHaveLength(1);
    expect(await harness.evidenceService.validateTraceability({
      documentId: document.id,
      evidenceLinkId: EvidenceLinkId.from('88888888-8888-4888-8888-888888888888'),
      actor,
    })).toBe(true);

    await harness.evidenceService.removeEvidence({
      documentId: document.id,
      evidenceLinkId: EvidenceLinkId.from('88888888-8888-4888-8888-888888888888'),
      actor,
    });
    expect(harness.evidenceRemoval.removed).toHaveLength(1);
  });

  it('rolls back event publication when repository persistence fails', async () => {
    const harness = createHarness();
    harness.documents.failSave = true;
    const document = createDocument();
    harness.documents.store(document);

    await expect(
      harness.revisionService.createRevision({
        documentId: document.id,
        revisionId: revisionId('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
        number: RevisionNumber.from('1.0'),
        contentHash,
        changeSummary: 'Initial controlled draft.',
        actor,
      }),
    ).rejects.toThrow('Document repository save failed.');
    expect(harness.events.published).toHaveLength(0);
    expect(harness.transaction.rollbacks).toBe(1);
  });

  it('delegates search orchestration and validates search limits', async () => {
    const harness = createHarness();
    const result = await harness.searchService.search({
      organisationId,
      documentNumber: 'QMS-MAN-001',
      title: 'Quality',
      metadata: { process_owner: 'Quality Manager' },
      isoClause: 'ISO 9001:2015:7.5',
      process: 'PROC-QUALITY',
      category: 'Manual',
      status: 'DRAFT',
      ownerId: authorId,
      revision: '1.0',
      limit: 25,
    });

    expect(result).toHaveLength(1);
    expect(harness.search.criteria[0]?.documentNumber).toBe('QMS-MAN-001');

    await expect(
      harness.searchService.search({ organisationId, limit: 0 }),
    ).rejects.toThrow(DocumentSearchLimitError);
  });

  it('registers application service providers without changing repository interfaces', () => {
    expect(DOCUMENT_APPLICATION_SERVICE_PROVIDERS).toEqual(
      expect.arrayContaining([
        ControlledInformationService,
        RevisionService,
        ApprovalService,
        PublicationService,
        RelationshipService,
        EvidenceService,
        LifecycleService,
        SearchService,
      ]),
    );
  });
});

class RecordingTransactionManager implements ApplicationTransactionManager {
  commits = 0;
  rollbacks = 0;

  async execute<TResult>(operation: () => Promise<TResult>): Promise<TResult> {
    try {
      const result = await operation();
      this.commits += 1;
      return result;
    } catch (error) {
      this.rollbacks += 1;
      throw error;
    }
  }
}

class RecordingEventPublisher implements DocumentDomainEventPublisher {
  readonly published: DocumentDomainEvent[] = [];

  publishAll(events: readonly DocumentDomainEvent[]): Promise<void> {
    this.published.push(...events);
    return Promise.resolve();
  }

  types(): readonly string[] {
    return this.published.map((event) => event.type);
  }
}

class RecordingLogger implements DocumentApplicationLogger {
  readonly messages: string[] = [];

  info(message: string): void {
    this.messages.push(message);
  }

  warn(message: string): void {
    this.messages.push(message);
  }

  error(message: string): void {
    this.messages.push(message);
  }
}

class InMemoryControlledInformationRepository implements ControlledInformationRepository {
  readonly records = new Map<string, ControlledInformation>();
  readonly saved: ControlledInformation[] = [];

  findById(id: ControlledInformationId): Promise<ControlledInformation | null> {
    return Promise.resolve(this.records.get(id.value) ?? null);
  }

  existsByDocumentNumber(documentNumber: DocumentNumber): Promise<boolean> {
    return Promise.resolve(
      [...this.records.values()].some((record) =>
        record.documentNumber.equals(documentNumber),
      ),
    );
  }

  save(controlledInformation: ControlledInformation): Promise<void> {
    this.records.set(controlledInformation.id.value, controlledInformation);
    this.saved.push(controlledInformation);
    return Promise.resolve();
  }

  store(controlledInformation: ControlledInformation): void {
    this.records.set(controlledInformation.id.value, controlledInformation);
  }
}

class InMemoryDocumentRepository implements DocumentRepository {
  readonly records = new Map<string, Document>();
  readonly saved: Document[] = [];
  failSave = false;

  findById(id: DocumentId): Promise<Document | null> {
    return Promise.resolve(this.records.get(id.value) ?? null);
  }

  findByDocumentNumber(documentNumber: DocumentNumber): Promise<Document | null> {
    return Promise.resolve(
      [...this.records.values()].find((document) =>
        document.controlledInformation.documentNumber.equals(documentNumber),
      ) ?? null,
    );
  }

  save(document: Document): Promise<void> {
    if (this.failSave) {
      return Promise.reject(new Error('Document repository save failed.'));
    }

    this.records.set(document.id.value, document);
    this.saved.push(document);
    return Promise.resolve();
  }

  store(document: Document): void {
    this.records.set(document.id.value, document);
  }
}

class InMemoryRevisionRepository implements RevisionRepository {
  readonly records = new Map<string, Revision>();

  findById(id: RevisionId): Promise<Revision | null> {
    return Promise.resolve(this.records.get(id.value) ?? null);
  }

  save(revision: Revision): Promise<void> {
    this.records.set(revision.id.value, revision);
    return Promise.resolve();
  }

  store(revision: Revision): void {
    this.records.set(revision.id.value, revision);
  }
}

class InMemoryApprovalRepository implements ApprovalRepository {
  readonly records = new Map<string, ApprovalEntity>();

  findById(id: ApprovalId): Promise<ApprovalEntity | null> {
    return Promise.resolve(this.records.get(id.value) ?? null);
  }

  save(approval: ApprovalEntity): Promise<void> {
    this.records.set(approval.id.value, approval);
    return Promise.resolve();
  }
}

class InMemoryRelationshipRepository implements RelationshipRepository {
  readonly records = new Map<string, Relationship>();

  findById(id: RelationshipId): Promise<Relationship | null> {
    return Promise.resolve(this.records.get(id.value) ?? null);
  }

  save(relationship: Relationship): Promise<void> {
    this.records.set(relationship.id.value, relationship);
    return Promise.resolve();
  }
}

class InMemoryEvidenceRepository implements EvidenceRepository {
  readonly records = new Map<string, EvidenceLink>();

  findLinkById(id: EvidenceLinkId): Promise<EvidenceLink | null> {
    return Promise.resolve(this.records.get(id.value) ?? null);
  }

  saveLink(evidenceLink: EvidenceLink): Promise<void> {
    this.records.set(evidenceLink.id.value, evidenceLink);
    return Promise.resolve();
  }
}

class RecordingEvidenceRemovalPort implements EvidenceLinkRemovalPort {
  readonly removed: EvidenceLinkId[] = [];

  removeLink(request: {
    readonly evidenceLinkId: EvidenceLinkId;
  }): Promise<void> {
    this.removed.push(request.evidenceLinkId);
    return Promise.resolve();
  }
}

class RecordingDistributionPort implements DocumentDistributionPort {
  readonly requests: Parameters<DocumentDistributionPort['distribute']>[0][] = [];

  distribute(request: Parameters<DocumentDistributionPort['distribute']>[0]): Promise<void> {
    this.requests.push(request);
    return Promise.resolve();
  }
}

class RecordingSearchPort implements DocumentSearchPort {
  readonly criteria: DocumentSearchCriteria[] = [];

  search(criteria: DocumentSearchCriteria): Promise<readonly DocumentSearchResult[]> {
    this.criteria.push(criteria);
    return Promise.resolve([
      {
        controlledInformationId: controlledInformationId(),
        documentId: documentId(),
        title: 'Quality Manual',
        documentNumber: 'QMS-MAN-001',
        lifecycle: 'DRAFT',
        ownerId: authorId,
      },
    ]);
  }
}

function createHarness(): {
  readonly controlledInformation: InMemoryControlledInformationRepository;
  readonly documents: InMemoryDocumentRepository;
  readonly revisions: InMemoryRevisionRepository;
  readonly events: RecordingEventPublisher;
  readonly transaction: RecordingTransactionManager;
  readonly distribution: RecordingDistributionPort;
  readonly evidenceRemoval: RecordingEvidenceRemovalPort;
  readonly search: RecordingSearchPort;
  readonly controlledInformationService: ControlledInformationService;
  readonly revisionService: RevisionService;
  readonly approvalService: ApprovalService;
  readonly publicationService: PublicationService;
  readonly relationshipService: RelationshipService;
  readonly evidenceService: EvidenceService;
  readonly lifecycleService: LifecycleService;
  readonly searchService: SearchService;
} {
  const controlledInformation = new InMemoryControlledInformationRepository();
  const documents = new InMemoryDocumentRepository();
  const revisions = new InMemoryRevisionRepository();
  const approvals = new InMemoryApprovalRepository();
  const relationships = new InMemoryRelationshipRepository();
  const evidence = new InMemoryEvidenceRepository();
  const transaction = new RecordingTransactionManager();
  const events = new RecordingEventPublisher();
  const logger = new RecordingLogger();
  const distribution = new RecordingDistributionPort();
  const evidenceRemoval = new RecordingEvidenceRemovalPort();
  const search = new RecordingSearchPort();

  return {
    controlledInformation,
    documents,
    revisions,
    events,
    transaction,
    distribution,
    evidenceRemoval,
    search,
    controlledInformationService: new ControlledInformationService(
      controlledInformation,
      transaction,
      events,
      logger,
    ),
    revisionService: new RevisionService(documents, revisions, transaction, events, logger),
    approvalService: new ApprovalService(documents, approvals, transaction, events, logger),
    publicationService: new PublicationService(
      documents,
      distribution,
      transaction,
      events,
      logger,
    ),
    relationshipService: new RelationshipService(
      documents,
      relationships,
      transaction,
      events,
      logger,
    ),
    evidenceService: new EvidenceService(
      documents,
      evidence,
      evidenceRemoval,
      transaction,
      events,
      logger,
    ),
    lifecycleService: new LifecycleService(controlledInformation, transaction, events, logger),
    searchService: new SearchService(search),
  };
}

function controlledInformationDraft(): Parameters<ControlledInformationService['register']>[0] {
  return {
    id: controlledInformationId(),
    type: 'DOCUMENT',
    title: 'Quality Manual',
    documentNumber: DocumentNumber.from('QMS-MAN-001'),
    classification: Classification.from('INTERNAL'),
    category: { name: 'Manual', active: true },
    owner: { userId: authorId, role: 'Process Owner' },
    accessPolicy: {
      canViewDraftUserIds: [authorId],
      canApproveUserIds: [approverId],
      externalAccessAllowed: false,
    },
    retentionRule: { period: RetentionPeriod.days(365), legalHold: false },
    metadata: Metadata.from(new Map([['process_owner', 'Quality Manager']])),
    organisationId,
    createdBy: authorId,
    updatedBy: authorId,
    createdAt: now,
    updatedAt: now,
    actor,
  };
}

function createDocument(): Document {
  const controlledInformation = ControlledInformation.create({
    ...controlledInformationDraft(),
  });
  return Document.create(
    {
      controlledInformation,
      documentId: documentId(),
    },
    authorId,
  );
}

function createPublishedDocument(): Document {
  const revision = createRevision('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '1.0');
  const signature = {
    id: ElectronicSignatureId.from('dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
    signerId: approverId,
    meaning: 'Approved for publication.',
    signedAt: now,
    revisionContentHash: contentHash,
  };
  const approval = ApprovalEntity.request({
    id: approvalId(),
    organisationId,
    revisionId: revision.id,
    requestedBy: authorId,
    approverId,
  });
  return createDocument()
    .createRevision(revision, authorId)
    .submitForReview(revision.id, authorId)
    .requestApproval(approval)
    .completeApproval(approval.id, 'APPROVED', signature, approverId)
    .publish(revision.id, approverId);
}

function createRevision(id: string, number: string): Revision {
  return Revision.draft({
    id: revisionId(id),
    organisationId,
    number: RevisionNumber.from(number),
    authorId,
    contentHash,
    changeSummary: 'Initial controlled draft.',
  });
}

function documentId(): DocumentId {
  return DocumentId.from('99999999-9999-4999-8999-999999999999');
}

function controlledInformationId(): ControlledInformationId {
  return ControlledInformationId.from('99999999-9999-4999-8999-999999999999');
}

function revisionId(id: string): RevisionId {
  return RevisionId.from(id);
}

function approvalId(): ApprovalId {
  return ApprovalId.from('12345678-1234-4234-8234-123456789abc');
}
