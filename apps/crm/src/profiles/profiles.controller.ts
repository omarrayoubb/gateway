import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { ProfilesService } from './profiles.service';
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

@Controller()
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @GrpcMethod('ProfileService', 'CreateProfile')
  async createProfile(
    data: CreateProfileRequest,
    metadata: Metadata,
  ): Promise<ProfileResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const createProfileDto = this.mapCreateRequestToDto(data);
      const result = await this.profilesService.create(createProfileDto, currentUser);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error('Error in CRM ProfilesController.createProfile:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred',
      });
    }
  }

  @GrpcMethod('ProfileService', 'FindAllProfiles')
  async findAllProfiles(data: PaginationRequest): Promise<PaginatedProfilesResponse> {
    try {
      const page = data.page && typeof data.page === 'number' ? data.page : Number(data.page) || 1;
      const limit = data.limit && typeof data.limit === 'number' ? data.limit : Number(data.limit) || 10;
      
      const paginationDto: PaginationQueryDto = {
        page: Math.max(1, page),
        limit: Math.max(1, Math.min(100, limit)),
      };
      const result = await this.profilesService.findAll(paginationDto);
      
      if (!result || !result.data || !Array.isArray(result.data)) {
        console.error('Invalid result from ProfilesService.findAll:', result);
        return {
          data: [],
          total: result?.total || 0,
          page: result?.page || page,
          lastPage: result?.lastPage || 0,
        };
      }
      
      return {
        data: result.data.map(profile => this.mapResponseDtoToProto(profile)),
        total: result.total || 0,
        page: result.page || page,
        lastPage: result.lastPage || 0,
      };
    } catch (error) {
      console.error('Error in findAllProfiles:', error);
      throw new RpcException({
        code: 13,
        message: `Failed to fetch profiles: ${error.message}`,
      });
    }
  }

  @GrpcMethod('ProfileService', 'FindOneProfile')
  async findOneProfile(data: FindOneProfileRequest): Promise<ProfileResponse> {
    try {
      const result = await this.profilesService.findOne(data.id);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(`Error in CRM ProfilesController.findOneProfile for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || `An unknown error occurred during findOneProfile for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('ProfileService', 'UpdateProfile')
  async updateProfile(
    data: UpdateProfileRequest,
    metadata: Metadata,
  ): Promise<ProfileResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const updateProfileDto = this.mapUpdateRequestToDto(data);
      const result = await this.profilesService.update(data.id, updateProfileDto, currentUser);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(`Error in CRM ProfilesController.updateProfile for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || `An unknown error occurred during updateProfile for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('ProfileService', 'DeleteProfile')
  async deleteProfile(data: DeleteProfileRequest): Promise<DeleteProfileResponse> {
    try {
      await this.profilesService.remove(data.id);
      return { success: true };
    } catch (error) {
      console.error(`Error in CRM ProfilesController.deleteProfile for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || `An unknown error occurred during deleteProfile for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('ProfileService', 'BulkDeleteProfiles')
  async bulkDeleteProfiles(data: BulkDeleteRequest): Promise<BulkDeleteResponse> {
    try {
      const bulkDeleteDto: BulkDeleteDto = { ids: data.ids };
      const result = await this.profilesService.bulkRemove(bulkDeleteDto);
      return {
        deleted_count: result.deletedCount,
        failed_ids: result.failedIds || [],
      };
    } catch (error) {
      console.error('Error in CRM ProfilesController.bulkDeleteProfiles:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred during bulkDeleteProfiles',
      });
    }
  }

  @GrpcMethod('ProfileService', 'BulkUpdateProfiles')
  async bulkUpdateProfiles(
    data: BulkUpdateRequest,
    metadata: Metadata,
  ): Promise<BulkUpdateResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const bulkUpdateDto: BulkUpdateProfileDto = {
        ids: data.ids,
        updateFields: this.mapUpdateFieldsToDto(data.update_fields),
      };
      const result = await this.profilesService.bulkUpdate(bulkUpdateDto, currentUser);
      return {
        updated_count: result.updatedCount,
        failed_items: result.failedItems || [],
      };
    } catch (error) {
      console.error('Error in CRM ProfilesController.bulkUpdateProfiles:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred during bulkUpdateProfiles',
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

  private mapCreateRequestToDto(data: CreateProfileRequest): CreateProfileDto {
    if (!data.name) {
      throw new RpcException({
        code: 3,
        message: 'Required field missing: name is required',
      });
    }

    return {
      name: data.name,
      description: data.description,
      permissions: data.permissions || {},
    };
  }

  private mapUpdateRequestToDto(data: UpdateProfileRequest): UpdateProfileDto {
    const dto: UpdateProfileDto = {};

    if (data.name !== undefined) dto.name = data.name;
    if (data.description !== undefined) dto.description = data.description;
    if (data.permissions !== undefined) dto.permissions = data.permissions;

    return dto;
  }

  private mapUpdateFieldsToDto(fields: any): UpdateProfileDto {
    const dto: UpdateProfileDto = {};

    if (fields.name !== undefined) dto.name = fields.name;
    if (fields.description !== undefined) dto.description = fields.description;
    if (fields.permissions !== undefined) dto.permissions = fields.permissions;

    return dto;
  }

  private mapResponseDtoToProto(dto: any): ProfileResponse {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description ?? undefined,
      permissions: dto.permissions || {},
      created_at: dto.createdAt?.toISOString() || new Date().toISOString(),
      updated_at: dto.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }
}
