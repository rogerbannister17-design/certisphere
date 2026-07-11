import {
  type DocumentRepository,
  type RevisionRepository,
} from './repositories.js';
import { commitAndPublish, ensureOrganisation, requireFound } from './service-helpers.js';
import {
  type ApplicationActor,
  type ApplicationTransactionManager,
  type DocumentApplicationLogger,
  type DocumentDomainEventPublisher,
} from './ports.js';
import { Revision } from '../domain/entities.js';
import type { Document, Revision as RevisionEntity } from '../domain/entities.js';
import type { DocumentId, RevisionId, RevisionNumber } from '../domain/value-objects.js';

export interface CreateRevisionCommand {
  readonly documentId: DocumentId;
  readonly revisionId: RevisionId;
  readonly number: RevisionNumber;
  readonly contentHash: string;
  readonly changeSummary: string;
  readonly actor: ApplicationActor;
}

export interface RevisionCommand {
  readonly revisionId: RevisionId;
  readonly actor: ApplicationActor;
}

export interface RestoreRevisionCommand {
  readonly documentId: DocumentId;
  readonly sourceRevisionId: RevisionId;
  readonly newRevisionId: RevisionId;
  readonly newRevisionNumber: RevisionNumber;
  readonly changeSummary: string;
  readonly actor: ApplicationActor;
}

export interface CompareRevisionsCommand {
  readonly firstRevisionId: RevisionId;
  readonly secondRevisionId: RevisionId;
  readonly actor: ApplicationActor;
}

export interface RevisionComparison {
  readonly firstRevisionId: RevisionId;
  readonly secondRevisionId: RevisionId;
  readonly contentHashMatches: boolean;
  readonly firstChangeSummary: string;
  readonly secondChangeSummary: string;
}

export class RevisionService {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly revisionRepository: RevisionRepository,
    private readonly transactionManager: ApplicationTransactionManager,
    private readonly eventPublisher: DocumentDomainEventPublisher,
    private readonly logger: DocumentApplicationLogger,
  ) {}

  async createRevision(command: CreateRevisionCommand): Promise<Document> {
    const document = await this.loadDocument(command.documentId, command.actor);
    const revision = Revision.draft({
      id: command.revisionId,
      organisationId: command.actor.organisationId,
      number: command.number,
      authorId: command.actor.userId,
      contentHash: command.contentHash,
      changeSummary: command.changeSummary,
    });
    const updated = document.createRevision(revision, command.actor.userId);

    return this.saveDocument('revision.create', updated, command.actor);
  }

  async supersedeRevision(command: RevisionCommand): Promise<RevisionEntity> {
    const revision = await this.loadRevision(command.revisionId, command.actor);
    const superseded = revision.supersede();

    return commitAndPublish(
      this.transactionManager,
      this.eventPublisher,
      this.logger,
      operationContext('revision.supersede', command.actor, command.revisionId.value),
      async () => {
        await this.revisionRepository.save(superseded);
        return { result: superseded, events: [] };
      },
    );
  }

  async restoreRevision(command: RestoreRevisionCommand): Promise<Document> {
    const document = await this.loadDocument(command.documentId, command.actor);
    const source = document.revisions.find((revision) => revision.id.equals(command.sourceRevisionId));
    const sourceRevision = requireFound(source ?? null, 'Revision');
    const restoredDraft = Revision.draft({
      id: command.newRevisionId,
      organisationId: command.actor.organisationId,
      number: command.newRevisionNumber,
      authorId: command.actor.userId,
      contentHash: sourceRevision.contentHash,
      changeSummary: command.changeSummary,
    });
    const updated = document.createRevision(restoredDraft, command.actor.userId);
    return this.saveDocument('revision.restore_as_draft', updated, command.actor);
  }

  async compareRevisions(command: CompareRevisionsCommand): Promise<RevisionComparison> {
    const first = await this.loadRevision(command.firstRevisionId, command.actor);
    const second = await this.loadRevision(command.secondRevisionId, command.actor);
    return {
      firstRevisionId: first.id,
      secondRevisionId: second.id,
      contentHashMatches: first.contentHash === second.contentHash,
      firstChangeSummary: first.changeSummary,
      secondChangeSummary: second.changeSummary,
    };
  }

  async retrieveRevisionHistory(command: {
    readonly documentId: DocumentId;
    readonly actor: ApplicationActor;
  }): Promise<readonly RevisionEntity[]> {
    const document = await this.loadDocument(command.documentId, command.actor);
    return [...document.revisions].sort((first, second) =>
      first.number.value.localeCompare(second.number.value),
    );
  }

  private async loadDocument(documentId: DocumentId, actor: ApplicationActor): Promise<Document> {
    const document = requireFound(await this.documentRepository.findById(documentId), 'Document');
    ensureOrganisation(document.organisationId, actor);
    return document;
  }

  private async loadRevision(revisionId: RevisionId, actor: ApplicationActor): Promise<RevisionEntity> {
    const revision = requireFound(await this.revisionRepository.findById(revisionId), 'Revision');
    ensureOrganisation(revision.organisationId, actor);
    return revision;
  }

  private saveDocument(operation: string, document: Document, actor: ApplicationActor): Promise<Document> {
    return commitAndPublish(
      this.transactionManager,
      this.eventPublisher,
      this.logger,
      operationContext(operation, actor, document.id.value),
      async () => {
        await this.documentRepository.save(document);
        return { result: document, events: document.events };
      },
    );
  }
}

function operationContext(
  operation: string,
  actor: ApplicationActor,
  resourceId: string,
): Readonly<Record<string, string>> {
  return {
    operation,
    organisationId: actor.organisationId.value,
    actorId: actor.userId.value,
    resourceId,
  };
}
