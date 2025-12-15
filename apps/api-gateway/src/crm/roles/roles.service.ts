import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
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
import { RoleResponseDto } from './dto/role-response.dto';
import { BulkDeleteResponseDto } from './dto/bulk-delete-response.dto';
import { BulkUpdateResponseDto } from './dto/bulk-update-response.dto';

interface RoleGrpcService {
  createRole(data: CreateRoleRequest, metadata?: Metadata): Observable<RoleResponse>;
  findAllRoles(data: Empty): Observable<RolesListResponse>;
  findOneRole(data: FindOneRoleRequest): Observable<RoleResponse>;
  updateRole(data: UpdateRoleRequest, metadata?: Metadata): Observable<RoleResponse>;
  deleteRole(data: DeleteRoleRequest): Observable<DeleteRoleResponse>;
  bulkDeleteRoles(data: BulkDeleteRequest): Observable<BulkDeleteResponse>;
  bulkUpdateRoles(data: BulkUpdateRequest, metadata?: Metadata): Observable<BulkUpdateResponse>;
}

@Injectable()
export class RolesService implements OnModuleInit {
  private roleGrpcService: RoleGrpcService;

  constructor(@Inject('CRM_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.roleGrpcService = this.client.getService<RoleGrpcService>('RoleService');
  }

  createRole(createRoleDto: CreateRoleDto, currentUser: { id: string; name: string; email: string }): Observable<RoleResponseDto> {
    const request: CreateRoleRequest = this.mapCreateDtoToRequest(createRoleDto);
    const metadata = this.createUserMetadata(currentUser);
    return this.roleGrpcService.createRole(request, metadata).pipe(
      map(response => this.mapResponseToDto(response)),
      catchError(error => {
        console.error('Error in createRole gRPC call:', error);
        return throwError(() => error);
      })
    );
  }

  findAllRoles(): Observable<RoleResponseDto[]> {
    const request: Empty = {};
    return this.roleGrpcService.findAllRoles(request).pipe(
      map(response => {
        if (!response || !response.roles || !Array.isArray(response.roles)) {
          return [];
        }
        return response.roles.map(item => this.mapResponseToDto(item));
      }),
      catchError(error => {
        console.error('Error fetching roles from CRM microservice:', error);
        return throwError(() => error);
      })
    );
  }

  findOneRole(id: string): Observable<RoleResponseDto> {
    const request: FindOneRoleRequest = { id };
    return this.roleGrpcService.findOneRole(request).pipe(
      map(response => this.mapResponseToDto(response))
    );
  }

  updateRole(id: string, updateRoleDto: UpdateRoleDto, currentUser: { id: string; name: string; email: string }): Observable<RoleResponseDto> {
    const request: UpdateRoleRequest = {
      id,
      ...this.mapUpdateDtoToRequest(updateRoleDto),
    };
    const metadata = this.createUserMetadata(currentUser);
    return this.roleGrpcService.updateRole(request, metadata).pipe(
      map(response => this.mapResponseToDto(response))
    );
  }

  remove(id: string): Observable<void> {
    const request: DeleteRoleRequest = { id };
    return this.roleGrpcService.deleteRole(request).pipe(
      map(() => undefined)
    );
  }

  bulkRemove(bulkDeleteDto: BulkDeleteDto): Observable<BulkDeleteResponseDto> {
    const request: BulkDeleteRequest = {
      ids: bulkDeleteDto.ids,
    };
    return this.roleGrpcService.bulkDeleteRoles(request).pipe(
      map(response => ({
        deletedCount: response.deletedCount,
        failedIds: response.failedIds || [],
      }))
    );
  }

  bulkUpdate(bulkUpdateDto: BulkUpdateRoleDto, currentUser: { id: string; name: string; email: string }): Observable<BulkUpdateResponseDto> {
    const request: BulkUpdateRequest = {
      ids: bulkUpdateDto.ids,
      update_fields: this.mapUpdateDtoToRequest(bulkUpdateDto.updateFields),
    };
    const metadata = this.createUserMetadata(currentUser);
    return this.roleGrpcService.bulkUpdateRoles(request, metadata).pipe(
      map(response => ({
        updatedCount: response.updatedCount,
        failedItems: response.failedItems || [],
      }))
    );
  }

  private createUserMetadata(user: { id: string; name: string; email: string }): Metadata {
    const metadata = new Metadata();
    metadata.add('user-id', user.id);
    metadata.add('user-name', user.name);
    metadata.add('user-email', user.email);
    return metadata;
  }

  private mapCreateDtoToRequest(dto: CreateRoleDto): CreateRoleRequest {
    return {
      name: dto.name,
      description: dto.description,
      parentId: dto.parentId || undefined,
      shareDataWithPeers: dto.shareDataWithPeers,
    };
  }

  private mapUpdateDtoToRequest(dto: UpdateRoleDto | Partial<UpdateRoleDto>): Partial<UpdateRoleRequest> {
    const request: Partial<UpdateRoleRequest> = {};

    if (dto.name !== undefined) request.name = dto.name;
    if (dto.description !== undefined) request.description = dto.description;
    if (dto.parentId !== undefined) request.parentId = dto.parentId || undefined;
    if (dto.shareDataWithPeers !== undefined) request.shareDataWithPeers = dto.shareDataWithPeers;

    return request;
  }

  private mapResponseToDto(response: RoleResponse): RoleResponseDto {
    return {
      id: response.id,
      name: response.name,
      description: response.description ?? null,
      parentId: response.parentId ?? null,
      parent: response.parent ? {
        id: response.parent.id,
        name: response.parent.name,
      } : null,
      shareDataWithPeers: response.shareDataWithPeers,
      createdById: response.createdById ?? null,
      createdBy: response.createdBy ? {
        id: response.createdBy.id,
        name: response.createdBy.name,
      } : null,
      createdAt: new Date(response.createdAt),
      children: response.children?.map(child => ({
        id: child.id,
        name: child.name,
      })),
    };
  }
}

