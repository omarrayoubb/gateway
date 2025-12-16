import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { OrchestratorService } from './orchestrator.service';
import { Metadata } from '@grpc/grpc-js';
import type {
  Empty,
  ConvertLeadToContactRequest,
  AccountFormOptionsResponse,
  ContactLeadFormOptionsResponse,
  RegisterFormOptionsResponse,
  DealFormOptionsResponse,
  ActivityFormOptionsResponse,
  DeliveryNoteFormOptionsResponse,
  ContactResponse,
} from '@app/common/types/orchestrator';

@Controller()
export class OrchestratorController {
  constructor(private readonly orchestratorService: OrchestratorService) {}

  @GrpcMethod('OrchestratorService', 'GetAccountFormOptions')
  async getAccountFormOptions(data: Empty): Promise<AccountFormOptionsResponse> {
    try {
      const result = await this.orchestratorService.getAccountFormOptions();
      return this.mapAccountFormOptionsToProto(result);
    } catch (error) {
      console.error('Error in getAccountFormOptions:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred',
      });
    }
  }

  @GrpcMethod('OrchestratorService', 'GetContactLeadFormOptions')
  async getContactLeadFormOptions(data: Empty): Promise<ContactLeadFormOptionsResponse> {
    try {
      const result = await this.orchestratorService.getContactLeadFormOptions();
      return this.mapContactLeadFormOptionsToProto(result);
    } catch (error) {
      console.error('Error in getContactLeadFormOptions:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred',
      });
    }
  }

  @GrpcMethod('OrchestratorService', 'GetRegisterFormOptions')
  async getRegisterFormOptions(data: Empty): Promise<RegisterFormOptionsResponse> {
    try {
      const result = await this.orchestratorService.getRegisterFormOptions();
      return this.mapRegisterFormOptionsToProto(result);
    } catch (error) {
      console.error('Error in getRegisterFormOptions:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred',
      });
    }
  }

  @GrpcMethod('OrchestratorService', 'GetDealFormOptions')
  async getDealFormOptions(data: Empty): Promise<DealFormOptionsResponse> {
    try {
      const result = await this.orchestratorService.getDealFormOptions();
      return this.mapDealFormOptionsToProto(result);
    } catch (error) {
      console.error('Error in getDealFormOptions:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred',
      });
    }
  }

  @GrpcMethod('OrchestratorService', 'GetActivityFormOptions')
  async getActivityFormOptions(data: Empty): Promise<ActivityFormOptionsResponse> {
    try {
      const result = await this.orchestratorService.getActivityFormOptions();
      return this.mapActivityFormOptionsToProto(result);
    } catch (error) {
      console.error('Error in getActivityFormOptions:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred',
      });
    }
  }

  @GrpcMethod('OrchestratorService', 'GetDeliveryNoteFormOptions')
  async getDeliveryNoteFormOptions(data: Empty): Promise<DeliveryNoteFormOptionsResponse> {
    try {
      const result = await this.orchestratorService.getDeliveryNoteFormOptions();
      return this.mapDeliveryNoteFormOptionsToProto(result);
    } catch (error) {
      console.error('Error in getDeliveryNoteFormOptions:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred',
      });
    }
  }

  @GrpcMethod('OrchestratorService', 'ConvertLeadToContact')
  async convertLeadToContact(
    data: ConvertLeadToContactRequest,
    metadata: Metadata,
  ): Promise<ContactResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const result = await this.orchestratorService.convertLeadToContact(data.leadId, currentUser);
      return this.mapContactResponseToProto(result);
    } catch (error) {
      console.error(`Error in convertLeadToContact for leadId ${data.leadId}:`, error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred',
      });
    }
  }

  private extractUserFromMetadata(metadata: Metadata): { id: string; name: string; email: string } {
    const userId = metadata.get('user-id')[0] as string;
    const userName = metadata.get('user-name')[0] as string;
    const userEmail = metadata.get('user-email')[0] as string;

    if (!userId || !userName || !userEmail) {
      throw new RpcException({
        code: 16,
        message: 'User information missing from metadata',
      });
    }

    return {
      id: userId,
      name: userName,
      email: userEmail,
    };
  }

  private mapAccountFormOptionsToProto(dto: any): AccountFormOptionsResponse {
    return {
      owners: dto.owners.map((owner: any) => ({
        id: owner.id,
        name: owner.name,
        email: owner.email,
      })),
    };
  }

  private mapContactLeadFormOptionsToProto(dto: any): ContactLeadFormOptionsResponse {
    return {
      owners: dto.owners.map((owner: any) => ({
        id: owner.id,
        name: owner.name,
        email: owner.email,
      })),
      accounts: dto.accounts.map((account: any) => ({
        id: account.id,
        name: account.name,
        accountNumber: account.accountNumber,
      })),
    };
  }

  private mapRegisterFormOptionsToProto(dto: any): RegisterFormOptionsResponse {
    return {
      profiles: dto.profiles.map((profile: any) => ({
        id: profile.id,
        name: profile.name,
      })),
      roles: dto.roles.map((role: any) => ({
        id: role.id,
        name: role.name,
      })),
    };
  }

  private mapDealFormOptionsToProto(dto: any): DealFormOptionsResponse {
    return {
      leads: dto.leads.map((lead: any) => ({
        id: lead.id,
        name: lead.name,
      })),
      contacts: dto.contacts.map((contact: any) => ({
        id: contact.id,
        name: contact.name,
      })),
      accounts: dto.accounts.map((account: any) => ({
        id: account.id,
        name: account.name,
        accountNumber: account.accountNumber,
      })),
      users: dto.users.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
      })),
    };
  }

  private mapActivityFormOptionsToProto(dto: any): ActivityFormOptionsResponse {
    return {
      leads: dto.leads.map((lead: any) => ({
        id: lead.id,
        name: lead.name,
      })),
      contacts: dto.contacts.map((contact: any) => ({
        id: contact.id,
        name: contact.name,
      })),
    };
  }

  private mapDeliveryNoteFormOptionsToProto(dto: any): DeliveryNoteFormOptionsResponse {
    return {
      accounts: dto.accounts.map((account: any) => ({
        id: account.id,
        name: account.name,
        accountNumber: account.accountNumber,
      })),
    };
  }

  private mapContactResponseToProto(dto: any): ContactResponse {
    return {
      id: dto.id,
      salutation: dto.salutation ?? undefined,
      firstName: dto.first_name,
      lastName: dto.last_name,
      email: dto.email,
      phone: dto.phone ?? undefined,
      mobilePhone: dto.mobile_phone ?? undefined,
      department: dto.department ?? undefined,
      governmentCode: dto.government_code ?? undefined,
      territory: dto.territory ?? undefined,
      secondaryPhone: dto.secondary_phone ?? undefined,
      assistantName: dto.assistant_name ?? undefined,
      currencyCode: dto.currency_code ?? undefined,
      username: dto.username ?? undefined,
      wpNumber: dto.wp_number ?? undefined,
      boxFolderId: dto.box_folder_id ?? undefined,
      assignedProfile: dto.assigned_profile ?? undefined,
      userPermissions: dto.user_permissions ?? undefined,
      mailingStreet: dto.mailing_street ?? undefined,
      mailingCity: dto.mailing_city ?? undefined,
      mailingState: dto.mailing_state ?? undefined,
      mailingZip: dto.mailing_zip ?? undefined,
      mailingCountry: dto.mailing_country ?? undefined,
      ownerData: dto.OwnerData ? {
        id: dto.OwnerData.id,
        name: `${dto.OwnerData.firstName} ${dto.OwnerData.lastName}`,
        email: dto.OwnerData.email || '',
      } : undefined,
      createdBy: dto.Created_by ?? undefined,
      modifiedBy: dto.Modified_by ?? undefined,
      accountDetails: dto.Account_details ? {
        id: dto.Account_details.id,
        name: dto.Account_details.name,
        accountNumber: dto.Account_details.accountNumber,
      } : undefined,
      deals: (dto.Deals || []).map((deal: any) => ({
        id: deal.id,
        name: deal.name,
      })),
      activities: (dto.Activities || []).map((activity: any) => ({
        id: activity.id,
        activityType: activity.activityType,
        subject: activity.subject,
      })),
      createdAt: dto.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: dto.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }
}
