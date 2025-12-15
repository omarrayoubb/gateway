export interface RoleResponseDto {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  parent: {
    id: string;
    name: string;
  } | null;
  shareDataWithPeers: boolean;
  createdById: string | null;
  createdBy: {
    id: string;
    name: string;
  } | null;
  createdAt: Date;
  children?: RoleResponseDto[]; // Recursive nested structure
}

