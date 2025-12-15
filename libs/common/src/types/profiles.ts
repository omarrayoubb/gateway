// libs/common/src/types/profiles.ts

// Request Types
export interface CreateProfileRequest {
  name: string;
  description?: string;
  permissions: { [moduleName: string]: ModulePermissions };
}

export interface UpdateProfileRequest {
  id: string;
  name?: string;
  description?: string;
  permissions?: { [moduleName: string]: ModulePermissions };
}

export interface PaginationRequest {
  page: number;
  limit: number;
}

export interface FindOneProfileRequest {
  id: string;
}

export interface DeleteProfileRequest {
  id: string;
}

export interface BulkDeleteRequest {
  ids: string[];
}

export interface BulkUpdateRequest {
  ids: string[];
  update_fields: UpdateProfileFields;
}

export interface UpdateProfileFields {
  name?: string;
  description?: string;
  permissions?: { [moduleName: string]: ModulePermissions };
}

// Response Types
export interface ModulePermissions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface ProfilePermissions {
  [moduleName: string]: ModulePermissions;
}

export interface ProfileResponse {
  id: string;
  name: string;
  description?: string | null;
  permissions: { [moduleName: string]: ModulePermissions };
  created_at: string;
  updated_at: string;
}

export interface PaginatedProfilesResponse {
  data: ProfileResponse[];
  total: number;
  page: number;
  lastPage: number;
}

export interface DeleteProfileResponse {
  success: boolean;
}

export interface FailedId {
  id: string;
  error: string;
}

export interface BulkDeleteResponse {
  deleted_count: number;
  failed_ids?: FailedId[];
}

export interface FailedItem {
  id: string;
  error: string;
}
export interface BulkUpdateResponse {
  updated_count: number;
  failed_items?: FailedItem[];
}


