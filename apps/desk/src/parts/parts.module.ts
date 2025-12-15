import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Part } from './entities/part.entity';
import { InstallationBase } from './entities/installation-base.entity';
import { InstallationBaseController } from './installation-base.controller';
import { InstallationBaseService } from './installation-base.service';
import { PartsGrpcController } from './parts.grpc.controller';
import { PartsService } from './parts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Part, InstallationBase])],
  controllers: [PartsGrpcController],
  providers: [InstallationBaseService, PartsService],
  exports: [TypeOrmModule, PartsService],
})
export class PartsModule {}

