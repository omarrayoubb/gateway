import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { RolesService } from './roles.service';
import { Metadata } from '@grpc/grpc-js';
import type {
  CreateRoleRequest,
  UpdateRoleRequest,
  Empty,
  FindOneRoleRequest,
  DeleteRoleRequest,
  BulkDeleteRequest,
  BulkUpdateRequest,
  RoleResponse,
  RolesListResponse,
  DeleteRoleResponse,
  BulkDeleteResponse,
  BulkUpdateResponse,
} from '@app/common/types/roles';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkUpdateRoleDto } from './dto/bulk-update.dto';

@Controller()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @GrpcMethod('RoleService', 'CreateRole')
  async createRole(
    data: CreateRoleRequest,
    metadata: Metadata,
  ): Promise<RoleResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const createRoleDto = this.mapCreateRequestToDto(data);
      const result = await this.rolesService.create(createRoleDto, currentUser);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error('Error in CRM RolesController.createRole:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred',
      });
    }
  }

  @GrpcMethod('RoleService', 'FindAllRoles')
  async findAllRoles(data: Empty): Promise<RolesListResponse> {
    try {
      const result = await this.rolesService.findAll();
      return {
        roles: result.map(role => this.mapResponseDtoToProto(role)),
      };
    } catch (error) {
      console.error('Error in findAllRoles:', error);
      throw new RpcException({
        code: 13,
        message: `Failed to fetch roles: ${error.message}`,
      });
    }
  }

  @GrpcMethod('RoleService', 'FindOneRole')
  async findOneRole(data: FindOneRoleRequest): Promise<RoleResponse> {
    try {
      const result = await this.rolesService.findOne(data.id);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(`Error in CRM RolesController.findOneRole for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || `An unknown error occurred during findOneRole for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('RoleService', 'UpdateRole')
  async updateRole(
    data: UpdateRoleRequest,
    metadata: Metadata,
  ): Promise<RoleResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const updateRoleDto = this.mapUpdateRequestToDto(data);
      const result = await this.rolesService.update(data.id, updateRoleDto);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(`Error in CRM RolesController.updateRole for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || `An unknown error occurred during updateRole for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('RoleService', 'DeleteRole')
  async deleteRole(data: DeleteRoleRequest): Promise<DeleteRoleResponse> {
    try {
      await this.rolesService.remove(data.id);
      return { success: true, message: 'Role deleted successfully' };
    } catch (error) {
      console.error(`Error in CRM RolesController.deleteRole for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || `An unknown error occurred during deleteRole for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('RoleService', 'BulkDeleteRoles')
  async bulkDeleteRoles(data: BulkDeleteRequest): Promise<BulkDeleteResponse> {
    try {
      const bulkDeleteDto: BulkDeleteDto = { ids: data.ids };
      const result = await this.rolesService.bulkRemove(bulkDeleteDto);
      return {
        deletedCount: result.deletedCount,
        failedIds: result.failedIds || [],
      };
    } catch (error) {
      console.error('Error in CRM RolesController.bulkDeleteRoles:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred during bulkDeleteRoles',
      });
    }
  }

  @GrpcMethod('RoleService', 'BulkUpdateRoles')
  async bulkUpdateRoles(
    data: BulkUpdateRequest,
    metadata: Metadata,
  ): Promise<BulkUpdateResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const bulkUpdateDto: BulkUpdateRoleDto = {
        ids: data.ids,
        updateFields: this.mapUpdateFieldsToDto(data.update_fields),
      };
      const result = await this.rolesService.bulkUpdate(bulkUpdateDto);
      return {
        updatedCount: result.updatedCount,
        failedItems: result.failedItems || [],
      };
    } catch (error) {
      console.error('Error in CRM RolesController.bulkUpdateRoles:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred during bulkUpdateRoles',
      });
    }
  }

  private extractUserFromMetadata(metadata: Metadata): { id: string; name: string; email: string } {
    const userId = metadata.get('user-id')[0] as string;
    const userName = metadata.get('user-name')[0] as string;
    const userEmail = metadata.get('user-email')[0] as string;

    if (!userId || !userName || !userEmail) {
      throw new RpcException({
        code: 16,
        message: 'User information missing from metadata',
      });
    }

    return {
      id: userId,
      name: userName,
      email: userEmail,
    };
  }

  private mapCreateRequestToDto(data: CreateRoleRequest): CreateRoleDto {
    if (!data.name) {
      throw new RpcException({
        code: 3,
        message: 'Required field missing: name is required',
      });
    }

    return {
      name: data.name,
      description: data.description,
      parentId: data.parentId || null,
      shareDataWithPeers: data.shareDataWithPeers || false,
    };
  }

  private mapUpdateRequestToDto(data: UpdateRoleRequest): UpdateRoleDto {
    const dto: UpdateRoleDto = {};

    if (data.name !== undefined) dto.name = data.name;
    if (data.description !== undefined) dto.description = data.description;
    if (data.parentId !== undefined) dto.parentId = data.parentId || null;
    if (data.shareDataWithPeers !== undefined) dto.shareDataWithPeers = data.shareDataWithPeers;

    return dto;
  }

  private mapUpdateFieldsToDto(fields: any): UpdateRoleDto {
    const dto: UpdateRoleDto = {};

    if (fields.name !== undefined) dto.name = fields.name;
    if (fields.description !== undefined) dto.description = fields.description;
    if (fields.parentId !== undefined) dto.parentId = fields.parentId || null;
    if (fields.shareDataWithPeers !== undefined) dto.shareDataWithPeers = fields.shareDataWithPeers;

    return dto;
  }

  private mapResponseDtoToProto(dto: any): RoleResponse {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description ?? undefined,
      parentId: dto.parentId ?? undefined,
      parent: dto.parent ? {
        id: dto.parent.id,
        name: dto.parent.name,
      } : undefined,
      shareDataWithPeers: dto.shareDataWithPeers,
      createdById: dto.createdById ?? undefined,
      createdBy: dto.createdBy ? {
        id: dto.createdBy.id,
        name: dto.createdBy.name,
      } : undefined,
      createdAt: dto.createdAt?.toISOString() || new Date().toISOString(),
      children: dto.children?.map((child: any) => ({
        id: child.id,
        name: child.name,
      })) || [],
    };
  }
}
