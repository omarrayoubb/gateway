import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './entities/note.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Note])],
  exports: [TypeOrmModule],
})
export class NotesModule {}

