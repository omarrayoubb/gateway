import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceReport } from './entities/service-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceReport])],
  exports: [TypeOrmModule],
})
export class ServiceReportsModule {}

