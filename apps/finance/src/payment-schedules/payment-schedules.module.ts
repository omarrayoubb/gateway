import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentSchedule } from './entities/payment-schedule.entity';
import { PaymentSchedulesService } from './payment-schedules.service';
import { PaymentSchedulesGrpcController } from './payment-schedules.grpc.controller';
import { OrganizationsModule } from '../organizations/organizations.module';
import { PurchaseBill } from '../purchase-bills/entities/purchase-bill.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentSchedule, PurchaseBill]),
    OrganizationsModule,
  ],
  providers: [PaymentSchedulesService],
  controllers: [PaymentSchedulesGrpcController],
  exports: [PaymentSchedulesService],
})
export class PaymentSchedulesModule {}

