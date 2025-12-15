import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductAlert } from './entities/product-alert.entity';
import { ProductAlertsService } from './product-alerts.service';
import { ProductAlertsGrpcController } from './product-alerts.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductAlert]),
  ],
  providers: [ProductAlertsService],
  controllers: [ProductAlertsGrpcController],
  exports: [ProductAlertsService],
})
export class ProductAlertsModule {}

