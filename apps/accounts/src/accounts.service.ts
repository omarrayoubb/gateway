import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { RegisterRequest, RegisterResponse } from '@app/common/types/auth';
import { User } from './users.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: [
          { email: data.email },
          { workId: data.workId }
        ],
      });

      if (existingUser) {
        return {
          status: 400,
          error: ['User with this email or work ID already exists'],
          email: data.email,
        };
      }

      // Create new user
      const user = this.userRepository.create({
        workId: data.workId,
        name: data.name,
        email: data.email,
        workLocation: data.workLocation,
        role: data.role,
        password: data.password, // TODO: Hash password before saving
        timezone: data.timezone,
        department: data.department,
        deptManager: data.deptManager,
        birthday: data.birthday ? new Date(data.birthday) : null,
      });

      // Save to database
      await this.userRepository.save(user);

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
}
