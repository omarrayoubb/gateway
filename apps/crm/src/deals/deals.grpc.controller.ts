import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';

@Controller()
export class DealsGrpcController {
  constructor(private readonly dealsService: DealsService) {}

  @GrpcMethod('DealsService', 'GetDeal')
  async getDeal(data: { id: string }) {
    const deal = await this.dealsService.findOne(data.id);
    return this.mapDealToProto(deal);
  }

  @GrpcMethod('DealsService', 'GetDeals')
  async getDeals(data: { page?: number; limit?: number; search?: string }) {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const result = await this.dealsService.findAll({ page, limit, search: data.search || '' });
    return {
      deals: result.data.map(deal => this.mapDealToProto(deal)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @GrpcMethod('DealsService', 'CreateDeal')
  async createDeal(data: any) {
    const createDto: CreateDealDto = {
      name: data.name,
      accountId: data.account_id,
      ownerId: data.owner_id,
      leadId: data.lead_id || null,
      contactId: data.contact_id || null,
      amount: data.amount,
      closingDate: data.closing_date ? new Date(data.closing_date) : undefined,
      currency: data.currency,
      type: data.type,
      stage: data.stage,
      probability: data.probability,
      leadSource: data.lead_source,
      description: data.description,
      boxFolderId: data.box_folder_id,
      campaignSource: data.campaign_source,
      quote: data.quote,
    };
    const deal = await this.dealsService.create(createDto, { id: 'system', name: 'System' } as any);
    return this.mapDealToProto(deal);
  }

  @GrpcMethod('DealsService', 'UpdateDeal')
  async updateDeal(data: any) {
    const updateDto: UpdateDealDto = {
      name: data.name,
      accountId: data.account_id,
      ownerId: data.owner_id,
      leadId: data.lead_id,
      contactId: data.contact_id,
      amount: data.amount,
      closingDate: data.closing_date ? new Date(data.closing_date) : undefined,
      currency: data.currency,
      type: data.type,
      stage: data.stage,
      probability: data.probability,
      leadSource: data.lead_source,
      description: data.description,
      boxFolderId: data.box_folder_id,
      campaignSource: data.campaign_source,
      quote: data.quote,
    };
    const deal = await this.dealsService.update(data.id, updateDto, { id: 'system', name: 'System' } as any);
    return this.mapDealToProto(deal);
  }

  @GrpcMethod('DealsService', 'DeleteDeal')
  async deleteDeal(data: { id: string }) {
    await this.dealsService.remove(data.id);
    return { success: true, message: 'Deal deleted successfully' };
  }

  private mapDealToProto(deal: any) {
    return {
      id: deal.id,
      name: deal.name || '',
      account_id: deal.accountId || '',
      owner_id: deal.ownerId || '',
      lead_id: deal.leadId || '',
      contact_id: deal.contactId || '',
      amount: deal.amount || 0,
      closing_date: deal.closingDate?.toISOString() || '',
      currency: deal.currency || '',
      type: deal.type || '',
      stage: deal.stage || '',
      probability: deal.probability || 0,
      lead_source: deal.leadSource || '',
      description: deal.description || '',
      box_folder_id: deal.boxFolderId || '',
      campaign_source: deal.campaignSource || '',
      quote: deal.quote || '',
      created_at: deal.createdAt?.toISOString() || '',
      updated_at: deal.updatedAt?.toISOString() || '',
    };
  }
}

