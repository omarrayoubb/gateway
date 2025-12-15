import {
  IsString,
  IsUUID,
  IsEnum,
  IsObject,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ActivityAction } from '../../common/enums/activity-action.enum';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @IsUUID()
  @IsNotEmpty()
  entityId: string;

  @IsEnum(ActivityAction)
  @IsNotEmpty()
  action: ActivityAction;

  @IsString()
  @IsNotEmpty()
  performedBy: string;

  @IsObject()
  @IsOptional()
  changes?: Record<string, any>;

  @IsUUID()
  @IsOptional()
  ticketId?: string;
}

