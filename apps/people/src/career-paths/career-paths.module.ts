import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareerPath } from './entities/career-path.entity';
import { CareerPathsService } from './career-paths.service';
import { CareerPathsGrpcController } from './career-paths.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CareerPath]),
  ],
  providers: [CareerPathsService],
  controllers: [CareerPathsGrpcController],
  exports: [CareerPathsService],
})
export class CareerPathsModule {}
