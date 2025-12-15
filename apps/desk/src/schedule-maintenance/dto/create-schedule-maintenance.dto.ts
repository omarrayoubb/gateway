import {
  IsString,
  IsUUID,
  IsDateString,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { ScheduleFrequency } from '../../common/enums/schedule-frequency.enum';

export class CreateScheduleMaintenanceDto {
  @IsEnum(ScheduleFrequency)
  @IsNotEmpty()
  schedule: ScheduleFrequency;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsString()
  @IsNotEmpty()
  relatedEntityType: string;

  @IsUUID()
  @IsNotEmpty()
  relatedId: string;
}

