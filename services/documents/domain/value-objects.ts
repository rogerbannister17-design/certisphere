import { InvalidDocumentIdentifierError, InvalidDocumentValueError } from './errors.js';

const uuidPattern = /^[\da-f]{8}-[\da-f]{4}-[1-5][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;

export type ControlledInformationType =
  | 'DOCUMENT'
  | 'POLICY'
  | 'PROCEDURE'
  | 'FORM'
  | 'REGISTER'
  | 'CHECKLIST'
  | 'RECORD'
  | 'EVIDENCE'
  | 'TEMPLATE';

export type LifecycleState =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'SUPERSEDED'
  | 'ARCHIVED'
  | 'WITHDRAWN'
  | 'OBSOLETE';

export type ClassificationLevel = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';

export type RelationshipType =
  | 'CLAUSE_SUPPORTS_DOCUMENT'
  | 'DOCUMENT_SUPPORTS_PROCESS'
  | 'DOCUMENT_GENERATES_RECORD'
  | 'DOCUMENT_REQUIRES_TRAINING'
  | 'DOCUMENT_CONTROLS_RISK'
  | 'DOCUMENT_SUPPORTS_AUDIT'
  | 'DOCUMENT_DRIVES_CAPA'
  | 'DOCUMENT_CONTROLS_SUPPLIER'
  | 'EVIDENCE_SUPPORTS_DOCUMENT'
  | 'REVISION_SUPERSEDES_REVISION';

export type ApprovalDecision = 'APPROVED' | 'REJECTED';

export interface TenantMetadata {
  readonly organisationId: OrganisationId;
  readonly createdBy: UserId;
  readonly updatedBy: UserId;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
}

abstract class UuidValueObject {
  protected constructor(readonly value: string) {
    if (!uuidPattern.test(value)) {
      throw new InvalidDocumentIdentifierError(value);
    }
  }

  equals(other: UuidValueObject): boolean {
    return this.value === other.value;
  }
}

export class OrganisationId extends UuidValueObject {
  static from(value: string): OrganisationId {
    return new OrganisationId(value);
  }
}

export class DocumentId extends UuidValueObject {
  static from(value: string): DocumentId {
    return new DocumentId(value);
  }
}

export class ControlledInformationId extends UuidValueObject {
  static from(value: string): ControlledInformationId {
    return new ControlledInformationId(value);
  }
}

export class RevisionId extends UuidValueObject {
  static from(value: string): RevisionId {
    return new RevisionId(value);
  }
}

export class ApprovalId extends UuidValueObject {
  static from(value: string): ApprovalId {
    return new ApprovalId(value);
  }
}

export class RelationshipId extends UuidValueObject {
  static from(value: string): RelationshipId {
    return new RelationshipId(value);
  }
}

export class EvidenceLinkId extends UuidValueObject {
  static from(value: string): EvidenceLinkId {
    return new EvidenceLinkId(value);
  }
}

export class CommentId extends UuidValueObject {
  static from(value: string): CommentId {
    return new CommentId(value);
  }
}

export class ReviewId extends UuidValueObject {
  static from(value: string): ReviewId {
    return new ReviewId(value);
  }
}

export class AttachmentId extends UuidValueObject {
  static from(value: string): AttachmentId {
    return new AttachmentId(value);
  }
}

export class ElectronicSignatureId extends UuidValueObject {
  static from(value: string): ElectronicSignatureId {
    return new ElectronicSignatureId(value);
  }
}

export class ClauseMappingId extends UuidValueObject {
  static from(value: string): ClauseMappingId {
    return new ClauseMappingId(value);
  }
}

export class ProcessLinkId extends UuidValueObject {
  static from(value: string): ProcessLinkId {
    return new ProcessLinkId(value);
  }
}

export class WorkflowReferenceId extends UuidValueObject {
  static from(value: string): WorkflowReferenceId {
    return new WorkflowReferenceId(value);
  }
}

export class UserId extends UuidValueObject {
  static from(value: string): UserId {
    return new UserId(value);
  }
}

export class RevisionNumber {
  private constructor(readonly value: string) {}

  static from(value: string): RevisionNumber {
    if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(value)) {
      throw new InvalidDocumentValueError('Revision number must use major.minor format.');
    }

    return new RevisionNumber(value);
  }

  nextMajor(): RevisionNumber {
    const [major] = this.parts();
    return RevisionNumber.from(`${String(major + 1)}.0`);
  }

  nextMinor(): RevisionNumber {
    const [major, minor] = this.parts();
    return RevisionNumber.from(`${String(major)}.${String(minor + 1)}`);
  }

  equals(other: RevisionNumber): boolean {
    return this.value === other.value;
  }

  private parts(): readonly [number, number] {
    const [majorText, minorText] = this.value.split('.');
    if (majorText === undefined || minorText === undefined) {
      throw new InvalidDocumentValueError('Revision number must use major.minor format.');
    }

    return [Number.parseInt(majorText, 10), Number.parseInt(minorText, 10)];
  }
}

