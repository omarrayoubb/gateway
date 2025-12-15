export interface SimpleRoleInfo {
  id: string;
  name: string;
}

export interface SimpleUserInfo {
  id: string;
  name: string;
}

export interface RoleResponseDto {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  parent: SimpleRoleInfo | null;
  shareDataWithPeers: boolean;
  createdById: string | null;
  createdBy: SimpleUserInfo | null;
  createdAt: Date;
  children?: SimpleRoleInfo[];
}

