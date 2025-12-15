import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleMaintenance } from './entities/schedule-maintenance.entity';
import { MaintenanceContract } from './entities/maintenance-contract.entity';
import { MaintenanceContractController } from './maintenance-contract.controller';
import { MaintenanceContractService } from './maintenance-contract.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScheduleMaintenance, MaintenanceContract]),
  ],
  controllers: [MaintenanceContractController],
  providers: [MaintenanceContractService],
  exports: [TypeOrmModule],
})
export class ScheduleMaintenanceModule {}

