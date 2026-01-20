import { Controller, BadRequestException } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { VendorCreditNotesService } from './vendor-credit-notes.service';
import { CreateVendorCreditNoteDto } from './dto/create-vendor-credit-note.dto';
import { VendorCreditNotePaginationDto } from './dto/pagination.dto';
import { VendorCreditNoteStatus, VendorCreditNoteReason } from './entities/vendor-credit-note.entity';

@Controller()
export class VendorCreditNotesGrpcController {
  constructor(private readonly vendorCreditNotesService: VendorCreditNotesService) {}

  @GrpcMethod('VendorCreditNotesService', 'GetVendorCreditNotes')
  async getVendorCreditNotes(data: { sort?: string; status?: string; vendor_id?: string }) {
    try {
      const query: VendorCreditNotePaginationDto = {
        sort: data.sort,
        status: data.status as VendorCreditNoteStatus,
        vendor_id: data.vendor_id,
      };

      const creditNotes = await this.vendorCreditNotesService.findAll(query);
      return {
        vendorCreditNotes: creditNotes.map(cn => this.mapVendorCreditNoteToProto(cn)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get vendor credit notes',
      });
    }
  }

  @GrpcMethod('VendorCreditNotesService', 'GetVendorCreditNote')
  async getVendorCreditNote(data: { id: string }) {
    try {
      const creditNote = await this.vendorCreditNotesService.findOne(data.id);
      return this.mapVendorCreditNoteToProto(creditNote);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get vendor credit note',
      });
    }
  }

  @GrpcMethod('VendorCreditNotesService', 'CreateVendorCreditNote')
  async createVendorCreditNote(data: any) {
    try {
      console.log('VendorCreditNotesGrpcController - CreateVendorCreditNote received:', JSON.stringify({
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        vendorId: data?.vendorId,
        vendor_id: data?.vendor_id,
      }, null, 2));

      const vendorId = data.vendorId || data.vendor_id;
      if (!vendorId) {
        throw new BadRequestException('vendor_id is required');
      }

      const createDto: CreateVendorCreditNoteDto = {
        organization_id: data.organizationId || data.organization_id || undefined,
        credit_note_number: data.creditNoteNumber || data.credit_note_number || undefined,
        vendor_id: vendorId,
        bill_id: data.billId || data.bill_id || undefined,
        credit_date: data.creditDate || data.credit_date,
        reason: (data.reason || data.reason) as VendorCreditNoteReason,
        total_amount: data.totalAmount !== undefined ? parseFloat(data.totalAmount.toString()) : undefined,
        description: data.description,
        items: data.items ? data.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity ? parseFloat(item.quantity.toString()) : undefined,
          unit_price: item.unitPrice !== undefined ? parseFloat(item.unitPrice.toString()) : undefined,
          amount: item.amount !== undefined ? parseFloat(item.amount.toString()) : undefined,
        })) : [],
        status: data.status ? (data.status as VendorCreditNoteStatus) : undefined,
      };

      const creditNote = await this.vendorCreditNotesService.create(createDto);
      return this.mapVendorCreditNoteToProto(creditNote);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create vendor credit note',
      });
    }
  }

  @GrpcMethod('VendorCreditNotesService', 'ApplyVendorCreditNote')
  async applyVendorCreditNote(data: { id: string; bill_id: string; amount: number }) {
    try {
      const creditNote = await this.vendorCreditNotesService.apply(
        data.id,
        data.bill_id,
        parseFloat(data.amount.toString())
      );
      return this.mapVendorCreditNoteToProto(creditNote);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to apply vendor credit note',
      });
    }
  }

  private formatDate(date: Date | string | null | undefined): string {
    if (!date) return '';
    if (typeof date === 'string') {
      try {
        const parsed = new Date(date);
        if (isNaN(parsed.getTime())) return '';
        return parsed.toISOString().split('T')[0];
      } catch {
        return '';
      }
    }
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return '';
  }

  private formatDateTime(date: Date | string | null | undefined): string {
    if (!date) return '';
    if (typeof date === 'string') {
      try {
        const parsed = new Date(date);
        if (isNaN(parsed.getTime())) return '';
        return parsed.toISOString();
      } catch {
        return '';
      }
    }
    if (date instanceof Date) {
      return date.toISOString();
    }
    return '';
  }

  private mapVendorCreditNoteToProto(creditNote: any) {
    return {
      id: creditNote.id,
      organizationId: creditNote.organizationId || '',
      creditNoteNumber: creditNote.creditNoteNumber || '',
      vendorId: creditNote.vendorId || '',
      vendorName: creditNote.vendorName || '',
      billId: creditNote.billId || '',
      creditDate: this.formatDate(creditNote.creditDate),
      reason: creditNote.reason,
      status: creditNote.status,
      totalAmount: creditNote.totalAmount ? creditNote.totalAmount.toString() : '0',
      appliedAmount: creditNote.appliedAmount ? creditNote.appliedAmount.toString() : '0',
      balance: creditNote.balance ? creditNote.balance.toString() : '0',
      description: creditNote.description || '',
      createdDate: this.formatDateTime(creditNote.createdDate),
      updatedAt: this.formatDateTime(creditNote.updatedAt),
    };
  }
}

