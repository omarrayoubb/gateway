import { Injectable, Inject, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  ValidateRequest,
  ValidateResponse,
  GetProfileRequest,
  GetProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  GetUsersRequest,
  GetUsersResponse,
} from '@app/common/types/auth';
import { UserCreatedEvent } from '@app/common/events/user-created.event';
import { User } from './users.entity';

@Injectable()
export class AccountsService implements OnModuleInit, OnModuleDestroy {
  private readonly saltRounds = 10;
  private readonly logger = new Logger(AccountsService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @Inject('RABBITMQ_SERVICE')
    private readonly rabbitmqClient: ClientProxy,
  ) { }

  async onModuleInit() {
    // Connect RabbitMQ client on module initialization
    try {
      await this.rabbitmqClient.connect();
      this.logger.log('RabbitMQ client connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect RabbitMQ client:', error);
    }
  }

  async onModuleDestroy() {
    // Close RabbitMQ connection on module destroy
    await this.rabbitmqClient.close();
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: [{ email: data.email }, { workId: data.workId }],
      });

      if (existingUser) {
        return {
          status: 400,
          error: ['User with this email or work ID already exists'],
          email: data.email,
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, this.saltRounds);

      // Create new user
      const user = this.userRepository.create({
        workId: data.workId,
        name: data.name,
        email: data.email,
        workLocation: data.workLocation,
        role: data.role,
        password: hashedPassword,
        timezone: data.timezone,
        department: data.department,
        deptManager: data.deptManager,
        birthday: data.birthday ? new Date(data.birthday) : null,
      });

      // Save to database
      await this.userRepository.save(user);

      // Publish UserCreatedEvent to RabbitMQ
      try {
        const event: UserCreatedEvent = {
          id: user.id,
          workId: user.workId,
          email: user.email,
          name: user.name,
          role: user.role || '',
          department: user.department || '',
        };
        this.logger.log(`Attempting to publish UserCreatedEvent for user ${user.id}`);
        
        // Use firstValueFrom to ensure we wait for the emit to complete
        this.rabbitmqClient.emit('user.created', event).subscribe({
          next: () => {
            this.logger.log(`✓ UserCreatedEvent published successfully for user ${user.id} (${user.email})`);
          },
          error: (error) => {
            this.logger.error(`✗ Failed to publish UserCreatedEvent for user ${user.id}:`, error);
          },
          complete: () => {
            this.logger.debug(`UserCreatedEvent emit completed for user ${user.id}`);
          },
        });
      } catch (error) {
        // Log error but don't fail registration if event publish fails
        this.logger.error(`Error publishing UserCreatedEvent for user ${user.id}:`, error);
      }

      return {
        status: 201,
        error: [],
        email: user.email,
      };
    } catch (error) {
      return {
        status: 500,
        error: [`Failed to register user: ${error.message}`],
        email: data.email,
      };
    }
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      // Find user with password field
      const user = await this.userRepository.findOne({
        where: { email: data.email },
        select: ['id', 'email', 'password', 'name', 'role'],
      });

      if (!user) {
        return {
          status: 401,
          error: ['Invalid email or password'],
          accessToken: '',
          userData: null,
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(data.password, user.password);
      if (!isPasswordValid) {
        return {
          status: 401,
          error: ['Invalid email or password'],
          accessToken: '',
          userData: null,
        };
      }

      // Generate JWT token
      const payload = {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
      const accessToken = this.jwtService.sign(payload);

      return {
        status: 200,
        error: [],
        accessToken,
        userData: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    } catch (error) {
      return {
        status: 500,
        error: [`Login failed: ${error.message}`],
        accessToken: '',
        userData: null,
      };
    }
  }

  async validate(data: ValidateRequest): Promise<ValidateResponse> {
    try {
      const decoded = this.jwtService.verify(data.token);

      // Optionally verify user still exists
      const user = await this.userRepository.findOne({
        where: { id: decoded.sub },
      });

      if (!user) {
        return {
          valid: false,
          user: null,
        };
      }

      return {
        valid: true,
        user: {
          id: decoded.sub,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
        },
      };
    } catch (error) {
      return {
        valid: false,
        user: null,
      };
    }
  }

  async getProfile(data: GetProfileRequest): Promise<GetProfileResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: data.userId },
      });

      if (!user) {
        return {
          status: 404,
          error: ['User not found'],
          profile: null,
        };
      }

      return {
        status: 200,
        error: [],
        profile: {
          id: user.id,
          workId: user.workId,
          name: user.name,
          email: user.email,
          workLocation: user.workLocation,
          role: user.role || '',
          timezone: user.timezone || '',
          department: user.department || '',
          deptManager: user.deptManager || '',
          birthday: user.birthday?.toString() || '',
          dateJoined: user.dateJoined.toISOString(),
        },
      };
    } catch (error) {
      return {
        status: 500,
        error: [`Failed to fetch profile: ${error.message}`],
        profile: null,
      };
    }
  }

  async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    try {
      // Find user
      const user = await this.userRepository.findOne({
        where: { id: data.userId },
      });

      if (!user) {
        return {
          status: 404,
          error: ['User not found'],
          profile: null,
        };
      }

      // Check if email is being updated and if it's already taken
      if (data.email && data.email !== user.email) {
        const existingUser = await this.userRepository.findOne({
          where: { email: data.email },
        });

        if (existingUser) {
          return {
            status: 400,
            error: ['Email already in use'],
            profile: null,
          };
        }
      }

      // Update fields if provided
      if (data.name !== undefined) user.name = data.name;
      if (data.email !== undefined) user.email = data.email;
      if (data.workLocation !== undefined) user.workLocation = data.workLocation;
      if (data.role !== undefined) user.role = data.role;
      if (data.timezone !== undefined) user.timezone = data.timezone;
      if (data.department !== undefined) user.department = data.department;
      if (data.deptManager !== undefined) user.deptManager = data.deptManager;
      if (data.birthday !== undefined) {
        user.birthday = data.birthday ? new Date(data.birthday) : null;
      }

      // Hash and update password if provided
      if (data.password) {
        user.password = await bcrypt.hash(data.password, this.saltRounds);
      }

      // Save updated user
      const updatedUser = await this.userRepository.save(user);

      return {
        status: 200,
        error: [],
        profile: {
          id: updatedUser.id,
          workId: updatedUser.workId,
          name: updatedUser.name,
          email: updatedUser.email,
          workLocation: updatedUser.workLocation,
          role: updatedUser.role || '',
          timezone: updatedUser.timezone || '',
          department: updatedUser.department || '',
          deptManager: updatedUser.deptManager || '',
          birthday: updatedUser.birthday?.toString() || '',
          dateJoined: updatedUser.dateJoined.toISOString(),
        },
      };
    } catch (error) {
      return {
        status: 500,
        error: [`Failed to update profile: ${error.message}`],
        profile: null,
      };
    }
  }
}
