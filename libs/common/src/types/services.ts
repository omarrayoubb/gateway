export interface CreateServiceRequest {
  name: string;
  netPrice: number;
}

export interface UpdateServiceRequest {
  id: string;
  name?: string;
  netPrice?: number;
}

export interface PaginationRequest {
  page: number;
  limit: number;
}

export interface FindOneServiceRequest {
  id: string;
}

export interface DeleteServiceRequest {
  id: string;
}

export interface BulkDeleteRequest {
  ids: string[];
}

export interface BulkUpdateRequest {
  ids: string[];
  update_fields: UpdateServiceFields;
}

export interface UpdateServiceFields {
  name?: string;
  netPrice?: number;
}

export interface ServiceResponse {
  id: string;
  name: string;
  netPrice: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedServicesResponse {
  data: ServiceResponse[];
  total: number;
  page: number;
  lastPage: number;
}

export interface DeleteServiceResponse {
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

