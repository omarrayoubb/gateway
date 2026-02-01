import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Competency } from './entities/competency.entity';
import { CompetenciesService } from './competencies.service';
import { CompetenciesGrpcController } from './competencies.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Competency]),
  ],
  providers: [CompetenciesService],
  controllers: [CompetenciesGrpcController],
  exports: [CompetenciesService],
})
export class CompetenciesModule {}
