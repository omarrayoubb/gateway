import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecurringBill } from './entities/recurring-bill.entity';
import { RecurringBillsService } from './recurring-bills.service';
import { RecurringBillsGrpcController } from './recurring-bills.grpc.controller';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecurringBill]),
    OrganizationsModule,
  ],
  providers: [RecurringBillsService],
  controllers: [RecurringBillsGrpcController],
  exports: [RecurringBillsService],
})
export class RecurringBillsModule {}

