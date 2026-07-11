import { type DocumentRepository } from './repositories.js';
import {
  commitAndPublish,
  ensureOrganisation,
  rebuildDocumentWithControlledInformation,
  requireFound,
} from './service-helpers.js';
import {
  type ApplicationActor,
  type ApplicationTransactionManager,
  type DocumentApplicationLogger,
  type DocumentDistributionPort,
  type DocumentDomainEventPublisher,
} from './ports.js';
import type { Document } from '../domain/entities.js';
import type { DocumentId, RevisionId, UserId } from '../domain/value-objects.js';

export interface PublishDocumentCommand {
  readonly documentId: DocumentId;
  readonly revisionId: RevisionId;
  readonly actor: ApplicationActor;
}

export interface WithdrawDocumentCommand {
  readonly documentId: DocumentId;
  readonly actor: ApplicationActor;
}

export interface DistributeDocumentCommand {
  readonly documentId: DocumentId;
  readonly revisionId: RevisionId;
  readonly recipientUserIds: readonly UserId[];
  readonly actor: ApplicationActor;
}

export class PublicationService {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly distributionPort: DocumentDistributionPort,
    private readonly transactionManager: ApplicationTransactionManager,
    private readonly eventPublisher: DocumentDomainEventPublisher,
    private readonly logger: DocumentApplicationLogger,
  ) {}

  async publish(command: PublishDocumentCommand): Promise<Document> {
    const document = await this.loadDocument(command.documentId, command.actor);
    const published = document.publish(command.revisionId, command.actor.userId);
    return this.saveDocument('publication.publish', published, command.actor);
  }

  async withdraw(command: WithdrawDocumentCommand): Promise<Document> {
    const document = await this.loadDocument(command.documentId, command.actor);
    const transition = document.controlledInformation.transitionTo('WITHDRAWN', command.actor.userId);
    const withdrawn = rebuildDocumentWithControlledInformation(document, transition.entity);
    return commitAndPublish(
      this.transactionManager,
      this.eventPublisher,
      this.logger,
      context('publication.withdraw', command.actor, command.documentId.value),
      async () => {
        await this.documentRepository.save(withdrawn);
        return { result: withdrawn, events: [transition.event] };
      },
    );
  }

  async distribute(command: DistributeDocumentCommand): Promise<void> {
    const document = await this.loadDocument(command.documentId, command.actor);
    const isPublished = await this.verifyPublicationState(command);
    if (!isPublished) {
      document.publish(command.revisionId, command.actor.userId);
    }
    await this.transactionManager.execute(async () => {
      await this.distributionPort.distribute({
        organisationId: command.actor.organisationId,
        documentId: command.documentId,
        revisionId: command.revisionId,
        actorId: command.actor.userId,
        recipientUserIds: command.recipientUserIds,
      });
    });
    this.logger.info('documents.application_service.completed', context('publication.distribute', command.actor, command.documentId.value));
  }

  async verifyPublicationState(command: PublishDocumentCommand): Promise<boolean> {
    const document = await this.loadDocument(command.documentId, command.actor);
    return (
      document.lifecycle === 'PUBLISHED' &&
      document.revisions.some(
        (revision) => revision.id.equals(command.revisionId) && revision.lifecycle === 'PUBLISHED',
      )
    );
  }

  private async loadDocument(documentId: DocumentId, actor: ApplicationActor): Promise<Document> {
    const document = requireFound(await this.documentRepository.findById(documentId), 'Document');
    ensureOrganisation(document.organisationId, actor);
    return document;
  }

  private saveDocument(operation: string, document: Document, actor: ApplicationActor): Promise<Document> {
    return commitAndPublish(
      this.transactionManager,
      this.eventPublisher,
      this.logger,
      context(operation, actor, document.id.value),
      async () => {
        await this.documentRepository.save(document);
        return { result: document, events: document.events };
      },
    );
  }
}

function context(
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
