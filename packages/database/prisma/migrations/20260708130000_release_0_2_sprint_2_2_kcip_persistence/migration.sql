CREATE TYPE "ControlledInformationType" AS ENUM (
  'DOCUMENT',
  'POLICY',
  'PROCEDURE',
  'FORM',
  'REGISTER',
  'CHECKLIST',
  'RECORD',
  'EVIDENCE',
  'TEMPLATE'
);

CREATE TYPE "KcipLifecycleState" AS ENUM (
  'DRAFT',
  'IN_REVIEW',
  'APPROVED',
  'PUBLISHED',
  'SUPERSEDED',
  'ARCHIVED',
  'WITHDRAWN',
  'OBSOLETE'
);

CREATE TYPE "ClassificationLevel" AS ENUM (
  'PUBLIC',
  'INTERNAL',
  'CONFIDENTIAL',
  'RESTRICTED'
);

CREATE TYPE "RelationshipType" AS ENUM (
  'CLAUSE_SUPPORTS_DOCUMENT',
  'DOCUMENT_SUPPORTS_PROCESS',
  'DOCUMENT_GENERATES_RECORD',
  'DOCUMENT_REQUIRES_TRAINING',
  'DOCUMENT_CONTROLS_RISK',
  'DOCUMENT_SUPPORTS_AUDIT',
  'DOCUMENT_DRIVES_CAPA',
  'DOCUMENT_CONTROLS_SUPPLIER',
  'EVIDENCE_SUPPORTS_DOCUMENT',
  'REVISION_SUPERSEDES_REVISION'
);

CREATE TYPE "EvidenceRelationshipType" AS ENUM (
  'SUPPORTS',
  'GENERATED_BY',
  'VERIFIES',
  'SUPERSEDES'
);

CREATE TYPE "ApprovalDecision" AS ENUM (
  'APPROVED',
  'REJECTED'
);

CREATE TYPE "ClauseCoverageType" AS ENUM (
  'FULL',
  'PARTIAL',
  'SUPPORTING'
);

CREATE TYPE "ProcessLinkRelationship" AS ENUM (
  'OWNS',
  'SUPPORTS',
  'GENERATES_RECORD',
  'REQUIRES_TRAINING'
);

CREATE TYPE "WorkflowReferenceStatus" AS ENUM (
  'NOT_STARTED',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED'
);

CREATE TABLE "controlled_information" (
  "id" UUID NOT NULL,
  "organisationId" UUID NOT NULL,
  "type" "ControlledInformationType" NOT NULL,
  "title" VARCHAR(240) NOT NULL,
  "documentNumber" VARCHAR(64) NOT NULL,
  "classification" "ClassificationLevel" NOT NULL,
  "categoryName" VARCHAR(160) NOT NULL,
  "categoryActive" BOOLEAN NOT NULL DEFAULT true,
  "ownerUserId" UUID NOT NULL,
  "ownerRole" VARCHAR(120) NOT NULL,
  "accessPolicy" JSONB NOT NULL,
  "retentionDays" INTEGER NOT NULL,
  "legalHold" BOOLEAN NOT NULL DEFAULT false,
  "metadata" JSONB NOT NULL,
  "lifecycle" "KcipLifecycleState" NOT NULL DEFAULT 'DRAFT',
  "archivedAt" TIMESTAMP(3),
  "archivedBy" UUID,
  "archiveReason" VARCHAR(1000),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" UUID NOT NULL,
  "modifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "modifiedBy" UUID NOT NULL,
  "tenantId" UUID NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "controlled_information_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "controlled_information_retentionDays_check" CHECK ("retentionDays" > 0),
  CONSTRAINT "controlled_information_tenant_check" CHECK ("tenantId" = "organisationId")
);

CREATE TABLE "kcip_documents" (
  "id" UUID NOT NULL,
  "organisationId" UUID NOT NULL,
  "controlledInformationId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" UUID NOT NULL,
  "modifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "modifiedBy" UUID NOT NULL,
  "tenantId" UUID NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "kcip_documents_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "kcip_documents_tenant_check" CHECK ("tenantId" = "organisationId")
);

