import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service'; // Kept your plural 'UsersService'
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/users.entity'; // Kept your plural 'users.entity'
import { RegisterUserDto } from './dto/register.dto'; // Import new DTO
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService, // Kept your plural 'UsersService'
    private jwtService: JwtService,
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
  async login(user: Omit<User, 'password'> & { profile?: { id: string; name: string } | null; roleEntity?: { id: string; name: string } | null }): Promise<LoginResponseDto> {
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
        ...payload,
        roleId: user.roleEntity?.id || user.roleId || null,
        roleName: user.roleEntity?.name || null,
        profileId: user.profile?.id || user.profileId || null,
        profileName: user.profile?.name || null,
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
      const { password, accounts, ...result } = newUser;
      
      // Transform to RegisterResponseDto format
      return {
        id: newUser.id,
        workId: newUser.workId,
        email: newUser.email,
        name: newUser.name,
        timezone: newUser.timezone,
        workLocation: newUser.workLocation,
        department: newUser.department,
        deptManager: newUser.deptManager,
        birthday: newUser.birthday,
        roleId: newUser.roleEntity?.id || newUser.roleId || null,
        roleName: newUser.roleEntity?.name || null,
        profileId: newUser.profile?.id || newUser.profileId || null,
        profileName: newUser.profile?.name || null,
        dateJoined: newUser.dateJoined,
        updatedAt: newUser.updatedAt,
      };
    
    } catch (error) {
      // Catch database-level errors (e.g., just in case)
      throw new BadRequestException('Could not create user', error.message);
    }
  }
}