export class DocumentNumber {
  private constructor(readonly value: string) {}

  static from(value: string): DocumentNumber {
    const trimmed = value.trim();
    if (!/^[A-Z0-9][A-Z0-9-]{2,63}$/.test(trimmed)) {
      throw new InvalidDocumentValueError(
        'Document number must be 3 to 64 uppercase alphanumeric or hyphen characters.',
      );
    }

    if (trimmed.includes('--')) {
      throw new InvalidDocumentValueError('Document number must not contain consecutive hyphens.');
    }

    return new DocumentNumber(trimmed);
  }

  equals(other: DocumentNumber): boolean {
    return this.value === other.value;
  }
}

export class ClauseReference {
  private constructor(
    readonly standard: string,
    readonly version: string,
    readonly clause: string,
  ) {}

  static from(standard: string, version: string, clause: string): ClauseReference {
    const normalisedStandard = standard.trim().toUpperCase();
    const normalisedVersion = version.trim();
    const normalisedClause = clause.trim();
    if (!/^ISO \d{4,5}$/.test(normalisedStandard)) {
      throw new InvalidDocumentValueError('Clause standard must use ISO number format.');
    }

    if (normalisedVersion.length === 0 || normalisedClause.length === 0) {
      throw new InvalidDocumentValueError('Clause reference requires standard version and clause.');
    }

    return new ClauseReference(normalisedStandard, normalisedVersion, normalisedClause);
  }
}

export class ProcessReference {
  private constructor(readonly value: string) {}

  static from(value: string): ProcessReference {
    const trimmed = value.trim();
    if (trimmed.length < 2 || trimmed.length > 128) {
      throw new InvalidDocumentValueError(
        'Process reference must be between 2 and 128 characters.',
      );
    }

    return new ProcessReference(trimmed);
  }
}

export class EvidenceReference {
  private constructor(readonly value: string) {}

  static from(value: string): EvidenceReference {
    const trimmed = value.trim();
    if (trimmed.length < 3 || trimmed.length > 256) {
      throw new InvalidDocumentValueError(
        'Evidence reference must be between 3 and 256 characters.',
      );
    }

    return new EvidenceReference(trimmed);
  }
}

export class Classification {
  private constructor(readonly level: ClassificationLevel) {}

  static from(level: ClassificationLevel): Classification {
    return new Classification(level);
  }

  permitsExternalAccess(): boolean {
    return this.level === 'PUBLIC' || this.level === 'INTERNAL';
  }
}

export class Metadata {
  private constructor(readonly values: ReadonlyMap<string, string>) {}

  static from(values: ReadonlyMap<string, string>): Metadata {
    for (const [key, value] of values.entries()) {
      if (!/^[a-z][a-z0-9_]{1,63}$/.test(key)) {
        throw new InvalidDocumentValueError(`Invalid metadata key: ${key}.`);
      }

      if (value.trim().length === 0) {
        throw new InvalidDocumentValueError(`Metadata value for ${key} must not be empty.`);
      }
    }

    return new Metadata(new Map(values));
  }

  get(key: string): string | undefined {
    return this.values.get(key);
  }
}

export class RetentionPeriod {
  private constructor(readonly days: number) {}

  static days(days: number): RetentionPeriod {
    if (!Number.isInteger(days) || days < 1) {
      throw new InvalidDocumentValueError('Retention period must be at least one day.');
    }

    return new RetentionPeriod(days);
  }
}
