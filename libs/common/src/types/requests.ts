export interface CreateRequestRequest {
  summary: string;
  status?: string;
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
  preferredDate1?: string;
  preferredDate2?: string;
  preferredTime?: string;
  preferredNotes?: string;
  territory?: string;
  ticketId?: string;
  createdBy: string;
}

export interface UpdateRequestRequest {
  id: string;
  summary?: string;
  status?: string;
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
  preferredDate1?: string;
  preferredDate2?: string;
  preferredTime?: string;
  preferredNotes?: string;
  territory?: string;
  ticketId?: string;
}

export interface PaginationRequest {
  page: number;
  limit: number;
}

export interface FindOneRequestRequest {
  id: string;
}

export interface DeleteRequestRequest {
  id: string;
}

export interface BulkDeleteRequest {
  ids: string[];
}

export interface BulkUpdateRequest {
  ids: string[];
  update_fields: UpdateRequestFields;
}

export interface UpdateRequestFields {
  summary?: string;
  status?: string;
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
  preferredDate1?: string;
  preferredDate2?: string;
  preferredTime?: string;
  preferredNotes?: string;
  territory?: string;
  ticketId?: string;
}

export interface RequestResponse {
  id: string;
  summary: string;
  status: string;
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
  preferredDate1?: string;
  preferredDate2?: string;
  preferredTime?: string;
  preferredNotes?: string;
  territory?: string;
  ticketId?: string;
  createdBy: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedRequestsResponse {
  data: RequestResponse[];
  total: number;
  page: number;
  lastPage: number;
}

export interface DeleteRequestResponse {
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

