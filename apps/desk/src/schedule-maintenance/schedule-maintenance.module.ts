import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleMaintenance } from './entities/schedule-maintenance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduleMaintenance])],
  exports: [TypeOrmModule],
})
export class ScheduleMaintenanceModule {}

