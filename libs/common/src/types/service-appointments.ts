export interface CreateServiceAppointmentRequest {
  workOrderId: string;
  scheduledDate: string;
  scheduledTime: string;
  status?: string;
  assignedAgent?: string;
}

export interface UpdateServiceAppointmentRequest {
  id: string;
  workOrderId?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  status?: string;
  assignedAgent?: string;
}

export interface PaginationRequest {
  page: number;
  limit: number;
}

export interface FindOneServiceAppointmentRequest {
  id: string;
}

export interface DeleteServiceAppointmentRequest {
  id: string;
}

export interface BulkDeleteRequest {
  ids: string[];
}

export interface BulkUpdateRequest {
  ids: string[];
  update_fields: UpdateServiceAppointmentFields;
}

export interface UpdateServiceAppointmentFields {
  workOrderId?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  status?: string;
  assignedAgent?: string;
}

export interface ServiceAppointmentResponse {
  id: string;
  workOrderId: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  assignedAgent: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedServiceAppointmentsResponse {
  data: ServiceAppointmentResponse[];
  total: number;
  page: number;
  lastPage: number;
}

export interface DeleteServiceAppointmentResponse {
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

