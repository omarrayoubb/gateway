import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users.entity';
import { RegisterUserDto } from '../auth/dto/register.dto';
import { UpdateUserDto } from '../auth/dto/update.dto';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private rabbitMQService: RabbitMQService,
  ) {}

  async create(registerUserDto: RegisterUserDto): Promise<any> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerUserDto.password, saltRounds);
    
    const newUser = this.userRepository.create({
      ...registerUserDto,
      password: hashedPassword,
    });
    
    return await this.userRepository.save(newUser);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.preload({
      id: id,
      ...updateUserDto,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updatedUser = await this.userRepository.save(user);
    const { password, ...result } = updatedUser;

    // Publish user updated event to RabbitMQ
    try {
      await this.rabbitMQService.publishUserUpdated({
        id: updatedUser.id,
        workId: updatedUser.workId,
        email: updatedUser.email,
        name: updatedUser.name,
        timezone: updatedUser.timezone,
        workLocation: updatedUser.workLocation,
        department: updatedUser.department,
        deptManager: updatedUser.deptManager,
        birthday: updatedUser.birthday,
        roleId: updateUserDto.roleId || null,
        profileId: null, // profileId not in UpdateUserDto - managed in CRM
      });
    } catch (error) {
      console.error('Failed to publish user updated event:', error);
    }

    return result;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .getOne();
  }

  async findByEmailOrWorkId(email: string, workId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: [{ email }, { workId }],
    });
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.userRepository.remove(user);

    // Publish user deleted event to RabbitMQ
    try {
      await this.rabbitMQService.publishUserDeleted(id);
    } catch (error) {
      console.error('Failed to publish user deleted event:', error);
    }
  }
}

