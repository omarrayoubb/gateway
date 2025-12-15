import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estimate } from './entities/estimate.entity';
import { EstimateService } from './entities/estimate-service.entity';
import { EstimatePart } from './entities/estimate-part.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Estimate, EstimateService, EstimatePart])],
  exports: [TypeOrmModule],
})
export class EstimatesModule {}

