export interface ModulePermissions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface ProfilePermissions {
  [moduleName: string]: ModulePermissions;
}

export interface ProfileResponseDto {
  id: string;
  name: string;
  description: string | null;
  permissions: ProfilePermissions;
  createdAt: Date;
  updatedAt: Date;
}
