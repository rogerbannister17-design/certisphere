import {
  type ApprovalRepository,
  type DocumentRepository,
} from './repositories.js';
import { commitAndPublish, ensureOrganisation, requireFound } from './service-helpers.js';
import {
  type ApplicationActor,
  type ApplicationTransactionManager,
  type DocumentApplicationLogger,
  type DocumentDomainEventPublisher,
} from './ports.js';
import { Approval } from '../domain/entities.js';
import type { Document, ElectronicSignature } from '../domain/entities.js';
import type {
  ApprovalDecision,
  ApprovalId,
  DocumentId,
  ElectronicSignatureId,
  RevisionId,
  UserId,
} from '../domain/value-objects.js';

export interface SubmitForApprovalCommand {
  readonly documentId: DocumentId;
  readonly revisionId: RevisionId;
  readonly approvalId: ApprovalId;
  readonly approverId: UserId;
  readonly actor: ApplicationActor;
}

export interface AssignApproverCommand {
  readonly documentId: DocumentId;
  readonly revisionId: RevisionId;
  readonly approvalId: ApprovalId;
  readonly approverId: UserId;
  readonly actor: ApplicationActor;
}

export interface RecordApprovalDecisionCommand {
  readonly documentId: DocumentId;
  readonly approvalId: ApprovalId;
  readonly decision: ApprovalDecision;
  readonly signatureId: ElectronicSignatureId;
  readonly signatureMeaning: string;
  readonly revisionContentHash: string;
  readonly actor: ApplicationActor;
}

export class ApprovalService {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly approvalRepository: ApprovalRepository,
    private readonly transactionManager: ApplicationTransactionManager,
    private readonly eventPublisher: DocumentDomainEventPublisher,
    private readonly logger: DocumentApplicationLogger,
  ) {}

  async submitForApproval(command: SubmitForApprovalCommand): Promise<Document> {
    const document = await this.loadDocument(command.documentId, command.actor);
    const inReview =
      document.lifecycle === 'DRAFT'
        ? document.submitForReview(command.revisionId, command.actor.userId)
        : document;
    const approval = this.createApproval(command);
    const updated = inReview.requestApproval(approval);
    return this.saveDocumentWithApproval('approval.submit', updated, approval, command.actor);
  }

  async assignApprover(command: AssignApproverCommand): Promise<Document> {
    const document = await this.loadDocument(command.documentId, command.actor);
    const approval = this.createApproval(command);
    const updated = document.requestApproval(approval);
    return this.saveDocumentWithApproval('approval.assign_approver', updated, approval, command.actor);
  }

  async recordApproval(command: Omit<RecordApprovalDecisionCommand, 'decision'>): Promise<Document> {
    return this.recordDecision({ ...command, decision: 'APPROVED' });
  }

  async recordRejection(command: Omit<RecordApprovalDecisionCommand, 'decision'>): Promise<Document> {
    return this.recordDecision({ ...command, decision: 'REJECTED' });
  }

  async applyElectronicApproval(command: RecordApprovalDecisionCommand): Promise<Document> {
    return this.recordDecision(command);
  }

  validateApprovalIndependence(command: AssignApproverCommand): void {
    this.createApproval(command);
  }

  private async recordDecision(command: RecordApprovalDecisionCommand): Promise<Document> {
    const document = await this.loadDocument(command.documentId, command.actor);
    const signature: ElectronicSignature = {
      id: command.signatureId,
      signerId: command.actor.userId,
      meaning: command.signatureMeaning,
      signedAt: new Date(),
      revisionContentHash: command.revisionContentHash,
    };
    const updated = document.completeApproval(
      command.approvalId,
      command.decision,
      signature,
      command.actor.userId,
    );
    return this.saveDocument('approval.record_decision', updated, command.actor);
  }

  private createApproval(command: AssignApproverCommand): Approval {
    return Approval.request({
      id: command.approvalId,
      organisationId: command.actor.organisationId,
      revisionId: command.revisionId,
      requestedBy: command.actor.userId,
      approverId: command.approverId,
    });
  }

  private async loadDocument(documentId: DocumentId, actor: ApplicationActor): Promise<Document> {
    const document = requireFound(await this.documentRepository.findById(documentId), 'Document');
    ensureOrganisation(document.organisationId, actor);
    return document;
  }

  private saveDocumentWithApproval(
    operation: string,
    document: Document,
    approval: Approval,
    actor: ApplicationActor,
  ): Promise<Document> {
    return commitAndPublish(
      this.transactionManager,
      this.eventPublisher,
      this.logger,
      context(operation, actor, document.id.value),
      async () => {
        await this.documentRepository.save(document);
        await this.approvalRepository.save(approval);
        return { result: document, events: document.events };
      },
    );
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
