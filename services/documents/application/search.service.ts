import {
  type DocumentSearchCriteria,
  type DocumentSearchPort,
  type DocumentSearchResult,
} from './ports.js';
import { DocumentSearchLimitError } from './service-errors.js';

export type SearchDocumentsCommand = DocumentSearchCriteria;

export class SearchService {
  constructor(private readonly searchPort: DocumentSearchPort) {}

  async search(command: SearchDocumentsCommand): Promise<readonly DocumentSearchResult[]> {
    if (!Number.isInteger(command.limit) || command.limit < 1 || command.limit > 100) {
      throw new DocumentSearchLimitError();
    }

    return this.searchPort.search(command);
  }
}
