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
import { UserDeletedEvent } from '@app/common/events/user-deleted.event';
import { User } from './users.entity';
import { Department } from './department.entity';

@Injectable()
export class AccountsService implements OnModuleInit, OnModuleDestroy {
  private readonly saltRounds = 10;
  private readonly logger = new Logger(AccountsService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    private readonly jwtService: JwtService,
    @Inject('RABBITMQ_PEOPLE_QUEUE')
    private readonly rabbitmqPeople: ClientProxy,
    @Inject('RABBITMQ_CRM_QUEUE')
    private readonly rabbitmqCrm: ClientProxy,
  ) {}

  async onModuleInit() {
    try {
      await this.rabbitmqPeople.connect();
      await this.rabbitmqCrm.connect();
      this.logger.log('RabbitMQ clients (people + crm queues) connected');
    } catch (error) {
      this.logger.error('Failed to connect RabbitMQ clients:', error);
    }
  }

  async onModuleDestroy() {
    await this.rabbitmqPeople.close();
    await this.rabbitmqCrm.close();
  }

  /** Normalize a date (Date or string) to ISO date string (YYYY-MM-DD) or null */
  private toDateString(value: Date | string | null | undefined): string | null {
    if (value == null) return null;
    if (typeof value === 'string') return value.slice(0, 10);
    return value.toISOString().slice(0, 10);
  }

  /** Normalize a date to full ISO string or null */
  private toISOString(value: Date | string | null | undefined): string {
    if (value == null) return new Date().toISOString();
    if (typeof value === 'string') return value;
    return value.toISOString();
  }

  /**
   * Build full user event payload with departmentName and managerName for People.
   * Pass a user loaded with relations: ['department'] for department name.
   */
  private async buildUserEventPayload(user: User): Promise<UserCreatedEvent> {
    const departmentName = user.department?.deptName ?? '';
    let managerName: string | null = null;
    if (user.managerId) {
      const manager = await this.userRepository.findOne({
        where: { id: user.managerId },
        select: ['name'],
      });
      managerName = manager?.name ?? null;
    }
    return {
      id: user.id,
      workId: user.workId,
      email: user.email ?? null,
      name: user.name,
      role: user.role ?? '',
      department: departmentName,
      departmentId: user.departmentId ?? null,
      departmentName,
      workLocation: user.workLocation,
      timezone: user.timezone ?? null,
      birthday: this.toDateString(user.birthday),
      dateJoined: this.toISOString(user.dateJoined),
      updatedAt: this.toISOString(user.updatedAt),
      status: user.status ?? null,
      position: user.position ?? null,
      hireDate: this.toDateString(user.hireDate),
      managerId: user.managerId ?? null,
      managerName,
      hierarchyLevel: user.hierarchyLevel ?? null,
      phone: user.phone ?? null,
      address: user.address ?? null,
      city: user.city ?? null,
      country: user.country ?? null,
      emergencyContactName: user.emergencyContactName ?? null,
      emergencyContactPhone: user.emergencyContactPhone ?? null,
      emergencyContactRelationship: user.emergencyContactRelationship ?? null,
      baseSalary: user.baseSalary ?? null,
    };
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

      // Resolve department_id: prefer departmentId (or proto department_id), else look up by department name
      const raw = data as RegisterRequest & { department_id?: string };
      let departmentId: string | null = data.departmentId ?? raw.department_id ?? null;
      if (!departmentId && data.department) {
        const dept = await this.departmentRepository.findOne({
          where: { deptName: data.department },
        });
        if (dept) departmentId = dept.id;
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
        departmentId,
        birthday: data.birthday ? new Date(data.birthday) : null,
      });

      // Save to database
      await this.userRepository.save(user);

