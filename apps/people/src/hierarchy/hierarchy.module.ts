import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../people/entities/person.entity';
import { HierarchyService } from './hierarchy.service';
import { HierarchyGrpcController } from './hierarchy.grpc.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Employee])],
  providers: [HierarchyService],
  controllers: [HierarchyGrpcController],
  exports: [HierarchyService],
})
export class HierarchyModule {}
