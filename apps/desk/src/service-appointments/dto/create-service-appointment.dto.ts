import { IsString, IsUUID, IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateServiceAppointmentDto {
  @IsUUID()
  @IsNotEmpty()
  workOrderId: string;

  @IsDateString()
  @IsNotEmpty()
  scheduledDate: string;

  @IsString()
  @IsNotEmpty()
  scheduledTime: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  assignedAgent?: string;
}

