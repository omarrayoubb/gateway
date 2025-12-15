import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';

interface ContactsService {
  GetContact(data: { id: string }): Observable<any>;
  GetContacts(data: { page?: number; limit?: number; search?: string; account_id?: string }): Observable<any>;
  CreateContact(data: any): Observable<any>;
  UpdateContact(data: any): Observable<any>;
  DeleteContact(data: { id: string }): Observable<any>;
}

interface AccountsService {
  GetAccount(data: { id: string }): Observable<any>;
  GetAccounts(data: { page?: number; limit?: number; search?: string }): Observable<any>;
  CreateAccount(data: any): Observable<any>;
  UpdateAccount(data: any): Observable<any>;
  DeleteAccount(data: { id: string }): Observable<any>;
}

@Injectable()
export class CrmClientService implements OnModuleInit {
  private contactsService: ContactsService;
  private accountsService: AccountsService;

  constructor(@Inject('CRM_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.contactsService = this.client.getService<ContactsService>('ContactsService');
    this.accountsService = this.client.getService<AccountsService>('AccountsService');
  }

  // Contacts methods
  async getContact(id: string) {
    return await firstValueFrom(this.contactsService.GetContact({ id }));
  }

  async getContacts(page = 1, limit = 100, search = '', accountId?: string) {
    return await firstValueFrom(
      this.contactsService.GetContacts({ page, limit, search, account_id: accountId })
    );
  }

  async getContactById(id: string) {
    try {
      return await this.getContact(id);
    } catch (error) {
      return null;
    }
  }

  // Accounts methods
  async getAccount(id: string) {
    return await firstValueFrom(this.accountsService.GetAccount({ id }));
  }

  async getAccounts(page = 1, limit = 100, search = '') {
    return await firstValueFrom(this.accountsService.GetAccounts({ page, limit, search }));
  }

  async getAccountById(id: string) {
    try {
      return await this.getAccount(id);
    } catch (error) {
      return null;
    }
  }

  // Helper methods for Desk to get account/contact names
  async getAccountName(accountId: string): Promise<string> {
    if (!accountId) return '';
    try {
      const account = await this.getAccount(accountId);
      return account?.name || '';
    } catch (error) {
      return '';
    }
  }

  async getContactName(contactId: string): Promise<string> {
    if (!contactId) return '';
    try {
      const contact = await this.getContact(contactId);
      return contact ? `${contact.first_name} ${contact.last_name}`.trim() : '';
    } catch (error) {
      return '';
    }
  }
}

