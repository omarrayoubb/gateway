import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Controller()
export class AccountsGrpcController {
  constructor(private readonly accountsService: AccountsService) {}

  @GrpcMethod('AccountsService', 'GetAccount')
  async getAccount(data: { id: string }) {
    const account = await this.accountsService.findOne(data.id);
    return this.mapAccountToProto(account);
  }

  @GrpcMethod('AccountsService', 'GetAccounts')
  async getAccounts(data: { page?: number; limit?: number; search?: string }) {
    const paginationQuery = {
      page: data.page || 1,
      limit: data.limit || 10,
      search: data.search || '',
    };
    
    const result = await this.accountsService.findAll(paginationQuery);
    
    return {
      accounts: result.data.map(a => this.mapAccountToProto(a)),
      total: result.total,
      page: result.page,
      limit: data.limit || 10,
    };
  }

  @GrpcMethod('AccountsService', 'CreateAccount')
  async createAccount(data: any) {
    const createDto: CreateAccountDto = {
      name: data.name,
      accountNumber: data.account_number,
      phone: data.phone,
      website: data.website,
      billing_street: data.billing_street,
      billing_city: data.billing_city,
      billing_state: data.billing_state,
      billing_zip: data.billing_zip,
      billing_country: data.billing_country,
      shipping_street: data.shipping_street,
      shipping_city: data.shipping_city,
      shipping_state: data.shipping_state,
      shipping_zip: data.shipping_zip,
      shipping_country: data.shipping_country,
      parentAccountId: data.parent_account_id,
      userIds: data.user_ids || [],
    };
    
    const account = await this.accountsService.create(createDto, { id: 'system', name: 'System' } as any);
    return this.mapAccountToProto(account);
  }

  @GrpcMethod('AccountsService', 'UpdateAccount')
  async updateAccount(data: any) {
    const updateDto: UpdateAccountDto = {
      name: data.name,
      // accountNumber is read-only, cannot be updated
      phone: data.phone,
      // website is not in UpdateAccountDto
      billing_street: data.billing_street,
      billing_city: data.billing_city,
      billing_state: data.billing_state,
      billing_zip: data.billing_zip,
      billing_country: data.billing_country,
      shipping_street: data.shipping_street,
      shipping_city: data.shipping_city,
      shipping_state: data.shipping_state,
      shipping_zip: data.shipping_zip,
      shipping_country: data.shipping_country,
      parentAccountId: data.parent_account_id,
    };
    
    const account = await this.accountsService.update(data.id, updateDto, { id: 'system', name: 'System' } as any);
    return this.mapAccountToProto(account);
  }

  @GrpcMethod('AccountsService', 'DeleteAccount')
  async deleteAccount(data: { id: string }) {
    await this.accountsService.remove(data.id);
    return { success: true, message: 'Account deleted successfully' };
  }

  private mapAccountToProto(account: any) {
    return {
      id: account.id,
      name: account.name,
      account_number: account.accountNumber || '',
      phone: account.phone || '',
      website: account.website || '',
      billing_street: account.billing_street || '',
      billing_city: account.billing_city || '',
      billing_state: account.billing_state || '',
      billing_zip: account.billing_zip || '',
      billing_country: account.billing_country || '',
      shipping_street: account.shipping_street || '',
      shipping_city: account.shipping_city || '',
      shipping_state: account.shipping_state || '',
      shipping_zip: account.shipping_zip || '',
      shipping_country: account.shipping_country || '',
      parent_account_id: account.parentAccountId || '',
      created_at: account.createdAt?.toISOString() || '',
      updated_at: account.updatedAt?.toISOString() || '',
    };
  }
}

