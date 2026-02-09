import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ProfilesService } from '../profiles/profiles.service';
import { UserCreatedEvent } from '@app/common/events/user-created.event';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly profilesService: ProfilesService,
  ) {}

  /**
   * Creates a user from a UserCreatedEvent
   * This method is called when a user is registered in the Accounts service
   * It creates a corresponding user record in the CRM database with a default profile
   */
  async createUserFromEvent(event: UserCreatedEvent): Promise<void> {
    try {
      // Check if user already exists (idempotency check)
      const existingUser = await this.userRepository.findOne({
        where: [{ id: event.id }, { workId: event.workId }],
      });

      if (existingUser) {
        this.logger.log(`User with id ${event.id} or workId ${event.workId} already exists. Skipping creation.`);
        return;
      }

      // Get or create default profile
      const defaultProfile = await this.getOrCreateDefaultProfile();
      const userData: DeepPartial<User> = {
        id: event.id,
        workId: event.workId,
        email: event.email ?? undefined,
        name: event.name,
        department: event.department,
        role: event.role,
        roleId: null,
        profileId: defaultProfile.id,
      // Create user entity
      };
      const user = this.userRepository.create(userData);

      // Save user to database
      await this.userRepository.save(user);
      this.logger.log(`User created from event: ${event.id} (${event.email}) with profile: ${defaultProfile.name}`);
    } catch (error) {
      this.logger.error(`Failed to create user from event for user ${event.id}:`, error);
      throw error;
    }
  }

  /**
   * Gets or creates a default profile for new users
   * If a "Default" profile exists, it returns that profile
   * Otherwise, it creates a new "Default" profile with basic permissions
   */
  private async getOrCreateDefaultProfile(): Promise<{ id: string; name: string }> {
    try {
      // Try to find existing default profile
      const existingProfile = await this.profilesService.findOneByName('Default');

      if (existingProfile) {
        return { id: existingProfile.id, name: existingProfile.name };
      }

      this.logger.log('Default profile not found. Creating new default profile...');
      
      // Create default profile with basic permissions
      const defaultPermissions = {
        leads: { create: true, read: true, update: true, delete: false },
        contacts: { create: true, read: true, update: true, delete: false },
        deals: { create: true, read: true, update: true, delete: false },
        accounts: { create: true, read: true, update: true, delete: false },
      };

      const newProfile = await this.profilesService.create(
        {
          name: 'Default',
          description: 'Default profile for new users with basic permissions',
          permissions: defaultPermissions,
        },
        {
          id: 'system',
          name: 'System',
          email: 'system@example.com',
        },
      );
      
      this.logger.log('Default profile created successfully');
      return { id: newProfile.id, name: newProfile.name };
    } catch (error) {
      this.logger.error('Failed to get or create default profile:', error);
      throw error;
    }
  }
}
