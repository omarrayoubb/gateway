import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldAgent } from './entities/field-agent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FieldAgent])],
  exports: [TypeOrmModule],
})
export class FieldAgentsModule {}