CREATE TABLE "document_revisions" (
  "id" UUID NOT NULL,
  "organisationId" UUID NOT NULL,
  "documentId" UUID NOT NULL,
  "controlledInformationId" UUID NOT NULL,
  "revisionNumber" VARCHAR(32) NOT NULL,
  "authorId" UUID NOT NULL,
  "contentHash" VARCHAR(128) NOT NULL,
  "changeSummary" VARCHAR(1000) NOT NULL,
  "lifecycle" "KcipLifecycleState" NOT NULL DEFAULT 'DRAFT',
  "approvedAt" TIMESTAMP(3),
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" UUID NOT NULL,
  "modifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "modifiedBy" UUID NOT NULL,
  "tenantId" UUID NOT NULL,
  "revisionId" UUID NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "document_revisions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "document_revisions_tenant_check" CHECK ("tenantId" = "organisationId")
);

CREATE TABLE "document_approvals" (
  "id" UUID NOT NULL,
  "organisationId" UUID NOT NULL,
  "documentId" UUID NOT NULL,
  "revisionId" UUID NOT NULL,
  "requestedBy" UUID NOT NULL,
  "approverId" UUID NOT NULL,
  "decision" "ApprovalDecision",
  "signature" JSONB,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" UUID NOT NULL,
  "modifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "modifiedBy" UUID NOT NULL,
  "tenantId" UUID NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "document_approvals_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "document_approvals_tenant_check" CHECK ("tenantId" = "organisationId"),
  CONSTRAINT "document_approvals_independent_check" CHECK ("requestedBy" <> "approverId")
);

CREATE TABLE "document_relationships" (
  "id" UUID NOT NULL,
  "organisationId" UUID NOT NULL,
  "controlledInformationId" UUID NOT NULL,
  "targetId" VARCHAR(256) NOT NULL,
  "type" "RelationshipType" NOT NULL,
  "rationale" VARCHAR(1000) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" UUID NOT NULL,
  "modifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "modifiedBy" UUID NOT NULL,
  "tenantId" UUID NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "document_relationships_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "document_relationships_tenant_check" CHECK ("tenantId" = "organisationId")
);

CREATE TABLE "document_evidence_links" (
  "id" UUID NOT NULL,
  "organisationId" UUID NOT NULL,
  "controlledInformationId" UUID NOT NULL,
  "evidenceReference" VARCHAR(256) NOT NULL,
  "relationshipType" "EvidenceRelationshipType" NOT NULL,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" UUID NOT NULL,
  "modifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "modifiedBy" UUID NOT NULL,
  "tenantId" UUID NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "document_evidence_links_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "document_evidence_links_tenant_check" CHECK ("tenantId" = "organisationId")
);

CREATE TABLE "document_comments" (
  "id" UUID NOT NULL,
  "organisationId" UUID NOT NULL,
  "controlledInformationId" UUID NOT NULL,
  "authorId" UUID NOT NULL,
  "body" VARCHAR(4000) NOT NULL,
  "resolved" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" UUID NOT NULL,
  "modifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "modifiedBy" UUID NOT NULL,
  "tenantId" UUID NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "document_comments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "document_comments_tenant_check" CHECK ("tenantId" = "organisationId")
);

CREATE TABLE "document_reviews" (
  "id" UUID NOT NULL,
  "organisationId" UUID NOT NULL,
  "controlledInformationId" UUID NOT NULL,
  "reviewerId" UUID NOT NULL,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "unresolvedMandatoryCommentCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" UUID NOT NULL,
  "modifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "modifiedBy" UUID NOT NULL,
  "tenantId" UUID NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "document_reviews_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "document_reviews_comment_count_check" CHECK ("unresolvedMandatoryCommentCount" >= 0),
  CONSTRAINT "document_reviews_tenant_check" CHECK ("tenantId" = "organisationId")
);

CREATE TABLE "document_attachments" (
  "id" UUID NOT NULL,
  "organisationId" UUID NOT NULL,
  "controlledInformationId" UUID NOT NULL,
  "filename" VARCHAR(260) NOT NULL,
  "checksum" VARCHAR(128) NOT NULL,
  "accepted" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" UUID NOT NULL,
  "modifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "modifiedBy" UUID NOT NULL,
  "tenantId" UUID NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "document_attachments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "document_attachments_tenant_check" CHECK ("tenantId" = "organisationId")
);

