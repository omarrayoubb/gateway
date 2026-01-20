import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrchestratorService } from './orchestrator.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import type {
  AccountFormOptionsResponse,
  ContactLeadFormOptionsResponse,
  RegisterFormOptionsResponse,
  DealFormOptionsResponse,
  ActivityFormOptionsResponse,
  DeliveryNoteFormOptionsResponse,
  RfqFormOptionsResponse,
  ContactResponse,
} from '@app/common/types/orchestrator';
import { ContactResponseDto } from '../contacts/dto/contact-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('orchestrator')
export class OrchestratorController {
  constructor(private readonly orchestratorService: OrchestratorService) {}

  @Get('account-creation-form')
  getAccountCreationForm(): Observable<AccountFormOptionsResponse> {
    return this.orchestratorService.getAccountFormOptions();
  }

  @Get('contact-lead-creation-form')
  getContactLeadCreationForm(): Observable<ContactLeadFormOptionsResponse> {
    return this.orchestratorService.getContactLeadFormOptions();
  }

  @Get('register-form')
  getRegisterForm(): Observable<RegisterFormOptionsResponse> {
    return this.orchestratorService.getRegisterFormOptions();
  }

  @Get('deal-form')
  getDealForm(): Observable<DealFormOptionsResponse> {
    return this.orchestratorService.getDealFormOptions();
  }

  @Get('activity-form')
  getActivityForm(): Observable<ActivityFormOptionsResponse> {
    return this.orchestratorService.getActivityFormOptions();
  }

  @Get('delivery-note-form')
  getDeliveryNoteForm(): Observable<DeliveryNoteFormOptionsResponse> {
    return this.orchestratorService.getDeliveryNoteFormOptions();
  }

  @Get('rfq-creation-form')
  getRfqCreationForm(): Observable<RfqFormOptionsResponse> {
    return this.orchestratorService.getRfqFormOptions();
  }

  @Patch('leads/:id/convert-to-contact')
  convertLeadToContact(
    @Param('id') id: string,
    @Request() req: any,
  ): Observable<ContactResponseDto> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.orchestratorService.convertLeadToContact(id, currentUser).pipe(
      map(response => this.mapContactResponseToDto(response))
    );
  }

  private mapContactResponseToDto(response: ContactResponse): ContactResponseDto {
    return {
      id: response.id,
      salutation: response.salutation ?? null,
      first_name: response.firstName,
      last_name: response.lastName,
      email: response.email,
      phone: response.phone ?? null,
      mobile_phone: response.mobilePhone ?? null,
      department: response.department ?? null,
      government_code: response.governmentCode ?? null,
      territory: response.territory ?? null,
      secondary_phone: response.secondaryPhone ?? null,
      assistant_name: response.assistantName ?? null,
      currency_code: response.currencyCode ?? null,
      username: response.username ?? null,
      wp_number: response.wpNumber ?? null,
      box_folder_id: response.boxFolderId ?? null,
      assigned_profile: response.assignedProfile ?? null,
      user_permissions: response.userPermissions ?? null,
      mailing_street: response.mailingStreet ?? null,
      mailing_city: response.mailingCity ?? null,
      mailing_state: response.mailingState ?? null,
      mailing_zip: response.mailingZip ?? null,
      mailing_country: response.mailingCountry ?? null,
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
      OwnerData: response.ownerData ? {
        id: response.ownerData.id,
        firstName: response.ownerData.name.split(' ')[0] || '',
        lastName: response.ownerData.name.split(' ').slice(1).join(' ') || '',
      } : null,
      Created_by: response.createdBy ?? '',
      Modified_by: response.modifiedBy ?? '',
      Account_details: response.accountDetails ? {
        id: response.accountDetails.id,
        name: response.accountDetails.name,
        accountNumber: response.accountDetails.accountNumber,
      } : null,
      Deals: (response.deals || []).map(deal => ({
        id: deal.id,
        name: deal.name,
      })),
      Activities: (response.activities || []).map(activity => ({
        id: activity.id,
        activityType: activity.activityType,
        subject: activity.subject,
      })),
    };
  }
}

