import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorCreditNote } from './entities/vendor-credit-note.entity';
import { VendorCreditNoteItem } from './vendor-credit-note-items/entities/vendor-credit-note-item.entity';
import { VendorCreditNotesService } from './vendor-credit-notes.service';
import { VendorCreditNotesGrpcController } from './vendor-credit-notes.grpc.controller';
import { OrganizationsModule } from '../organizations/organizations.module';
import { PurchaseBill } from '../purchase-bills/entities/purchase-bill.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([VendorCreditNote, VendorCreditNoteItem, PurchaseBill]),
    OrganizationsModule,
  ],
  providers: [VendorCreditNotesService],
  controllers: [VendorCreditNotesGrpcController],
  exports: [VendorCreditNotesService],
})
export class VendorCreditNotesModule {}

