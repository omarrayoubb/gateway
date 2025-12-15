// Request Types
export interface CreateTaskRequest {
  ownerId: string;
  subject: string;
  dueDate?: string;
  description?: string;
  notes?: string;
  links?: string[];
  priority?: string;
  status?: string;
  rfqId?: string;
  currency?: string;
  exchangeRate?: number;
  closedTime?: string;
}

export interface UpdateTaskRequest {
  id: string;
  ownerId?: string;
  subject?: string;
  dueDate?: string;
  description?: string;
  notes?: string;
  links?: string[];
  priority?: string;
  status?: string;
  rfqId?: string;
  currency?: string;
  exchangeRate?: number;
  closedTime?: string;
}

export interface PaginationRequest {
  page: number;
  limit: number;
}

export interface FindOneTaskRequest {
  id: string;
}

export interface DeleteTaskRequest {
  id: string;
}

export interface BulkDeleteRequest {
  ids: string[];
}

export interface BulkUpdateRequest {
  ids: string[];
  update_fields: UpdateTaskFields;
}

export interface UpdateTaskFields {
  ownerId?: string;
  subject?: string;
  dueDate?: string;
  description?: string;
  notes?: string;
  links?: string[];
  priority?: string;
  status?: string;
  rfqId?: string;
  currency?: string;
  exchangeRate?: number;
  closedTime?: string;
}

// Response Types
export interface SimpleUser {
  id: string;
  name: string;
}

export interface TaskResponse {
  id: string;
  taskNumber?: string;
  ownerId?: string;
  subject: string;
  dueDate?: string;
  description?: string;
  notes?: string;
  links?: string[];
  priority?: string;
  status?: string;
  currency?: string;
  exchangeRate?: number;
  closedTime?: string;
  createdBy: string;
  modifiedBy: string;
  createdAt: string;
  updatedAt: string;
  owner?: SimpleUser;
}

export interface PaginatedTasksResponse {
  data: TaskResponse[];
  total: number;
  page: number;
  lastPage: number;
}

export interface DeleteTaskResponse {
  success: boolean;
  message: string;
}

export interface FailedId {
  id: string;
  error: string;
}

export interface BulkDeleteResponse {
  deletedCount: number;
  failedIds?: FailedId[];
}

export interface FailedItem {
  id: string;
  error: string;
}

export interface BulkUpdateResponse {
  updatedCount: number;
  failedItems?: FailedItem[];
}

