import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Holiday } from './entities/holiday.entity';
import { HolidaysService } from './holidays.service';
import { HolidaysGrpcController } from './holidays.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Holiday]),
  ],
  providers: [HolidaysService],
  controllers: [HolidaysGrpcController],
  exports: [HolidaysService],
})
export class HolidaysModule {}

