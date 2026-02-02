import { IsEmail, IsEnum, IsUUID, IsOptional } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsUUID()
  @IsOptional()
  employeeId?: string;

  @IsEnum(UserRole)
  role: UserRole;
}
