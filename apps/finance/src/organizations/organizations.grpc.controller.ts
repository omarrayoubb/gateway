import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Controller()
export class OrganizationsGrpcController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @GrpcMethod('OrganizationsService', 'GetOrganization')
  async getOrganization(data: { id: string }) {
    try {
      const organization = await this.organizationsService.findOne(data.id);
      return this.mapOrganizationToProto(organization);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get organization',
      });
    }
  }

  @GrpcMethod('OrganizationsService', 'GetOrganizations')
  async getOrganizations(data: {
    limit?: number;
    sort?: string;
    filter?: string;
  }) {
    try {
      const organizations = await this.organizationsService.findAll({
        limit: data.limit,
        sort: data.sort,
        filter: data.filter,
      });

      return {
        organizations: organizations.map(org => this.mapOrganizationToProto(org)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get organizations',
      });
    }
  }

  @GrpcMethod('OrganizationsService', 'CreateOrganization')
  async createOrganization(data: any) {
    try {
      const createDto: CreateOrganizationDto = {
        organization_code: data.organizationCode || data.organization_code,
        organization_name: data.organizationName || data.organization_name,
        description: data.description || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        zip_code: data.zipCode || data.zip_code || undefined,
        country: data.country || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        website: data.website || undefined,
        currency: data.currency || 'USD',
        timezone: data.timezone || undefined,
        is_active: data.isActive !== undefined ? data.isActive : (data.is_active !== undefined ? data.is_active : true),
      };

      const organization = await this.organizationsService.create(createDto);
      return this.mapOrganizationToProto(organization);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create organization',
      });
    }
  }

  @GrpcMethod('OrganizationsService', 'UpdateOrganization')
  async updateOrganization(data: any) {
    try {
      const updateDto: UpdateOrganizationDto = {
        organization_code: data.organizationCode || data.organization_code,
        organization_name: data.organizationName || data.organization_name,
        description: data.description,
        address: data.address,
        city: data.city,
        state: data.state,
        zip_code: data.zipCode || data.zip_code,
        country: data.country,
        phone: data.phone,
        email: data.email,
        website: data.website,
        currency: data.currency,
        timezone: data.timezone,
        is_active: data.isActive !== undefined ? data.isActive : data.is_active,
      };

      const organization = await this.organizationsService.update(data.id, updateDto);
      return this.mapOrganizationToProto(organization);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update organization',
      });
    }
  }

  @GrpcMethod('OrganizationsService', 'DeleteOrganization')
  async deleteOrganization(data: { id: string }) {
    try {
      await this.organizationsService.remove(data.id);
      return { success: true };
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to delete organization',
      });
    }
  }

  private mapOrganizationToProto(organization: any): any {
    return {
      id: organization.id,
      organizationCode: organization.organizationCode,
      organizationName: organization.organizationName,
      description: organization.description || '',
      address: organization.address || '',
      city: organization.city || '',
      state: organization.state || '',
      zipCode: organization.zipCode || '',
      country: organization.country || '',
      phone: organization.phone || '',
      email: organization.email || '',
      website: organization.website || '',
      currency: organization.currency || 'USD',
      timezone: organization.timezone || '',
      isActive: organization.isActive !== undefined ? organization.isActive : true,
      createdDate: organization.createdDate?.toISOString() || organization.createdAt?.toISOString() || '',
      updatedAt: organization.updatedAt?.toISOString() || '',
    };
  }
}

