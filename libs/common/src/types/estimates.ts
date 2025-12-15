export interface CreateEstimateRequest {
  summary: string;
  priority?: string;
  dueDate?: string;
  currency: string;
  exchangeRate?: number;
  company: string;
  contact: string;
  email: string;
  phone?: string;
  mobile?: string;
  serviceAddress?: string;
  billingAddress?: string;
  termsAndConditions?: string;
  parentWorkOrderId?: string;
  requestId?: string;
  createdBy: string;
}

export interface UpdateEstimateRequest {
  id: string;
  summary?: string;
  priority?: string;
  dueDate?: string;
  currency?: string;
  exchangeRate?: number;
  company?: string;
  contact?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  serviceAddress?: string;
  billingAddress?: string;
  termsAndConditions?: string;
  parentWorkOrderId?: string;
  requestId?: string;
}

export interface PaginationRequest {
  page: number;
  limit: number;
}

export interface FindOneEstimateRequest {
  id: string;
}

export interface DeleteEstimateRequest {
  id: string;
}

export interface BulkDeleteRequest {
  ids: string[];
}

export interface BulkUpdateRequest {
  ids: string[];
  update_fields: UpdateEstimateFields;
}

export interface UpdateEstimateFields {
  summary?: string;
  priority?: string;
  dueDate?: string;
  currency?: string;
  exchangeRate?: number;
  company?: string;
  contact?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  serviceAddress?: string;
  billingAddress?: string;
  termsAndConditions?: string;
  parentWorkOrderId?: string;
  requestId?: string;
}

export interface EstimateResponse {
  id: string;
  summary: string;
  priority: string;
  dueDate?: string;
  currency: string;
  exchangeRate?: number;
  company: string;
  contact: string;
  email: string;
  phone?: string;
  mobile?: string;
  serviceAddress?: string;
  billingAddress?: string;
  termsAndConditions?: string;
  parentWorkOrderId?: string;
  requestId?: string;
  createdBy: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedEstimatesResponse {
  data: EstimateResponse[];
  total: number;
  page: number;
  lastPage: number;
}

export interface DeleteEstimateResponse {
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

