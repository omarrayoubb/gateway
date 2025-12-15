import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkDeleteResponse } from './dto/bulk-delete-response.dto';
import { BulkUpdateProfileDto } from './dto/bulk-update.dto';
import { BulkUpdateResponse } from './dto/bulk-update-response.dto';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
  ) {}

  async create(createProfileDto: CreateProfileDto): Promise<Profile> {
    // Check if profile with same name already exists
    const existingProfile = await this.profileRepository.findOne({
      where: { name: createProfileDto.name },
    });

    if (existingProfile) {
      throw new ConflictException(`Profile with name "${createProfileDto.name}" already exists`);
    }

    const profile = this.profileRepository.create(createProfileDto);
    return this.profileRepository.save(profile);
  }

  async findAll(): Promise<Profile[]> {
    return this.profileRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { id },
    });

    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }

    return profile;
  }

  async findOneByName(name: string): Promise<Profile | null> {
    return this.profileRepository.findOne({
      where: { name },
    });
  }

  async update(id: string, updateProfileDto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.findOne(id);

    // If name is being updated, check for conflicts
    if (updateProfileDto.name && updateProfileDto.name !== profile.name) {
      const existingProfile = await this.profileRepository.findOne({
        where: { name: updateProfileDto.name },
      });

      if (existingProfile) {
        throw new ConflictException(`Profile with name "${updateProfileDto.name}" already exists`);
      }
    }

    Object.assign(profile, updateProfileDto);
    return this.profileRepository.save(profile);
  }

  async remove(id: string): Promise<void> {
    const profile = await this.findOne(id);
    
    // Prevent deletion of Administrator profile
    if (profile.name === 'Administrator') {
      throw new ConflictException('Cannot delete the Administrator profile');
    }

    await this.profileRepository.remove(profile);
  }

  /**
   * Bulk delete profiles
   */
  async bulkRemove(bulkDeleteDto: BulkDeleteDto): Promise<BulkDeleteResponse> {
    const { ids } = bulkDeleteDto;
    const failedIds: Array<{ id: string; error: string }> = [];
    let deletedCount = 0;

    // Find all profiles that exist
    const profiles = await this.profileRepository.find({
      where: { id: In(ids) },
    });

    const foundIds = new Set(profiles.map((p) => p.id));

    // Track which IDs were not found and validate each profile
    for (const id of ids) {
      if (!foundIds.has(id)) {
        failedIds.push({ id, error: 'Profile not found' });
        continue;
      }

      const profile = profiles.find((p) => p.id === id);
      if (!profile) continue;

      // Prevent deletion of Administrator profile
      if (profile.name === 'Administrator') {
        failedIds.push({
          id,
          error: 'Cannot delete the Administrator profile',
        });
        continue;
      }
    }

    // Delete only profiles that passed validation
    const profilesToDelete = profiles.filter(
      (profile) =>
        !failedIds.some((f) => f.id === profile.id) &&
        profile.name !== 'Administrator',
    );

    if (profilesToDelete.length > 0) {
      await this.profileRepository.remove(profilesToDelete);
      deletedCount = profilesToDelete.length;
    }

    return {
      deletedCount,
      ...(failedIds.length > 0 && { failedIds }),
    };
  }

  /**
   * Bulk update profiles - applies the same update fields to multiple profiles
   */
  async bulkUpdate(bulkUpdateDto: BulkUpdateProfileDto): Promise<BulkUpdateResponse> {
    const { ids, updateFields } = bulkUpdateDto;
    const failedItems: Array<{ id: string; error: string }> = [];
    let updatedCount = 0;

    // Find all profiles that exist
    const profiles = await this.profileRepository.find({
      where: { id: In(ids) },
    });

    const foundIds = new Set(profiles.map((p) => p.id));

    // Track which IDs were not found
    for (const id of ids) {
      if (!foundIds.has(id)) {
        failedItems.push({ id, error: 'Profile not found' });
      }
    }

    // If name is being updated, check for conflicts before processing
    if (updateFields.name) {
      const existingProfile = await this.profileRepository.findOne({
        where: { name: updateFields.name },
      });

      if (existingProfile) {
        // If the name conflicts with an existing profile (and it's not one of the profiles being updated)
        if (!ids.includes(existingProfile.id)) {
          // Name conflict - fail all updates
          return {
            updatedCount: 0,
            failedItems: ids.map((id) => ({
              id,
              error: `Profile with name "${updateFields.name}" already exists`,
            })),
          };
        } else {
          // The name belongs to one of the profiles being updated, check if we're updating multiple profiles
          if (ids.length > 1) {
            // Cannot update multiple profiles to the same name
            return {
              updatedCount: 0,
              failedItems: ids.map((id) => ({
                id,
                error: 'Cannot update multiple profiles to the same name',
              })),
            };
          }
        }
      }
    }

    // Process each profile
    for (const profile of profiles) {
      // Skip if already failed validation
      if (failedItems.some((f) => f.id === profile.id)) {
        continue;
      }

      try {
        // If name is being updated and it's different from current name, check for conflicts
        if (updateFields.name && updateFields.name !== profile.name) {
          const existingProfile = await this.profileRepository.findOne({
            where: { name: updateFields.name },
          });

          if (existingProfile && existingProfile.id !== profile.id) {
            failedItems.push({
              id: profile.id,
              error: `Profile with name "${updateFields.name}" already exists`,
            });
            continue;
          }
        }

        Object.assign(profile, updateFields);
        await this.profileRepository.save(profile);
        updatedCount++;
      } catch (error) {
        failedItems.push({
          id: profile.id,
          error: error.message || 'Failed to update profile',
        });
      }
    }

    return {
      updatedCount,
      ...(failedItems.length > 0 && { failedItems }),
    };
  }
}

