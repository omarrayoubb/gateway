// Request Types
export interface CreateRoleRequest {
  name: string;
  description?: string;
  parentId?: string | null;
  shareDataWithPeers?: boolean;
}

export interface UpdateRoleRequest {
  id: string;
  name?: string;
  description?: string;
  parentId?: string | null;
  shareDataWithPeers?: boolean;
}

export interface FindOneRoleRequest {
  id: string;
}

export interface DeleteRoleRequest {
  id: string;
}

export interface BulkDeleteRequest {
  ids: string[];
}

export interface BulkUpdateRequest {
  ids: string[];
  update_fields: UpdateRoleFields;
}

export interface UpdateRoleFields {
  name?: string;
  description?: string;
  parentId?: string | null;
  shareDataWithPeers?: boolean;
}

export interface Empty {}

// Response Types
export interface SimpleUser {
  id: string;
  name: string;
}

export interface SimpleRole {
  id: string;
  name: string;
}

export interface RoleResponse {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  parent?: SimpleRole;
  shareDataWithPeers: boolean;
  createdById?: string;
  createdBy?: SimpleUser;
  createdAt: string;
  children?: SimpleRole[];
}

export interface RolesListResponse {
  roles: RoleResponse[];
}

export interface DeleteRoleResponse {
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

