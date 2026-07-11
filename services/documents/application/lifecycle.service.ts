import {
  type ControlledInformationRepository,
} from './repositories.js';
import { commitAndPublish, ensureOrganisation, requireFound } from './service-helpers.js';
import {
  type ApplicationActor,
  type ApplicationTransactionManager,
  type DocumentApplicationLogger,
  type DocumentDomainEventPublisher,
} from './ports.js';
import type { ControlledInformation } from '../domain/entities.js';
import type { ControlledInformationId, LifecycleState } from '../domain/value-objects.js';

export interface TransitionLifecycleCommand {
  readonly controlledInformationId: ControlledInformationId;
  readonly targetState: LifecycleState;
  readonly actor: ApplicationActor;
}

export class LifecycleService {
  constructor(
    private readonly controlledInformationRepository: ControlledInformationRepository,
    private readonly transactionManager: ApplicationTransactionManager,
    private readonly eventPublisher: DocumentDomainEventPublisher,
    private readonly logger: DocumentApplicationLogger,
  ) {}

  async transition(command: TransitionLifecycleCommand): Promise<ControlledInformation> {
    const controlledInformation = requireFound(
      await this.controlledInformationRepository.findById(command.controlledInformationId),
      'Controlled information',
    );
    ensureOrganisation(controlledInformation.organisationId, command.actor);
    const transition = controlledInformation.transitionTo(command.targetState, command.actor.userId);

    return commitAndPublish(
      this.transactionManager,
      this.eventPublisher,
      this.logger,
      {
        operation: 'controlled_information.lifecycle_transition',
        organisationId: command.actor.organisationId.value,
        actorId: command.actor.userId.value,
        resourceId: command.controlledInformationId.value,
      },
      async () => {
        await this.controlledInformationRepository.save(transition.entity);
        return { result: transition.entity, events: [transition.event] };
      },
    );
  }
}