      // Publish UserCreatedEvent to RabbitMQ (full user data + departmentName, managerName)
      try {
        const withRelations = await this.userRepository.findOne({
          where: { id: user.id },
          relations: ['department'],
        });
        if (withRelations) {
          const event = await this.buildUserEventPayload(withRelations);
          this.logger.log(`Publishing UserCreatedEvent to People and CRM queues for user ${user.id}`);
          this.rabbitmqPeople.emit('user.created', event).subscribe({
            next: () => this.logger.log(`✓ UserCreatedEvent sent to People queue for user ${user.id}`),
            error: (err) => this.logger.error(`✗ Failed to publish to People queue for user ${user.id}:`, err),
          });
          this.rabbitmqCrm.emit('user.created', event).subscribe({
            next: () => this.logger.log(`✓ UserCreatedEvent sent to CRM queue for user ${user.id}`),
            error: (err) => this.logger.error(`✗ Failed to publish to CRM queue for user ${user.id}:`, err),
          });
        }
      } catch (error) {
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
        relations: ['department'],
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
          departmentId: user.departmentId ?? null,
          department: user.department?.deptName ?? '',
          birthday: this.toDateString(user.birthday) || '',
          dateJoined: this.toISOString(user.dateJoined),
          status: user.status ?? undefined,
          position: user.position ?? undefined,
          hireDate: this.toDateString(user.hireDate) ?? undefined,
          managerId: user.managerId ?? undefined,
          hierarchyLevel: user.hierarchyLevel ?? undefined,
          phone: user.phone ?? undefined,
          address: user.address ?? undefined,
          city: user.city ?? undefined,
          country: user.country ?? undefined,
          emergencyContactName: user.emergencyContactName ?? undefined,
          emergencyContactPhone: user.emergencyContactPhone ?? undefined,
          emergencyContactRelationship: user.emergencyContactRelationship ?? undefined,
          baseSalary: user.baseSalary ?? undefined,
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

      // Check if workId is being updated and if it's already taken
      if (data.workId !== undefined && data.workId !== user.workId) {
        const existingByWorkId = await this.userRepository.findOne({
          where: { workId: data.workId },
        });

        if (existingByWorkId) {
          return {
            status: 400,
            error: ['Work ID already in use'],
            profile: null,
          };
        }
      }
      console.log(data);
      console.log(user);

      // Update fields if provided
      if (data.workId !== undefined) user.workId = data.workId;
      if (data.name !== undefined) user.name = data.name;
      if (data.email !== undefined) user.email = data.email;
      if (data.workLocation !== undefined) user.workLocation = data.workLocation;
      if (data.role !== undefined) user.role = data.role;
      if (data.timezone !== undefined) user.timezone = data.timezone;
      if (data.departmentId !== undefined) user.departmentId = data.departmentId ?? null;
      if (data.birthday !== undefined) {
        user.birthday = data.birthday ? new Date(data.birthday) : null;
      }
      if (data.status !== undefined) user.status = data.status;
      if (data.position !== undefined) user.position = data.position;
      if (data.hireDate !== undefined) {
        user.hireDate = data.hireDate ? new Date(data.hireDate) : null;
      }
      if (data.managerId !== undefined) user.managerId = data.managerId ?? null;
      if (data.hierarchyLevel !== undefined) user.hierarchyLevel = data.hierarchyLevel ?? null;
      if (data.phone !== undefined) user.phone = data.phone;
      if (data.address !== undefined) user.address = data.address;
      if (data.city !== undefined) user.city = data.city;
      if (data.country !== undefined) user.country = data.country;
      if (data.emergencyContactName !== undefined) user.emergencyContactName = data.emergencyContactName;
      if (data.emergencyContactPhone !== undefined) user.emergencyContactPhone = data.emergencyContactPhone;
      if (data.emergencyContactRelationship !== undefined) user.emergencyContactRelationship = data.emergencyContactRelationship;
      if (data.baseSalary !== undefined) user.baseSalary = data.baseSalary ?? null;

      // Hash and update password if provided
      if (data.password) {
        user.password = await bcrypt.hash(data.password, this.saltRounds);
      }

      // Save updated user
      const updatedUser = await this.userRepository.save(user);

      // Reload with department for response
      const withDept = await this.userRepository.findOne({
        where: { id: updatedUser.id },
        relations: ['department'],
      });
      if (!withDept) {
        return {
          status: 500,
          error: ['Failed to load updated profile'],
          profile: null,
        };
      }

      // Emit user.updated to People queue so local copy stays in sync
      try {
        const event = await this.buildUserEventPayload(withDept);
        this.rabbitmqPeople.emit('user.updated', event).subscribe({
          next: () => this.logger.log(`✓ user.updated sent to People queue for user ${withDept.id}`),
          error: (err) => this.logger.error(`Failed to publish user.updated for user ${withDept.id}:`, err),
        });
      } catch (emitErr) {
        this.logger.error(`Error publishing user.updated for user ${withDept.id}:`, emitErr);
      }

      return {
        status: 200,
        error: [],
        profile: {
          id: withDept.id,
          workId: withDept.workId,
          name: withDept.name,
          email: withDept.email,
          workLocation: withDept.workLocation,
          role: withDept.role || '',
          timezone: withDept.timezone || '',
          departmentId: withDept.departmentId ?? null,
          department: withDept.department?.deptName ?? '',
          birthday: this.toDateString(withDept.birthday) || '',
          dateJoined: this.toISOString(withDept.dateJoined),
          status: withDept.status ?? undefined,
          position: withDept.position ?? undefined,
          hireDate: this.toDateString(withDept.hireDate) ?? undefined,
          managerId: withDept.managerId ?? undefined,
          hierarchyLevel: withDept.hierarchyLevel ?? undefined,
          phone: withDept.phone ?? undefined,
          address: withDept.address ?? undefined,
          city: withDept.city ?? undefined,
          country: withDept.country ?? undefined,
          emergencyContactName: withDept.emergencyContactName ?? undefined,
          emergencyContactPhone: withDept.emergencyContactPhone ?? undefined,
          emergencyContactRelationship: withDept.emergencyContactRelationship ?? undefined,
          baseSalary: withDept.baseSalary ?? undefined,
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

  /**
   * Delete (or soft-delete) a user and emit user.deleted to People queue.
   * Option A: full implementation. Handles departments.dept_manager_id FK.
   */
  async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    console.log (userId);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    // Null dept_manager_id in any department that points to this user
    await this.departmentRepository.update(
      { deptManagerId: userId },
      { deptManagerId: null },
    );
    // Soft-delete: set status to inactive so we keep referential integrity
    user.status = 'inactive';
    await this.userRepository.save(user);

    const event: UserDeletedEvent = { id: userId };
    try {
      this.rabbitmqPeople.emit('user.deleted', event).subscribe({
        next: () => this.logger.log(`✓ user.deleted sent to People queue for user ${userId}`),
        error: (err) => this.logger.error(`Failed to publish user.deleted for user ${userId}:`, err),
      });
    } catch (err) {
      this.logger.error(`Error publishing user.deleted for user ${userId}:`, err);
    }
    return { success: true };
  }

  // Department CRUD
  async getDepartment(data: { id: string }): Promise<{ id: string; deptName: string; deptManagerId: string } | null> {
    const raw = data as { id?: string };
    const id = data.id ?? raw.id;
    if (!id) return null;
    const dept = await this.departmentRepository.findOne({ where: { id } });
    if (!dept) return null;
    return {
      id: dept.id,
      deptName: dept.deptName,
      deptManagerId: dept.deptManagerId ?? '',
    };
  }

  async getDepartments(): Promise<{ departments: Array<{ id: string; deptName: string; deptManagerId: string }> }> {
    const list = await this.departmentRepository.find({ order: { deptName: 'ASC' } });
    return {
      departments: list.map((d) => ({
        id: d.id,
        deptName: d.deptName,
        deptManagerId: d.deptManagerId ?? '',
      })),
    };
  }

  async createDepartment(data: { deptName?: string; deptManagerId?: string }): Promise<{ id: string; deptName: string; deptManagerId: string }> {
    const raw = data as { deptName?: string; deptManagerId?: string };
    const name = data.deptName ?? raw.deptName ?? '';
    const managerId = (data.deptManagerId ?? raw.deptManagerId ?? null) || null;
    const dept = this.departmentRepository.create({
      deptName: name.trim() || 'Unnamed',
      deptManagerId: managerId || null,
    });
    const saved = await this.departmentRepository.save(dept);
    return {
      id: saved.id,
      deptName: saved.deptName,
      deptManagerId: saved.deptManagerId ?? '',
    };
  }

  async updateDepartment(data: { id: string; deptName?: string; deptManagerId?: string }): Promise<{ id: string; deptName: string; deptManagerId: string } | null> {
    const raw = data as { id: string; deptName?: string; deptManagerId?: string };
    const id = data.id ?? raw.id;
    const dept = await this.departmentRepository.findOne({ where: { id } });
    if (!dept) return null;
    if (raw.deptName !== undefined) dept.deptName = raw.deptName;
    if (raw.deptManagerId !== undefined) dept.deptManagerId = raw.deptManagerId || null;
    const saved = await this.departmentRepository.save(dept);
    return {
      id: saved.id,
      deptName: saved.deptName,
      deptManagerId: saved.deptManagerId ?? '',
    };
  }

  async deleteDepartment(data: { id: string }): Promise<{ success: boolean; message: string }> {
    const raw = data as { id?: string };
    const id = data.id ?? raw.id;
    if (!id) return { success: false, message: 'id is required' };
    const dept = await this.departmentRepository.findOne({ where: { id } });
    if (!dept) return { success: false, message: 'Department not found' };
    await this.departmentRepository.remove(dept);
    return { success: true, message: 'Department deleted' };
  }
}
