import {
  type DocumentRepository,
  type EvidenceRepository,
} from './repositories.js';
import { commitAndPublish, ensureOrganisation, requireFound } from './service-helpers.js';
import {
  type ApplicationActor,
  type ApplicationTransactionManager,
  type DocumentApplicationLogger,
  type DocumentDomainEventPublisher,
  type EvidenceLinkRemovalPort,
} from './ports.js';
import { EvidenceLink } from '../domain/entities.js';
import type { Document } from '../domain/entities.js';
import type {
  ControlledInformationId,
  DocumentId,
  EvidenceLinkId,
  EvidenceReference,
} from '../domain/value-objects.js';

export interface AttachEvidenceCommand {
  readonly documentId: DocumentId;
  readonly evidenceLinkId: EvidenceLinkId;
  readonly controlledInformationId: ControlledInformationId;
  readonly evidenceReference: EvidenceReference;
  readonly relationshipType: 'SUPPORTS' | 'GENERATED_BY' | 'VERIFIES' | 'SUPERSEDES';
  readonly verified: boolean;
  readonly actor: ApplicationActor;
}

export interface RemoveEvidenceCommand {
  readonly documentId: DocumentId;
  readonly evidenceLinkId: EvidenceLinkId;
  readonly actor: ApplicationActor;
}

export class EvidenceService {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly evidenceRepository: EvidenceRepository,
    private readonly evidenceLinkRemovalPort: EvidenceLinkRemovalPort,
    private readonly transactionManager: ApplicationTransactionManager,
    private readonly eventPublisher: DocumentDomainEventPublisher,
    private readonly logger: DocumentApplicationLogger,
  ) {}

  async attachEvidence(command: AttachEvidenceCommand): Promise<Document> {
    const document = await this.loadDocument(command.documentId, command.actor);
    const evidenceLink = EvidenceLink.create({
      id: command.evidenceLinkId,
      organisationId: command.actor.organisationId,
      controlledInformationId: command.controlledInformationId,
      evidenceReference: command.evidenceReference,
      relationshipType: command.relationshipType,
      verified: command.verified,
    });
    const updated = document.linkEvidence(evidenceLink, command.actor.userId);

    return commitAndPublish(
      this.transactionManager,
      this.eventPublisher,
      this.logger,
      context('evidence.attach', command.actor, command.evidenceLinkId.value),
      async () => {
        await this.documentRepository.save(updated);
        await this.evidenceRepository.saveLink(evidenceLink);
        return { result: updated, events: updated.events };
      },
    );
  }

  async removeEvidence(command: RemoveEvidenceCommand): Promise<void> {
    const document = await this.loadDocument(command.documentId, command.actor);
    const evidenceLink = requireFound(
      document.evidenceLinks.find((link) => link.id.equals(command.evidenceLinkId)) ?? null,
      'Evidence link',
    );

    await this.transactionManager.execute(async () => {
      await this.evidenceLinkRemovalPort.removeLink({
        organisationId: command.actor.organisationId,
        controlledInformationId: evidenceLink.controlledInformationId,
        evidenceLinkId: command.evidenceLinkId,
        actorId: command.actor.userId,
      });
    });
    this.logger.info('documents.application_service.completed', context('evidence.remove', command.actor, command.evidenceLinkId.value));
  }

  async validateTraceability(command: RemoveEvidenceCommand): Promise<boolean> {
    const document = await this.loadDocument(command.documentId, command.actor);
    return document.evidenceLinks.some((link) => link.id.equals(command.evidenceLinkId));
  }

  async retrieveLinkedEvidence(command: {
    readonly documentId: DocumentId;
    readonly actor: ApplicationActor;
  }): Promise<readonly EvidenceLink[]> {
    const document = await this.loadDocument(command.documentId, command.actor);
    return document.evidenceLinks;
  }

  private async loadDocument(documentId: DocumentId, actor: ApplicationActor): Promise<Document> {
    const document = requireFound(await this.documentRepository.findById(documentId), 'Document');
    ensureOrganisation(document.organisationId, actor);
    return document;
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
