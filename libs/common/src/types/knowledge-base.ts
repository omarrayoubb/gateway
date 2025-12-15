export interface CreateKnowledgeBaseRequest {
  articleTitle: string;
  category: string;
  status?: string;
  content: string;
  author: string;
}

export interface UpdateKnowledgeBaseRequest {
  id: string;
  articleTitle?: string;
  category?: string;
  status?: string;
  content?: string;
  author?: string;
}

export interface PaginationRequest {
  page: number;
  limit: number;
}

export interface FindOneKnowledgeBaseRequest {
  id: string;
}

export interface DeleteKnowledgeBaseRequest {
  id: string;
}

export interface BulkDeleteRequest {
  ids: string[];
}

export interface BulkUpdateRequest {
  ids: string[];
  update_fields: UpdateKnowledgeBaseFields;
}

export interface UpdateKnowledgeBaseFields {
  articleTitle?: string;
  category?: string;
  status?: string;
  content?: string;
  author?: string;
}

export interface KnowledgeBaseResponse {
  id: string;
  articleTitle: string;
  category: string;
  status: string;
  content: string;
  author: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedKnowledgeBasesResponse {
  data: KnowledgeBaseResponse[];
  total: number;
  page: number;
  lastPage: number;
}

export interface DeleteKnowledgeBaseResponse {
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
