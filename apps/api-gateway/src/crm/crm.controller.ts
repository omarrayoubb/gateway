import { 
  Controller, 
  Get, 
  Param, 
  Query, 
  Post, 
  Body, 
  Patch, 
  Delete, 
  HttpCode, 
  HttpStatus, 
  ParseUUIDPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CrmService } from './crm.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateContactDto } from './dto/contacts/create-contact.dto';
import { UpdateContactDto } from './dto/contacts/update-contact.dto';
import { CreateAccountDto } from './dto/accounts/create-account.dto';
import { UpdateAccountDto } from './dto/accounts/update-account.dto';

@Controller('crm')
// @UseGuards(JwtAuthGuard)
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  // ============================================
  // CONTACTS ENDPOINTS
  // ============================================

  @Post('contacts')
  async createContact(@Body() createContactDto: CreateContactDto, @Request() req: any) {
    // Map DTO to gRPC format
    const grpcData = {
      salutation: createContactDto.salutation || '',
      first_name: createContactDto.first_name,
      last_name: createContactDto.last_name,
      email: createContactDto.email,
      phone: createContactDto.phone || '',
      mobile_phone: createContactDto.mobile_phone || '',
      account_id: createContactDto.accountId || '',
      department: createContactDto.department || '',
      territory: createContactDto.territory || '',
      mailing_street: createContactDto.mailing_street || '',
      mailing_city: createContactDto.mailing_city || '',
      mailing_state: createContactDto.mailing_state || '',
      mailing_zip: createContactDto.mailing_zip || '',
      mailing_country: createContactDto.mailing_country || '',
    };
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.crmService.createContact(grpcData, token);
  }

  @Get('contacts')
  async getContacts(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('account_id') accountId?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.crmService.getContacts(pageNum, limitNum, search || '', accountId, token);
  }

  @Get('contacts/:id')
  async getContact(@Param('id', ParseUUIDPipe) id: string) {
    return await this.crmService.getContact(id);
  }

  @Patch('contacts/:id')
  async updateContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    const grpcData = {
      salutation: updateContactDto.salutation || '',
      first_name: updateContactDto.first_name || '',
      last_name: updateContactDto.last_name || '',
      email: updateContactDto.email || '',
      phone: updateContactDto.phone || '',
      mobile_phone: updateContactDto.mobile_phone || '',
      account_id: '', // Note: accountId not in UpdateContactDto
      department: updateContactDto.department || '',
      territory: updateContactDto.territory || '',
      mailing_street: updateContactDto.mailing_street || '',
      mailing_city: updateContactDto.mailing_city || '',
      mailing_state: updateContactDto.mailing_state || '',
      mailing_zip: updateContactDto.mailing_zip || '',
      mailing_country: updateContactDto.mailing_country || '',
    };
    return await this.crmService.updateContact(id, grpcData);
  }

  @Delete('contacts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteContact(@Param('id', ParseUUIDPipe) id: string) {
    return await this.crmService.deleteContact(id);
  }

  // ============================================
  // ACCOUNTS ENDPOINTS
  // ============================================

  @Post('accounts')
  async createAccount(@Body() createAccountDto: CreateAccountDto, @Request() req: any) {
    const grpcData = {
      name: createAccountDto.name,
      account_number: createAccountDto.accountNumber || '',
      phone: createAccountDto.phone,
      website: createAccountDto.website || '',
      billing_street: createAccountDto.billing_street || '',
      billing_city: createAccountDto.billing_city || '',
      billing_state: createAccountDto.billing_state || '',
      billing_zip: createAccountDto.billing_zip || '',
      billing_country: createAccountDto.billing_country || '',
      shipping_street: createAccountDto.shipping_street || '',
      shipping_city: createAccountDto.shipping_city || '',
      shipping_state: createAccountDto.shipping_state || '',
      shipping_zip: createAccountDto.shipping_zip || '',
      shipping_country: createAccountDto.shipping_country || '',
      parent_account_id: createAccountDto.parentAccountId || '',
      user_ids: createAccountDto.userIds || [],
    };
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.crmService.createAccount(grpcData, token);
  }

  @Get('accounts')
  async getAccounts(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.crmService.getAccounts(pageNum, limitNum, search || '', token);
  }

  @Get('accounts/:id')
  async getAccount(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.crmService.getAccount(id, token);
  }

  @Patch('accounts/:id')
  async updateAccount(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @Request() req: any,
  ) {
    const grpcData = {
      name: updateAccountDto.name || '',
      account_number: updateAccountDto.accountNumber || '',
      phone: updateAccountDto.phone || '',
      billing_street: updateAccountDto.billing_street || '',
      billing_city: updateAccountDto.billing_city || '',
      billing_state: updateAccountDto.billing_state || '',
      billing_zip: updateAccountDto.billing_zip || '',
      billing_country: updateAccountDto.billing_country || '',
      shipping_street: updateAccountDto.shipping_street || '',
      shipping_city: updateAccountDto.shipping_city || '',
      shipping_state: updateAccountDto.shipping_state || '',
      shipping_zip: updateAccountDto.shipping_zip || '',
      shipping_country: updateAccountDto.shipping_country || '',
      parent_account_id: updateAccountDto.parentAccountId || '',
    };
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.crmService.updateAccount(id, grpcData, token);
  }

  @Delete('accounts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.crmService.deleteAccount(id, token);
  }
}

