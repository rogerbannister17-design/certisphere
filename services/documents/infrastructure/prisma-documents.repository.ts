import {
  type Approval,
  type ApprovalRepository,
  type ApprovalId,
  type ControlledInformation,
  type ControlledInformationRepository,
  type ControlledInformationId,
  type Document,
  type DocumentId,
  type DocumentNumber,
  type DocumentRepository,
  type EvidenceLink,
  type EvidenceLinkId,
  type EvidenceRepository,
  type Relationship,
  type RelationshipId,
  type RelationshipRepository,
  type Revision,
  type RevisionId,
  type RevisionRepository,
  UserId,
} from '../index.js';
import {
  approvalData,
  controlledInformationData,
  documentData,
  evidenceLinkData,
  mapApprovalRow,
  mapControlledInformationRow,
  mapDocumentRow,
  mapEvidenceLinkRow,
  mapRelationshipRow,
  mapRevisionRow,
  relationshipData,
  revisionData,
  revisionDataForDocument,
} from './prisma-document.mapper.js';
import type { KcipPrismaClient } from './prisma-documents.types.js';

const includeDocumentAggregate = {
  controlledInformation: true,
  revisions: true,
  approvals: true,
} as const;
const systemActorId = UserId.from('00000000-0000-4000-8000-000000000000');

export class PrismaControlledInformationRepository implements ControlledInformationRepository {
  constructor(private readonly prisma: KcipPrismaClient) {}

  async findById(id: ControlledInformationId): Promise<ControlledInformation | null> {
    const row = await this.prisma.controlledInformation.findFirst({
      where: {
        id: id.value,
        deletedAt: null,
      },
    });

    return row === null ? null : mapControlledInformationRow(row);
  }

  async existsByDocumentNumber(documentNumber: DocumentNumber): Promise<boolean> {
    const row = await this.prisma.controlledInformation.findFirst({
      where: {
        documentNumber: documentNumber.value,
        deletedAt: null,
      },
    });

    return row !== null;
  }

  async save(controlledInformation: ControlledInformation): Promise<void> {
    const data = controlledInformationData(controlledInformation);
    await this.prisma.controlledInformation.upsert({
      where: { id: controlledInformation.id.value },
      create: data,
      update: {
        ...data,
        version: { increment: 1 },
      },
    });
  }
}

export class PrismaDocumentRepository implements DocumentRepository {
  constructor(private readonly prisma: KcipPrismaClient) {}

  async findById(id: DocumentId): Promise<Document | null> {
    const row = await this.prisma.kcipDocument.findFirst({
      where: {
        id: id.value,
        deletedAt: null,
      },
      include: includeDocumentAggregate,
    });

    return row === null ? null : mapDocumentRow(row);
  }

  async findByDocumentNumber(documentNumber: DocumentNumber): Promise<Document | null> {
    const row = await this.prisma.kcipDocument.findFirst({
      where: {
        controlledInformation: {
          documentNumber: documentNumber.value,
          deletedAt: null,
        },
        deletedAt: null,
      },
      include: includeDocumentAggregate,
    });

    return row === null ? null : mapDocumentRow(row);
  }

  async save(document: Document): Promise<void> {
    await this.prisma.$transaction(async (transaction) => {
      const controlledInformation = controlledInformationData(document.controlledInformation);
      await transaction.controlledInformation.upsert({
        where: { id: document.controlledInformation.id.value },
        create: controlledInformation,
        update: {
          ...controlledInformation,
          version: { increment: 1 },
        },
      });

      const documentRecord = documentData(document);
      await transaction.kcipDocument.upsert({
        where: { id: document.id.value },
        create: documentRecord,
        update: {
          ...documentRecord,
          version: { increment: 1 },
        },
      });

      await transaction.documentApproval.deleteMany({ where: { documentId: document.id.value } });
      await transaction.documentRevision.deleteMany({ where: { documentId: document.id.value } });

      if (document.revisions.length > 0) {
        await transaction.documentRevision.createMany({
          data: document.revisions.map((revision) => revisionData(document, revision)),
        });
      }

      if (document.approvals.length > 0) {
        await transaction.documentApproval.createMany({
          data: document.approvals.map((approval) => approvalData(document.id.value, approval)),
        });
      }
    });
  }
}

export class PrismaApprovalRepository implements ApprovalRepository {
  constructor(private readonly prisma: KcipPrismaClient) {}

  async findById(id: ApprovalId): Promise<Approval | null> {
    const row = await this.prisma.documentApproval.findFirst({
      where: {
        id: id.value,
        deletedAt: null,
      },
    });

    return row === null ? null : mapApprovalRow(row);
  }

  async save(approval: Approval): Promise<void> {
    await this.prisma.$transaction(async (transaction) => {
      const revision = await transaction.documentRevision.findFirst({
        where: {
          id: approval.revisionId.value,
          deletedAt: null,
        },
      });
      if (revision === null) {
        throw new Error('Cannot persist approval because the target revision was not found.');
      }

      const data = approvalData(revision.documentId, approval);
      await transaction.documentApproval.upsert({
        where: { id: approval.id.value },
        create: data,
        update: {
          ...data,
          version: { increment: 1 },
        },
      });
    });
  }
}

export class PrismaRelationshipRepository implements RelationshipRepository {
  constructor(private readonly prisma: KcipPrismaClient) {}

  async findById(id: RelationshipId): Promise<Relationship | null> {
    const row = await this.prisma.documentRelationship.findFirst({
      where: {
        id: id.value,
        deletedAt: null,
      },
    });

    return row === null ? null : mapRelationshipRow(row);
  }

  async save(relationship: Relationship): Promise<void> {
    const data = relationshipData(relationship, systemActorId);
    await this.prisma.documentRelationship.upsert({
      where: { id: relationship.id.value },
      create: data,
      update: {
        ...data,
        version: { increment: 1 },
      },
    });
  }
}

export class PrismaEvidenceRepository implements EvidenceRepository {
  constructor(private readonly prisma: KcipPrismaClient) {}

  async findLinkById(id: EvidenceLinkId): Promise<EvidenceLink | null> {
    const row = await this.prisma.documentEvidenceLink.findFirst({
      where: {
        id: id.value,
        deletedAt: null,
      },
    });

    return row === null ? null : mapEvidenceLinkRow(row);
  }

  async saveLink(evidenceLink: EvidenceLink): Promise<void> {
    const data = evidenceLinkData(evidenceLink, systemActorId);
    await this.prisma.documentEvidenceLink.upsert({
      where: { id: evidenceLink.id.value },
      create: data,
      update: {
        ...data,
        version: { increment: 1 },
      },
    });
  }
}

export class PrismaRevisionRepository implements RevisionRepository {
  constructor(private readonly prisma: KcipPrismaClient) {}

  async findById(id: RevisionId): Promise<Revision | null> {
    const row = await this.prisma.documentRevision.findFirst({
      where: {
        id: id.value,
        deletedAt: null,
      },
    });

    return row === null ? null : mapRevisionRow(row);
  }

  async save(revision: Revision): Promise<void> {
    const existing = await this.prisma.documentRevision.findFirst({
      where: {
        id: revision.id.value,
        deletedAt: null,
      },
    });
    if (existing === null) {
      throw new Error('Standalone revision persistence requires an existing revision row.');
    }

    const data = {
      ...revisionDataForDocument(existing.documentId, existing.controlledInformationId, revision),
    };

    await this.prisma.documentRevision.update({
      where: { id: revision.id.value },
      data: {
        ...data,
        version: { increment: 1 },
      },
    });
  }
}