CREATE TABLE "document_clause_mappings" (
  "id" UUID NOT NULL,
  "organisationId" UUID NOT NULL,
  "controlledInformationId" UUID NOT NULL,
  "standard" VARCHAR(32) NOT NULL,
  "standardVersion" VARCHAR(32) NOT NULL,
  "clause" VARCHAR(64) NOT NULL,
  "coverageType" "ClauseCoverageType" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" UUID NOT NULL,
  "modifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "modifiedBy" UUID NOT NULL,
  "tenantId" UUID NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "document_clause_mappings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "document_clause_mappings_tenant_check" CHECK ("tenantId" = "organisationId")
);

CREATE TABLE "document_process_links" (
  "id" UUID NOT NULL,
  "organisationId" UUID NOT NULL,
  "controlledInformationId" UUID NOT NULL,
  "processReference" VARCHAR(128) NOT NULL,
  "relationship" "ProcessLinkRelationship" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" UUID NOT NULL,
  "modifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "modifiedBy" UUID NOT NULL,
  "tenantId" UUID NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "document_process_links_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "document_process_links_tenant_check" CHECK ("tenantId" = "organisationId")
);

CREATE TABLE "document_workflow_references" (
  "id" UUID NOT NULL,
  "organisationId" UUID NOT NULL,
  "controlledInformationId" UUID NOT NULL,
  "externalReference" VARCHAR(160) NOT NULL,
  "status" "WorkflowReferenceStatus" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" UUID NOT NULL,
  "modifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "modifiedBy" UUID NOT NULL,
  "tenantId" UUID NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "document_workflow_references_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "document_workflow_references_tenant_check" CHECK ("tenantId" = "organisationId")
);

CREATE UNIQUE INDEX "controlled_information_organisationId_documentNumber_key" ON "controlled_information"("organisationId", "documentNumber");
CREATE INDEX "controlled_information_tenantId_lifecycle_idx" ON "controlled_information"("tenantId", "lifecycle");
CREATE INDEX "controlled_information_tenantId_classification_idx" ON "controlled_information"("tenantId", "classification");
CREATE INDEX "controlled_information_tenantId_deletedAt_idx" ON "controlled_information"("tenantId", "deletedAt");

CREATE UNIQUE INDEX "kcip_documents_controlledInformationId_key" ON "kcip_documents"("controlledInformationId");
CREATE INDEX "kcip_documents_tenantId_deletedAt_idx" ON "kcip_documents"("tenantId", "deletedAt");

CREATE UNIQUE INDEX "document_revisions_documentId_revisionNumber_key" ON "document_revisions"("documentId", "revisionNumber");
CREATE INDEX "document_revisions_tenantId_lifecycle_idx" ON "document_revisions"("tenantId", "lifecycle");
CREATE INDEX "document_revisions_tenantId_deletedAt_idx" ON "document_revisions"("tenantId", "deletedAt");

CREATE INDEX "document_approvals_tenantId_revisionId_idx" ON "document_approvals"("tenantId", "revisionId");
CREATE INDEX "document_approvals_tenantId_decision_idx" ON "document_approvals"("tenantId", "decision");
CREATE INDEX "document_approvals_tenantId_deletedAt_idx" ON "document_approvals"("tenantId", "deletedAt");

CREATE INDEX "document_relationships_tenantId_type_idx" ON "document_relationships"("tenantId", "type");
CREATE INDEX "document_relationships_tenantId_targetId_idx" ON "document_relationships"("tenantId", "targetId");
CREATE INDEX "document_relationships_tenantId_deletedAt_idx" ON "document_relationships"("tenantId", "deletedAt");

CREATE INDEX "document_evidence_links_tenantId_evidenceReference_idx" ON "document_evidence_links"("tenantId", "evidenceReference");
CREATE INDEX "document_evidence_links_tenantId_verified_idx" ON "document_evidence_links"("tenantId", "verified");
CREATE INDEX "document_evidence_links_tenantId_deletedAt_idx" ON "document_evidence_links"("tenantId", "deletedAt");

