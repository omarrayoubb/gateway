export interface BulkDeleteResponseDto {
  deletedCount: number;
  failedIds?: Array<{ id: string; error: string }>;
}

