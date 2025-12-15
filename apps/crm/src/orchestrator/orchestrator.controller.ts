import { Controller, Get, Patch, Param, Request, UseGuards } from '@nestjs/common';
import { OrchestratorService } from './orchestrator.service';
import { JwtAuthGuard } from '../auth/jwt.authguard';
import { AuthorizationGuard } from '../auth/authorization.guard';
import { 
  AccountOrchestratorResponse, 
  ContactLeadOrchestratorResponse,
  RegisterFormOrchestratorResponse,
  DealFormOrchestratorResponse 
} from './dto/orchestrator-response.dto';
import { ContactResponseDto } from '../contacts/dto/contact-response.dto';
import { User } from '../users/users.entity';

@UseGuards(JwtAuthGuard, AuthorizationGuard)
@Controller('orchestrator')
export class OrchestratorController {
  constructor(private readonly orchestratorService: OrchestratorService) {}

  @Get('account-creation-form')
  getAccountCreationForm(): Promise<AccountOrchestratorResponse> {
    return this.orchestratorService.getAccountFormOptions();
  }

  @Get('contact-lead-creation-form')
  getContactLeadCreationForm(): Promise<ContactLeadOrchestratorResponse> {
    return this.orchestratorService.getContactLeadFormOptions();
  }

  @Get('register-form')
  getRegisterForm(): Promise<RegisterFormOrchestratorResponse> {
    return this.orchestratorService.getRegisterFormOptions();
  }

  @Get('deal-form')
  getDealForm(): Promise<DealFormOrchestratorResponse> {
    return this.orchestratorService.getDealFormOptions();
  }

  /**
   * PATCH /orchestrator/leads/:id/convert-to-contact
   * Converts a lead to a contact by removing the lead and inserting all its data into contacts table.
   */
  @Patch('leads/:id/convert-to-contact')
  convertLeadToContact(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ContactResponseDto> {
    const currentUser: Omit<User, 'password'> = req.user;
    return this.orchestratorService.convertLeadToContact(id, currentUser);
  }
}