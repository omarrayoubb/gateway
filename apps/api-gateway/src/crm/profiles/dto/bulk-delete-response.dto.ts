export interface BulkDeleteResponse {
  deletedCount: number;
  failedIds?: Array<{
    id: string;
    error: string;
  }>;
}
