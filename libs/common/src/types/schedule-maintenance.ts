export interface CreateScheduleMaintenanceRequest {
  schedule: string;
  startDate: string;
  endDate: string;
  relatedEntityType: string;
  relatedId: string;
}

export interface UpdateScheduleMaintenanceRequest {
  id: string;
  schedule?: string;
  startDate?: string;
  endDate?: string;
  relatedEntityType?: string;
  relatedId?: string;
}

export interface PaginationRequest {
  page: number;
  limit: number;
}

export interface FindOneScheduleMaintenanceRequest {
  id: string;
}

export interface DeleteScheduleMaintenanceRequest {
  id: string;
}

export interface BulkDeleteRequest {
  ids: string[];
}

export interface BulkUpdateRequest {
  ids: string[];
  update_fields: UpdateScheduleMaintenanceFields;
}

export interface UpdateScheduleMaintenanceFields {
  schedule?: string;
  startDate?: string;
  endDate?: string;
  relatedEntityType?: string;
  relatedId?: string;
}

export interface ScheduleMaintenanceResponse {
  id: string;
  schedule: string;
  startDate: string;
  endDate: string;
  relatedEntityType: string;
  relatedId: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedScheduleMaintenancesResponse {
  data: ScheduleMaintenanceResponse[];
  total: number;
  page: number;
  lastPage: number;
}

export interface DeleteScheduleMaintenanceResponse {
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

