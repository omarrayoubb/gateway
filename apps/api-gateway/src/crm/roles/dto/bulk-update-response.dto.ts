export interface BulkUpdateResponseDto {
  updatedCount: number;
  failedItems?: Array<{ id: string; error: string }>;
}

