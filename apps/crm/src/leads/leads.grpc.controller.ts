import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@Controller()
export class LeadsGrpcController {
  constructor(private readonly leadsService: LeadsService) {}

  @GrpcMethod('LeadsService', 'GetLead')
  async getLead(data: { id: string }) {
    const lead = await this.leadsService.findOne(data.id);
    return this.mapLeadToProto(lead);
  }

  @GrpcMethod('LeadsService', 'GetLeads')
  async getLeads(data: { page?: number; limit?: number; search?: string }) {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const result = await this.leadsService.findAll({ page, limit, search: data.search || '' });
    return {
      leads: result.data.map(lead => this.mapLeadToProto(lead)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @GrpcMethod('LeadsService', 'CreateLead')
  async createLead(data: any) {
    const createDto: CreateLeadDto = {
      ownerId: data.owner_id || '',
      salutation: data.salutation || '',
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      email: data.email,
      shipping_street: data.shipping_street,
      billing_city: data.billing_city,
      accountId: data.account_id,
      product_name: data.product_name,
      currency_code: data.currency_code,
      employee_count: data.employee_count,
      hq_code: data.hq_code,
      billing_amount: data.billing_amount,
      exchange_rate: data.exchange_rate,
      shipping_street_2: data.shipping_street_2,
      shipping_city: data.shipping_city,
      shipping_state: data.shipping_state,
      shipping_country: data.shipping_country,
      shipping_zip_code: data.shipping_zip_code,
      billing_street: data.billing_street,
      billing_street_2: data.billing_street_2,
      billing_state: data.billing_state,
      billing_country: data.billing_country,
      billing_zip_code: data.billing_zip_code,
    };
    const lead = await this.leadsService.create(createDto, { id: 'system', name: 'System' } as any);
    return this.mapLeadToProto(lead);
  }

  @GrpcMethod('LeadsService', 'UpdateLead')
  async updateLead(data: any) {
    const updateDto: UpdateLeadDto = {
      ownerId: data.owner_id,
      salutation: data.salutation,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      email: data.email,
      shipping_street: data.shipping_street,
      billing_city: data.billing_city,
      accountId: data.account_id,
      product_name: data.product_name,
      currency_code: data.currency_code,
      employee_count: data.employee_count,
      hq_code: data.hq_code,
      billing_amount: data.billing_amount,
      exchange_rate: data.exchange_rate,
      shipping_street_2: data.shipping_street_2,
      shipping_city: data.shipping_city,
      shipping_state: data.shipping_state,
      shipping_country: data.shipping_country,
      shipping_zip_code: data.shipping_zip_code,
      billing_street: data.billing_street,
      billing_street_2: data.billing_street_2,
      billing_state: data.billing_state,
      billing_country: data.billing_country,
      billing_zip_code: data.billing_zip_code,
    };
    const lead = await this.leadsService.update(data.id, updateDto, { id: 'system', name: 'System' } as any);
    return this.mapLeadToProto(lead);
  }

  @GrpcMethod('LeadsService', 'DeleteLead')
  async deleteLead(data: { id: string }) {
    await this.leadsService.remove(data.id);
    return { success: true, message: 'Lead deleted successfully' };
  }

  private mapLeadToProto(lead: any) {
    return {
      id: lead.id,
      owner_id: lead.ownerId || '',
      salutation: lead.salutation || '',
      first_name: lead.first_name || '',
      last_name: lead.last_name || '',
      phone: lead.phone || '',
      email: lead.email || '',
      shipping_street: lead.shipping_street || '',
      billing_city: lead.billing_city || '',
      account_id: lead.accountId || '',
      product_name: lead.product_name || '',
      currency_code: lead.currency_code || '',
      employee_count: lead.employee_count || 0,
      hq_code: lead.hq_code || '',
      billing_amount: lead.billing_amount || 0,
      exchange_rate: lead.exchange_rate || 0,
      created_at: lead.createdAt?.toISOString() || '',
      updated_at: lead.updatedAt?.toISOString() || '',
    };
  }
}

