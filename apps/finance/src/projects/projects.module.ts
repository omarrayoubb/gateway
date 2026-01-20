import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsGrpcController } from './projects.grpc.controller';
import { Project } from './entities/project.entity';
import { GeneralLedger } from '../general-ledger/entities/general-ledger.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, GeneralLedger]),
  ],
  controllers: [ProjectsGrpcController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}

