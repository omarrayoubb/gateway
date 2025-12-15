export interface CreatePartRequest {
  name: string;
  price: number;
}

export interface UpdatePartRequest {
  id: string;
  name?: string;
  price?: number;
}

export interface PaginationRequest {
  page: number;
  limit: number;
}

export interface FindOnePartRequest {
  id: string;
}

export interface DeletePartRequest {
  id: string;
}

export interface BulkDeleteRequest {
  ids: string[];
}

export interface BulkUpdateRequest {
  ids: string[];
  update_fields: UpdatePartFields;
}

export interface UpdatePartFields {
  name?: string;
  price?: number;
}

export interface PartResponse {
  id: string;
  name: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedPartsResponse {
  data: PartResponse[];
  total: number;
  page: number;
  lastPage: number;
}

export interface DeletePartResponse {
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

