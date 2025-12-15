export interface BulkUpdateResponse {
  updatedCount: number;
  failedItems?: Array<{
    id: string;
    error: string;
  }>;
}

