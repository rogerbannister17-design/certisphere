export const KCIP_PRISMA_CLIENT = Symbol('KCIP_PRISMA_CLIENT');

export interface ControlledInformationRow {
  readonly id: string;
  readonly organisationId: string;
  readonly type: string;
  readonly title: string;
  readonly documentNumber: string;
  readonly classification: string;
  readonly categoryName: string;
  readonly categoryActive: boolean;
  readonly ownerUserId: string;
  readonly ownerRole: string;
  readonly accessPolicy: unknown;
  readonly retentionDays: number;
  readonly legalHold: boolean;
  readonly metadata: unknown;
  readonly lifecycle: string;
  readonly archivedAt: Date | null;
  readonly archivedBy: string | null;
  readonly archiveReason: string | null;
  readonly createdAt: Date;
  readonly createdBy: string;
  readonly modifiedAt: Date;
  readonly modifiedBy: string;
  readonly tenantId: string;
  readonly deletedAt: Date | null;
  readonly version: number;
}

export interface KcipDocumentRow {
  readonly id: string;
  readonly organisationId: string;
  readonly controlledInformationId: string;
  readonly createdAt: Date;
  readonly createdBy: string;
  readonly modifiedAt: Date;
  readonly modifiedBy: string;
  readonly tenantId: string;
  readonly deletedAt: Date | null;
  readonly version: number;
  readonly controlledInformation: ControlledInformationRow;
  readonly revisions: readonly DocumentRevisionRow[];
  readonly approvals: readonly DocumentApprovalRow[];
}

export interface DocumentRevisionRow {
  readonly id: string;
  readonly organisationId: string;
  readonly documentId: string;
  readonly controlledInformationId: string;
  readonly revisionNumber: string;
  readonly authorId: string;
  readonly contentHash: string;
  readonly changeSummary: string;
  readonly lifecycle: string;
  readonly approvedAt: Date | null;
  readonly publishedAt: Date | null;
  readonly createdAt: Date;
  readonly createdBy: string;
  readonly modifiedAt: Date;
  readonly modifiedBy: string;
  readonly tenantId: string;
  readonly revisionId: string;
  readonly deletedAt: Date | null;
  readonly version: number;
}

export interface DocumentApprovalRow {
  readonly id: string;
  readonly organisationId: string;
  readonly documentId: string;
  readonly revisionId: string;
  readonly requestedBy: string;
  readonly approverId: string;
  readonly decision: string | null;
  readonly signature: unknown;
  readonly completedAt: Date | null;
  readonly createdAt: Date;
  readonly createdBy: string;
  readonly modifiedAt: Date;
  readonly modifiedBy: string;
  readonly tenantId: string;
  readonly deletedAt: Date | null;
  readonly version: number;
}

export interface DocumentRelationshipRow {
  readonly id: string;
  readonly organisationId: string;
  readonly controlledInformationId: string;
  readonly targetId: string;
  readonly type: string;
  readonly rationale: string;
  readonly createdAt: Date;
  readonly createdBy: string;
  readonly modifiedAt: Date;
  readonly modifiedBy: string;
  readonly tenantId: string;
  readonly deletedAt: Date | null;
  readonly version: number;
}

export interface DocumentEvidenceLinkRow {
  readonly id: string;
  readonly organisationId: string;
  readonly controlledInformationId: string;
  readonly evidenceReference: string;
  readonly relationshipType: string;
  readonly verified: boolean;
  readonly createdAt: Date;
  readonly createdBy: string;
  readonly modifiedAt: Date;
  readonly modifiedBy: string;
  readonly tenantId: string;
  readonly deletedAt: Date | null;
  readonly version: number;
}

export interface KcipDelegate<TRow> {
  findFirst(args: unknown): Promise<TRow | null>;
  findUnique(args: unknown): Promise<TRow | null>;
  upsert(args: unknown): Promise<TRow>;
  update(args: unknown): Promise<TRow>;
  deleteMany(args: unknown): Promise<{ readonly count: number }>;
  createMany(args: unknown): Promise<{ readonly count: number }>;
}

export interface KcipPrismaTransaction {
  readonly controlledInformation: KcipDelegate<ControlledInformationRow>;
  readonly kcipDocument: KcipDelegate<KcipDocumentRow>;
  readonly documentRevision: KcipDelegate<DocumentRevisionRow>;
  readonly documentApproval: KcipDelegate<DocumentApprovalRow>;
  readonly documentRelationship: KcipDelegate<DocumentRelationshipRow>;
  readonly documentEvidenceLink: KcipDelegate<DocumentEvidenceLinkRow>;
}

export interface KcipPrismaClient extends KcipPrismaTransaction {
  $transaction<TResult>(
    handler: (transaction: KcipPrismaTransaction) => Promise<TResult>,
  ): Promise<TResult>;
}
