import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';

interface ContactsService {
  GetContact(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetContacts(data: { page?: number; limit?: number; search?: string; account_id?: string }, metadata?: Metadata): Observable<any>;
  CreateContact(data: any, metadata?: Metadata): Observable<any>;
  UpdateContact(data: any, metadata?: Metadata): Observable<any>;
  DeleteContact(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface AccountsService {
  GetAccount(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetAccounts(data: { page?: number; limit?: number; search?: string }, metadata?: Metadata): Observable<any>;
  CreateAccount(data: any, metadata?: Metadata): Observable<any>;
  UpdateAccount(data: any, metadata?: Metadata): Observable<any>;
  DeleteAccount(data: { id: string }, metadata?: Metadata): Observable<any>;
}

@Injectable()
export class CrmService implements OnModuleInit {
  private contactsService: ContactsService;
  private accountsService: AccountsService;

  constructor(@Inject('CRM_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.contactsService = this.client.getService<ContactsService>('ContactsService');
    this.accountsService = this.client.getService<AccountsService>('AccountsService');
  }

  private createMetadata(token?: string): Metadata {
    const metadata = new Metadata();
    if (token) {
      metadata.add('authorization', `Bearer ${token}`);
    }
    return metadata;
  }

  // Contacts methods
  async getContact(id: string, token?: string) {
    return await firstValueFrom(
      this.contactsService.GetContact({ id }, this.createMetadata(token))
    );
  }

  async getContacts(page = 1, limit = 10, search = '', accountId?: string, token?: string) {
    return await firstValueFrom(
      this.contactsService.GetContacts(
        { page, limit, search, account_id: accountId },
        this.createMetadata(token)
      )
    );
  }

  async createContact(data: any, token?: string) {
    return await firstValueFrom(
      this.contactsService.CreateContact(data, this.createMetadata(token))
    );
  }

  async updateContact(id: string, data: any, token?: string) {
    return await firstValueFrom(
      this.contactsService.UpdateContact({ id, ...data }, this.createMetadata(token))
    );
  }

  async deleteContact(id: string, token?: string) {
    return await firstValueFrom(
      this.contactsService.DeleteContact({ id }, this.createMetadata(token))
    );
  }

  // Accounts methods
  async getAccount(id: string, token?: string) {
    return await firstValueFrom(
      this.accountsService.GetAccount({ id }, this.createMetadata(token))
    );
  }

  async getAccounts(page = 1, limit = 10, search = '', token?: string) {
    return await firstValueFrom(
      this.accountsService.GetAccounts({ page, limit, search }, this.createMetadata(token))
    );
  }

  async createAccount(data: any, token?: string) {
    return await firstValueFrom(
      this.accountsService.CreateAccount(data, this.createMetadata(token))
    );
  }

  async updateAccount(id: string, data: any, token?: string) {
    return await firstValueFrom(
      this.accountsService.UpdateAccount({ id, ...data }, this.createMetadata(token))
    );
  }

  async deleteAccount(id: string, token?: string) {
    return await firstValueFrom(
      this.accountsService.DeleteAccount({ id }, this.createMetadata(token))
    );
  }
}

