import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users.entity';
import { RegisterUserDto } from './dto/register.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private rabbitMQService: RabbitMQService,
  ) {}

  /**
   * Validates a user's password.
   * This is the core of our email/password strategy.
   */
  async validateUser(email: string, pass: string): Promise<Omit<User, 'password'>> {
    // 1. Find the user by email
    const user = await this.userService.findOneByEmail(email);
    console.log("here");
    if (!user) {
      // Case 1: User not found
      throw new UnauthorizedException('Incorrect Email or Password');
    }
    console.log("here2");

    // 2. Compare the incoming password with the stored hash
    console.log(user.password);
    const isPasswordMatching = await bcrypt.compare(pass, user.password);
    console.log(isPasswordMatching);
    if (isPasswordMatching) {
      // 3. If passwords match, return the user object (minus the password)
      const { password, ...result } = user;
      return result;
    }

    // Case 2: Password does not match
    throw new UnauthorizedException('Incorrect Email or password');
  }

  /**
   * Generates a JWT for a given user.
   */
  async login(user: Omit<User, 'password'>): Promise<LoginResponseDto> {
    // The payload is the data we store inside the JWT.
    // We can add any data we want, but 'sub' (subject) and 'email' are standard.
    const payload = { 
      sub: user.id, 
      email: user.email,
    };
    
    return {
      // This is the signed JWT
      accessToken: this.jwtService.sign(payload),
      // We also return the user data for the frontend
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        workId: user.workId,
        workLocation: user.workLocation,
      },
    };
  }

  /**
   * NEW: Registers a new user
   */
  async register(registerUserDto: RegisterUserDto): Promise<RegisterResponseDto> {
    // The ValidationPipe in main.ts has already checked for missing fields
    // and password strength.

    // 1. Check if email or workId is already taken
    // We assume your 'UsersService' has this method
    const existingUser = await this.userService.findByEmailOrWorkId(
      registerUserDto.email,
      registerUserDto.workId,
    );

    if (existingUser) {
      if (existingUser.email === registerUserDto.email) {
        throw new ConflictException('Email is already in use');
      }
      if (existingUser.workId === registerUserDto.workId) {
        throw new ConflictException('Work ID is already in use');
      }
    }

    // 2. Create and save the new user
    // The @BeforeInsert hook in user.entity.ts will hash the password
    try {
      // We assume your 'UsersService' has this 'create' method
      const newUser = await this.userService.create(registerUserDto);
      const { password, ...result } = newUser;
      
      // Transform to RegisterResponseDto format
      const response: RegisterResponseDto = {
        id: newUser.id,
        workId: newUser.workId,
        email: newUser.email,
        name: newUser.name,
        timezone: newUser.timezone,
        workLocation: newUser.workLocation,
        department: newUser.department,
        deptManager: newUser.deptManager,
        birthday: newUser.birthday,
        dateJoined: newUser.dateJoined,
        updatedAt: newUser.updatedAt,
        roleId: registerUserDto.roleId || null,
        profileId: registerUserDto.profileId || null,
        createdAt: newUser.dateJoined, // Use dateJoined as createdAt
      };

      // Publish user created event to RabbitMQ
      try {
        await this.rabbitMQService.publishUserCreated({
          id: newUser.id,
          workId: newUser.workId,
          email: newUser.email,
          name: newUser.name,
          timezone: newUser.timezone,
          workLocation: newUser.workLocation,
          department: newUser.department,
          deptManager: newUser.deptManager,
          birthday: newUser.birthday,
          roleId: registerUserDto.roleId || null,
          profileId: registerUserDto.profileId || null,
        });
      } catch (error) {
        console.error('Failed to publish user created event:', error);
        // Don't fail the registration if event publishing fails
      }

      return response;
    
    } catch (error) {
      // Catch database-level errors and provide detailed error message
      console.error('Registration error:', error);
      
      // Extract the actual error message
      let errorMessage = 'Could not create user';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.detail) {
        // PostgreSQL specific error details
        errorMessage = error.detail;
      } else if (error.code) {
        // Database error codes
        if (error.code === '23505') {
          // Unique constraint violation
          errorMessage = 'Email or Work ID already exists';
        } else if (error.code === '23502') {
          // Not null constraint violation
          errorMessage = 'Required field is missing';
        } else {
          errorMessage = `Database error: ${error.code}`;
        }
      }
      
      throw new BadRequestException(errorMessage);
    }
  }
}