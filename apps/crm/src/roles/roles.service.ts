import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { User } from '../users/entities/user.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleResponseDto } from './dto/role-response.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkDeleteResponse } from './dto/bulk-delete-response.dto';
import { BulkUpdateRoleDto } from './dto/bulk-update.dto';
import { BulkUpdateResponse } from './dto/bulk-update-response.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  /**
   * Gets eligible user IDs based on role hierarchy and share_data_with_peers setting
   * Uses PostgreSQL CTE (Common Table Expression) to traverse the hierarchy
   */
  async getEligibleUserIds(userId: string): Promise<string[]> {
    // First, get the user with their role
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roleEntity'],
    });

    if (!user || !user.roleEntity) {
      // If user has no role, return only the user's own ID
      return [userId];
    }

    const userRole = user.roleEntity;
    const eligibleUserIds: string[] = [];

    if (userRole.shareDataWithPeers) {
      // If share_data_with_peers is true: get all users at the same role level AND their children
      // First, get users with the same role (peers)
      const peerUsers = await this.userRepository.find({
        where: { roleId: userRole.id },
        select: ['id'],
      });
      eligibleUserIds.push(...peerUsers.map((u) => u.id));

      // Then, get all child role IDs for each peer role (including this role)
      // Get children of the current role
      const childRoleIds = await this.getChildRoleIds(userRole.id);
      
      if (childRoleIds.length > 0) {
        const childUsers = await this.userRepository.find({
          where: { roleId: In(childRoleIds) },
          select: ['id'],
        });
        eligibleUserIds.push(...childUsers.map((u) => u.id));
      }
    } else {
      // If share_data_with_peers is false: get all users in child roles only (below this role)
      // Use CTE to traverse down the hierarchy
      const childRoleIds = await this.getChildRoleIds(userRole.id);
      
      if (childRoleIds.length > 0) {
        const childUsers = await this.userRepository.find({
          where: { roleId: In(childRoleIds) },
          select: ['id'],
        });
        eligibleUserIds.push(...childUsers.map((u) => u.id));
      }
      
      // Always include the current user
      eligibleUserIds.push(userId);
    }

    // Remove duplicates and return
    return Array.from(new Set(eligibleUserIds));
  }

  /**
   * Helper method to get all child role IDs using PostgreSQL CTE (WITH RECURSIVE)
   */
  private async getChildRoleIds(roleId: string): Promise<string[]> {
    const query = `
      WITH RECURSIVE role_hierarchy AS (
        -- Base case: start with the given role
        SELECT id, parent_id
        FROM roles
        WHERE parent_id = $1
        
        UNION ALL
        
        -- Recursive case: get children of children
        SELECT r.id, r.parent_id
        FROM roles r
        INNER JOIN role_hierarchy rh ON r.parent_id = rh.id
      )
      SELECT id FROM role_hierarchy;
    `;

    const result = await this.dataSource.query(query, [roleId]);
    return result.map((row: any) => row.id);
  }

  /**
   * Creates a new role
   */
  async create(createRoleDto: CreateRoleDto, currentUser: { id: string; name: string; email?: string }): Promise<RoleResponseDto> {
    // Check if role with same name already exists
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new ConflictException(`Role with name "${createRoleDto.name}" already exists`);
    }

    // Validate parent role if provided
    if (createRoleDto.parentId) {
      const parentRole = await this.roleRepository.findOne({
        where: { id: createRoleDto.parentId },
      });

      if (!parentRole) {
        throw new NotFoundException(`Parent role with ID ${createRoleDto.parentId} not found`);
      }
    }

    // Check if user exists in CRM database before setting createdById
    // In microservices architecture, user might exist in accounts service but not in CRM
    let createdById: string | null = null;
    if (currentUser.id) {
      const userExists = await this.userRepository.findOne({
        where: { id: currentUser.id },
      });
      if (userExists) {
        createdById = currentUser.id;
      }
    }

    const role = this.roleRepository.create({
      ...createRoleDto,
      createdById,
    });

    const savedRole = await this.roleRepository.save(role);
    
    // Fetch with relations to return full response
    const roleWithRelations = await this.roleRepository.findOne({
      where: { id: savedRole.id },
      relations: ['parent', 'createdBy'],
    });

    return this.transformRoleToResponse(roleWithRelations!);
  }

  /**
   * Gets all roles with nested hierarchy structure
   * Returns only root roles (parentId is null) with their children nested recursively
   */
  async findAll(): Promise<RoleResponseDto[]> {
    // Fetch all roles with parent and createdBy relations
    // We need all roles to build the complete tree structure
    const allRoles = await this.roleRepository.find({
      relations: ['parent', 'createdBy'],
      order: { name: 'ASC' },
    });

    // Build nested tree structure starting from root roles only
    return this.buildRoleTree(allRoles);
  }

  /**
   * Gets a single role by ID with nested children structure
   */
  async findOne(id: string): Promise<RoleResponseDto> {
    // Fetch all roles to build the full tree
    const allRoles = await this.roleRepository.find({
      relations: ['parent', 'children', 'createdBy'],
      order: { name: 'ASC' },
    });

    const role = allRoles.find(r => r.id === id);

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    // Build nested structure for this role and its children
    return this.buildSingleRoleTree(role, allRoles);
  }

  /**
   * Updates a role
   */
  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<RoleResponseDto> {
    const role = await this.roleRepository.preload({
      id,
      ...updateRoleDto,
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    // Validate parent role if provided
    if (updateRoleDto.parentId !== undefined) {
      if (updateRoleDto.parentId === null) {
        role.parentId = null;
      } else {
        const parentRole = await this.roleRepository.findOne({
          where: { id: updateRoleDto.parentId },
        });

        if (!parentRole) {
          throw new NotFoundException(`Parent role with ID ${updateRoleDto.parentId} not found`);
        }

        // Prevent circular reference (role cannot be its own parent)
        if (updateRoleDto.parentId === id) {
          throw new ConflictException('Role cannot be its own parent');
        }

        // Prevent setting a child as parent (check hierarchy)
        const childIds = await this.getChildRoleIds(id);
        if (childIds.includes(updateRoleDto.parentId)) {
          throw new ConflictException('Cannot set a child role as parent');
        }
      }
    }

    const savedRole = await this.roleRepository.save(role);
    
    // Fetch with relations to return full response
    const roleWithRelations = await this.roleRepository.findOne({
      where: { id: savedRole.id },
      relations: ['parent', 'createdBy'],
    });

    return this.transformRoleToResponse(roleWithRelations!);
  }

  /**
   * Deletes a role
   */
  async remove(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['children'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    // Check if role has users assigned
    const usersWithRole = await this.userRepository.count({
      where: { roleId: id },
    });

    if (usersWithRole > 0) {
      throw new ConflictException(
        `Cannot delete role "${role.name}" because it has ${usersWithRole} user(s) assigned`,
      );
    }

    // Check if role has children
    if (role.children && role.children.length > 0) {
      throw new ConflictException(
        `Cannot delete role "${role.name}" because it has ${role.children.length} child role(s)`,
      );
    }

    return this.roleRepository.remove(role);
  }

  /**
   * Bulk delete roles
   */
  async bulkRemove(bulkDeleteDto: BulkDeleteDto): Promise<BulkDeleteResponse> {
    const { ids } = bulkDeleteDto;
    const failedIds: Array<{ id: string; error: string }> = [];
    let deletedCount = 0;

    // Find all roles that exist
    const roles = await this.roleRepository.find({
      where: { id: In(ids) },
      relations: ['children'],
    });

    const foundIds = new Set(roles.map((r) => r.id));

    // Track which IDs were not found and validate each role
    for (const id of ids) {
      if (!foundIds.has(id)) {
        failedIds.push({ id, error: 'Role not found' });
        continue;
      }

      const role = roles.find((r) => r.id === id);
      if (!role) continue;

      // Check if role has users assigned
      const usersWithRole = await this.userRepository.count({
        where: { roleId: id },
      });

      if (usersWithRole > 0) {
        failedIds.push({
          id,
          error: `Cannot delete role "${role.name}" because it has ${usersWithRole} user(s) assigned`,
        });
        continue;
      }

      // Check if role has children
      if (role.children && role.children.length > 0) {
        failedIds.push({
          id,
          error: `Cannot delete role "${role.name}" because it has ${role.children.length} child role(s)`,
        });
        continue;
      }
    }

    // Delete only roles that passed validation
    const rolesToDelete = roles.filter(
      (role) =>
        !failedIds.some((f) => f.id === role.id) &&
        (!role.children || role.children.length === 0),
    );

    // Double-check no users assigned
    for (const role of rolesToDelete) {
      const usersWithRole = await this.userRepository.count({
        where: { roleId: role.id },
      });
      if (usersWithRole > 0) {
        const index = rolesToDelete.findIndex((r) => r.id === role.id);
        if (index !== -1) {
          rolesToDelete.splice(index, 1);
          failedIds.push({
            id: role.id,
            error: `Cannot delete role "${role.name}" because it has ${usersWithRole} user(s) assigned`,
          });
        }
      }
    }

    if (rolesToDelete.length > 0) {
      await this.roleRepository.remove(rolesToDelete);
      deletedCount = rolesToDelete.length;
    }

    return {
      deletedCount,
      ...(failedIds.length > 0 && { failedIds }),
    };
  }

  /**
   * Bulk update roles - applies the same update fields to multiple roles
   */
  async bulkUpdate(bulkUpdateDto: BulkUpdateRoleDto): Promise<BulkUpdateResponse> {
    const { ids, updateFields } = bulkUpdateDto;
    const failedItems: Array<{ id: string; error: string }> = [];
    let updatedCount = 0;

    // Find all roles that exist
    const roles = await this.roleRepository.find({
      where: { id: In(ids) },
    });

    const foundIds = new Set(roles.map((r) => r.id));

    // Track which IDs were not found
    for (const id of ids) {
      if (!foundIds.has(id)) {
        failedItems.push({ id, error: 'Role not found' });
      }
    }

    // Validate parent role if provided (before processing)
    if (updateFields.parentId !== undefined) {
      if (updateFields.parentId !== null) {
        const parentRole = await this.roleRepository.findOne({
          where: { id: updateFields.parentId },
        });

        if (!parentRole) {
          // If parent role is invalid, fail all updates
          return {
            updatedCount: 0,
            failedItems: ids.map((id) => ({
              id,
              error: `Parent role with ID ${updateFields.parentId} not found`,
            })),
          };
        }

        // Check if any role is trying to be its own parent
        for (const id of ids) {
          if (updateFields.parentId === id) {
            failedItems.push({ id, error: 'Role cannot be its own parent' });
          }
        }

        // Check if any role is trying to set a child as parent
        for (const id of ids) {
          const childIds = await this.getChildRoleIds(id);
          if (childIds.includes(updateFields.parentId)) {
            failedItems.push({
              id,
              error: 'Cannot set a child role as parent',
            });
          }
        }
      }
    }

    // Process each role
    for (const role of roles) {
      // Skip if already failed validation
      if (failedItems.some((f) => f.id === role.id)) {
        continue;
      }

      try {
        const updatedRole = await this.roleRepository.preload({
          id: role.id,
          ...updateFields,
        });

        if (!updatedRole) {
          failedItems.push({ id: role.id, error: 'Role not found' });
          continue;
        }

        await this.roleRepository.save(updatedRole);
        updatedCount++;
      } catch (error) {
        failedItems.push({
          id: role.id,
          error: error.message || 'Failed to update role',
        });
      }
    }

    return {
      updatedCount,
      ...(failedItems.length > 0 && { failedItems }),
    };
  }

  /**
   * Transforms a Role entity to RoleResponseDto
   */
  private transformRoleToResponse(role: Role): RoleResponseDto {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      parentId: role.parentId,
      parent: role.parent
        ? {
            id: role.parent.id,
            name: role.parent.name,
          }
        : null,
      shareDataWithPeers: role.shareDataWithPeers,
      createdById: role.createdById,
      createdBy: role.createdBy
        ? {
            id: role.createdBy.id,
            name: role.createdBy.name,
          }
        : null,
      createdAt: role.createdAt,
    };
  }

  /**
   * Builds a nested tree structure from a flat list of roles
   * Returns only root roles (parentId is null) with their children nested recursively
   */
  private buildRoleTree(allRoles: Role[]): RoleResponseDto[] {
    // Filter to get only root roles (parentId is null)
    const rootRoles = allRoles.filter((role) => !role.parentId);

    // Build tree for each root role
    return rootRoles.map((rootRole) => this.buildSingleRoleTree(rootRole, allRoles));
  }

  /**
   * Builds nested structure for a single role and its children recursively
   */
  private buildSingleRoleTree(role: Role, allRoles: Role[]): RoleResponseDto {
    const roleResponse = this.transformRoleToResponse(role);

    // Find all direct children of this role
    const directChildren = allRoles.filter(
      (r) => r.parentId === role.id,
    );

    // Recursively build children tree
    if (directChildren.length > 0) {
      roleResponse.children = directChildren.map((child) =>
        this.buildSingleRoleTree(child, allRoles),
      );
    }

    return roleResponse;
  }
}

