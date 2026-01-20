import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CreditNotesService } from './credit-notes.service';
import { CreateCreditNoteDto } from './dto/create-credit-note.dto';
import { UpdateCreditNoteDto } from './dto/update-credit-note.dto';
import { CreditNotePaginationDto } from './dto/pagination.dto';
import { ApplyCreditNoteDto } from './dto/apply-credit-note.dto';
import { CreditNoteStatus, CreditNoteReason } from './entities/credit-note.entity';

@Controller()
export class CreditNotesGrpcController {
  constructor(private readonly creditNotesService: CreditNotesService) {}

  @GrpcMethod('CreditNotesService', 'GetCreditNotes')
  async getCreditNotes(data: { sort?: string; status?: string; customer_id?: string }) {
    try {
      const query: CreditNotePaginationDto = {
        sort: data.sort,
        status: data.status as CreditNoteStatus,
        customer_id: data.customer_id,
      };

      const creditNotes = await this.creditNotesService.findAll(query);
      return {
        creditNotes: creditNotes.map(cn => this.mapCreditNoteToProto(cn)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get credit notes',
      });
    }
  }

  @GrpcMethod('CreditNotesService', 'GetCreditNote')
  async getCreditNote(data: { id: string }) {
    try {
      const creditNote = await this.creditNotesService.findOne(data.id);
      return this.mapCreditNoteToProto(creditNote);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get credit note',
      });
    }
  }

  @GrpcMethod('CreditNotesService', 'CreateCreditNote')
  async createCreditNote(data: any) {
    try {
      const createDto: CreateCreditNoteDto = {
        organization_id: data.organizationId || data.organization_id || undefined,
        credit_note_number: data.creditNoteNumber || data.credit_note_number || undefined,
        customer_id: data.customerId || data.customer_id,
        invoice_id: data.invoiceId || data.invoice_id || undefined,
        credit_date: data.creditDate || data.credit_date,
        reason: (data.reason || data.reason) as CreditNoteReason,
        total_amount: data.totalAmount !== undefined ? parseFloat(data.totalAmount) : undefined,
        description: data.description,
        items: data.items ? data.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity ? parseFloat(item.quantity) : undefined,
          unit_price: item.unitPrice !== undefined ? parseFloat(item.unitPrice) : undefined,
        })) : undefined,
        status: data.status ? (data.status as CreditNoteStatus) : undefined,
      };

      const creditNote = await this.creditNotesService.create(createDto);
      return this.mapCreditNoteToProto(creditNote);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create credit note',
      });
    }
  }

  @GrpcMethod('CreditNotesService', 'UpdateCreditNote')
  async updateCreditNote(data: any) {
    try {
      const updateDto: UpdateCreditNoteDto = {
        organization_id: data.organizationId || data.organization_id || undefined,
        credit_note_number: data.creditNoteNumber || data.credit_note_number || undefined,
        customer_id: data.customerId || data.customer_id || undefined,
        invoice_id: data.invoiceId || data.invoice_id || undefined,
        credit_date: data.creditDate || data.credit_date || undefined,
        reason: data.reason ? (data.reason as CreditNoteReason) : undefined,
        total_amount: data.totalAmount !== undefined ? parseFloat(data.totalAmount) : undefined,
        description: data.description || undefined,
        items: data.items ? data.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity ? parseFloat(item.quantity) : undefined,
          unit_price: item.unitPrice !== undefined ? parseFloat(item.unitPrice) : undefined,
        })) : undefined,
        status: data.status ? (data.status as CreditNoteStatus) : undefined,
      };

      const creditNote = await this.creditNotesService.update(data.id, updateDto);
      return this.mapCreditNoteToProto(creditNote);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 409 ? 6 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update credit note',
      });
    }
  }

  @GrpcMethod('CreditNotesService', 'ApplyCreditNote')
  async applyCreditNote(data: { id: string; invoice_id: string; amount: number }) {
    try {
      const applyDto: ApplyCreditNoteDto = {
        invoice_id: data.invoice_id,
        amount: parseFloat(data.amount.toString()),
      };

      const result = await this.creditNotesService.apply(data.id, applyDto);
      return {
        success: true,
        message: 'Credit note applied',
        creditNote: this.mapCreditNoteToProto(result.creditNote),
        invoice: {
          id: result.invoice.id,
          invoiceNumber: result.invoice.invoiceNumber || '',
          balanceDue: result.invoice.balanceDue.toString(),
          paidAmount: result.invoice.paidAmount.toString(),
          status: result.invoice.status,
        },
        appliedAmount: result.appliedAmount.toString(),
      };
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : error.status === 400 ? 3 : 2,
        message: error.message || 'Failed to apply credit note',
      });
    }
  }

  @GrpcMethod('CreditNotesService', 'DeleteCreditNote')
  async deleteCreditNote(data: { id: string }) {
    try {
      await this.creditNotesService.remove(data.id);
      return { success: true, message: 'Credit note deleted' };
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : error.status === 400 ? 3 : 2,
        message: error.message || 'Failed to delete credit note',
      });
    }
  }

  private mapCreditNoteToProto(creditNote: any): any {
    const formatDate = (date: any): string => {
      if (!date) return '';
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      }
      if (typeof date === 'string') {
        try {
          const parsedDate = new Date(date);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toISOString().split('T')[0];
          }
        } catch (e) {
          // If parsing fails, return date part if it's already in ISO format
        }
        return date.split('T')[0];
      }
      return '';
    };

    return {
      id: creditNote.id,
      organizationId: creditNote.organizationId || '',
      creditNoteNumber: creditNote.creditNoteNumber || '',
      customerId: creditNote.customerId || '',
      customerName: creditNote.customerName || '',
      invoiceId: creditNote.invoiceId || '',
      creditDate: formatDate(creditNote.creditDate),
      reason: creditNote.reason,
      status: creditNote.status,
      totalAmount: creditNote.totalAmount ? creditNote.totalAmount.toString() : '0',
      appliedAmount: creditNote.appliedAmount ? creditNote.appliedAmount.toString() : '0',
      balance: creditNote.balance ? creditNote.balance.toString() : '0',
    };
  }
}

