import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller()
export class ContactsGrpcController {
  constructor(private readonly contactsService: ContactsService) {}

  @GrpcMethod('ContactsService', 'GetContact')
  async getContact(data: { id: string }) {
    const contact = await this.contactsService.findOne(data.id);
    return this.mapContactToProto(contact);
  }

  @GrpcMethod('ContactsService', 'GetContacts')
  async getContacts(data: { page?: number; limit?: number; search?: string; account_id?: string }) {
    const paginationQuery = {
      page: data.page || 1,
      limit: data.limit || 10,
      search: data.search || '',
    };
    
    const result = await this.contactsService.findAll(paginationQuery);
    
    // Filter by account_id if provided
    let contacts = result.data;
    if (data.account_id) {
      contacts = contacts.filter(c => c.Account_details?.id === data.account_id);
    }
    
    return {
      contacts: contacts.map(c => this.mapContactToProto(c)),
      total: result.total,
      page: result.page,
      limit: data.limit || 10,
    };
  }

  @GrpcMethod('ContactsService', 'CreateContact')
  async createContact(data: any, @CurrentUser() user: any) {
    const createDto: CreateContactDto = {
      salutation: data.salutation,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      mobile_phone: data.mobile_phone,
      accountId: data.account_id,
      department: data.department,
      territory: data.territory,
      mailing_street: data.mailing_street,
      mailing_city: data.mailing_city,
      mailing_state: data.mailing_state,
      mailing_zip: data.mailing_zip,
      mailing_country: data.mailing_country,
    };
    
    const contact = await this.contactsService.create(createDto, user);
    return this.mapContactToProto(contact);
  }

  @GrpcMethod('ContactsService', 'UpdateContact')
  async updateContact(data: any, @CurrentUser() user: any) {
    const updateDto: UpdateContactDto = {
      salutation: data.salutation,
      first_name: data.first_name,
      last_name: data.last_name,
      // email is not allowed to be updated
      phone: data.phone,
      mobile_phone: data.mobile_phone,
      // accountId is not in UpdateContactDto, would need to be handled separately
      department: data.department,
      territory: data.territory,
      mailing_street: data.mailing_street,
      mailing_city: data.mailing_city,
      mailing_state: data.mailing_state,
      mailing_zip: data.mailing_zip,
      mailing_country: data.mailing_country,
    };
    
    const contact = await this.contactsService.update(data.id, updateDto, user);
    return this.mapContactToProto(contact);
  }

  @GrpcMethod('ContactsService', 'DeleteContact')
  async deleteContact(data: { id: string }) {
    await this.contactsService.remove(data.id);
    return { success: true, message: 'Contact deleted successfully' };
  }

  private mapContactToProto(contact: any) {
    return {
      id: contact.id,
      salutation: contact.salutation || '',
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      phone: contact.phone || '',
      mobile_phone: contact.mobile_phone || '',
      account_id: contact.Account_details?.id || '',
      account_name: contact.Account_details?.name || '',
      department: contact.department || '',
      territory: contact.territory || '',
      mailing_street: contact.mailing_street || '',
      mailing_city: contact.mailing_city || '',
      mailing_state: contact.mailing_state || '',
      mailing_zip: contact.mailing_zip || '',
      mailing_country: contact.mailing_country || '',
      created_at: contact.createdAt?.toISOString() || '',
      updated_at: contact.updatedAt?.toISOString() || '',
    };
  }
}

