import {
  type ControlledInformationRepository,
} from './repositories.js';
import {
  commitAndPublish,
  createControlledInformation,
  ensureOrganisation,
  rebuildControlledInformation,
  requireFound,
  type ControlledInformationDraft,
} from './service-helpers.js';
import { DocumentOwnershipMismatchError, DuplicateDocumentNumberError } from './service-errors.js';
import {
  type ApplicationActor,
  type ApplicationTransactionManager,
  type DocumentApplicationLogger,
  type DocumentDomainEventPublisher,
} from './ports.js';
import type { ControlledInformation } from '../domain/entities.js';
import type {
  ControlledInformationId,
  DocumentNumber,
  Metadata,
  UserId,
} from '../domain/value-objects.js';

export interface RegisterControlledInformationCommand extends ControlledInformationDraft {
  readonly actor: ApplicationActor;
}

export interface RetrieveControlledInformationCommand {
  readonly id: ControlledInformationId;
  readonly actor: ApplicationActor;
}

export interface UpdateControlledInformationMetadataCommand {
  readonly id: ControlledInformationId;
  readonly metadata: Metadata;
  readonly actor: ApplicationActor;
}

export interface ArchiveControlledInformationCommand {
  readonly id: ControlledInformationId;
  readonly reason: string;
  readonly actor: ApplicationActor;
}

export interface RestoreControlledInformationCommand {
  readonly id: ControlledInformationId;
  readonly actor: ApplicationActor;
}

export interface ValidateControlledInformationOwnershipCommand {
  readonly id: ControlledInformationId;
  readonly ownerId: UserId;
  readonly actor: ApplicationActor;
}

export class ControlledInformationService {
  constructor(
    private readonly controlledInformationRepository: ControlledInformationRepository,
    private readonly transactionManager: ApplicationTransactionManager,
    private readonly eventPublisher: DocumentDomainEventPublisher,
    private readonly logger: DocumentApplicationLogger,
  ) {}

  async register(command: RegisterControlledInformationCommand): Promise<ControlledInformation> {
    await this.ensureDocumentNumberAvailable(command.documentNumber);
    const controlledInformation = createControlledInformation({
      ...command,
      organisationId: command.actor.organisationId,
      createdBy: command.actor.userId,
      updatedBy: command.actor.userId,
    });

    return commitAndPublish(
      this.transactionManager,
      this.eventPublisher,
      this.logger,
      context('controlled_information.register', command.actor, controlledInformation.id.value),
      async () => {
        await this.controlledInformationRepository.save(controlledInformation);
        return { result: controlledInformation, events: [] };
      },
    );
  }

  async retrieve(command: RetrieveControlledInformationCommand): Promise<ControlledInformation> {
    const controlledInformation = requireFound(
      await this.controlledInformationRepository.findById(command.id),
      'Controlled information',
    );
    ensureOrganisation(controlledInformation.organisationId, command.actor);
    return controlledInformation;
  }

  async updateMetadata(
    command: UpdateControlledInformationMetadataCommand,
  ): Promise<ControlledInformation> {
    const current = await this.retrieve({ id: command.id, actor: command.actor });
    const updated = rebuildControlledInformation(current, {
      metadata: command.metadata,
      updatedBy: command.actor.userId,
      updatedAt: new Date(),
    });

    return commitAndPublish(
      this.transactionManager,
      this.eventPublisher,
      this.logger,
      context('controlled_information.update_metadata', command.actor, command.id.value),
      async () => {
        await this.controlledInformationRepository.save(updated);
        return { result: updated, events: [] };
      },
    );
  }

  async archive(command: ArchiveControlledInformationCommand): Promise<ControlledInformation> {
    const current = await this.retrieve({ id: command.id, actor: command.actor });
    const archived = current.archive(command.actor.userId, command.reason);

    return commitAndPublish(
      this.transactionManager,
      this.eventPublisher,
      this.logger,
      context('controlled_information.archive', command.actor, command.id.value),
      async () => {
        await this.controlledInformationRepository.save(archived.entity);
        return { result: archived.entity, events: [archived.event] };
      },
    );
  }

  async restore(command: RestoreControlledInformationCommand): Promise<ControlledInformation> {
    const current = await this.retrieve({ id: command.id, actor: command.actor });
    const restored = current.transitionTo('DRAFT', command.actor.userId);

    return commitAndPublish(
      this.transactionManager,
      this.eventPublisher,
      this.logger,
      context('controlled_information.restore', command.actor, command.id.value),
      async () => {
        await this.controlledInformationRepository.save(restored.entity);
        return { result: restored.entity, events: [restored.event] };
      },
    );
  }

  async validateOwnership(command: ValidateControlledInformationOwnershipCommand): Promise<void> {
    const controlledInformation = await this.retrieve({ id: command.id, actor: command.actor });
    if (!controlledInformation.owner.userId.equals(command.ownerId)) {
      throw new DocumentOwnershipMismatchError();
    }
  }

  async validateTenantIsolation(command: RetrieveControlledInformationCommand): Promise<void> {
    await this.retrieve(command);
  }

  private async ensureDocumentNumberAvailable(documentNumber: DocumentNumber): Promise<void> {
    if (await this.controlledInformationRepository.existsByDocumentNumber(documentNumber)) {
      throw new DuplicateDocumentNumberError();
    }
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
