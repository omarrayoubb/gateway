import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeBase } from './entities/knowledge-base.entity';
import { KnowledgeBaseGrpcController } from './knowledge-base.grpc.controller';
import { KnowledgeBaseService } from './knowledge-base.service';

@Module({
  imports: [TypeOrmModule.forFeature([KnowledgeBase])],
  controllers: [KnowledgeBaseGrpcController],
  providers: [KnowledgeBaseService],
  exports: [TypeOrmModule],
})
export class KnowledgeBaseModule {}

