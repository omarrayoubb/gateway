import { Controller, BadRequestException } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { BankAccountsService } from './bank-accounts.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { BankAccountPaginationDto } from './dto/pagination.dto';
import { BankAccountType } from './entities/bank-account.entity';

@Controller()
export class BankAccountsGrpcController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @GrpcMethod('BankAccountsService', 'GetBankAccounts')
  async getBankAccounts(data: { sort?: string; is_active?: boolean }) {
    try {
      const query: BankAccountPaginationDto = {
        sort: data.sort,
        is_active: data.is_active !== undefined 
          ? (typeof data.is_active === 'boolean' ? data.is_active : data.is_active === 'true')
          : undefined,
      };

      const bankAccounts = await this.bankAccountsService.findAll(query);
      return {
        bankAccounts: bankAccounts.map(account => this.mapBankAccountToProto(account)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get bank accounts',
      });
    }
  }

  @GrpcMethod('BankAccountsService', 'GetBankAccount')
  async getBankAccount(data: { id: string }) {
    try {
      const bankAccount = await this.bankAccountsService.findOne(data.id);
      return this.mapBankAccountToProto(bankAccount);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get bank account',
      });
    }
  }

  @GrpcMethod('BankAccountsService', 'CreateBankAccount')
  async createBankAccount(data: any) {
    try {
      console.log('BankAccountsGrpcController - CreateBankAccount received:', JSON.stringify({
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
      }, null, 2));

      if (!data.account_name && !data.accountName) {
        throw new BadRequestException('account_name is required');
      }
      if (!data.account_number && !data.accountNumber) {
        throw new BadRequestException('account_number is required');
      }
      if (!data.bank_name && !data.bankName) {
        throw new BadRequestException('bank_name is required');
      }
      if (!data.account_type && !data.accountType) {
        throw new BadRequestException('account_type is required');
      }

      const createDto: CreateBankAccountDto = {
        organization_id: data.organizationId || data.organization_id || undefined,
        account_name: data.accountName || data.account_name,
        account_number: data.accountNumber || data.account_number,
        bank_name: data.bankName || data.bank_name,
        account_type: (data.accountType || data.account_type) as BankAccountType,
        currency: data.currency || 'USD',
        opening_balance: data.openingBalance !== undefined ? parseFloat(data.openingBalance.toString()) : undefined,
        is_active: data.isActive !== undefined 
          ? (typeof data.isActive === 'boolean' ? data.isActive : data.isActive === 'true')
          : undefined,
      };

      const bankAccount = await this.bankAccountsService.create(createDto);
      return this.mapBankAccountToProto(bankAccount);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create bank account',
      });
    }
  }

  @GrpcMethod('BankAccountsService', 'GetBankAccountBalance')
  async getBankAccountBalance(data: { id: string; as_of_date?: string }) {
    try {
      const balance = await this.bankAccountsService.getBalance(data.id, data.as_of_date);
      return {
        accountId: balance.account_id,
        accountName: balance.account_name,
        openingBalance: balance.opening_balance.toString(),
        currentBalance: balance.current_balance.toString(),
        asOfDate: balance.as_of_date,
        reconciledBalance: balance.reconciled_balance.toString(),
        unreconciledTransactions: balance.unreconciled_transactions,
      };
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to get bank account balance',
      });
    }
  }

  @GrpcMethod('BankAccountsService', 'DeleteBankAccount')
  async deleteBankAccount(data: { id: string }) {
    try {
      await this.bankAccountsService.remove(data.id);
      return { success: true, message: 'Bank account deleted successfully' };
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete bank account',
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

  private mapBankAccountToProto(account: any) {
    return {
      id: account.id,
      organizationId: account.organizationId || '',
      accountName: account.accountName || '',
      accountNumber: account.accountNumber || '',
      bankName: account.bankName || '',
      accountType: account.accountType,
      currency: account.currency || 'USD',
      openingBalance: account.openingBalance ? account.openingBalance.toString() : '0',
      currentBalance: account.currentBalance ? account.currentBalance.toString() : '0',
      isActive: account.isActive !== undefined ? account.isActive : true,
      createdDate: this.formatDateTime(account.createdDate),
      updatedAt: this.formatDateTime(account.updatedAt),
    };
  }
}

