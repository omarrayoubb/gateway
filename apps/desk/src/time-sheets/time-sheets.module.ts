import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeSheet } from './entities/time-sheet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimeSheet])],
  exports: [TypeOrmModule],
})
export class TimeSheetsModule {}

