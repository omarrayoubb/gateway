import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certification } from './entities/certification.entity';
import { CertificationsService } from './certifications.service';
import { CertificationsGrpcController } from './certifications.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Certification]),
  ],
  providers: [CertificationsService],
  controllers: [CertificationsGrpcController],
  exports: [CertificationsService],
})
export class CertificationsModule {}
