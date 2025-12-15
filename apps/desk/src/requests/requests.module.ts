import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request } from './entities/request.entity';
import { RequestNote } from './entities/request-note.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Request, RequestNote])],
  exports: [TypeOrmModule],
})
export class RequestsModule {}

