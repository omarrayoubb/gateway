import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningPath } from './entities/learning-path.entity';
import { LearningPathsService } from './learning-paths.service';
import { LearningPathsGrpcController } from './learning-paths.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([LearningPath]),
  ],
  providers: [LearningPathsService],
  controllers: [LearningPathsGrpcController],
  exports: [LearningPathsService],
})
export class LearningPathsModule {}
