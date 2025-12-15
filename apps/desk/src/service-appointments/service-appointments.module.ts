import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceAppointment } from './entities/service-appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceAppointment])],
  exports: [TypeOrmModule],
})
export class ServiceAppointmentsModule {}

