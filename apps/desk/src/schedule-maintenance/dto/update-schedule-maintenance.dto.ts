import { PartialType } from '@nestjs/mapped-types';
import { CreateScheduleMaintenanceDto } from './create-schedule-maintenance.dto';

export class UpdateScheduleMaintenanceDto extends PartialType(CreateScheduleMaintenanceDto) {}

