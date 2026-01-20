import { Controller, BadRequestException } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { ChequesService } from './cheques.service';
import { CreateChequeDto } from './dto/create-cheque.dto';
import { ChequePaginationDto } from './dto/pagination.dto';
import { DepositChequeDto } from './dto/deposit-cheque.dto';
import { ClearChequeDto } from './dto/clear-cheque.dto';
import { ChequeType, ChequeStatus } from './entities/cheque.entity';

@Controller()
export class ChequesGrpcController {
  constructor(private readonly chequesService: ChequesService) {}

  @GrpcMethod('ChequesService', 'GetCheques')
  async getCheques(data: { sort?: string; type?: string; status?: string }) {
    try {
      const query: ChequePaginationDto = {
        sort: data.sort,
        type: data.type as ChequeType,
        status: data.status as ChequeStatus,
      };

      const cheques = await this.chequesService.findAll(query);
      return {
        cheques: cheques.map(cheque => this.mapChequeToProto(cheque)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get cheques',
      });
    }
  }

  @GrpcMethod('ChequesService', 'GetCheque')
  async getCheque(data: { id: string }) {
    try {
      const cheque = await this.chequesService.findOne(data.id);
      return this.mapChequeToProto(cheque);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get cheque',
      });
    }
  }

  @GrpcMethod('ChequesService', 'CreateCheque')
  async createCheque(data: any) {
    try {
      console.log('ChequesGrpcController - CreateCheque received:', JSON.stringify({
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
      }, null, 2));

      if (!data.cheque_number && !data.chequeNumber) {
        throw new BadRequestException('cheque_number is required');
      }
      if (!data.type) {
        throw new BadRequestException('type is required');
      }
      if (!data.cheque_date && !data.chequeDate) {
        throw new BadRequestException('cheque_date is required');
      }
      if (!data.payee_name && !data.payeeName) {
        throw new BadRequestException('payee_name is required');
      }

      const createDto: CreateChequeDto = {
        organization_id: data.organizationId || data.organization_id || undefined,
        cheque_number: data.chequeNumber || data.cheque_number,
        type: (data.type) as ChequeType,
        cheque_date: data.chequeDate || data.cheque_date,
        amount: data.amount !== undefined ? parseFloat(data.amount.toString()) : undefined,
        currency: data.currency || 'USD',
        payee_name: data.payeeName || data.payee_name,
        bank_name: data.bankName || data.bank_name || undefined,
        bank_account_id: data.bankAccountId || data.bank_account_id || undefined,
      };

      const cheque = await this.chequesService.create(createDto);
      return this.mapChequeToProto(cheque);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create cheque',
      });
    }
  }

  @GrpcMethod('ChequesService', 'DepositCheque')
  async depositCheque(data: any) {
    try {
      const depositDto: DepositChequeDto = {
        deposit_date: data.deposit_date || data.depositDate || undefined,
        bank_account_id: data.bank_account_id || data.bankAccountId,
      };
      const cheque = await this.chequesService.deposit(data.id, depositDto);
      return this.mapChequeToProto(cheque);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to deposit cheque',
      });
    }
  }

  @GrpcMethod('ChequesService', 'ClearCheque')
  async clearCheque(data: any) {
    try {
      const clearDto: ClearChequeDto = {
        clear_date: data.clear_date || data.clearDate || undefined,
      };
      const cheque = await this.chequesService.clear(data.id, clearDto);
      return this.mapChequeToProto(cheque);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to clear cheque',
      });
    }
  }

  @GrpcMethod('ChequesService', 'DeleteCheque')
  async deleteCheque(data: { id: string }) {
    try {
      await this.chequesService.remove(data.id);
      return { success: true, message: 'Cheque deleted successfully' };
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete cheque',
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

  private mapChequeToProto(cheque: any) {
    return {
      id: cheque.id,
      organizationId: cheque.organizationId || '',
      chequeNumber: cheque.chequeNumber || '',
      type: cheque.type,
      chequeDate: this.formatDate(cheque.chequeDate),
      amount: cheque.amount ? cheque.amount.toString() : '0',
      currency: cheque.currency || 'USD',
      payeeName: cheque.payeeName || '',
      bankName: cheque.bankName || '',
      status: cheque.status,
      bankAccountId: cheque.bankAccountId || '',
      depositDate: this.formatDate(cheque.depositDate),
      clearDate: this.formatDate(cheque.clearDate),
      createdDate: this.formatDateTime(cheque.createdDate),
      updatedAt: this.formatDateTime(cheque.updatedAt),
    };
  }
}

