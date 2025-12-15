import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { ServicesGrpcController } from './services.grpc.controller';
import { ServicesService } from './services.service';

@Module({
  imports: [TypeOrmModule.forFeature([Service])],
  controllers: [ServicesGrpcController],
  providers: [ServicesService],
  exports: [TypeOrmModule, ServicesService],
})
export class ServicesModule {}

