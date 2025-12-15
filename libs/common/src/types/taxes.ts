export interface CreateTaxRequest {
  name: string;
  percentage: number;
}

export interface UpdateTaxRequest {
  id: string;
  name?: string;
  percentage?: number;
}

export interface PaginationRequest {
  page: number;
  limit: number;
}

export interface FindOneTaxRequest {
  id: string;
}

export interface DeleteTaxRequest {
  id: string;
}

export interface BulkDeleteRequest {
  ids: string[];
}

export interface BulkUpdateRequest {
  ids: string[];
  update_fields: UpdateTaxFields;
}

export interface UpdateTaxFields {
  name?: string;
  percentage?: number;
}

export interface TaxResponse {
  id: string;
  name: string;
  percentage: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedTaxesResponse {
  data: TaxResponse[];
  total: number;
  page: number;
  lastPage: number;
}

export interface DeleteTaxResponse {
  success: boolean;
  message?: string;
}

export interface BulkDeleteResponse {
  deleted_count: number;
  failed_ids?: FailedId[];
}

export interface FailedId {
  id: string;
  error: string;
}

export interface BulkUpdateResponse {
  updated_count: number;
  failed_items?: FailedItem[];
}

export interface FailedItem {
  id: string;
  error: string;
}

