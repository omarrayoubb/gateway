import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsDateString,
  IsNumber,
  IsArray,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TaskStatus {
  NOT_STARTED = 'not started',
  DEFERRED = 'deferred',
  IN_PROGRESS = 'in progress',
  COMPLETED = 'completed',
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
}

export class CreateTaskDto {
  @IsUUID()
  @IsNotEmpty()
  ownerId: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsDateString()
  @IsOptional()
  dueDate?: Date;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  links?: string[];

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsString()
  @IsOptional()
  rfqId?: string | null;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  exchangeRate?: number;

  @IsDateString()
  @IsOptional()
  closedTime?: Date;
}

