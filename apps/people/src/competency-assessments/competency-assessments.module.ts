import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompetencyAssessment } from './entities/competency-assessment.entity';
import { CompetencyAssessmentsService } from './competency-assessments.service';
import { CompetencyAssessmentsGrpcController } from './competency-assessments.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompetencyAssessment]),
  ],
  providers: [CompetencyAssessmentsService],
  controllers: [CompetencyAssessmentsGrpcController],
  exports: [CompetencyAssessmentsService],
})
export class CompetencyAssessmentsModule {}
