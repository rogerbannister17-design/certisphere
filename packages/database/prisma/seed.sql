INSERT INTO "organisations" (
  "id",
  "organisationId",
  "name",
  "slug",
  "createdBy",
  "updatedBy"
) VALUES (
  '11111111-1111-4111-8111-111111111111',
  '11111111-1111-4111-8111-111111111111',
  'Certisphere Development Organisation',
  'certisphere-development',
  '33333333-3333-4333-8333-333333333333',
  '33333333-3333-4333-8333-333333333333'
) ON CONFLICT ("organisationId") DO NOTHING;

INSERT INTO "controlled_information" (
  "id",
  "organisationId",
  "type",
  "title",
  "documentNumber",
  "classification",
  "categoryName",
  "categoryActive",
  "ownerUserId",
  "ownerRole",
  "accessPolicy",
  "retentionDays",
  "legalHold",
  "metadata",
  "lifecycle",
  "createdBy",
  "modifiedBy",
  "tenantId"
) VALUES (
  '99999999-9999-4999-8999-999999999999',
  '11111111-1111-4111-8111-111111111111',
  'DOCUMENT',
  'Quality Manual',
  'QMS-MAN-001',
  'INTERNAL',
  'Quality Manual',
  true,
  '33333333-3333-4333-8333-333333333333',
  'Quality Manager',
  '{"canViewDraftUserIds":["33333333-3333-4333-8333-333333333333"],"canApproveUserIds":["44444444-4444-4444-8444-444444444444"],"externalAccessAllowed":false}'::jsonb,
  2555,
  false,
  '{"process_owner":"Quality Manager"}'::jsonb,
  'DRAFT',
  '33333333-3333-4333-8333-333333333333',
  '33333333-3333-4333-8333-333333333333',
  '11111111-1111-4111-8111-111111111111'
) ON CONFLICT ("organisationId", "documentNumber") DO NOTHING;

INSERT INTO "kcip_documents" (
  "id",
  "organisationId",
  "controlledInformationId",
  "createdBy",
  "modifiedBy",
  "tenantId"
) VALUES (
  '99999999-9999-4999-8999-999999999999',
  '11111111-1111-4111-8111-111111111111',
  '99999999-9999-4999-8999-999999999999',
  '33333333-3333-4333-8333-333333333333',
  '33333333-3333-4333-8333-333333333333',
  '11111111-1111-4111-8111-111111111111'
) ON CONFLICT ("controlledInformationId") DO NOTHING;
