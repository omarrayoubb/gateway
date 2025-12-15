export interface CreateServiceReportRequest {
  serviceAppointmentId: string;
  reportDate: string;
  description: string;
}

export interface UpdateServiceReportRequest {
  id: string;
  serviceAppointmentId?: string;
  reportDate?: string;
  description?: string;
}

export interface PaginationRequest {
  page: number;
  limit: number;
}

export interface FindOneServiceReportRequest {
  id: string;
}

export interface DeleteServiceReportRequest {
  id: string;
}

export interface BulkDeleteRequest {
  ids: string[];
}

export interface BulkUpdateRequest {
  ids: string[];
  update_fields: UpdateServiceReportFields;
}

export interface UpdateServiceReportFields {
  serviceAppointmentId?: string;
  reportDate?: string;
  description?: string;
}

export interface ServiceReportResponse {
  id: string;
  serviceAppointmentId: string;
  reportDate: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedServiceReportsResponse {
  data: ServiceReportResponse[];
  total: number;
  page: number;
  lastPage: number;
}

export interface DeleteServiceReportResponse {
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

