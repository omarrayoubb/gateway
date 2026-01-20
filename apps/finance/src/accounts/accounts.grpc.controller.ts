import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountType } from './entities/account.entity';

@Controller()
export class AccountsGrpcController {
  constructor(private readonly accountsService: AccountsService) {}

  @GrpcMethod('AccountsService', 'GetAccount')
  async getAccount(data: { id: string }) {
    try {
      const account = await this.accountsService.findOne(data.id);
      return this.mapAccountToProto(account);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get account',
      });
    }
  }

  @GrpcMethod('AccountsService', 'GetAccounts')
  async getAccounts(data: {
    limit?: number;
    sort?: string;
    filter?: string;
  }) {
    try {
      const accounts = await this.accountsService.findAll({
        limit: data.limit,
        sort: data.sort,
        filter: data.filter,
      });

      return {
        accounts: accounts.map(account => this.mapAccountToProto(account)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get accounts',
      });
    }
  }

  @GrpcMethod('AccountsService', 'CreateAccount')
  async createAccount(data: any) {
    try {
      const createDto: CreateAccountDto = {
        organization_id: data.organizationId || data.organization_id || undefined,
        account_code: data.accountCode || data.account_code,
        account_name: data.accountName || data.account_name,
        account_type: (data.accountType || data.account_type) as AccountType,
        account_subtype: data.accountSubtype || data.account_subtype || undefined,
        description: data.description || undefined,
        balance: data.balance !== undefined ? parseFloat(data.balance) : undefined,
        currency: data.currency || 'USD',
        is_active: data.isActive !== undefined ? data.isActive : (data.is_active !== undefined ? data.is_active : true),
      };

      const account = await this.accountsService.create(createDto);
      return this.mapAccountToProto(account);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create account',
      });
    }
  }

  @GrpcMethod('AccountsService', 'UpdateAccount')
  async updateAccount(data: any) {
    try {
      const updateDto: UpdateAccountDto = {
        organization_id: data.organizationId || data.organization_id,
        account_code: data.accountCode || data.account_code,
        account_name: data.accountName || data.account_name,
        account_type: (data.accountType || data.account_type) as AccountType,
        account_subtype: data.accountSubtype || data.account_subtype,
        description: data.description,
        balance: data.balance !== undefined ? parseFloat(data.balance) : undefined,
        currency: data.currency,
        is_active: data.isActive !== undefined ? data.isActive : data.is_active,
      };

      const account = await this.accountsService.update(data.id, updateDto);
      return this.mapAccountToProto(account);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update account',
      });
    }
  }

  @GrpcMethod('AccountsService', 'DeleteAccount')
  async deleteAccount(data: { id: string }) {
    try {
      await this.accountsService.remove(data.id);
      return { success: true };
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to delete account',
      });
    }
  }

  private mapAccountToProto(account: any): any {
    return {
      id: account.id,
      organizationId: account.organizationId,
      accountCode: account.accountCode,
      accountName: account.accountName,
      accountType: account.accountType,
      accountSubtype: account.accountSubtype || '',
      description: account.description || '',
      balance: account.balance?.toString() || '0',
      currency: account.currency || 'USD',
      isActive: account.isActive !== undefined ? account.isActive : true,
      createdDate: account.createdDate?.toISOString() || account.createdAt?.toISOString() || '',
      updatedAt: account.updatedAt?.toISOString() || '',
    };
  }
}

