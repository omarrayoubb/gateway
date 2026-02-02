import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeCertification } from './entities/employee-certification.entity';
import { EmployeeCertificationsService } from './employee-certifications.service';
import { EmployeeCertificationsGrpcController } from './employee-certifications.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployeeCertification]),
  ],
  providers: [EmployeeCertificationsService],
  controllers: [EmployeeCertificationsGrpcController],
  exports: [EmployeeCertificationsService],
})
export class EmployeeCertificationsModule {}
