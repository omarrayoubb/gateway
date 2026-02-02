import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserStatus, UserRole } from './entities/user.entity';
import { Employee } from '../people/entities/person.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ActivateUserDto } from './dto/activate-user.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto, createdBy: string): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Verify employee exists - try by ID first, then by email as fallback
    let employee: Employee | null = null;
    if (createUserDto.employeeId) {
      employee = await this.employeeRepository.findOne({
        where: { id: createUserDto.employeeId },
      });
    }
    
    // If not found by ID, try to find by email
    if (!employee && createUserDto.email) {
      employee = await this.employeeRepository.findOne({
        where: { email: createUserDto.email },
      });
      
      // If found by email, update the employeeId in the DTO
      if (employee) {
        createUserDto.employeeId = employee.id;
      }
    }
    
    if (!employee) {
      const errorMessage = createUserDto.employeeId 
        ? `Employee with ID ${createUserDto.employeeId} not found. Please create an employee first or use a valid employee ID.`
        : `No employee found with email ${createUserDto.email}. Please create an employee first using POST /entities/Employee.`;
      throw new NotFoundException(errorMessage);
    }
    
    // Check if employee already has a user account
    if (employee.userId) {
      const existingEmployeeUser = await this.userRepository.findOne({
        where: { id: employee.userId },
      });
      if (existingEmployeeUser) {
        throw new BadRequestException(`Employee already has a user account with email ${existingEmployeeUser.email}`);
      }
    }

    // Generate activation token
    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationTokenExpires = new Date();
    activationTokenExpires.setHours(activationTokenExpires.getHours() + 24); // 24 hours

    const user = this.userRepository.create({
      email: createUserDto.email,
      passwordHash: '', // Will be set on activation
      employeeId: employee.id, // Use the found employee's ID
      role: createUserDto.role,
      status: UserStatus.PENDING_ACTIVATION,
      activationToken,
      activationTokenExpires,
    });

    const savedUser = await this.userRepository.save(user);

    // Update employee with user_id
    employee.userId = savedUser.id;
    await this.employeeRepository.save(employee);

    // TODO: Send activation email with token
    return savedUser;
  }

  async activate(activateUserDto: ActivateUserDto): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    const user = await this.userRepository.findOne({
      where: { activationToken: activateUserDto.activationToken },
    });

    if (!user) {
      throw new BadRequestException('Invalid activation token');
    }

    if (user.activationTokenExpires && user.activationTokenExpires < new Date()) {
      throw new BadRequestException('Activation token has expired');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(activateUserDto.password, 10);

    // Update user
    user.passwordHash = passwordHash;
    user.status = UserStatus.ACTIVE;
    user.activationToken = null;
    user.activationTokenExpires = null;
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: this.mapUserToResponse(user),
    };
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number; user: any }> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['employee'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Password not set. Please activate your account.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      expiresIn: 3600 * 24 * 7, // 7 days
      user: this.mapUserToResponse(user),
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const accessToken = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
      });

      return {
        accessToken,
        expiresIn: 3600 * 24 * 7,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email exists, a password reset link has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetTokenExpires;
    await this.userRepository.save(user);

    // TODO: Send reset email with token

    return { message: 'If the email exists, a password reset link has been sent.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { passwordResetToken: resetPasswordDto.resetToken },
    });

    if (!user) {
      throw new BadRequestException('Invalid reset token');
    }

    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    const passwordHash = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    user.passwordHash = passwordHash;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.userRepository.save(user);

    return { message: 'Password reset successfully' };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['employee'],
    });
  }

  async findAll(query: { role?: string; status?: string; departmentId?: string }): Promise<User[]> {
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.employee', 'employee');

    if (query.role) {
      queryBuilder.where('user.role = :role', { role: query.role });
    }

    if (query.status) {
      const whereCondition = query.role ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('user.status = :status', { status: query.status });
    }

    if (query.departmentId) {
      const whereCondition = (query.role || query.status) ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('employee.departmentId = :departmentId', { departmentId: query.departmentId });
    }

    return await queryBuilder.getMany();
  }

  async update(id: string, updateData: Partial<User>, updatedBy: string): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateData);
    return await this.userRepository.save(user);
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    let employee: Employee | null = null;
    if (user.employeeId) {
      employee = await this.employeeRepository.findOne({
        where: { id: user.employeeId },
      });
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      departmentId: employee?.departmentId || null,
      managerId: employee?.managerId || null,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    return { accessToken, refreshToken };
  }

  /**
   * Bootstrap method to create the first admin account
   * This bypasses the employee requirement for initial setup
   */
  async bootstrapAdmin(email: string, password: string, name: string = 'System Administrator'): Promise<User> {
    // Check if any users exist
    const userCount = await this.userRepository.count();
    if (userCount > 0) {
      throw new BadRequestException('Bootstrap can only be used when no users exist in the system');
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Create or find employee for admin
    let employee = await this.employeeRepository.findOne({
      where: { email },
    });

    if (!employee) {
      // Create employee record for admin
      employee = this.employeeRepository.create({
        name,
        email,
        status: 'active' as any,
        jobTitle: 'System Administrator',
        department: 'Administration',
      });
      employee = await this.employeeRepository.save(employee);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    const user = this.userRepository.create({
      email,
      passwordHash,
      employeeId: employee.id,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE, // Admin is immediately active
      activationToken: null,
      activationTokenExpires: null,
    });

    const savedUser = await this.userRepository.save(user);

    // Update employee with user_id
    employee.userId = savedUser.id;
    await this.employeeRepository.save(employee);

    return savedUser;
  }

  private mapUserToResponse(user: User): any {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      employeeId: user.employeeId,
      employee: user.employee ? {
        id: user.employee.id,
        name: user.employee.name,
        departmentId: user.employee.departmentId,
        managerId: user.employee.managerId,
      } : null,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };
  }
}
