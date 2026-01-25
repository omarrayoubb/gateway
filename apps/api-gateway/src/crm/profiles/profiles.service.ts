import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Metadata } from '@grpc/grpc-js';
import type {
  CreateProfileRequest,
  UpdateProfileRequest,
  PaginationRequest,
  FindOneProfileRequest,
  DeleteProfileRequest,
  BulkDeleteRequest,
  BulkUpdateRequest,
  ProfileResponse,
  PaginatedProfilesResponse,
  DeleteProfileResponse,
  BulkDeleteResponse,
  BulkUpdateResponse,
} from '@app/common/types/profiles';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PaginationQueryDto } from '../leads/dto/pagination.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkUpdateProfileDto } from './dto/bulk-update.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { BulkDeleteResponse as BulkDeleteResponseDto } from './dto/bulk-delete-response.dto';
import { BulkUpdateResponse as BulkUpdateResponseDto } from './dto/bulk-update-response.dto';

interface ProfileGrpcService {
  createProfile(data: CreateProfileRequest, metadata?: Metadata): Observable<ProfileResponse>;
  findAllProfiles(data: PaginationRequest): Observable<PaginatedProfilesResponse>;
  findOneProfile(data: FindOneProfileRequest): Observable<ProfileResponse>;
  updateProfile(data: UpdateProfileRequest, metadata?: Metadata): Observable<ProfileResponse>;
  deleteProfile(data: DeleteProfileRequest): Observable<DeleteProfileResponse>;
  bulkDeleteProfiles(data: BulkDeleteRequest): Observable<BulkDeleteResponse>;
  bulkUpdateProfiles(data: BulkUpdateRequest, metadata?: Metadata): Observable<BulkUpdateResponse>;
}

export interface PaginatedProfilesResult {
  data: ProfileResponseDto[];
  total: number;
  page: number;
  last_page: number;
}

@Injectable()
export class ProfilesService implements OnModuleInit {
  private profileGrpcService: ProfileGrpcService;

  constructor(@Inject('CRM_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.profileGrpcService = this.client.getService<ProfileGrpcService>('ProfileService');
  }

  createProfile(createProfileDto: CreateProfileDto, currentUser: { id: string; name: string; email: string }): Observable<ProfileResponseDto> {
    const request: CreateProfileRequest = this.mapCreateDtoToRequest(createProfileDto);
    const metadata = this.createUserMetadata(currentUser);
    return this.profileGrpcService.createProfile(request, metadata).pipe(
      map(response => this.mapResponseToDto(response)),
    );
  }

  findAllProfiles(paginationQuery: PaginationQueryDto): Observable<PaginatedProfilesResult> {
    const page = typeof paginationQuery.page === 'number' ? paginationQuery.page : Number(paginationQuery.page) || 1;
    const limit = typeof paginationQuery.limit === 'number' ? paginationQuery.limit : Number(paginationQuery.limit) || 10;
    
    const request: PaginationRequest = {
      page: Math.max(1, Math.floor(page)),
      limit: Math.max(1, Math.min(100, Math.floor(limit))),
    };
    return this.profileGrpcService.findAllProfiles(request).pipe(
      map(response => {
        if (!response) {
          throw new Error('Empty response from CRM microservice');
        }
        if (!response.data || !Array.isArray(response.data)) {
          console.error('Invalid response structure from CRM:', JSON.stringify(response, null, 2));
          return {
            data: [],
            total: response.total || 0,
            page: response.page || page,
            last_page: response.lastPage || 0,
          };
        }
        return {
          data: response.data.map(item => this.mapResponseToDto(item)),
          total: response.total || 0,
          page: response.page || page,
          last_page: response.lastPage || 0,
        };
      }),
    );
  }

  findOneProfile(id: string): Observable<ProfileResponseDto> {
    const request: FindOneProfileRequest = { id };
    return this.profileGrpcService.findOneProfile(request).pipe(
      map(response => this.mapResponseToDto(response))
    );
  }

  updateProfile(id: string, updateProfileDto: UpdateProfileDto, currentUser: { id: string; name: string; email: string }): Observable<ProfileResponseDto> {
    const request: UpdateProfileRequest = {
      id,
      ...this.mapUpdateDtoToRequest(updateProfileDto),
    };
    const metadata = this.createUserMetadata(currentUser);
    return this.profileGrpcService.updateProfile(request, metadata).pipe(
      map(response => this.mapResponseToDto(response))
    );
  }

  remove(id: string): Observable<void> {
    const request: DeleteProfileRequest = { id };
    return this.profileGrpcService.deleteProfile(request).pipe(
      map(() => undefined)
    );
  }

  bulkRemove(bulkDeleteDto: BulkDeleteDto): Observable<BulkDeleteResponseDto> {
    const request: BulkDeleteRequest = {
      ids: bulkDeleteDto.ids,
    };
    return this.profileGrpcService.bulkDeleteProfiles(request).pipe(
      map(response => ({
        deletedCount: response.deleted_count,
        failedIds: response.failed_ids || [],
      }))
    );
  }

  bulkUpdate(bulkUpdateDto: BulkUpdateProfileDto, currentUser: { id: string; name: string; email: string }): Observable<BulkUpdateResponseDto> {
    const request: BulkUpdateRequest = {
      ids: bulkUpdateDto.ids,
      update_fields: this.mapUpdateDtoToRequest(bulkUpdateDto.updateFields),
    };
    const metadata = this.createUserMetadata(currentUser);
    return this.profileGrpcService.bulkUpdateProfiles(request, metadata).pipe(
      map(response => ({
        updatedCount: response.updated_count,
        failedItems: response.failed_items || [],
      }))
    );
  }

  private createUserMetadata(user: { id: string; name: string; email: string }): Metadata {
    // Handle undefined user
    const safeUser = user || { id: 'system', name: 'System User', email: 'system@example.com' };
    const metadata = new Metadata();
    metadata.add('user-id', safeUser.id);
    metadata.add('user-name', safeUser.name);
    metadata.add('user-email', safeUser.email);
    return metadata;
  }

  private mapCreateDtoToRequest(dto: CreateProfileDto): CreateProfileRequest {
    return {
      name: dto.name,
      description: dto.description,
      permissions: dto.permissions || {},
    };
  }

  private mapUpdateDtoToRequest(dto: UpdateProfileDto | Partial<UpdateProfileDto>): Partial<UpdateProfileRequest> {
    const request: Partial<UpdateProfileRequest> = {};

    if (dto.name !== undefined) request.name = dto.name;
    if (dto.description !== undefined) request.description = dto.description;
    if (dto.permissions !== undefined) request.permissions = dto.permissions;

    return request;
  }

  private mapResponseToDto(response: ProfileResponse): ProfileResponseDto {
    return {
      id: response.id,
      name: response.name,
      description: response.description ?? null,
      permissions: response.permissions || {},
      createdAt: new Date(response.created_at),
      updatedAt: new Date(response.updated_at),
    };
  }
}
