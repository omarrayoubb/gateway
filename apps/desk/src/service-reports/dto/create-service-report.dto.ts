import { IsString, IsUUID, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateServiceReportDto {
  @IsUUID()
  @IsNotEmpty()
  serviceAppointmentId: string;

  @IsDateString()
  @IsNotEmpty()
  reportDate: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

