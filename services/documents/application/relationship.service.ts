import {
  type DocumentRepository,
  type RelationshipRepository,
} from './repositories.js';
import { commitAndPublish, ensureOrganisation, requireFound } from './service-helpers.js';
import {
  type ApplicationActor,
  type ApplicationTransactionManager,
  type DocumentApplicationLogger,
  type DocumentDomainEventPublisher,
} from './ports.js';
import { Relationship } from '../domain/entities.js';
import type { Document } from '../domain/entities.js';
import type {
  ControlledInformationId,
  DocumentId,
  RelationshipId,
  RelationshipType,
} from '../domain/value-objects.js';

export interface CreateRelationshipCommand {
  readonly documentId: DocumentId;
  readonly relationshipId: RelationshipId;
  readonly sourceId: ControlledInformationId;
  readonly targetId: string;
  readonly type: RelationshipType;
  readonly rationale: string;
  readonly actor: ApplicationActor;
}

export interface RetrieveRelationshipCommand {
  readonly relationshipId: RelationshipId;
  readonly actor: ApplicationActor;
}

export class RelationshipService {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly relationshipRepository: RelationshipRepository,
    private readonly transactionManager: ApplicationTransactionManager,
    private readonly eventPublisher: DocumentDomainEventPublisher,
    private readonly logger: DocumentApplicationLogger,
  ) {}

  async createRelationship(command: CreateRelationshipCommand): Promise<Document> {
    const document = requireFound(
      await this.documentRepository.findById(command.documentId),
      'Document',
    );
    ensureOrganisation(document.organisationId, command.actor);
    const relationship = Relationship.create({
      id: command.relationshipId,
      organisationId: command.actor.organisationId,
      sourceId: command.sourceId,
      targetId: command.targetId,
      type: command.type,
      rationale: command.rationale,
    });
    const updated = document.addRelationship(relationship, command.actor.userId);

    return commitAndPublish(
      this.transactionManager,
      this.eventPublisher,
      this.logger,
      context('relationship.create', command.actor, command.relationshipId.value),
      async () => {
        await this.documentRepository.save(updated);
        await this.relationshipRepository.save(relationship);
        return { result: updated, events: updated.events };
      },
    );
  }

  async retrieve(command: RetrieveRelationshipCommand): Promise<Relationship> {
    const relationship = requireFound(
      await this.relationshipRepository.findById(command.relationshipId),
      'Relationship',
    );
    ensureOrganisation(relationship.organisationId, command.actor);
    return relationship;
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
