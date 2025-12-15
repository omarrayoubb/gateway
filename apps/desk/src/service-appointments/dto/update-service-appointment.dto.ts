import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceAppointmentDto } from './create-service-appointment.dto';

export class UpdateServiceAppointmentDto extends PartialType(CreateServiceAppointmentDto) {}

