import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Applicant } from './entities/applicant.entity';
import { ApplicantsService } from './applicants.service';
import { ApplicantsGrpcController } from './applicants.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Applicant]),
  ],
  providers: [ApplicantsService],
  controllers: [ApplicantsGrpcController],
  exports: [ApplicantsService],
})
export class ApplicantsModule {}
