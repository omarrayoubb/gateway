import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationPaginationDto } from './dto/pagination.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    try {
      // Validate required fields
      if (!createOrganizationDto.organization_code) {
        throw new BadRequestException('organization_code is required');
      }
      if (!createOrganizationDto.organization_name) {
        throw new BadRequestException('organization_name is required');
      }

      const existingOrganization = await this.organizationRepository.findOneBy({
        organizationCode: createOrganizationDto.organization_code,
      });

      if (existingOrganization) {
        throw new ConflictException(`Organization with code ${createOrganizationDto.organization_code} already exists`);
      }

      const organization = this.organizationRepository.create({
        organizationCode: createOrganizationDto.organization_code,
        organizationName: createOrganizationDto.organization_name,
        description: createOrganizationDto.description || null,
        address: createOrganizationDto.address || null,
        city: createOrganizationDto.city || null,
        state: createOrganizationDto.state || null,
        zipCode: createOrganizationDto.zip_code || null,
        country: createOrganizationDto.country || null,
        phone: createOrganizationDto.phone || null,
        email: createOrganizationDto.email || null,
        website: createOrganizationDto.website || null,
        currency: createOrganizationDto.currency || 'USD',
        timezone: createOrganizationDto.timezone || null,
        isActive: createOrganizationDto.is_active !== undefined ? createOrganizationDto.is_active : true,
      });

      const savedOrganization = await this.organizationRepository.save(organization);
      return await this.findOne(savedOrganization.id);
    } catch (error) {
      console.error('Error in OrganizationsService.create:', error);
      throw error;
    }
  }

  async findAll(paginationQuery: OrganizationPaginationDto): Promise<Organization[]> {
    try {
      const { limit = 100, sort, filter } = paginationQuery;

      const queryBuilder = this.organizationRepository
        .createQueryBuilder('organization');

      // Handle filter
      if (filter) {
        try {
          const filterObj = typeof filter === 'string' ? JSON.parse(filter) : filter;
          
          if (filterObj.is_active !== undefined) {
            queryBuilder.where('organization.isActive = :isActive', { isActive: filterObj.is_active });
          }
          
          if (filterObj.search) {
            const whereCondition = filterObj.is_active !== undefined ? 'andWhere' : 'where';
            queryBuilder[whereCondition](
              '(organization.organizationCode ILIKE :search OR organization.organizationName ILIKE :search OR organization.description ILIKE :search)',
              { search: `%${filterObj.search}%` }
            );
          }
        } catch (e) {
          // If filter is not JSON, treat it as a simple search
          queryBuilder.where(
            '(organization.organizationCode ILIKE :search OR organization.organizationName ILIKE :search OR organization.description ILIKE :search)',
            { search: `%${filter}%` }
          );
        }
      }

      // Handle sort
      if (sort) {
        let sortField = sort;
        let sortOrder: 'ASC' | 'DESC' = 'ASC';
        
        if (sortField.startsWith('-')) {
          sortField = sortField.substring(1);
          sortOrder = 'DESC';
        } else if (sortField.includes(':')) {
          const [field, order] = sortField.split(':');
          sortField = field;
          sortOrder = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        }
        
        if (sortField && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(sortField)) {
          try {
            queryBuilder.orderBy(`organization.${sortField}`, sortOrder);
          } catch (error) {
            queryBuilder.orderBy('organization.createdDate', 'DESC');
          }
        } else {
          queryBuilder.orderBy('organization.createdDate', 'DESC');
        }
      } else {
        queryBuilder.orderBy('organization.createdDate', 'DESC');
      }

      if (limit) {
        queryBuilder.take(limit);
      }

      const data = await queryBuilder.getMany();

      return data || [];
    } catch (error) {
      console.error('Error in OrganizationsService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
    });
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    return organization;
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto): Promise<Organization> {
    const organization = await this.findOne(id);

    if (updateOrganizationDto.organization_code && updateOrganizationDto.organization_code !== organization.organizationCode) {
      const existingOrganization = await this.organizationRepository.findOne({
        where: { organizationCode: updateOrganizationDto.organization_code },
      });
      if (existingOrganization && existingOrganization.id !== id) {
        throw new ConflictException(`Organization with code ${updateOrganizationDto.organization_code} already exists`);
      }
    }

    Object.assign(organization, {
      organizationCode: updateOrganizationDto.organization_code !== undefined ? updateOrganizationDto.organization_code : organization.organizationCode,
      organizationName: updateOrganizationDto.organization_name !== undefined ? updateOrganizationDto.organization_name : organization.organizationName,
      description: updateOrganizationDto.description !== undefined ? updateOrganizationDto.description : organization.description,
      address: updateOrganizationDto.address !== undefined ? updateOrganizationDto.address : organization.address,
      city: updateOrganizationDto.city !== undefined ? updateOrganizationDto.city : organization.city,
      state: updateOrganizationDto.state !== undefined ? updateOrganizationDto.state : organization.state,
      zipCode: updateOrganizationDto.zip_code !== undefined ? updateOrganizationDto.zip_code : organization.zipCode,
      country: updateOrganizationDto.country !== undefined ? updateOrganizationDto.country : organization.country,
      phone: updateOrganizationDto.phone !== undefined ? updateOrganizationDto.phone : organization.phone,
      email: updateOrganizationDto.email !== undefined ? updateOrganizationDto.email : organization.email,
      website: updateOrganizationDto.website !== undefined ? updateOrganizationDto.website : organization.website,
      currency: updateOrganizationDto.currency !== undefined ? updateOrganizationDto.currency : organization.currency,
      timezone: updateOrganizationDto.timezone !== undefined ? updateOrganizationDto.timezone : organization.timezone,
      isActive: updateOrganizationDto.is_active !== undefined ? updateOrganizationDto.is_active : organization.isActive,
    });

    await this.organizationRepository.save(organization);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const organization = await this.findOne(id);
    await this.organizationRepository.remove(organization);
  }
}

