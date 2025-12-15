export interface CreateFieldAgentRequest {
  name: string;
}

export interface UpdateFieldAgentRequest {
  id: string;
  name?: string;
}

export interface PaginationRequest {
  page: number;
  limit: number;
}

export interface FindOneFieldAgentRequest {
  id: string;
}

export interface DeleteFieldAgentRequest {
  id: string;
}

export interface BulkDeleteRequest {
  ids: string[];
}

export interface BulkUpdateRequest {
  ids: string[];
  update_fields: UpdateFieldAgentFields;
}

export interface UpdateFieldAgentFields {
  name?: string;
}

export interface FieldAgentResponse {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedFieldAgentsResponse {
  data: FieldAgentResponse[];
  total: number;
  page: number;
  lastPage: number;
}

export interface DeleteFieldAgentResponse {
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

