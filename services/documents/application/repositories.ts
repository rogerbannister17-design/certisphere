import type {
  Approval,
  ControlledInformation,
  Document,
  EvidenceLink,
  Relationship,
  Revision,
} from '../domain/entities.js';
import type {
  ApprovalId,
  ControlledInformationId,
  DocumentId,
  DocumentNumber,
  EvidenceLinkId,
  RelationshipId,
  RevisionId,
} from '../domain/value-objects.js';

export const CONTROLLED_INFORMATION_REPOSITORY = Symbol('CONTROLLED_INFORMATION_REPOSITORY');
export const DOCUMENT_REPOSITORY = Symbol('DOCUMENT_REPOSITORY');
export const APPROVAL_REPOSITORY = Symbol('APPROVAL_REPOSITORY');
export const RELATIONSHIP_REPOSITORY = Symbol('RELATIONSHIP_REPOSITORY');
export const EVIDENCE_REPOSITORY = Symbol('EVIDENCE_REPOSITORY');
export const REVISION_REPOSITORY = Symbol('REVISION_REPOSITORY');

export interface ControlledInformationRepository {
  findById(id: ControlledInformationId): Promise<ControlledInformation | null>;
  existsByDocumentNumber(documentNumber: DocumentNumber): Promise<boolean>;
  save(controlledInformation: ControlledInformation): Promise<void>;
}

export interface DocumentRepository {
  findById(id: DocumentId): Promise<Document | null>;
  findByDocumentNumber(documentNumber: DocumentNumber): Promise<Document | null>;
  save(document: Document): Promise<void>;
}

export interface ApprovalRepository {
  findById(id: ApprovalId): Promise<Approval | null>;
  save(approval: Approval): Promise<void>;
}

export interface RelationshipRepository {
  findById(id: RelationshipId): Promise<Relationship | null>;
  save(relationship: Relationship): Promise<void>;
}

export interface EvidenceRepository {
  findLinkById(id: EvidenceLinkId): Promise<EvidenceLink | null>;
  saveLink(evidenceLink: EvidenceLink): Promise<void>;
}

export interface RevisionRepository {
  findById(id: RevisionId): Promise<Revision | null>;
  save(revision: Revision): Promise<void>;
}
