export interface CreateTimeSheetRequest {
  serviceResource: string;
  description: string;
  startDate: string;
  endDate: string;
  duration: number;
  serviceId: string;
}

export interface UpdateTimeSheetRequest {
  id: string;
  serviceResource?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  duration?: number;
  serviceId?: string;
}

export interface PaginationRequest {
  page: number;
  limit: number;
}

export interface FindOneTimeSheetRequest {
  id: string;
}

export interface DeleteTimeSheetRequest {
  id: string;
}

export interface BulkDeleteRequest {
  ids: string[];
}

export interface BulkUpdateRequest {
  ids: string[];
  update_fields: UpdateTimeSheetFields;
}

export interface UpdateTimeSheetFields {
  serviceResource?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  duration?: number;
  serviceId?: string;
}

export interface TimeSheetResponse {
  id: string;
  serviceResource: string;
  description: string;
  startDate: string;
  endDate: string;
  duration: number;
  serviceId: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedTimeSheetsResponse {
  data: TimeSheetResponse[];
  total: number;
  page: number;
  lastPage: number;
}

export interface DeleteTimeSheetResponse {
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

