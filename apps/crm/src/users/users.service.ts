import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './users.entity';
import { UpdateUserDto } from '../auth/dto/update.dto';
import { RegisterUserDto } from '../auth/dto/register.dto'; // Assumes DTO is at src/auth/dto/

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * NEW: Creates and saves a new user
   * This is called by the AuthService.
   * The password is hashed before saving to the database.
   */
  async create(registerUserDto: RegisterUserDto): Promise<any> {
    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerUserDto.password, saltRounds);
    
    // Create user with hashed password
    const newUser = this.userRepository.create({
      ...registerUserDto,
      password: hashedPassword,
    });
    
    const savedUser = await this.userRepository.save(newUser);
    
    // Reload with profile and role relations
    return this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['profile', 'roleEntity'],
    }) || savedUser;
  }

  /**
   * NEW: Updates an existing user
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    // 1. Find the user.
    // 'preload' gets the user and merges the DTO values onto it.
    const user = await this.userRepository.preload({
      id: id,
      ...updateUserDto,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // 2. Save the updated user
    const updatedUser = await this.userRepository.save(user);

    // 3. Return the user without the password
    const { password, ...result } = updatedUser;
    return result;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  /**
   * Finds a user by ID and eagerly loads the profile relation.
   * Used by JWT strategy for authorization.
   */
  async findOneWithProfile(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['profile', 'roleEntity'],
    });
  }

  /**
   * We need a way to find a user by email for authentication.
   * We must explicitly ask for the password, since it's hidden with { select: false }.
   * Also loads the profile relation.
   */
  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.roleEntity', 'roleEntity')
      .where('user.email = :email', { email })
      .addSelect('user.password') // Explicitly select the password
      .getOne();
  }

  /**
   * NEW: Finds a user by email OR workId
   * Used to check for conflicts during registration.
   */
  async findByEmailOrWorkId(email: string, workId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: [{ email }, { workId }],
    });
  }

  /**
   * Returns all users with id, name, and email for dropdown options.
   * Used by the orchestrator module to populate form dropdowns.
   */
  async findAllForDropdown(): Promise<{ id: string; name: string; email: string }[]> {
    const users = await this.userRepository.find({
      select: ['id', 'name', 'email'],
      order: {
        name: 'ASC',
      },
    });

    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }));
  }

  /**
   * Removes a user by ID
   */
  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.userRepository.remove(user);
  }
}