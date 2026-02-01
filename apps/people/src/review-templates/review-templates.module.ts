import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewTemplate } from './entities/review-template.entity';
import { ReviewTemplatesService } from './review-templates.service';
import { ReviewTemplatesGrpcController } from './review-templates.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewTemplate]),
  ],
  providers: [ReviewTemplatesService],
  controllers: [ReviewTemplatesGrpcController],
  exports: [ReviewTemplatesService],
})
export class ReviewTemplatesModule {}
