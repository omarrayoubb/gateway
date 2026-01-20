import { Controller, BadRequestException } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CashAccountsService } from './cash-accounts.service';
import { CreateCashAccountDto } from './dto/create-cash-account.dto';
import { CashAccountPaginationDto } from './dto/pagination.dto';

@Controller()
export class CashAccountsGrpcController {
  constructor(private readonly cashAccountsService: CashAccountsService) {}

  @GrpcMethod('CashAccountsService', 'GetCashAccounts')
  async getCashAccounts(data: { sort?: string; is_active?: boolean }) {
    try {
      const query: CashAccountPaginationDto = {
        sort: data.sort,
        is_active: data.is_active !== undefined 
          ? (typeof data.is_active === 'boolean' ? data.is_active : data.is_active === 'true')
          : undefined,
      };

      const cashAccounts = await this.cashAccountsService.findAll(query);
      return {
        cashAccounts: cashAccounts.map(account => this.mapCashAccountToProto(account)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get cash accounts',
      });
    }
  }

  @GrpcMethod('CashAccountsService', 'GetCashAccount')
  async getCashAccount(data: { id: string }) {
    try {
      const cashAccount = await this.cashAccountsService.findOne(data.id);
      return this.mapCashAccountToProto(cashAccount);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get cash account',
      });
    }
  }

  @GrpcMethod('CashAccountsService', 'CreateCashAccount')
  async createCashAccount(data: any) {
    try {
      console.log('CashAccountsGrpcController - CreateCashAccount received:', JSON.stringify({
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
      }, null, 2));

      if (!data.account_name && !data.accountName) {
        throw new BadRequestException('account_name is required');
      }
      if (!data.account_code && !data.accountCode) {
        throw new BadRequestException('account_code is required');
      }

      const createDto: CreateCashAccountDto = {
        organization_id: data.organizationId || data.organization_id || undefined,
        account_name: data.accountName || data.account_name,
        account_code: data.accountCode || data.account_code,
        location: data.location || undefined,
        currency: data.currency || 'USD',
        opening_balance: data.openingBalance !== undefined ? parseFloat(data.openingBalance.toString()) : undefined,
        is_active: data.isActive !== undefined 
          ? (typeof data.isActive === 'boolean' ? data.isActive : data.isActive === 'true')
          : undefined,
      };

      const cashAccount = await this.cashAccountsService.create(createDto);
      return this.mapCashAccountToProto(cashAccount);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create cash account',
      });
    }
  }

  @GrpcMethod('CashAccountsService', 'DeleteCashAccount')
  async deleteCashAccount(data: { id: string }) {
    try {
      await this.cashAccountsService.remove(data.id);
      return { success: true, message: 'Cash account deleted successfully' };
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete cash account',
      });
    }
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

  private mapCashAccountToProto(account: any) {
    return {
      id: account.id,
      organizationId: account.organizationId || '',
      accountName: account.accountName || '',
      accountCode: account.accountCode || '',
      location: account.location || '',
      currency: account.currency || 'USD',
      openingBalance: account.openingBalance ? account.openingBalance.toString() : '0',
      currentBalance: account.currentBalance ? account.currentBalance.toString() : '0',
      isActive: account.isActive !== undefined ? account.isActive : true,
      createdDate: this.formatDateTime(account.createdDate),
      updatedAt: this.formatDateTime(account.updatedAt),
    };
  }
}

