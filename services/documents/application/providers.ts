import { ApprovalService } from './approval.service.js';
import { ControlledInformationService } from './controlled-information.service.js';
import { EvidenceService } from './evidence.service.js';
import { LifecycleService } from './lifecycle.service.js';
import {
  DOCUMENT_TRANSACTION_MANAGER,
  ImmediateApplicationTransactionManager,
} from './ports.js';
import { PublicationService } from './publication.service.js';
import { RelationshipService } from './relationship.service.js';
import { RevisionService } from './revision.service.js';
import { SearchService } from './search.service.js';

export const DOCUMENT_APPLICATION_SERVICE_PROVIDERS = [
  ControlledInformationService,
  RevisionService,
  ApprovalService,
  PublicationService,
  RelationshipService,
  EvidenceService,
  LifecycleService,
  SearchService,
  {
    provide: DOCUMENT_TRANSACTION_MANAGER,
    useClass: ImmediateApplicationTransactionManager,
  },
];
