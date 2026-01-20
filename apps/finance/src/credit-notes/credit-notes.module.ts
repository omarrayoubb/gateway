import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditNote } from './entities/credit-note.entity';
import { CreditNoteItem } from './credit-note-items/entities/credit-note-item.entity';
import { CreditNotesService } from './credit-notes.service';
import { CreditNotesGrpcController } from './credit-notes.grpc.controller';
import { Invoice } from '../invoices/entities/invoice.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CreditNote, CreditNoteItem, Invoice]),
  ],
  providers: [CreditNotesService],
  controllers: [CreditNotesGrpcController],
  exports: [CreditNotesService],
})
export class CreditNotesModule {}