CREATE INDEX "document_comments_tenantId_controlledInformationId_idx" ON "document_comments"("tenantId", "controlledInformationId");
CREATE INDEX "document_comments_tenantId_resolved_idx" ON "document_comments"("tenantId", "resolved");

CREATE INDEX "document_reviews_tenantId_controlledInformationId_idx" ON "document_reviews"("tenantId", "controlledInformationId");
CREATE INDEX "document_reviews_tenantId_completed_idx" ON "document_reviews"("tenantId", "completed");

CREATE INDEX "document_attachments_tenantId_controlledInformationId_idx" ON "document_attachments"("tenantId", "controlledInformationId");
CREATE INDEX "document_attachments_tenantId_checksum_idx" ON "document_attachments"("tenantId", "checksum");

CREATE UNIQUE INDEX "document_clause_mappings_controlledInformationId_standard_standardVersion_clause_key" ON "document_clause_mappings"("controlledInformationId", "standard", "standardVersion", "clause");
CREATE INDEX "document_clause_mappings_tenantId_standard_clause_idx" ON "document_clause_mappings"("tenantId", "standard", "clause");

CREATE INDEX "document_process_links_tenantId_processReference_idx" ON "document_process_links"("tenantId", "processReference");
CREATE INDEX "document_process_links_tenantId_relationship_idx" ON "document_process_links"("tenantId", "relationship");

CREATE INDEX "document_workflow_references_tenantId_externalReference_idx" ON "document_workflow_references"("tenantId", "externalReference");
CREATE INDEX "document_workflow_references_tenantId_status_idx" ON "document_workflow_references"("tenantId", "status");

ALTER TABLE "controlled_information" ADD CONSTRAINT "controlled_information_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "kcip_documents" ADD CONSTRAINT "kcip_documents_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "kcip_documents" ADD CONSTRAINT "kcip_documents_controlledInformationId_fkey" FOREIGN KEY ("controlledInformationId") REFERENCES "controlled_information"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "document_revisions" ADD CONSTRAINT "document_revisions_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "document_revisions" ADD CONSTRAINT "document_revisions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "kcip_documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "document_revisions" ADD CONSTRAINT "document_revisions_controlledInformationId_fkey" FOREIGN KEY ("controlledInformationId") REFERENCES "controlled_information"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "document_approvals" ADD CONSTRAINT "document_approvals_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "document_approvals" ADD CONSTRAINT "document_approvals_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "kcip_documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "document_approvals" ADD CONSTRAINT "document_approvals_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "document_revisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "document_relationships" ADD CONSTRAINT "document_relationships_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "document_relationships" ADD CONSTRAINT "document_relationships_controlledInformationId_fkey" FOREIGN KEY ("controlledInformationId") REFERENCES "controlled_information"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "document_evidence_links" ADD CONSTRAINT "document_evidence_links_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "document_evidence_links" ADD CONSTRAINT "document_evidence_links_controlledInformationId_fkey" FOREIGN KEY ("controlledInformationId") REFERENCES "controlled_information"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "document_comments" ADD CONSTRAINT "document_comments_controlledInformationId_fkey" FOREIGN KEY ("controlledInformationId") REFERENCES "controlled_information"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "document_reviews" ADD CONSTRAINT "document_reviews_controlledInformationId_fkey" FOREIGN KEY ("controlledInformationId") REFERENCES "controlled_information"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "document_attachments" ADD CONSTRAINT "document_attachments_controlledInformationId_fkey" FOREIGN KEY ("controlledInformationId") REFERENCES "controlled_information"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "document_clause_mappings" ADD CONSTRAINT "document_clause_mappings_controlledInformationId_fkey" FOREIGN KEY ("controlledInformationId") REFERENCES "controlled_information"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "document_process_links" ADD CONSTRAINT "document_process_links_controlledInformationId_fkey" FOREIGN KEY ("controlledInformationId") REFERENCES "controlled_information"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "document_workflow_references" ADD CONSTRAINT "document_workflow_references_controlledInformationId_fkey" FOREIGN KEY ("controlledInformationId") REFERENCES "controlled_information"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
