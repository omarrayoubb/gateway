import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseUUIDPipe, BadRequestException, NotFoundException, Req } from '@nestjs/common';
import { FinanceService } from './finance.service';

@Controller('api/entities')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('ChartOfAccounts')
  async getChartOfAccounts(@Query() query: any) {
    try {
      const result = await this.financeService.getAccounts({
        limit: query.limit ? parseInt(query.limit) : undefined,
        sort: query.sort,
        filter: query.filter,
      });

      // Transform response to match API specification
      return (result.accounts || []).map(account => ({
        id: account.id,
        organization_id: account.organizationId,
        account_code: account.accountCode,
        account_name: account.accountName,
        account_type: account.accountType,
        account_subtype: account.accountSubtype || '',
        description: account.description || '',
        balance: parseFloat(account.balance || '0'),
        currency: account.currency || 'USD',
        is_active: account.isActive !== undefined ? account.isActive : true,
        created_date: account.createdDate || account.createdAt || '',
      }));
    } catch (error) {
      console.error('Error fetching chart of accounts:', error);
      throw error;
    }
  }

  @Post('ChartOfAccounts')
  async createChartOfAccount(@Body() createAccountDto: any) {
    try {
      // Validate required fields
      if (!createAccountDto.account_code) {
        throw new BadRequestException('account_code is required');
      }
      if (!createAccountDto.account_name) {
        throw new BadRequestException('account_name is required');
      }
      if (!createAccountDto.account_type) {
        throw new BadRequestException('account_type is required');
      }

      const grpcData: any = {
        accountCode: createAccountDto.account_code,
        accountName: createAccountDto.account_name,
        accountType: createAccountDto.account_type,
      };
      
      // Optional fields
      if (createAccountDto.organization_id !== undefined) grpcData.organizationId = createAccountDto.organization_id;
      if (createAccountDto.account_subtype !== undefined) grpcData.accountSubtype = createAccountDto.account_subtype;
      if (createAccountDto.description !== undefined) grpcData.description = createAccountDto.description || '';
      if (createAccountDto.balance !== undefined) grpcData.balance = createAccountDto.balance?.toString() || '0';
      if (createAccountDto.currency !== undefined) grpcData.currency = createAccountDto.currency || 'USD';
      if (createAccountDto.is_active !== undefined) grpcData.isActive = createAccountDto.is_active;

      const result = await this.financeService.createAccount(grpcData);
      
      // Transform response to match API specification
      return {
        id: result.id,
        organization_id: result.organizationId,
        account_code: result.accountCode,
        account_name: result.accountName,
        account_type: result.accountType,
        account_subtype: result.accountSubtype || '',
        description: result.description || '',
        balance: parseFloat(result.balance || '0'),
        currency: result.currency || 'USD',
        is_active: result.isActive !== undefined ? result.isActive : true,
        created_date: result.createdDate || result.createdAt || '',
      };
    } catch (error) {
      console.error('Error creating chart of account:', error);
      throw error;
    }
  }

  @Put('ChartOfAccounts/:id')
  async updateChartOfAccount(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAccountDto: any,
  ) {
    try {
      const grpcData: any = {};
      if (updateAccountDto.organization_id !== undefined) grpcData.organizationId = updateAccountDto.organization_id;
      if (updateAccountDto.account_code !== undefined) grpcData.accountCode = updateAccountDto.account_code;
      if (updateAccountDto.account_name !== undefined) grpcData.accountName = updateAccountDto.account_name;
      if (updateAccountDto.account_type !== undefined) grpcData.accountType = updateAccountDto.account_type;
      if (updateAccountDto.account_subtype !== undefined) grpcData.accountSubtype = updateAccountDto.account_subtype;
      if (updateAccountDto.description !== undefined) grpcData.description = updateAccountDto.description || '';
      if (updateAccountDto.balance !== undefined) grpcData.balance = updateAccountDto.balance?.toString() || '0';
      if (updateAccountDto.currency !== undefined) grpcData.currency = updateAccountDto.currency || 'USD';
      if (updateAccountDto.is_active !== undefined) grpcData.isActive = updateAccountDto.is_active;

      const result = await this.financeService.updateAccount(id, grpcData);
      
      // Transform response to match API specification
      return {
        id: result.id,
        organization_id: result.organizationId,
        account_code: result.accountCode,
        account_name: result.accountName,
        account_type: result.accountType,
        account_subtype: result.accountSubtype || '',
        description: result.description || '',
        balance: parseFloat(result.balance || '0'),
        currency: result.currency || 'USD',
        is_active: result.isActive !== undefined ? result.isActive : true,
        created_date: result.createdDate || result.createdAt || '',
      };
    } catch (error) {
      console.error('Error updating chart of account:', error);
      throw error;
    }
  }

  @Delete('ChartOfAccounts/:id')
  async deleteChartOfAccount(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.financeService.deleteAccount(id);
      return {
        success: true,
        message: 'Account deleted',
      };
    } catch (error) {
      console.error('Error deleting chart of account:', error);
      throw error;
    }
  }

  // Organization endpoints
  @Get('Organization')
  async getOrganizations(@Query() query: any) {
    try {
      const result = await this.financeService.getOrganizations({
        limit: query.limit ? parseInt(query.limit) : undefined,
        sort: query.sort,
        filter: query.filter,
      });

      // Transform response to match API specification
      return (result.organizations || []).map(org => ({
        id: org.id,
        organization_code: org.organizationCode,
        organization_name: org.organizationName,
        description: org.description || '',
        address: org.address || '',
        city: org.city || '',
        state: org.state || '',
        zip_code: org.zipCode || '',
        country: org.country || '',
        phone: org.phone || '',
        email: org.email || '',
        website: org.website || '',
        currency: org.currency || 'USD',
        timezone: org.timezone || '',
        is_active: org.isActive !== undefined ? org.isActive : true,
        created_date: org.createdDate || org.createdAt || '',
      }));
    } catch (error) {
      console.error('Error fetching organizations:', error);
      throw error;
    }
  }

  @Get('Organization/:id')
  async getOrganization(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.getOrganization(id);
      
      return {
        id: result.id,
        organization_code: result.organizationCode,
        organization_name: result.organizationName,
        description: result.description || '',
        address: result.address || '',
        city: result.city || '',
        state: result.state || '',
        zip_code: result.zipCode || '',
        country: result.country || '',
        phone: result.phone || '',
        email: result.email || '',
        website: result.website || '',
        currency: result.currency || 'USD',
        timezone: result.timezone || '',
        is_active: result.isActive !== undefined ? result.isActive : true,
        created_date: result.createdDate || result.createdAt || '',
      };
    } catch (error) {
      console.error('Error fetching organization:', error);
      throw error;
    }
  }

  @Post('Organization')
  async createOrganization(@Body() createOrganizationDto: any) {
    try {
      // Validate required fields
      if (!createOrganizationDto.organization_code) {
        throw new BadRequestException('organization_code is required');
      }
      if (!createOrganizationDto.organization_name) {
        throw new BadRequestException('organization_name is required');
      }

      const grpcData: any = {
        organizationCode: createOrganizationDto.organization_code,
        organizationName: createOrganizationDto.organization_name,
      };
      
      // Optional fields
      if (createOrganizationDto.description !== undefined) grpcData.description = createOrganizationDto.description || '';
      if (createOrganizationDto.address !== undefined) grpcData.address = createOrganizationDto.address || '';
      if (createOrganizationDto.city !== undefined) grpcData.city = createOrganizationDto.city || '';
      if (createOrganizationDto.state !== undefined) grpcData.state = createOrganizationDto.state || '';
      if (createOrganizationDto.zip_code !== undefined) grpcData.zipCode = createOrganizationDto.zip_code || '';
      if (createOrganizationDto.country !== undefined) grpcData.country = createOrganizationDto.country || '';
      if (createOrganizationDto.phone !== undefined) grpcData.phone = createOrganizationDto.phone || '';
      if (createOrganizationDto.email !== undefined) grpcData.email = createOrganizationDto.email || '';
      if (createOrganizationDto.website !== undefined) grpcData.website = createOrganizationDto.website || '';
      if (createOrganizationDto.currency !== undefined) grpcData.currency = createOrganizationDto.currency || 'USD';
      if (createOrganizationDto.timezone !== undefined) grpcData.timezone = createOrganizationDto.timezone || '';
      if (createOrganizationDto.is_active !== undefined) grpcData.isActive = createOrganizationDto.is_active;

      const result = await this.financeService.createOrganization(grpcData);
      
      return {
        id: result.id,
        organization_code: result.organizationCode,
        organization_name: result.organizationName,
        description: result.description || '',
        address: result.address || '',
        city: result.city || '',
        state: result.state || '',
        zip_code: result.zipCode || '',
        country: result.country || '',
        phone: result.phone || '',
        email: result.email || '',
        website: result.website || '',
        currency: result.currency || 'USD',
        timezone: result.timezone || '',
        is_active: result.isActive !== undefined ? result.isActive : true,
        created_date: result.createdDate || result.createdAt || '',
      };
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  }

  @Put('Organization/:id')
  async updateOrganization(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrganizationDto: any,
  ) {
    try {
      const grpcData: any = {};
      if (updateOrganizationDto.organization_code !== undefined) grpcData.organizationCode = updateOrganizationDto.organization_code;
      if (updateOrganizationDto.organization_name !== undefined) grpcData.organizationName = updateOrganizationDto.organization_name;
      if (updateOrganizationDto.description !== undefined) grpcData.description = updateOrganizationDto.description || '';
      if (updateOrganizationDto.address !== undefined) grpcData.address = updateOrganizationDto.address || '';
      if (updateOrganizationDto.city !== undefined) grpcData.city = updateOrganizationDto.city || '';
      if (updateOrganizationDto.state !== undefined) grpcData.state = updateOrganizationDto.state || '';
      if (updateOrganizationDto.zip_code !== undefined) grpcData.zipCode = updateOrganizationDto.zip_code || '';
      if (updateOrganizationDto.country !== undefined) grpcData.country = updateOrganizationDto.country || '';
      if (updateOrganizationDto.phone !== undefined) grpcData.phone = updateOrganizationDto.phone || '';
      if (updateOrganizationDto.email !== undefined) grpcData.email = updateOrganizationDto.email || '';
      if (updateOrganizationDto.website !== undefined) grpcData.website = updateOrganizationDto.website || '';
      if (updateOrganizationDto.currency !== undefined) grpcData.currency = updateOrganizationDto.currency || 'USD';
      if (updateOrganizationDto.timezone !== undefined) grpcData.timezone = updateOrganizationDto.timezone || '';
      if (updateOrganizationDto.is_active !== undefined) grpcData.isActive = updateOrganizationDto.is_active;

      const result = await this.financeService.updateOrganization(id, grpcData);
      
      return {
        id: result.id,
        organization_code: result.organizationCode,
        organization_name: result.organizationName,
        description: result.description || '',
        address: result.address || '',
        city: result.city || '',
        state: result.state || '',
        zip_code: result.zipCode || '',
        country: result.country || '',
        phone: result.phone || '',
        email: result.email || '',
        website: result.website || '',
        currency: result.currency || 'USD',
        timezone: result.timezone || '',
        is_active: result.isActive !== undefined ? result.isActive : true,
        created_date: result.createdDate || result.createdAt || '',
      };
    } catch (error) {
      console.error('Error updating organization:', error);
      throw error;
    }
  }

  @Delete('Organization/:id')
  async deleteOrganization(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.financeService.deleteOrganization(id);
      return {
        success: true,
        message: 'Organization deleted',
      };
    } catch (error) {
      console.error('Error deleting organization:', error);
      throw error;
    }
  }

  // Journal Entry endpoints
  @Get('JournalEntry')
  async getJournalEntries(@Query() query: any) {
    try {
      const result = await this.financeService.getJournalEntries({
        limit: query.limit ? parseInt(query.limit) : undefined,
        sort: query.sort,
        entry_type: query.entry_type,
        status: query.status,
      });

      return (result.entries || []).map(entry => ({
        id: entry.id,
        organization_id: entry.organizationId || null,
        entry_number: entry.entryNumber,
        entry_date: entry.entryDate,
        entry_type: entry.entryType,
        reference: entry.reference || '',
        description: entry.description,
        status: entry.status,
        total_debit: parseFloat(entry.totalDebit || '0'),
        total_credit: parseFloat(entry.totalCredit || '0'),
        is_balanced: entry.isBalanced !== undefined ? entry.isBalanced : false,
        notes: entry.notes || '',
      }));
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      throw error;
    }
  }

  @Post('JournalEntry')
  async createJournalEntry(@Body() createJournalEntryDto: any) {
    try {
      if (!createJournalEntryDto.entry_number) {
        throw new BadRequestException('entry_number is required');
      }
      if (!createJournalEntryDto.entry_date) {
        throw new BadRequestException('entry_date is required');
      }
      if (!createJournalEntryDto.entry_type) {
        throw new BadRequestException('entry_type is required');
      }
      if (!createJournalEntryDto.description) {
        throw new BadRequestException('description is required');
      }

      const grpcData: any = {
        entryNumber: createJournalEntryDto.entry_number,
        entryDate: createJournalEntryDto.entry_date,
        entryType: createJournalEntryDto.entry_type,
        description: createJournalEntryDto.description,
      };

      if (createJournalEntryDto.organization_id !== undefined) grpcData.organizationId = createJournalEntryDto.organization_id;
      if (createJournalEntryDto.reference !== undefined) grpcData.reference = createJournalEntryDto.reference;
      if (createJournalEntryDto.status !== undefined) grpcData.status = createJournalEntryDto.status;
      if (createJournalEntryDto.notes !== undefined) grpcData.notes = createJournalEntryDto.notes;
      if (createJournalEntryDto.lines !== undefined) {
        grpcData.lines = createJournalEntryDto.lines.map((line: any) => ({
          accountId: line.account_id,
          lineNumber: line.line_number,
          description: line.description,
          debit: line.debit?.toString(),
          credit: line.credit?.toString(),
        }));
      }

      const result = await this.financeService.createJournalEntry(grpcData);

      return {
        id: result.id,
        organization_id: result.organizationId || null,
        entry_number: result.entryNumber,
        entry_date: result.entryDate,
        entry_type: result.entryType,
        reference: result.reference || '',
        description: result.description,
        status: result.status,
        total_debit: parseFloat(result.totalDebit || '0'),
        total_credit: parseFloat(result.totalCredit || '0'),
        is_balanced: result.isBalanced !== undefined ? result.isBalanced : false,
        notes: result.notes || '',
      };
    } catch (error) {
      console.error('Error creating journal entry:', error);
      throw error;
    }
  }

  @Post('JournalEntry/:id/post')
  async postJournalEntry(@Param('id', ParseUUIDPipe) id: string) {
    try {
      console.log(`Posting journal entry: ${id}`);
      const result = await this.financeService.postJournalEntry(id);
      console.log(`Journal entry ${id} posted successfully`);
      return {
        success: true,
        message: 'Posted',
        entry: {
          id: result.id,
          organization_id: result.organizationId || null,
          entry_number: result.entryNumber,
          entry_date: result.entryDate,
          entry_type: result.entryType,
          reference: result.reference || '',
          description: result.description,
          status: result.status,
          total_debit: parseFloat(result.totalDebit || '0'),
          total_credit: parseFloat(result.totalCredit || '0'),
          is_balanced: result.isBalanced !== undefined ? result.isBalanced : false,
          notes: result.notes || '',
        },
      };
    } catch (error) {
      console.error('Error posting journal entry:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        stack: error.stack,
        journalEntryId: id,
      });
      
      // Provide more detailed error message
      if (error.message) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Post('JournalEntry/:id/void')
  async voidJournalEntry(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { reason?: string },
  ) {
    try {
      const result = await this.financeService.voidJournalEntry(id, body.reason);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        entry_number: result.entryNumber,
        entry_date: result.entryDate,
        entry_type: result.entryType,
        reference: result.reference || '',
        description: result.description,
        status: result.status,
        total_debit: parseFloat(result.totalDebit || '0'),
        total_credit: parseFloat(result.totalCredit || '0'),
        is_balanced: result.isBalanced !== undefined ? result.isBalanced : false,
        notes: result.notes || '',
      };
    } catch (error) {
      console.error('Error voiding journal entry:', error);
      throw error;
    }
  }

  // Journal Entry Line endpoints
  @Get('JournalEntryLine')
  async getJournalEntryLines(@Query('journal_entry_id') journalEntryId: string) {
    try {
      if (!journalEntryId) {
        throw new BadRequestException('journal_entry_id query parameter is required');
      }

      const result = await this.financeService.getJournalEntryLines(journalEntryId);

      return (result.lines || []).map(line => ({
        id: line.id,
        journal_entry_id: line.journalEntryId,
        line_number: line.lineNumber,
        account_id: line.accountId,
        account_code: line.accountCode || '',
        account_name: line.accountName || '',
        description: line.description || '',
        debit: parseFloat(line.debit || '0'),
        credit: parseFloat(line.credit || '0'),
      }));
    } catch (error) {
      console.error('Error fetching journal entry lines:', error);
      throw error;
    }
  }

  @Post('JournalEntryLine')
  async createJournalEntryLine(@Body() createLineDto: any) {
    try {
      if (!createLineDto.journal_entry_id) {
        throw new BadRequestException('journal_entry_id is required');
      }
      if (!createLineDto.account_id) {
        throw new BadRequestException('account_id is required');
      }

      const grpcData: any = {
        journalEntryId: createLineDto.journal_entry_id,
        accountId: createLineDto.account_id,
      };

      if (createLineDto.organization_id !== undefined) grpcData.organizationId = createLineDto.organization_id;
      if (createLineDto.line_number !== undefined) grpcData.lineNumber = createLineDto.line_number;
      if (createLineDto.description !== undefined) grpcData.description = createLineDto.description;
      if (createLineDto.debit !== undefined) grpcData.debit = createLineDto.debit.toString();
      if (createLineDto.credit !== undefined) grpcData.credit = createLineDto.credit.toString();

      const result = await this.financeService.createJournalEntryLine(grpcData);

      return {
        id: result.id,
        journal_entry_id: result.journalEntryId,
        line_number: result.lineNumber,
        account_id: result.accountId,
        account_code: result.accountCode || '',
        account_name: result.accountName || '',
        description: result.description || '',
        debit: parseFloat(result.debit || '0'),
        credit: parseFloat(result.credit || '0'),
      };
    } catch (error) {
      console.error('Error creating journal entry line:', error);
      throw error;
    }
  }

  // General Ledger endpoints
  @Get('GeneralLedger')
  async getGeneralLedger(@Query() query: any) {
    try {
      const result = await this.financeService.getGeneralLedger({
        account_id: query.account_id,
        period_start: query.period_start,
        period_end: query.period_end,
        sort: query.sort,
      });

      return (result.entries || []).map(entry => ({
        id: entry.id,
        account_id: entry.accountId,
        account_code: entry.accountCode || '',
        account_name: entry.accountName || '',
        transaction_date: entry.transactionDate,
        transaction_type: entry.transactionType,
        transaction_id: entry.transactionId,
        reference: entry.reference || '',
        description: entry.description || '',
        debit: parseFloat(entry.debit || '0'),
        credit: parseFloat(entry.credit || '0'),
        balance: parseFloat(entry.balance || '0'),
      }));
    } catch (error) {
      console.error('Error fetching general ledger:', error);
      throw error;
    }
  }

  @Get('GeneralLedger/account/:accountId')
  async getAccountLedger(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @Query() query: any,
  ) {
    try {
      const result = await this.financeService.getAccountLedger(accountId, {
        period_start: query.period_start,
        period_end: query.period_end,
      });

      return {
        account: {
          id: result.account.id,
          account_code: result.account.accountCode,
          account_name: result.account.accountName,
          account_type: result.account.accountType,
        },
        opening_balance: parseFloat(result.openingBalance || '0'),
        closing_balance: parseFloat(result.closingBalance || '0'),
        transactions: (result.transactions || []).map(trans => ({
          id: trans.id,
          account_id: trans.accountId,
          account_code: trans.accountCode || '',
          transaction_date: trans.transactionDate,
          transaction_type: trans.transactionType,
          transaction_id: trans.transactionId,
          reference: trans.reference || '',
          description: trans.description || '',
          debit: parseFloat(trans.debit || '0'),
          credit: parseFloat(trans.credit || '0'),
          balance: parseFloat(trans.balance || '0'),
        })),
        summary: {
          total_debits: parseFloat(result.summary.totalDebits || '0'),
          total_credits: parseFloat(result.summary.totalCredits || '0'),
          net_change: parseFloat(result.summary.netChange || '0'),
        },
      };
    } catch (error) {
      console.error('Error fetching account ledger:', error);
      throw error;
    }
  }

  @Get('GeneralLedger/report')
  async getGeneralLedgerReport(@Query() query: any) {
    try {
      // Validate required parameters
      if (!query.period_start || !query.period_end) {
        throw new BadRequestException('period_start and period_end are required');
      }

      // Log for debugging
      console.log('General Ledger Report Request:', {
        period_start: query.period_start,
        period_end: query.period_end,
        account_type: query.account_type,
        format: query.format,
      });

      const result = await this.financeService.getGeneralLedgerReport({
        period_start: query.period_start,
        period_end: query.period_end,
        account_type: query.account_type,
        format: query.format,
      });

      return {
        period_start: result.periodStart,
        period_end: result.periodEnd,
        accounts: (result.accounts || []).map(acc => ({
          account_code: acc.accountCode,
          account_name: acc.accountName,
          opening_balance: parseFloat(acc.openingBalance || '0'),
          debits: parseFloat(acc.debits || '0'),
          credits: parseFloat(acc.credits || '0'),
          closing_balance: parseFloat(acc.closingBalance || '0'),
        })),
        totals: {
          total_debits: parseFloat(result.totals.totalDebits || '0'),
          total_credits: parseFloat(result.totals.totalCredits || '0'),
        },
      };
    } catch (error) {
      console.error('Error fetching general ledger report:', error);
      throw error;
    }
  }

  // Accounting Period endpoints
  // IMPORTANT: More specific routes must come before less specific ones
  @Get('AccountingPeriod/current')
  async getCurrentAccountingPeriod(@Query('organization_id') organizationId?: string) {
    try {
      const result = await this.financeService.getCurrentAccountingPeriod(organizationId);

      if (!result) {
        throw new BadRequestException('No current accounting period found');
      }

      return {
        id: result.id,
        organization_id: result.organizationId || null,
        period_name: result.periodName,
        period_start: result.periodStart,
        period_end: result.periodEnd,
        status: result.status,
      };
    } catch (error) {
      console.error('Error fetching current accounting period:', error);
      throw error;
    }
  }

  @Get('AccountingPeriod')
  async getAccountingPeriods(@Query() query: any) {
    try {
      const result = await this.financeService.getAccountingPeriods({
        status: query.status,
        year: query.year,
      });

      return (result.periods || []).map(period => ({
        id: period.id,
        organization_id: period.organizationId || null,
        period_name: period.periodName,
        period_type: period.periodType,
        period_start: period.periodStart,
        period_end: period.periodEnd,
        status: period.status,
        closed_date: period.closedDate || null,
        closed_by: period.closedBy || null,
        notes: period.notes || null,
      }));
    } catch (error) {
      console.error('Error fetching accounting periods:', error);
      throw error;
    }
  }

  @Post('AccountingPeriod')
  async createAccountingPeriod(@Body() createPeriodDto: any) {
    try {
      // Validate required fields
      if (!createPeriodDto.period_name) {
        throw new BadRequestException('period_name is required');
      }
      if (!createPeriodDto.period_type) {
        throw new BadRequestException('period_type is required');
      }
      if (!createPeriodDto.period_start) {
        throw new BadRequestException('period_start is required');
      }
      if (!createPeriodDto.period_end) {
        throw new BadRequestException('period_end is required');
      }

      const grpcData: any = {
        periodName: createPeriodDto.period_name,
        periodType: createPeriodDto.period_type,
        periodStart: createPeriodDto.period_start,
        periodEnd: createPeriodDto.period_end,
      };

      if (createPeriodDto.organization_id !== undefined) grpcData.organizationId = createPeriodDto.organization_id;
      if (createPeriodDto.notes !== undefined) grpcData.notes = createPeriodDto.notes;

      const result = await this.financeService.createAccountingPeriod(grpcData);

      return {
        id: result.id,
        organization_id: result.organizationId || null,
        period_name: result.periodName,
        period_type: result.periodType,
        period_start: result.periodStart,
        period_end: result.periodEnd,
        status: result.status,
        closed_date: result.closedDate || null,
        closed_by: result.closedBy || null,
        notes: result.notes || null,
      };
    } catch (error) {
      console.error('Error creating accounting period:', error);
      throw error;
    }
  }

  @Post('AccountingPeriod/:id/close')
  async closeAccountingPeriod(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { notes?: string; force?: boolean },
  ) {
    try {
      const result = await this.financeService.closeAccountingPeriod(id, {
        notes: body.notes,
        force: body.force || false,
      });

      return {
        success: result.success,
        message: result.message || 'Period closed',
        period: {
          id: result.period.id,
          organization_id: result.period.organizationId || null,
          period_name: result.period.periodName,
          period_type: result.period.periodType,
          period_start: result.period.periodStart,
          period_end: result.period.periodEnd,
          status: result.period.status,
          closed_date: result.period.closedDate || null,
          closed_by: result.period.closedBy || null,
          notes: result.period.notes || null,
        },
        summary: {
          total_transactions: result.summary.totalTransactions || 0,
          total_debits: parseFloat(result.summary.totalDebits || '0'),
          total_credits: parseFloat(result.summary.totalCredits || '0'),
          unbalanced_entries: result.summary.unbalancedEntries || 0,
        },
      };
    } catch (error) {
      console.error('Error closing accounting period:', error);
      throw error;
    }
  }

  // Tax Configuration endpoints
  // IMPORTANT: More specific routes must come before less specific ones
  @Get('TaxConfiguration/calculate')
  async calculateTax(@Query() query: any) {
    try {
      if (!query.amount) {
        throw new BadRequestException('amount query parameter is required');
      }
      if (!query.tax_code) {
        throw new BadRequestException('tax_code query parameter is required');
      }

      const result = await this.financeService.calculateTax({
        amount: parseFloat(query.amount),
        tax_code: query.tax_code,
        date: query.date,
        organization_id: query.organization_id,
      });

      return {
        base_amount: parseFloat(result.baseAmount || '0'),
        tax_code: result.taxCode || query.tax_code,
        tax_rate: parseFloat(result.taxRate || '0'),
        tax_amount: parseFloat(result.taxAmount || '0'),
        total_amount: parseFloat(result.totalAmount || '0'),
      };
    } catch (error) {
      console.error('Error calculating tax:', error);
      throw error;
    }
  }

  @Get('TaxConfiguration')
  async getTaxConfigurations(@Query() query: any) {
    try {
      // Convert string boolean to actual boolean
      let isActive: boolean | undefined = undefined;
      if (query.is_active !== undefined) {
        if (typeof query.is_active === 'string') {
          isActive = query.is_active.toLowerCase() === 'true';
        } else {
          isActive = Boolean(query.is_active);
        }
      }

      const result = await this.financeService.getTaxConfigurations({
        tax_type: query.tax_type,
        is_active: isActive,
        sort: query.sort,
      });

      console.log('Tax configurations query:', { tax_type: query.tax_type, is_active: isActive, sort: query.sort });
      console.log('Tax configurations result:', result);
      console.log('Tax configurations result count:', result.taxConfigurations?.length || 0);

      if (!result || !result.taxConfigurations) {
        console.warn('Tax configurations result is null or missing taxConfigurations array');
        return [];
      }

      return (result.taxConfigurations || []).map(tax => ({
        id: tax.id,
        organization_id: tax.organizationId || null,
        tax_code: tax.taxCode,
        tax_name: tax.taxName,
        tax_type: tax.taxType,
        tax_rate: parseFloat(tax.taxRate || '0'),
        calculation_method: tax.calculationMethod,
        is_inclusive: tax.isInclusive !== undefined ? tax.isInclusive : false,
        applies_to: tax.appliesTo || [],
        account_id: tax.accountId,
        is_active: tax.isActive !== undefined ? tax.isActive : true,
        effective_from: tax.effectiveFrom || null,
        effective_to: tax.effectiveTo || null,
      }));
    } catch (error) {
      console.error('Error fetching tax configurations:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        query: query,
      });
      throw error;
    }
  }

  @Post('TaxConfiguration')
  async createTaxConfiguration(@Body() createTaxDto: any) {
    try {
      // Validate required fields
      if (!createTaxDto.tax_code) {
        throw new BadRequestException('tax_code is required');
      }
      if (!createTaxDto.tax_name) {
        throw new BadRequestException('tax_name is required');
      }
      if (!createTaxDto.tax_type) {
        throw new BadRequestException('tax_type is required');
      }
      if (!createTaxDto.calculation_method) {
        throw new BadRequestException('calculation_method is required');
      }
      if (!createTaxDto.account_id) {
        throw new BadRequestException('account_id is required');
      }

      const grpcData: any = {
        taxCode: createTaxDto.tax_code,
        taxName: createTaxDto.tax_name,
        taxType: createTaxDto.tax_type,
        calculationMethod: createTaxDto.calculation_method,
        accountId: createTaxDto.account_id,
      };

      if (createTaxDto.organization_id !== undefined) grpcData.organizationId = createTaxDto.organization_id;
      if (createTaxDto.tax_rate !== undefined) grpcData.taxRate = createTaxDto.tax_rate.toString();
      if (createTaxDto.is_inclusive !== undefined) grpcData.isInclusive = createTaxDto.is_inclusive;
      if (createTaxDto.applies_to !== undefined) grpcData.appliesTo = createTaxDto.applies_to;
      if (createTaxDto.effective_from !== undefined) grpcData.effectiveFrom = createTaxDto.effective_from;
      if (createTaxDto.effective_to !== undefined) grpcData.effectiveTo = createTaxDto.effective_to;

      const result = await this.financeService.createTaxConfiguration(grpcData);

      return {
        id: result.id,
        organization_id: result.organizationId || null,
        tax_code: result.taxCode,
        tax_name: result.taxName,
        tax_type: result.taxType,
        tax_rate: parseFloat(result.taxRate || '0'),
        calculation_method: result.calculationMethod,
        is_inclusive: result.isInclusive !== undefined ? result.isInclusive : false,
        applies_to: result.appliesTo || [],
        account_id: result.accountId,
        is_active: result.isActive !== undefined ? result.isActive : true,
        effective_from: result.effectiveFrom || null,
        effective_to: result.effectiveTo || null,
      };
    } catch (error) {
      console.error('Error creating tax configuration:', error);
      throw error;
    }
  }

  // CRM Accounts endpoints (Customer Accounts from CRM module)
  @Get('CrmAccount')
  async getCrmAccounts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const pageNum = page ? parseInt(page) : 1;
      const limitNum = limit ? parseInt(limit) : 10;
      // Note: Token extraction removed as per finance module pattern (no auth required)
      return await this.financeService.getCrmAccounts(pageNum, limitNum);
    } catch (error) {
      console.error('Error getting CRM accounts:', error);
      if (error.code === 5) {
        throw new BadRequestException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Get('CrmAccount/:id')
  async getCrmAccount(@Param('id', ParseUUIDPipe) id: string) {
    try {
      // Note: Token extraction removed as per finance module pattern (no auth required)
      return await this.financeService.getCrmAccount(id);
    } catch (error) {
      console.error('Error getting CRM account:', error);
      if (error.code === 5) {
        throw new BadRequestException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  // Invoice endpoints
  @Get('Invoice')
  async getInvoices(@Query() query: any) {
    try {
      const result = await this.financeService.getInvoices({
        sort: query.sort,
        status: query.status,
        customer_id: query.customer_id,
        is_proforma: query.is_proforma !== undefined ? query.is_proforma === 'true' : undefined,
      });

      return (result.invoices || []).map(invoice => ({
        id: invoice.id,
        organization_id: invoice.organizationId || null,
        invoice_number: invoice.invoiceNumber || null,
        proforma_number: invoice.proformaNumber || null,
        is_proforma: invoice.isProforma !== undefined ? invoice.isProforma : false,
        customer_account_id: invoice.customerAccountId || null,
        customer_account_name: invoice.customerAccountName || null,
        customer_name: invoice.customerName || null,
        invoice_date: invoice.invoiceDate,
        due_date: invoice.dueDate || null,
        status: invoice.status,
        currency: invoice.currency || 'USD',
        subtotal: parseFloat(invoice.subtotal || '0'),
        tax_amount: parseFloat(invoice.taxAmount || '0'),
        total_amount: parseFloat(invoice.totalAmount || '0'),
        paid_amount: parseFloat(invoice.paidAmount || '0'),
        balance_due: parseFloat(invoice.balanceDue || '0'),
        items: (invoice.items || []).map((item: any) => ({
          description: item.description || '',
          quantity: parseFloat(item.quantity || '0'),
          unit_price: parseFloat(item.unit_price || '0'),
          amount: parseFloat(item.amount || '0'),
        })),
      }));
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  @Post('Invoice')
  async createInvoice(@Body() createInvoiceDto: any) {
    try {
      // Validate required fields
      if (!createInvoiceDto.customer_account_name) {
        throw new BadRequestException('customer_account_name is required');
      }
      if (!createInvoiceDto.invoice_date) {
        throw new BadRequestException('invoice_date is required');
      }

      const grpcData: any = {
        customerAccountName: createInvoiceDto.customer_account_name,
        invoiceDate: createInvoiceDto.invoice_date,
      };

      if (createInvoiceDto.organization_id !== undefined) grpcData.organizationId = createInvoiceDto.organization_id;
      if (createInvoiceDto.invoice_number !== undefined) grpcData.invoiceNumber = createInvoiceDto.invoice_number;
      if (createInvoiceDto.proforma_number !== undefined) grpcData.proformaNumber = createInvoiceDto.proforma_number;
      if (createInvoiceDto.is_proforma !== undefined) grpcData.isProforma = createInvoiceDto.is_proforma;
      if (createInvoiceDto.customer_name !== undefined) grpcData.customerName = createInvoiceDto.customer_name;
      if (createInvoiceDto.customer_account_id !== undefined) grpcData.customerAccountId = createInvoiceDto.customer_account_id;
      if (createInvoiceDto.due_date !== undefined) grpcData.dueDate = createInvoiceDto.due_date;
      if (createInvoiceDto.status !== undefined) grpcData.status = createInvoiceDto.status;
      if (createInvoiceDto.currency !== undefined) grpcData.currency = createInvoiceDto.currency;
      if (createInvoiceDto.tax_rate !== undefined) grpcData.taxRate = createInvoiceDto.tax_rate?.toString();
      if (createInvoiceDto.notes !== undefined) grpcData.notes = createInvoiceDto.notes;
      if (createInvoiceDto.items !== undefined) {
        grpcData.items = createInvoiceDto.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity?.toString(),
          unitPrice: item.unit_price?.toString(),
          taxRate: item.tax_rate?.toString(),
          discountPercent: item.discount_percent?.toString(),
        }));
      }

      const result = await this.financeService.createInvoice(grpcData);

      return {
        id: result.id,
        organization_id: result.organizationId || null,
        invoice_number: result.invoiceNumber || null,
        proforma_number: result.proformaNumber || null,
        is_proforma: result.isProforma !== undefined ? result.isProforma : false,
        customer_account_id: result.customerAccountId || null,
        customer_account_name: result.customerAccountName || null,
        customer_name: result.customerName || null,
        invoice_date: result.invoiceDate,
        due_date: result.dueDate || null,
        status: result.status,
        currency: result.currency || 'USD',
        subtotal: parseFloat(result.subtotal || '0'),
        tax_amount: parseFloat(result.taxAmount || '0'),
        total_amount: parseFloat(result.totalAmount || '0'),
        paid_amount: parseFloat(result.paidAmount || '0'),
        balance_due: parseFloat(result.balanceDue || '0'),
        items: (result.items || []).map((item: any) => ({
          description: item.description || '',
          quantity: parseFloat(item.quantity || '0'),
          unit_price: parseFloat(item.unit_price || '0'),
          amount: parseFloat(item.amount || '0'),
        })),
      };
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  @Post('Invoice/:id/send')
  async sendInvoice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { send_method?: string; email_to?: string[]; email_subject?: string; email_message?: string },
  ) {
    try {
      const result = await this.financeService.sendInvoice(id, {
        send_method: body.send_method,
        email_to: body.email_to,
        email_subject: body.email_subject,
        email_message: body.email_message,
      });

      return {
        id: result.id,
        organization_id: result.organizationId || null,
        invoice_number: result.invoiceNumber || null,
        proforma_number: result.proformaNumber || null,
        is_proforma: result.isProforma !== undefined ? result.isProforma : false,
        customer_account_id: result.customerAccountId || null,
        customer_account_name: result.customerAccountName || null,
        customer_name: result.customerName || null,
        invoice_date: result.invoiceDate,
        due_date: result.dueDate || null,
        status: result.status,
        currency: result.currency || 'USD',
        subtotal: parseFloat(result.subtotal || '0'),
        tax_amount: parseFloat(result.taxAmount || '0'),
        total_amount: parseFloat(result.totalAmount || '0'),
        paid_amount: parseFloat(result.paidAmount || '0'),
        balance_due: parseFloat(result.balanceDue || '0'),
        items: (result.items || []).map((item: any) => ({
          description: item.description || '',
          quantity: parseFloat(item.quantity || '0'),
          unit_price: parseFloat(item.unit_price || '0'),
          amount: parseFloat(item.amount || '0'),
        })),
      };
    } catch (error) {
      console.error('Error sending invoice:', error);
      throw error;
    }
  }

  @Post('Invoice/:id/convert-proforma')
  async convertProforma(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.convertProforma(id);

      return {
        success: result.success,
        message: result.message || 'Converted',
        invoice: {
          id: result.invoice.id,
          organization_id: result.invoice.organizationId || null,
          invoice_number: result.invoice.invoiceNumber || null,
          proforma_number: result.invoice.proformaNumber || null,
          is_proforma: result.invoice.isProforma !== undefined ? result.invoice.isProforma : false,
          customer_account_id: result.invoice.customerAccountId || null,
          customer_account_name: result.invoice.customerAccountName || null,
          customer_name: result.invoice.customerName || null,
          invoice_date: result.invoice.invoiceDate,
          due_date: result.invoice.dueDate || null,
          status: result.invoice.status,
          currency: result.invoice.currency || 'USD',
          subtotal: parseFloat(result.invoice.subtotal || '0'),
          tax_amount: parseFloat(result.invoice.taxAmount || '0'),
          total_amount: parseFloat(result.invoice.totalAmount || '0'),
          paid_amount: parseFloat(result.invoice.paidAmount || '0'),
          balance_due: parseFloat(result.invoice.balanceDue || '0'),
          items: (result.invoice.items || []).map((item: any) => ({
            description: item.description || '',
            quantity: parseFloat(item.quantity || '0'),
            unit_price: parseFloat(item.unit_price || '0'),
            amount: parseFloat(item.amount || '0'),
          })),
        },
      };
    } catch (error) {
      console.error('Error converting proforma:', error);
      throw error;
    }
  }

  // Credit Note endpoints
  @Get('CreditNote')
  async getCreditNotes(@Query() query: any) {
    try {
      const result = await this.financeService.getCreditNotes({
        sort: query.sort,
        status: query.status,
        customer_id: query.customer_id,
      });

      return (result.creditNotes || []).map(cn => ({
        id: cn.id,
        organization_id: cn.organizationId || null,
        credit_note_number: cn.creditNoteNumber || null,
        customer_id: cn.customerId || null,
        customer_name: cn.customerName || null,
        invoice_id: cn.invoiceId || null,
        credit_date: cn.creditDate,
        reason: cn.reason,
        status: cn.status,
        total_amount: parseFloat(cn.totalAmount || '0'),
        applied_amount: parseFloat(cn.appliedAmount || '0'),
        balance: parseFloat(cn.balance || '0'),
      }));
    } catch (error) {
      console.error('Error fetching credit notes:', error);
      throw error;
    }
  }

  @Post('CreditNote')
  async createCreditNote(@Body() createCreditNoteDto: any) {
    try {
      // Validate required fields
      if (!createCreditNoteDto.customer_id) {
        throw new BadRequestException('customer_id is required');
      }
      if (!createCreditNoteDto.credit_date) {
        throw new BadRequestException('credit_date is required');
      }
      if (!createCreditNoteDto.reason) {
        throw new BadRequestException('reason is required');
      }
      if (!createCreditNoteDto.description) {
        throw new BadRequestException('description is required');
      }

      // Auto-fetch organization_id if not provided
      let organizationId = createCreditNoteDto.organization_id;
      if (organizationId === undefined) {
        try {
          // Try to get the first active organization
          const organizations = await this.financeService.getOrganizations({ limit: 1, filter: JSON.stringify({ is_active: true }) });
          if (organizations.organizations && organizations.organizations.length > 0) {
            organizationId = organizations.organizations[0].id;
          } else {
            // If no active organization, set to null
            organizationId = null;
          }
        } catch (error) {
          // If fetching organizations fails, default to null
          console.warn('Could not auto-fetch organization_id, defaulting to null:', error.message);
          organizationId = null;
        }
      }

      const grpcData: any = {
        organizationId: organizationId,
        customerId: createCreditNoteDto.customer_id,
        creditDate: createCreditNoteDto.credit_date,
        reason: createCreditNoteDto.reason,
        description: createCreditNoteDto.description,
      };

      if (createCreditNoteDto.credit_note_number !== undefined) grpcData.creditNoteNumber = createCreditNoteDto.credit_note_number;
      if (createCreditNoteDto.invoice_id !== undefined) grpcData.invoiceId = createCreditNoteDto.invoice_id;
      if (createCreditNoteDto.total_amount !== undefined) grpcData.totalAmount = createCreditNoteDto.total_amount?.toString();
      if (createCreditNoteDto.status !== undefined) grpcData.status = createCreditNoteDto.status;
      if (createCreditNoteDto.items !== undefined) {
        grpcData.items = createCreditNoteDto.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity?.toString(),
          unitPrice: item.unit_price?.toString(),
        }));
      }

      const result = await this.financeService.createCreditNote(grpcData);

      return {
        id: result.id,
        organization_id: result.organizationId || null,
        credit_note_number: result.creditNoteNumber || null,
        customer_id: result.customerId || null,
        customer_name: result.customerName || null,
        invoice_id: result.invoiceId || null,
        credit_date: result.creditDate,
        reason: result.reason,
        status: result.status,
        total_amount: parseFloat(result.totalAmount || '0'),
        applied_amount: parseFloat(result.appliedAmount || '0'),
        balance: parseFloat(result.balance || '0'),
      };
    } catch (error) {
      console.error('Error creating credit note:', error);
      throw error;
    }
  }

  @Post('CreditNote/:id/apply')
  async applyCreditNote(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { invoice_id: string; amount: number },
  ) {
    try {
      if (!body.invoice_id) {
        throw new BadRequestException('invoice_id is required');
      }
      if (!body.amount || body.amount <= 0) {
        throw new BadRequestException('amount is required and must be greater than 0');
      }

      const result = await this.financeService.applyCreditNote(id, {
        invoice_id: body.invoice_id,
        amount: body.amount,
      });

      return {
        success: result.success,
        message: result.message || 'Credit note applied',
        credit_note: {
          id: result.creditNote.id,
          organization_id: result.creditNote.organizationId || null,
          credit_note_number: result.creditNote.creditNoteNumber || null,
          customer_id: result.creditNote.customerId || null,
          customer_name: result.creditNote.customerName || null,
          invoice_id: result.creditNote.invoiceId || null,
          credit_date: result.creditNote.creditDate,
          reason: result.creditNote.reason,
          status: result.creditNote.status,
          total_amount: parseFloat(result.creditNote.totalAmount || '0'),
          applied_amount: parseFloat(result.creditNote.appliedAmount || '0'),
          balance: parseFloat(result.creditNote.balance || '0'),
        },
        invoice: {
          id: result.invoice.id,
          invoice_number: result.invoice.invoiceNumber || null,
          balance_due: parseFloat(result.invoice.balanceDue || '0'),
          paid_amount: parseFloat(result.invoice.paidAmount || '0'),
          status: result.invoice.status,
        },
        applied_amount: parseFloat(result.appliedAmount || '0'),
      };
    } catch (error) {
      console.error('Error applying credit note:', error);
      throw error;
    }
  }

  // Customer Payment endpoints
  // IMPORTANT: More specific routes must come before less specific ones
  @Get('CustomerPayment/unallocated')
  async getUnallocatedPayments() {
    try {
      const result = await this.financeService.getUnallocatedPayments();

      return (result.payments || []).map(payment => ({
        id: payment.id,
        organization_id: payment.organizationId || null,
        payment_number: payment.paymentNumber || null,
        customer_id: payment.customerId || null,
        customer_name: payment.customerName || null,
        payment_date: payment.paymentDate,
        payment_method: payment.paymentMethod,
        payment_reference: payment.paymentReference || null,
        amount: parseFloat(payment.amount || '0'),
        currency: payment.currency || 'USD',
        status: payment.status,
        allocated_amount: parseFloat(payment.allocatedAmount || '0'),
        unallocated_amount: parseFloat(payment.unallocatedAmount || '0'),
        bank_account_id: payment.bankAccountId || null,
      }));
    } catch (error) {
      console.error('Error fetching unallocated payments:', error);
      throw error;
    }
  }

  @Get('CustomerPayment')
  async getCustomerPayments(@Query() query: any) {
    try {
      const result = await this.financeService.getCustomerPayments({
        sort: query.sort,
        customer_id: query.customer_id,
        status: query.status,
      });

      return (result.payments || []).map(payment => ({
        id: payment.id,
        organization_id: payment.organizationId || null,
        payment_number: payment.paymentNumber || null,
        customer_id: payment.customerId || null,
        customer_name: payment.customerName || null,
        payment_date: payment.paymentDate,
        payment_method: payment.paymentMethod,
        payment_reference: payment.paymentReference || null,
        amount: parseFloat(payment.amount || '0'),
        currency: payment.currency || 'USD',
        status: payment.status,
        allocated_amount: parseFloat(payment.allocatedAmount || '0'),
        unallocated_amount: parseFloat(payment.unallocatedAmount || '0'),
        bank_account_id: payment.bankAccountId || null,
      }));
    } catch (error) {
      console.error('Error fetching customer payments:', error);
      throw error;
    }
  }

  @Post('CustomerPayment')
  async createCustomerPayment(@Body() createPaymentDto: any) {
    try {
      // Validate required fields
      if (!createPaymentDto.customer_id) {
        throw new BadRequestException('customer_id is required');
      }
      if (!createPaymentDto.payment_date) {
        throw new BadRequestException('payment_date is required');
      }
      if (!createPaymentDto.payment_method) {
        throw new BadRequestException('payment_method is required');
      }
      if (!createPaymentDto.amount || createPaymentDto.amount <= 0) {
        throw new BadRequestException('amount is required and must be greater than 0');
      }

      // Auto-fetch organization_id if not provided
      let organizationId = createPaymentDto.organization_id;
      if (organizationId === undefined) {
        try {
          // Try to get the first active organization
          const organizations = await this.financeService.getOrganizations({ limit: 1, filter: JSON.stringify({ is_active: true }) });
          if (organizations.organizations && organizations.organizations.length > 0) {
            organizationId = organizations.organizations[0].id;
          } else {
            // If no active organization, set to null
            organizationId = null;
          }
        } catch (error) {
          // If fetching organizations fails, default to null
          console.warn('Could not auto-fetch organization_id, defaulting to null:', error.message);
          organizationId = null;
        }
      }

      const grpcData: any = {
        organizationId: organizationId,
        customerId: createPaymentDto.customer_id,
        paymentDate: createPaymentDto.payment_date,
        paymentMethod: createPaymentDto.payment_method,
        amount: createPaymentDto.amount?.toString(),
      };

      if (createPaymentDto.payment_number !== undefined) grpcData.paymentNumber = createPaymentDto.payment_number;
      if (createPaymentDto.payment_reference !== undefined) grpcData.paymentReference = createPaymentDto.payment_reference;
      if (createPaymentDto.currency !== undefined) grpcData.currency = createPaymentDto.currency;
      if (createPaymentDto.bank_account_id !== undefined) grpcData.bankAccountId = createPaymentDto.bank_account_id;
      if (createPaymentDto.status !== undefined) grpcData.status = createPaymentDto.status;
      if (createPaymentDto.allocations !== undefined) {
        grpcData.allocations = createPaymentDto.allocations.map((alloc: any) => ({
          invoiceId: alloc.invoice_id,
          amount: alloc.amount?.toString(),
        }));
      }

      const result = await this.financeService.createCustomerPayment(grpcData);

      return {
        id: result.id,
        organization_id: result.organizationId || null,
        payment_number: result.paymentNumber || null,
        customer_id: result.customerId || null,
        customer_name: result.customerName || null,
        payment_date: result.paymentDate,
        payment_method: result.paymentMethod,
        payment_reference: result.paymentReference || null,
        amount: parseFloat(result.amount || '0'),
        currency: result.currency || 'USD',
        status: result.status,
        allocated_amount: parseFloat(result.allocatedAmount || '0'),
        unallocated_amount: parseFloat(result.unallocatedAmount || '0'),
        bank_account_id: result.bankAccountId || null,
      };
    } catch (error) {
      console.error('Error creating customer payment:', error);
      throw error;
    }
  }

  @Put('CustomerPayment/:id')
  async updateCustomerPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePaymentDto: any,
  ) {
    try {
      const grpcData: any = {};
      
      if (updatePaymentDto.customer_id !== undefined) grpcData.customerId = updatePaymentDto.customer_id;
      if (updatePaymentDto.payment_date !== undefined) grpcData.paymentDate = updatePaymentDto.payment_date;
      if (updatePaymentDto.payment_method !== undefined) grpcData.paymentMethod = updatePaymentDto.payment_method;
      if (updatePaymentDto.payment_reference !== undefined) grpcData.paymentReference = updatePaymentDto.payment_reference;
      if (updatePaymentDto.amount !== undefined) grpcData.amount = updatePaymentDto.amount?.toString();
      if (updatePaymentDto.currency !== undefined) grpcData.currency = updatePaymentDto.currency;
      if (updatePaymentDto.bank_account_id !== undefined) grpcData.bankAccountId = updatePaymentDto.bank_account_id;
      if (updatePaymentDto.status !== undefined) grpcData.status = updatePaymentDto.status;
      if (updatePaymentDto.organization_id !== undefined) grpcData.organizationId = updatePaymentDto.organization_id;

      const result = await this.financeService.updateCustomerPayment(id, grpcData);

      return {
        id: result.id,
        organization_id: result.organizationId || null,
        payment_number: result.paymentNumber || null,
        customer_id: result.customerId || null,
        customer_name: result.customerName || null,
        payment_date: result.paymentDate,
        payment_method: result.paymentMethod,
        payment_reference: result.paymentReference || null,
        amount: parseFloat(result.amount || '0'),
        currency: result.currency || 'USD',
        status: result.status,
        allocated_amount: parseFloat(result.allocatedAmount || '0'),
        unallocated_amount: parseFloat(result.unallocatedAmount || '0'),
        bank_account_id: result.bankAccountId || null,
      };
    } catch (error) {
      console.error('Error updating customer payment:', error);
      throw error;
    }
  }

  @Post('CustomerPayment/:id/allocate')
  async allocatePayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { allocations: Array<{ invoice_id: string; amount: number }> },
  ) {
    try {
      if (!body.allocations || body.allocations.length === 0) {
        throw new BadRequestException('allocations array is required and cannot be empty');
      }

      const result = await this.financeService.allocatePayment(id, {
        allocations: body.allocations.map(alloc => ({
          invoiceId: alloc.invoice_id,
          amount: alloc.amount?.toString(),
        })),
      });

      return {
        id: result.id,
        organization_id: result.organizationId || null,
        payment_number: result.paymentNumber || null,
        customer_id: result.customerId || null,
        customer_name: result.customerName || null,
        payment_date: result.paymentDate,
        payment_method: result.paymentMethod,
        payment_reference: result.paymentReference || null,
        amount: parseFloat(result.amount || '0'),
        currency: result.currency || 'USD',
        status: result.status,
        allocated_amount: parseFloat(result.allocatedAmount || '0'),
        unallocated_amount: parseFloat(result.unallocatedAmount || '0'),
        bank_account_id: result.bankAccountId || null,
      };
    } catch (error) {
      console.error('Error allocating payment:', error);
      throw error;
    }
  }

  // Customer Credit endpoints
  @Get('CustomerCredit')
  async getCustomerCredits(@Query() query: any) {
    try {
      const result = await this.financeService.getCustomerCredits({
        sort: query.sort,
        risk_level: query.risk_level,
      });

      return (result.credits || []).map(credit => ({
        id: credit.id || '',
        organization_id: credit.organizationId || '',
        customer_id: credit.customerId || '',
        customer_name: credit.customerName || '',
        credit_limit: parseFloat(credit.creditLimit || '0'),
        current_balance: parseFloat(credit.currentBalance || '0'),
        available_credit: parseFloat(credit.availableCredit || '0'),
        credit_score: credit.creditScore || 0,
        risk_level: credit.riskLevel || '',
        on_time_payment_rate: parseFloat(credit.onTimePaymentRate || '0'),
        average_days_to_pay: credit.averageDaysToPay || 0,
      }));
    } catch (error) {
      console.error('Error fetching customer credits:', error);
      throw error;
    }
  }

  @Get('CustomerCredit/:id')
  async getCustomerCredit(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const credit = await this.financeService.getCustomerCredit(id);
      return {
        id: credit.id || '',
        organization_id: credit.organizationId || '',
        customer_id: credit.customerId || '',
        customer_name: credit.customerName || '',
        credit_limit: parseFloat(credit.creditLimit || '0'),
        current_balance: parseFloat(credit.currentBalance || '0'),
        available_credit: parseFloat(credit.availableCredit || '0'),
        credit_score: credit.creditScore || 0,
        risk_level: credit.riskLevel || '',
        on_time_payment_rate: parseFloat(credit.onTimePaymentRate || '0'),
        average_days_to_pay: credit.averageDaysToPay || 0,
      };
    } catch (error) {
      console.error('Error fetching customer credit:', error);
      throw error;
    }
  }

  @Post('CustomerCredit')
  async createCustomerCredit(@Body() createDto: any) {
    try {
      if (!createDto.customer_id) {
        throw new BadRequestException('customer_id is required');
      }
      if (!createDto.credit_limit || parseFloat(createDto.credit_limit) <= 0) {
        throw new BadRequestException('credit_limit is required and must be greater than 0');
      }

      const grpcData: any = {
        organizationId: createDto.organization_id,
        customerId: createDto.customer_id,
        customerName: createDto.customer_name,
        creditLimit: createDto.credit_limit?.toString(),
      };

      if (createDto.current_balance !== undefined) grpcData.currentBalance = createDto.current_balance?.toString();
      if (createDto.credit_score !== undefined) grpcData.creditScore = createDto.credit_score;
      if (createDto.risk_level !== undefined) grpcData.riskLevel = createDto.risk_level;
      if (createDto.on_time_payment_rate !== undefined) grpcData.onTimePaymentRate = createDto.on_time_payment_rate?.toString();
      if (createDto.average_days_to_pay !== undefined) grpcData.averageDaysToPay = createDto.average_days_to_pay;

      const credit = await this.financeService.createCustomerCredit(grpcData);

      return {
        id: credit.id || '',
        organization_id: credit.organizationId || '',
        customer_id: credit.customerId || '',
        customer_name: credit.customerName || '',
        credit_limit: parseFloat(credit.creditLimit || '0'),
        current_balance: parseFloat(credit.currentBalance || '0'),
        available_credit: parseFloat(credit.availableCredit || '0'),
        credit_score: credit.creditScore || 0,
        risk_level: credit.riskLevel || '',
        on_time_payment_rate: parseFloat(credit.onTimePaymentRate || '0'),
        average_days_to_pay: credit.averageDaysToPay || 0,
      };
    } catch (error) {
      console.error('Error creating customer credit:', error);
      throw error;
    }
  }

  @Put('CustomerCredit/:id')
  async updateCustomerCredit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: any,
  ) {
    try {
      const grpcData: any = {};

      if (updateDto.organization_id !== undefined) grpcData.organizationId = updateDto.organization_id;
      if (updateDto.customer_id !== undefined) grpcData.customerId = updateDto.customer_id;
      if (updateDto.customer_name !== undefined) grpcData.customerName = updateDto.customer_name;
      if (updateDto.credit_limit !== undefined) grpcData.creditLimit = updateDto.credit_limit?.toString();
      if (updateDto.current_balance !== undefined) grpcData.currentBalance = updateDto.current_balance?.toString();
      if (updateDto.credit_score !== undefined) grpcData.creditScore = updateDto.credit_score;
      if (updateDto.risk_level !== undefined) grpcData.riskLevel = updateDto.risk_level;
      if (updateDto.on_time_payment_rate !== undefined) grpcData.onTimePaymentRate = updateDto.on_time_payment_rate?.toString();
      if (updateDto.average_days_to_pay !== undefined) grpcData.averageDaysToPay = updateDto.average_days_to_pay;

      const credit = await this.financeService.updateCustomerCredit(id, grpcData);

      return {
        id: credit.id || '',
        organization_id: credit.organizationId || '',
        customer_id: credit.customerId || '',
        customer_name: credit.customerName || '',
        credit_limit: parseFloat(credit.creditLimit || '0'),
        current_balance: parseFloat(credit.currentBalance || '0'),
        available_credit: parseFloat(credit.availableCredit || '0'),
        credit_score: credit.creditScore || 0,
        risk_level: credit.riskLevel || '',
        on_time_payment_rate: parseFloat(credit.onTimePaymentRate || '0'),
        average_days_to_pay: credit.averageDaysToPay || 0,
      };
    } catch (error) {
      console.error('Error updating customer credit:', error);
      throw error;
    }
  }

  @Delete('CustomerCredit/:id')
  async deleteCustomerCredit(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.financeService.deleteCustomerCredit(id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting customer credit:', error);
      throw error;
    }
  }

  @Post('CustomerCredit/:customerId/recalculate')
  async recalculateCreditBalance(@Param('customerId', ParseUUIDPipe) customerId: string) {
    try {
      const credit = await this.financeService.recalculateCreditBalance(customerId);
      return {
        id: credit.id || '',
        organization_id: credit.organizationId || '',
        customer_id: credit.customerId || '',
        customer_name: credit.customerName || '',
        credit_limit: parseFloat(credit.creditLimit || '0'),
        current_balance: parseFloat(credit.currentBalance || '0'),
        available_credit: parseFloat(credit.availableCredit || '0'),
        credit_score: credit.creditScore || 0,
        risk_level: credit.riskLevel || '',
        on_time_payment_rate: parseFloat(credit.onTimePaymentRate || '0'),
        average_days_to_pay: credit.averageDaysToPay || 0,
      };
    } catch (error) {
      console.error('Error recalculating credit balance:', error);
      throw error;
    }
  }

  // Reports endpoints
  @Get('reports/budget-vs-actual')
  async getBudgetVsActual(@Query() query: any) {
    try {
      if (!query.fiscal_year) {
        throw new BadRequestException('fiscal_year is required');
      }

      const result = await this.financeService.getBudgetVsActual(query) as any;
      return {
        fiscal_year: result.fiscalYear,
        summary: {
          total_budget: parseFloat(result.summary?.totalBudget || '0'),
          total_actual: parseFloat(result.summary?.totalActual || '0'),
          variance: parseFloat(result.summary?.variance || '0'),
          variance_percent: parseFloat(result.summary?.variancePercent || '0'),
        },
        budgets: (result.budgets || []).map((budget: any) => ({
          budget_id: budget.budgetId,
          budget_name: budget.budgetName,
          account_code: budget.accountCode,
          account_name: budget.accountName,
          budget_amount: parseFloat(budget.budgetAmount || '0'),
          actual_amount: parseFloat(budget.actualAmount || '0'),
          variance: parseFloat(budget.variance || '0'),
          variance_percent: parseFloat(budget.variancePercent || '0'),
          periods: (budget.periods || []).map((period: any) => ({
            period: period.period,
            budget: parseFloat(period.budget || '0'),
            actual: parseFloat(period.actual || '0'),
            variance: parseFloat(period.variance || '0'),
          })),
        })),
      };
    } catch (error) {
      console.error('Error fetching budget vs actual report:', error);
      throw error;
    }
  }

  @Get('reports/ar-aging')
  async getArAgingReport(@Query() query: any) {
    try {
      if (!query.as_of_date) {
        throw new BadRequestException('as_of_date query parameter is required');
      }

      const result = await this.financeService.getArAgingReport({
        as_of_date: query.as_of_date,
        customer_id: query.customer_id,
        format: query.format,
      });

      return {
        as_of_date: result.asOfDate,
        summary: {
          total_receivables: parseFloat(result.summary.totalReceivables || '0'),
          current: parseFloat(result.summary.current || '0'),
          days_30: parseFloat(result.summary.days30 || '0'),
          days_60: parseFloat(result.summary.days60 || '0'),
          days_90: parseFloat(result.summary.days90 || '0'),
          over_90: parseFloat(result.summary.over90 || '0'),
        },
        customers: (result.customers || []).map(customer => ({
          customer_id: customer.customerId,
          customer_name: customer.customerName,
          total_balance: parseFloat(customer.totalBalance || '0'),
          current: parseFloat(customer.current || '0'),
          days_30: parseFloat(customer.days30 || '0'),
          days_60: parseFloat(customer.days60 || '0'),
          days_90: parseFloat(customer.days90 || '0'),
          over_90: parseFloat(customer.over90 || '0'),
          invoices: (customer.invoices || []).map(invoice => ({
            invoice_number: invoice.invoiceNumber,
            invoice_date: invoice.invoiceDate,
            due_date: invoice.dueDate,
            amount: parseFloat(invoice.amount || '0'),
            days_overdue: invoice.daysOverdue || 0,
            aging_bucket: invoice.agingBucket,
          })),
        })),
      };
    } catch (error) {
      console.error('Error fetching AR aging report:', error);
      throw error;
    }
  }

  // Supply Chain Vendors endpoints
  @Get('Vendor')
  async getVendors(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    try {
      const pageNum = page ? parseInt(page) : 1;
      const limitNum = limit ? parseInt(limit) : 10;
      const result = await this.financeService.getVendors(pageNum, limitNum, sort, status, search);
      
      console.log('Finance Controller - Vendors response:', JSON.stringify({
        hasResult: !!result,
        resultKeys: result ? Object.keys(result) : [],
        vendorsCount: result?.vendors?.length || 0,
        total: result?.total,
        page: result?.page,
        limit: result?.limit,
      }, null, 2));
      
      // Handle both possible response structures
      const vendors = result?.vendors || result?.data || [];
      
      return {
        vendors: vendors.map((vendor: any) => ({
          id: vendor.id,
          name: vendor.name,
          code: vendor.code,
          contact_person: vendor.contactPerson || vendor.contact_person,
          email: vendor.email,
          phone: vendor.phone,
          address: vendor.address,
          city: vendor.city,
          country: vendor.country,
          tax_id: vendor.taxId || vendor.tax_id,
          payment_terms: vendor.paymentTerms || vendor.payment_terms,
          currency: vendor.currency,
          status: vendor.status,
          rating: vendor.rating,
          notes: vendor.notes,
          created_at: vendor.createdAt || vendor.created_at,
          updated_at: vendor.updatedAt || vendor.updated_at,
        })),
        total: result?.total || 0,
        page: result?.page || pageNum,
        limit: result?.limit || limitNum,
      };
    } catch (error) {
      console.error('Error getting vendors:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        stack: error.stack,
      });
      if (error.code === 5) {
        throw new BadRequestException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Get('Vendor/:id')
  async getVendor(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.getVendor(id);
      
      return {
        id: result.id,
        name: result.name,
        code: result.code,
        contact_person: result.contactPerson,
        email: result.email,
        phone: result.phone,
        address: result.address,
        city: result.city,
        country: result.country,
        tax_id: result.taxId,
        payment_terms: result.paymentTerms,
        currency: result.currency,
        status: result.status,
        rating: result.rating,
        notes: result.notes,
        created_at: result.createdAt,
        updated_at: result.updatedAt,
      };
    } catch (error) {
      console.error('Error getting vendor:', error);
      if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Vendor not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  // Supply Chain Shipments endpoints
  @Get('Shipment')
  async getShipments(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('warehouse_id') warehouse_id?: string,
    @Query('shipment_date') shipment_date?: string,
  ) {
    try {
      const pageNum = page ? parseInt(page) : 1;
      const limitNum = limit ? parseInt(limit) : 10;
      const result = await this.financeService.getShipments(pageNum, limitNum, sort, status, type, warehouse_id, shipment_date);
      
      console.log('Finance Controller - Shipments response:', JSON.stringify({
        hasResult: !!result,
        resultKeys: result ? Object.keys(result) : [],
        shipmentsCount: result?.shipments?.length || 0,
        total: result?.total,
        page: result?.page,
        limit: result?.limit,
      }, null, 2));
      
      // Handle both possible response structures
      const shipments = result?.shipments || result?.data || [];
      
      return {
        shipments: shipments.map((shipment: any) => ({
          id: shipment.id,
          shipment_number: shipment.shipmentNumber || shipment.shipment_number,
          type: shipment.type,
          warehouse_id: shipment.warehouseId || shipment.warehouse_id,
          warehouse_name: shipment.warehouseName || shipment.warehouse_name,
          to_warehouse_id: shipment.toWarehouseId || shipment.to_warehouse_id,
          to_warehouse_name: shipment.toWarehouseName || shipment.to_warehouse_name,
          vendor_id: shipment.vendorId || shipment.vendor_id,
          vendor_name: shipment.vendorName || shipment.vendor_name,
          customer_name: shipment.customerName || shipment.customer_name,
          tracking_number: shipment.trackingNumber || shipment.tracking_number,
          carrier: shipment.carrier,
          shipment_date: shipment.shipmentDate || shipment.shipment_date,
          expected_delivery: shipment.expectedDelivery || shipment.expected_delivery,
          status: shipment.status,
          notes: shipment.notes,
          items: (shipment.items || []).map((item: any) => ({
            id: item.id,
            product_id: item.productId || item.product_id,
            product_name: item.productName || item.product_name,
            product_sku: item.productSku || item.product_sku,
            batch_id: item.batchId || item.batch_id,
            batch_number: item.batchNumber || item.batch_number,
            quantity: item.quantity,
          })),
          created_at: shipment.createdAt || shipment.created_at,
          updated_at: shipment.updatedAt || shipment.updated_at,
        })),
        total: result?.total || 0,
        page: result?.page || pageNum,
        limit: result?.limit || limitNum,
      };
    } catch (error) {
      console.error('Error getting shipments:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        stack: error.stack,
      });
      if (error.code === 5) {
        throw new BadRequestException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Get('Shipment/:id')
  async getShipment(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.getShipment(id);
      
      return {
        id: result.id,
        shipment_number: result.shipmentNumber || result.shipment_number,
        type: result.type,
        warehouse_id: result.warehouseId || result.warehouse_id,
        warehouse_name: result.warehouseName || result.warehouse_name,
        to_warehouse_id: result.toWarehouseId || result.to_warehouse_id,
        to_warehouse_name: result.toWarehouseName || result.to_warehouse_name,
        vendor_id: result.vendorId || result.vendor_id,
        vendor_name: result.vendorName || result.vendor_name,
        customer_name: result.customerName || result.customer_name,
        tracking_number: result.trackingNumber || result.tracking_number,
        carrier: result.carrier,
        shipment_date: result.shipmentDate || result.shipment_date,
        expected_delivery: result.expectedDelivery || result.expected_delivery,
        status: result.status,
        notes: result.notes,
        items: (result.items || []).map((item: any) => ({
          id: item.id,
          product_id: item.productId || item.product_id,
          product_name: item.productName || item.product_name,
          product_sku: item.productSku || item.product_sku,
          batch_id: item.batchId || item.batch_id,
          batch_number: item.batchNumber || item.batch_number,
          quantity: item.quantity,
        })),
        created_at: result.createdAt || result.created_at,
        updated_at: result.updatedAt || result.updated_at,
      };
    } catch (error) {
      console.error('Error getting shipment:', error);
      if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Shipment not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  // Supply Chain Purchase Orders endpoints
  @Get('PurchaseOrder')
  async getPurchaseOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
    @Query('status') status?: string,
    @Query('vendor_id') vendor_id?: string,
    @Query('warehouse_id') warehouse_id?: string,
    @Query('order_date') order_date?: string,
  ) {
    try {
      const pageNum = page ? parseInt(page) : 1;
      const limitNum = limit ? parseInt(limit) : 10;
      const result = await this.financeService.getPurchaseOrders(pageNum, limitNum, sort, status, vendor_id, warehouse_id, order_date);
      
      console.log('Finance Controller - Purchase Orders response:', JSON.stringify({
        hasResult: !!result,
        resultKeys: result ? Object.keys(result) : [],
        purchaseOrdersCount: result?.purchaseOrders?.length || result?.data?.length || 0,
        total: result?.total,
        page: result?.page,
        limit: result?.limit,
      }, null, 2));
      
      // Handle both possible response structures
      const purchaseOrders = result?.purchaseOrders || result?.data || [];
      
      return {
        purchase_orders: purchaseOrders.map((po: any) => ({
          id: po.id,
          po_number: po.poNumber || po.po_number,
          vendor_id: po.vendorId || po.vendor_id,
          vendor_name: po.vendorName || po.vendor_name,
          warehouse_id: po.warehouseId || po.warehouse_id,
          warehouse_name: po.warehouseName || po.warehouse_name,
          order_date: po.orderDate || po.order_date,
          expected_delivery_date: po.expectedDeliveryDate || po.expected_delivery_date,
          subtotal: parseFloat(po.subtotal || po.subtotal || '0'),
          tax: parseFloat(po.tax || po.tax || '0'),
          total_amount: parseFloat(po.totalAmount || po.total_amount || '0'),
          status: po.status,
          approval_status: po.approvalStatus || po.approval_status,
          requires_approval: po.requiresApproval || po.requires_approval,
          notes: po.notes,
          items: (po.items || []).map((item: any) => ({
            id: item.id,
            product_id: item.productId || item.product_id,
            product_name: item.productName || item.product_name,
            product_sku: item.productSku || item.product_sku,
            quantity: parseFloat(item.quantity || item.quantity || '0'),
            unit_price: parseFloat(item.unitPrice || item.unit_price || '0'),
            subtotal: parseFloat(item.subtotal || item.subtotal || '0'),
          })),
          created_at: po.createdAt || po.created_at,
          updated_at: po.updatedAt || po.updated_at,
        })),
        total: result?.total || 0,
        page: result?.page || pageNum,
        limit: result?.limit || limitNum,
      };
    } catch (error) {
      console.error('Error getting purchase orders:', error);
      if (error.code === 2) {
        throw new BadRequestException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Get('PurchaseOrder/:id')
  async getPurchaseOrder(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.getPurchaseOrder(id);
      
      return {
        id: result.id,
        po_number: result.poNumber || result.po_number,
        vendor_id: result.vendorId || result.vendor_id,
        vendor_name: result.vendorName || result.vendor_name,
        warehouse_id: result.warehouseId || result.warehouse_id,
        warehouse_name: result.warehouseName || result.warehouse_name,
        order_date: result.orderDate || result.order_date,
        expected_delivery_date: result.expectedDeliveryDate || result.expected_delivery_date,
        subtotal: parseFloat(result.subtotal || result.subtotal || '0'),
        tax: parseFloat(result.tax || result.tax || '0'),
        total_amount: parseFloat(result.totalAmount || result.total_amount || '0'),
        status: result.status,
        approval_status: result.approvalStatus || result.approval_status,
        requires_approval: result.requiresApproval || result.requires_approval,
        notes: result.notes,
        items: (result.items || []).map((item: any) => ({
          id: item.id,
          product_id: item.productId || item.product_id,
          product_name: item.productName || item.product_name,
          product_sku: item.productSku || item.product_sku,
          quantity: parseFloat(item.quantity || item.quantity || '0'),
          unit_price: parseFloat(item.unitPrice || item.unit_price || '0'),
          subtotal: parseFloat(item.subtotal || item.subtotal || '0'),
        })),
        created_at: result.createdAt || result.created_at,
        updated_at: result.updatedAt || result.updated_at,
      };
    } catch (error) {
      console.error('Error getting purchase order:', error);
      if (error.code === 2) {
        throw new NotFoundException('Purchase order not found');
      }
      throw error;
    }
  }

  // Supply Chain Products/Inventory endpoints
  @Get('Product')
  async getProducts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('type') type?: string,
    @Query('vendor_id') vendor_id?: string,
  ) {
    try {
      const pageNum = page ? parseInt(page) : 1;
      const limitNum = limit ? parseInt(limit) : 10;
      const result = await this.financeService.getProducts(pageNum, limitNum, search, sort, status, category, type, vendor_id);
      
      console.log('Finance Controller - Products response:', JSON.stringify({
        hasResult: !!result,
        resultKeys: result ? Object.keys(result) : [],
        productsCount: result?.products?.length || 0,
        total: result?.total,
        page: result?.page,
        limit: result?.limit,
      }, null, 2));
      
      // Handle both possible response structures
      const products = result?.products || result?.data || [];
      
      return {
        products: products.map((product: any) => ({
          id: product.id,
          sku: product.sku,
          name: product.name,
          description: product.description || '',
          type: product.type,
          category: product.category,
          cost_price: parseFloat(product.costPrice || product.cost_price || '0'),
          selling_price: parseFloat(product.sellingPrice || product.selling_price || '0'),
          reorder_point: product.reorderPoint || product.reorder_point || 0,
          status: product.status,
          barcode: product.barcode || '',
          gtin: product.gtin || '',
          unit_of_measure: product.unitOfMeasure || product.unit_of_measure || '',
          default_warehouse_id: product.defaultWarehouseId || product.default_warehouse_id || '',
          vendor_id: product.vendorId || product.vendor_id || '',
          temperature: product.temperature || '',
          created_at: product.createdAt || product.created_at,
          updated_at: product.updatedAt || product.updated_at,
        })),
        total: result?.total || 0,
        page: result?.page || pageNum,
        limit: result?.limit || limitNum,
      };
    } catch (error) {
      console.error('Error getting products:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        stack: error.stack,
      });
      if (error.code === 5) {
        throw new BadRequestException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Get('Product/:id')
  async getProduct(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.getProduct(id);
      
      return {
        id: result.id,
        sku: result.sku,
        name: result.name,
        description: result.description || '',
        type: result.type,
        category: result.category,
        cost_price: parseFloat(result.costPrice || result.cost_price || '0'),
        selling_price: parseFloat(result.sellingPrice || result.selling_price || '0'),
        reorder_point: result.reorderPoint || result.reorder_point || 0,
        status: result.status,
        barcode: result.barcode || '',
        gtin: result.gtin || '',
        unit_of_measure: result.unitOfMeasure || result.unit_of_measure || '',
        default_warehouse_id: result.defaultWarehouseId || result.default_warehouse_id || '',
        vendor_id: result.vendorId || result.vendor_id || '',
        temperature: result.temperature || '',
        created_at: result.createdAt || result.created_at,
        updated_at: result.updatedAt || result.updated_at,
      };
    } catch (error) {
      console.error('Error getting product:', error);
      if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Product not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  // Purchase Bills endpoints
  // IMPORTANT: More specific routes must come before less specific ones
  @Post('PurchaseBill/:id/approve')
  async approvePurchaseBill(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() approveDto: { approved_by: string; notes?: string },
  ) {
    try {
      if (!approveDto.approved_by) {
        throw new BadRequestException('approved_by is required');
      }

      const result = await this.financeService.approvePurchaseBill(
        id,
        approveDto.approved_by,
        approveDto.notes
      );

      return {
        id: result.id,
        organization_id: result.organizationId,
        bill_number: result.billNumber,
        vendor_id: result.vendorId,
        vendor_name: result.vendorName,
        bill_date: result.billDate,
        due_date: result.dueDate,
        status: result.status,
        currency: result.currency,
        subtotal: parseFloat(result.subtotal || '0'),
        tax_amount: parseFloat(result.taxAmount || '0'),
        total_amount: parseFloat(result.totalAmount || '0'),
        paid_amount: parseFloat(result.paidAmount || '0'),
        balance_due: parseFloat(result.balanceDue || '0'),
        approved_by: result.approvedBy,
        approved_at: result.approvedAt,
        items: (result.items || []).map((item: any) => ({
          description: item.description,
          quantity: parseFloat(item.quantity || '1'),
          unit_price: parseFloat(item.unitPrice || '0'),
          amount: parseFloat(item.amount || '0'),
          account_id: item.accountId,
        })),
      };
    } catch (error) {
      console.error('Error approving purchase bill:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Bad request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Purchase bill not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Post('PurchaseBill/:id/post')
  async postPurchaseBill(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.postPurchaseBill(id);

      return {
        success: result.success,
        journal_entry_id: result.journalEntryId,
      };
    } catch (error) {
      console.error('Error posting purchase bill:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Bad request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Purchase bill not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Get('PurchaseBill')
  async getPurchaseBills(
    @Query('sort') sort?: string,
    @Query('status') status?: string,
    @Query('vendor_id') vendor_id?: string,
  ) {
    try {
      const result = await this.financeService.getPurchaseBills({ sort, status, vendor_id });
      
      return (result.purchaseBills || []).map((bill: any) => ({
        id: bill.id,
        organization_id: bill.organizationId,
        bill_number: bill.billNumber,
        vendor_id: bill.vendorId,
        vendor_name: bill.vendorName,
        bill_date: bill.billDate,
        due_date: bill.dueDate,
        status: bill.status,
        currency: bill.currency,
        subtotal: parseFloat(bill.subtotal || '0'),
        tax_amount: parseFloat(bill.taxAmount || '0'),
        total_amount: parseFloat(bill.totalAmount || '0'),
        paid_amount: parseFloat(bill.paidAmount || '0'),
        balance_due: parseFloat(bill.balanceDue || '0'),
        attachment_url: bill.attachmentUrl || null,
        attachment_name: bill.attachmentName || null,
        items: (bill.items || []).map((item: any) => ({
          description: item.description,
          quantity: parseFloat(item.quantity || '1'),
          unit_price: parseFloat(item.unitPrice || '0'),
          amount: parseFloat(item.amount || '0'),
          account_id: item.accountId,
        })),
      }));
    } catch (error) {
      console.error('Error getting purchase bills:', error);
      if (error.code === 5) {
        throw new BadRequestException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Post('PurchaseBill')
  async createPurchaseBill(@Body() createBillDto: any) {
    try {
      console.log('PurchaseBill create request:', JSON.stringify(createBillDto, null, 2));
      
      // Support both camelCase and snake_case from frontend
      const vendorId = createBillDto.vendor_id || createBillDto.vendorId;
      if (!vendorId) {
        console.error('Missing vendor_id in request:', {
          vendor_id: createBillDto.vendor_id,
          vendorId: createBillDto.vendorId,
          allKeys: Object.keys(createBillDto),
        });
        throw new BadRequestException('vendor_id is required');
      }

      const result = await this.financeService.createPurchaseBill({
        organization_id: createBillDto.organization_id || createBillDto.organizationId,
        bill_number: createBillDto.bill_number || createBillDto.billNumber,
        vendor_id: vendorId,
        bill_date: createBillDto.bill_date || createBillDto.billDate,
        due_date: createBillDto.due_date || createBillDto.dueDate,
        status: createBillDto.status,
        currency: createBillDto.currency,
        tax_rate: createBillDto.tax_rate || createBillDto.taxRate,
        attachment_url: createBillDto.attachment_url || createBillDto.attachmentUrl,
        attachment_name: createBillDto.attachment_name || createBillDto.attachmentName,
        items: (createBillDto.items || []).map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price || item.unitPrice,
          account_id: item.account_id || item.accountId,
        })),
      });

      return {
        id: result.id,
        organization_id: result.organizationId,
        bill_number: result.billNumber,
        vendor_id: result.vendorId,
        vendor_name: result.vendorName,
        bill_date: result.billDate,
        due_date: result.dueDate,
        status: result.status,
        currency: result.currency,
        subtotal: parseFloat(result.subtotal || '0'),
        tax_amount: parseFloat(result.taxAmount || '0'),
        total_amount: parseFloat(result.totalAmount || '0'),
        paid_amount: parseFloat(result.paidAmount || '0'),
        balance_due: parseFloat(result.balanceDue || '0'),
        attachment_url: result.attachmentUrl || null,
        attachment_name: result.attachmentName || null,
        items: (result.items || []).map((item: any) => ({
          description: item.description,
          quantity: parseFloat(item.quantity || '1'),
          unit_price: parseFloat(item.unitPrice || '0'),
          amount: parseFloat(item.amount || '0'),
          account_id: item.accountId,
        })),
      };
    } catch (error) {
      console.error('Error creating purchase bill:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Bad request');
      } else if (error.code === 6) {
        throw new BadRequestException(error.details || error.message || 'Conflict');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Put('PurchaseBill/:id')
  async updatePurchaseBill(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBillDto: any,
  ) {
    try {
      // Support both camelCase and snake_case from frontend
      const result = await this.financeService.updatePurchaseBill(id, {
        organization_id: updateBillDto.organization_id || updateBillDto.organizationId,
        bill_number: updateBillDto.bill_number || updateBillDto.billNumber,
        vendor_id: updateBillDto.vendor_id || updateBillDto.vendorId,
        bill_date: updateBillDto.bill_date || updateBillDto.billDate,
        due_date: updateBillDto.due_date || updateBillDto.dueDate,
        status: updateBillDto.status,
        currency: updateBillDto.currency,
        tax_rate: updateBillDto.tax_rate || updateBillDto.taxRate,
        attachment_url: updateBillDto.attachment_url !== undefined ? updateBillDto.attachment_url : (updateBillDto.attachmentUrl !== undefined ? updateBillDto.attachmentUrl : undefined),
        attachment_name: updateBillDto.attachment_name !== undefined ? updateBillDto.attachment_name : (updateBillDto.attachmentName !== undefined ? updateBillDto.attachmentName : undefined),
        // Only include items if they're explicitly provided and not empty
        // If items is undefined or empty, don't update items (preserve existing items)
        items: (updateBillDto.items && Array.isArray(updateBillDto.items) && updateBillDto.items.length > 0) ? updateBillDto.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price || item.unitPrice,
          account_id: item.account_id || item.accountId,
        })) : undefined,
      });

      return {
        id: result.id,
        organization_id: result.organizationId,
        bill_number: result.billNumber,
        vendor_id: result.vendorId,
        vendor_name: result.vendorName,
        bill_date: result.billDate,
        due_date: result.dueDate,
        status: result.status,
        currency: result.currency,
        subtotal: parseFloat(result.subtotal || '0'),
        tax_amount: parseFloat(result.taxAmount || '0'),
        total_amount: parseFloat(result.totalAmount || '0'),
        paid_amount: parseFloat(result.paidAmount || '0'),
        balance_due: parseFloat(result.balanceDue || '0'),
        attachment_url: result.attachmentUrl || null,
        attachment_name: result.attachmentName || null,
        items: (result.items || []).map((item: any) => ({
          description: item.description,
          quantity: parseFloat(item.quantity || '1'),
          unit_price: parseFloat(item.unitPrice || '0'),
          amount: parseFloat(item.amount || '0'),
          account_id: item.accountId,
        })),
      };
    } catch (error) {
      console.error('Error updating purchase bill:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Bad request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Purchase bill not found');
      } else if (error.code === 6) {
        throw new BadRequestException(error.details || error.message || 'Conflict');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  // Vendor Credit Notes endpoints
  // IMPORTANT: More specific routes must come before less specific ones
  @Post('VendorCreditNote/:id/apply')
  async applyVendorCreditNote(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() applyDto: { bill_id?: string; billId?: string; amount: number },
  ) {
    try {
      const billId = applyDto.bill_id || applyDto.billId;
      if (!billId) {
        throw new BadRequestException('bill_id is required');
      }

      if (!applyDto.amount) {
        throw new BadRequestException('amount is required');
      }

      const result = await this.financeService.applyVendorCreditNote(
        id,
        billId,
        parseFloat(applyDto.amount.toString())
      );

      return {
        id: result.id,
        organization_id: result.organizationId,
        credit_note_number: result.creditNoteNumber,
        vendor_id: result.vendorId,
        vendor_name: result.vendorName,
        bill_id: result.billId,
        credit_date: result.creditDate,
        reason: result.reason,
        status: result.status,
        total_amount: parseFloat(result.totalAmount || '0'),
        applied_amount: parseFloat(result.appliedAmount || '0'),
        balance: parseFloat(result.balance || '0'),
      };
    } catch (error) {
      console.error('Error applying vendor credit note:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Bad request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Vendor credit note not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Get('VendorCreditNote')
  async getVendorCreditNotes(
    @Query('sort') sort?: string,
    @Query('status') status?: string,
    @Query('vendor_id') vendor_id?: string,
  ) {
    try {
      const result = await this.financeService.getVendorCreditNotes({ sort, status, vendor_id });
      
      return (result.vendorCreditNotes || []).map((cn: any) => ({
        id: cn.id,
        organization_id: cn.organizationId,
        credit_note_number: cn.creditNoteNumber,
        vendor_id: cn.vendorId,
        vendor_name: cn.vendorName,
        bill_id: cn.billId,
        credit_date: cn.creditDate,
        reason: cn.reason,
        status: cn.status,
        total_amount: parseFloat(cn.totalAmount || '0'),
        applied_amount: parseFloat(cn.appliedAmount || '0'),
        balance: parseFloat(cn.balance || '0'),
      }));
    } catch (error) {
      console.error('Error getting vendor credit notes:', error);
      if (error.code === 5) {
        throw new BadRequestException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Post('VendorCreditNote')
  async createVendorCreditNote(@Body() createDto: any) {
    try {
      console.log('VendorCreditNote create request:', JSON.stringify(createDto, null, 2));
      
      // Support both camelCase and snake_case from frontend
      const vendorId = createDto.vendor_id || createDto.vendorId;
      if (!vendorId) {
        console.error('Missing vendor_id in request:', {
          vendor_id: createDto.vendor_id,
          vendorId: createDto.vendorId,
          allKeys: Object.keys(createDto),
        });
        throw new BadRequestException('vendor_id is required');
      }

      const result = await this.financeService.createVendorCreditNote({
        organization_id: createDto.organization_id || createDto.organizationId,
        credit_note_number: createDto.credit_note_number || createDto.creditNoteNumber,
        vendor_id: vendorId,
        bill_id: createDto.bill_id || createDto.billId,
        credit_date: createDto.credit_date || createDto.creditDate,
        reason: createDto.reason,
        status: createDto.status,
        total_amount: createDto.total_amount || createDto.totalAmount,
        description: createDto.description,
        items: (createDto.items || []).map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price || item.unitPrice,
          amount: item.amount,
        })),
      });

      return {
        id: result.id,
        organization_id: result.organizationId,
        credit_note_number: result.creditNoteNumber,
        vendor_id: result.vendorId,
        vendor_name: result.vendorName,
        bill_id: result.billId,
        credit_date: result.creditDate,
        reason: result.reason,
        status: result.status,
        total_amount: parseFloat(result.totalAmount || '0'),
        applied_amount: parseFloat(result.appliedAmount || '0'),
        balance: parseFloat(result.balance || '0'),
      };
    } catch (error) {
      console.error('Error creating vendor credit note:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Bad request');
      } else if (error.code === 6) {
        throw new BadRequestException(error.details || error.message || 'Conflict');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  // Vendor Payments endpoints
  // IMPORTANT: More specific routes must come before less specific ones
  @Post('VendorPayment/:id/process')
  async processVendorPayment(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.processVendorPayment(id);

      return {
        success: result.success,
        payment: {
          id: result.payment.id,
          organization_id: result.payment.organizationId,
          payment_number: result.payment.paymentNumber,
          vendor_id: result.payment.vendorId,
          vendor_name: result.payment.vendorName,
          payment_date: result.payment.paymentDate,
          payment_method: result.payment.paymentMethod,
          amount: parseFloat(result.payment.amount || '0'),
          currency: result.payment.currency,
          status: result.payment.status,
          bank_account_id: result.payment.bankAccountId,
          allocations: (result.payment.allocations || []).map((alloc: any) => ({
            bill_id: alloc.billId,
            amount: parseFloat(alloc.amount || '0'),
          })),
        },
      };
    } catch (error) {
      console.error('Error processing vendor payment:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Bad request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Vendor payment not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Get('VendorPayment')
  async getVendorPayments(
    @Query('sort') sort?: string,
    @Query('vendor_id') vendor_id?: string,
    @Query('status') status?: string,
  ) {
    try {
      const result = await this.financeService.getVendorPayments({ sort, vendor_id, status });
      
      return (result.vendorPayments || []).map((payment: any) => ({
        id: payment.id,
        organization_id: payment.organizationId,
        payment_number: payment.paymentNumber,
        vendor_id: payment.vendorId,
        vendor_name: payment.vendorName,
        payment_date: payment.paymentDate,
        payment_method: payment.paymentMethod,
        amount: parseFloat(payment.amount || '0'),
        currency: payment.currency,
        status: payment.status,
        bank_account_id: payment.bankAccountId,
        allocations: (payment.allocations || []).map((alloc: any) => ({
          bill_id: alloc.billId,
          amount: parseFloat(alloc.amount || '0'),
        })),
      }));
    } catch (error) {
      console.error('Error getting vendor payments:', error);
      if (error.code === 5) {
        throw new BadRequestException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Post('VendorPayment')
  async createVendorPayment(@Body() createDto: any) {
    try {
      console.log('VendorPayment create request:', JSON.stringify(createDto, null, 2));
      
      // Support both camelCase and snake_case from frontend
      const vendorId = createDto.vendor_id || createDto.vendorId;
      if (!vendorId) {
        console.error('Missing vendor_id in request:', {
          vendor_id: createDto.vendor_id,
          vendorId: createDto.vendorId,
          allKeys: Object.keys(createDto),
        });
        throw new BadRequestException('vendor_id is required');
      }

      const result = await this.financeService.createVendorPayment({
        organization_id: createDto.organization_id || createDto.organizationId,
        payment_number: createDto.payment_number || createDto.paymentNumber,
        vendor_id: vendorId,
        payment_date: createDto.payment_date || createDto.paymentDate,
        payment_method: createDto.payment_method || createDto.paymentMethod,
        amount: createDto.amount,
        currency: createDto.currency,
        bank_account_id: createDto.bank_account_id || createDto.bankAccountId,
        allocations: (createDto.allocations || []).map((alloc: any) => ({
          bill_id: alloc.bill_id || alloc.billId,
          amount: alloc.amount,
        })),
      });

      return {
        id: result.id,
        organization_id: result.organizationId,
        payment_number: result.paymentNumber,
        vendor_id: result.vendorId,
        vendor_name: result.vendorName,
        payment_date: result.paymentDate,
        payment_method: result.paymentMethod,
        amount: parseFloat(result.amount || '0'),
        currency: result.currency,
        status: result.status,
        bank_account_id: result.bankAccountId,
        allocations: (result.allocations || []).map((alloc: any) => ({
          bill_id: alloc.billId,
          amount: parseFloat(alloc.amount || '0'),
        })),
      };
    } catch (error) {
      console.error('Error creating vendor payment:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Bad request');
      } else if (error.code === 6) {
        throw new BadRequestException(error.details || error.message || 'Conflict');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  // Payment Schedules endpoints
  @Get('PaymentSchedule')
  async getPaymentSchedules(
    @Query('vendor_id') vendor_id?: string,
    @Query('status') status?: string,
    @Query('due_date_from') due_date_from?: string,
    @Query('due_date_to') due_date_to?: string,
    @Query('sort') sort?: string,
  ) {
    try {
      const result = await this.financeService.getPaymentSchedules({ 
        vendor_id, 
        status, 
        due_date_from, 
        due_date_to,
        sort,
      });
      
      return (result.paymentSchedules || []).map((schedule: any) => ({
        id: schedule.id,
        organization_id: schedule.organizationId,
        vendor_id: schedule.vendorId,
        vendor_name: schedule.vendorName,
        bill_id: schedule.billId,
        bill_number: schedule.billNumber,
        due_date: schedule.dueDate,
        amount_due: parseFloat(schedule.amountDue || '0'),
        status: schedule.status,
        payment_method: schedule.paymentMethod,
        scheduled_payment_date: schedule.scheduledPaymentDate,
        priority: schedule.priority,
      }));
    } catch (error) {
      console.error('Error getting payment schedules:', error);
      if (error.code === 5) {
        throw new BadRequestException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Post('PaymentSchedule')
  async createPaymentSchedule(@Body() createDto: any) {
    try {
      console.log('PaymentSchedule create request:', JSON.stringify(createDto, null, 2));
      
      // Support both camelCase and snake_case from frontend
      const vendorId = createDto.vendor_id || createDto.vendorId;
      if (!vendorId) {
        console.error('Missing vendor_id in request:', {
          vendor_id: createDto.vendor_id,
          vendorId: createDto.vendorId,
          allKeys: Object.keys(createDto),
        });
        throw new BadRequestException('vendor_id is required');
      }

      const billId = createDto.bill_id || createDto.billId;
      if (!billId) {
        throw new BadRequestException('bill_id is required');
      }

      const result = await this.financeService.createPaymentSchedule({
        organization_id: createDto.organization_id || createDto.organizationId,
        vendor_id: vendorId,
        bill_id: billId,
        due_date: createDto.due_date || createDto.dueDate,
        amount_due: createDto.amount_due || createDto.amountDue,
        payment_method: createDto.payment_method || createDto.paymentMethod,
        scheduled_payment_date: createDto.scheduled_payment_date || createDto.scheduledPaymentDate,
        priority: createDto.priority,
      });

      return {
        id: result.id,
        organization_id: result.organizationId,
        vendor_id: result.vendorId,
        vendor_name: result.vendorName,
        bill_id: result.billId,
        bill_number: result.billNumber,
        due_date: result.dueDate,
        amount_due: parseFloat(result.amountDue || '0'),
        status: result.status,
        payment_method: result.paymentMethod,
        scheduled_payment_date: result.scheduledPaymentDate,
        priority: result.priority,
      };
    } catch (error) {
      console.error('Error creating payment schedule:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Bad request');
      } else if (error.code === 6) {
        throw new BadRequestException(error.details || error.message || 'Conflict');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  // Recurring Bills endpoints
  @Get('RecurringBill')
  async getRecurringBills(
    @Query('sort') sort?: string,
    @Query('is_active') is_active?: string,
  ) {
    try {
      // Convert is_active string to boolean
      const isActive = is_active !== undefined 
        ? (is_active === 'true' || is_active === '1')
        : undefined;

      const result = await this.financeService.getRecurringBills({ sort, is_active: isActive });
      
      return (result.recurringBills || []).map((bill: any) => ({
        id: bill.id,
        organization_id: bill.organizationId,
        bill_name: bill.billName,
        vendor_id: bill.vendorId,
        vendor_name: bill.vendorName,
        category: bill.category,
        amount: parseFloat(bill.amount || '0'),
        currency: bill.currency,
        frequency: bill.frequency,
        start_date: bill.startDate,
        end_date: bill.endDate,
        next_due_date: bill.nextDueDate,
        is_active: bill.isActive !== undefined ? bill.isActive : true,
        auto_create: bill.autoCreate !== undefined ? bill.autoCreate : false,
        account_id: bill.accountId,
      }));
    } catch (error) {
      console.error('Error getting recurring bills:', error);
      if (error.code === 5) {
        throw new BadRequestException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Post('RecurringBill')
  async createRecurringBill(@Body() createDto: any) {
    try {
      console.log('RecurringBill create request:', JSON.stringify(createDto, null, 2));
      
      // Support both camelCase and snake_case from frontend
      const vendorId = createDto.vendor_id || createDto.vendorId;
      if (!vendorId) {
        console.error('Missing vendor_id in request:', {
          vendor_id: createDto.vendor_id,
          vendorId: createDto.vendorId,
          allKeys: Object.keys(createDto),
        });
        throw new BadRequestException('vendor_id is required');
      }

      const accountId = createDto.account_id || createDto.accountId;
      if (!accountId) {
        console.error('Missing account_id in request:', {
          account_id: createDto.account_id,
          accountId: createDto.accountId,
          allKeys: Object.keys(createDto),
        });
        throw new BadRequestException('account_id is required');
      }

      const result = await this.financeService.createRecurringBill({
        organization_id: createDto.organization_id || createDto.organizationId,
        bill_name: createDto.bill_name || createDto.billName,
        vendor_id: vendorId,
        category: createDto.category,
        amount: createDto.amount,
        currency: createDto.currency,
        frequency: createDto.frequency,
        start_date: createDto.start_date || createDto.startDate,
        end_date: createDto.end_date || createDto.endDate,
        is_active: createDto.is_active !== undefined 
          ? (typeof createDto.is_active === 'boolean' ? createDto.is_active : createDto.is_active === 'true' || createDto.is_active === true)
          : undefined,
        auto_create: createDto.auto_create !== undefined 
          ? (typeof createDto.auto_create === 'boolean' ? createDto.auto_create : createDto.auto_create === 'true' || createDto.auto_create === true)
          : undefined,
        account_id: accountId,
      });

      return {
        id: result.id,
        organization_id: result.organizationId,
        bill_name: result.billName,
        vendor_id: result.vendorId,
        vendor_name: result.vendorName,
        category: result.category,
        amount: parseFloat(result.amount || '0'),
        currency: result.currency,
        frequency: result.frequency,
        start_date: result.startDate,
        end_date: result.endDate,
        next_due_date: result.nextDueDate,
        is_active: result.isActive !== undefined ? result.isActive : true,
        auto_create: result.autoCreate !== undefined ? result.autoCreate : false,
        account_id: result.accountId,
      };
    } catch (error) {
      console.error('Error creating recurring bill:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Bad request');
      } else if (error.code === 6) {
        throw new BadRequestException(error.details || error.message || 'Conflict');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  // Bank Accounts endpoints
  // IMPORTANT: More specific routes must come before less specific ones
  @Get('BankAccount/:id/balance')
  async getBankAccountBalance(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('as_of_date') as_of_date?: string,
  ) {
    try {
      const result = await this.financeService.getBankAccountBalance(id, as_of_date);
      
      return {
        account_id: result.accountId,
        account_name: result.accountName,
        opening_balance: parseFloat(result.openingBalance || '0'),
        current_balance: parseFloat(result.currentBalance || '0'),
        as_of_date: result.asOfDate,
        reconciled_balance: parseFloat(result.reconciledBalance || '0'),
        unreconciled_transactions: result.unreconciledTransactions || 0,
      };
    } catch (error) {
      console.error('Error getting bank account balance:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Bad request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Bank account not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Get('BankAccount')
  async getBankAccounts(
    @Query('sort') sort?: string,
    @Query('is_active') is_active?: string,
  ) {
    try {
      // Convert is_active string to boolean
      const isActive = is_active !== undefined 
        ? (is_active === 'true' || is_active === '1')
        : undefined;

      const result = await this.financeService.getBankAccounts({ sort, is_active: isActive });
      
      return (result.bankAccounts || []).map((account: any) => ({
        id: account.id,
        organization_id: account.organizationId,
        account_name: account.accountName,
        account_number: account.accountNumber,
        bank_name: account.bankName,
        account_type: account.accountType,
        currency: account.currency,
        opening_balance: parseFloat(account.openingBalance || '0'),
        current_balance: parseFloat(account.currentBalance || '0'),
        is_active: account.isActive !== undefined ? account.isActive : true,
      }));
    } catch (error) {
      console.error('Error getting bank accounts:', error);
      if (error.code === 5) {
        throw new BadRequestException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Post('BankAccount')
  async createBankAccount(@Body() createDto: any) {
    try {
      console.log('BankAccount create request:', JSON.stringify(createDto, null, 2));
      
      // Support both camelCase and snake_case from frontend
      if (!createDto.account_name && !createDto.accountName) {
        throw new BadRequestException('account_name is required');
      }
      if (!createDto.account_number && !createDto.accountNumber) {
        throw new BadRequestException('account_number is required');
      }
      if (!createDto.bank_name && !createDto.bankName) {
        throw new BadRequestException('bank_name is required');
      }
      if (!createDto.account_type && !createDto.accountType) {
        throw new BadRequestException('account_type is required');
      }

      const result = await this.financeService.createBankAccount({
        organization_id: createDto.organization_id || createDto.organizationId,
        account_name: createDto.account_name || createDto.accountName,
        account_number: createDto.account_number || createDto.accountNumber,
        bank_name: createDto.bank_name || createDto.bankName,
        account_type: createDto.account_type || createDto.accountType,
        currency: createDto.currency,
        opening_balance: createDto.opening_balance || createDto.openingBalance,
        is_active: createDto.is_active !== undefined 
          ? (typeof createDto.is_active === 'boolean' ? createDto.is_active : createDto.is_active === 'true' || createDto.is_active === true)
          : undefined,
      });

      return {
        id: result.id,
        organization_id: result.organizationId,
        account_name: result.accountName,
        account_number: result.accountNumber,
        bank_name: result.bankName,
        account_type: result.accountType,
        currency: result.currency,
        opening_balance: parseFloat(result.openingBalance || '0'),
        current_balance: parseFloat(result.currentBalance || '0'),
        is_active: result.isActive !== undefined ? result.isActive : true,
      };
    } catch (error) {
      console.error('Error creating bank account:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Bad request');
      } else if (error.code === 6) {
        throw new BadRequestException(error.details || error.message || 'Conflict');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  // Cash Accounts endpoints
  @Get('CashAccount')
  async getCashAccounts(
    @Query('sort') sort?: string,
    @Query('is_active') is_active?: string,
  ) {
    try {
      // Convert is_active string to boolean
      const isActive = is_active !== undefined 
        ? (is_active === 'true' || is_active === '1')
        : undefined;

      const result = await this.financeService.getCashAccounts({ sort, is_active: isActive });
      
      return (result.cashAccounts || []).map((account: any) => ({
        id: account.id,
        organization_id: account.organizationId,
        account_name: account.accountName,
        account_code: account.accountCode,
        location: account.location,
        currency: account.currency,
        opening_balance: parseFloat(account.openingBalance || '0'),
        current_balance: parseFloat(account.currentBalance || '0'),
        is_active: account.isActive !== undefined ? account.isActive : true,
      }));
    } catch (error) {
      console.error('Error getting cash accounts:', error);
      if (error.code === 5) {
        throw new BadRequestException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Post('CashAccount')
  async createCashAccount(@Body() createDto: any) {
    try {
      console.log('CashAccount create request:', JSON.stringify(createDto, null, 2));
      
      // Support both camelCase and snake_case from frontend
      if (!createDto.account_name && !createDto.accountName) {
        throw new BadRequestException('account_name is required');
      }
      if (!createDto.account_code && !createDto.accountCode) {
        throw new BadRequestException('account_code is required');
      }

      const result = await this.financeService.createCashAccount({
        organization_id: createDto.organization_id || createDto.organizationId,
        account_name: createDto.account_name || createDto.accountName,
        account_code: createDto.account_code || createDto.accountCode,
        location: createDto.location,
        currency: createDto.currency,
        opening_balance: createDto.opening_balance || createDto.openingBalance,
        is_active: createDto.is_active !== undefined 
          ? (typeof createDto.is_active === 'boolean' ? createDto.is_active : createDto.is_active === 'true' || createDto.is_active === true)
          : undefined,
      });

      return {
        id: result.id,
        organization_id: result.organizationId,
        account_name: result.accountName,
        account_code: result.accountCode,
        location: result.location,
        currency: result.currency,
        opening_balance: parseFloat(result.openingBalance || '0'),
        current_balance: parseFloat(result.currentBalance || '0'),
        is_active: result.isActive !== undefined ? result.isActive : true,
      };
    } catch (error) {
      console.error('Error creating cash account:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Bad request');
      } else if (error.code === 6) {
        throw new BadRequestException(error.details || error.message || 'Conflict');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  // Bank Transactions endpoints
  // IMPORTANT: More specific routes must come before less specific ones
  @Post('BankTransaction/import')
  async importBankTransactions(@Body() importDto: any) {
    try {
      console.log('BankTransaction import request:', JSON.stringify(importDto, null, 2));
      
      const bankAccountId = importDto.bank_account_id || importDto.bankAccountId;
      if (!bankAccountId) {
        throw new BadRequestException('bank_account_id is required');
      }
      if (!importDto.file_url && !importDto.fileUrl) {
        throw new BadRequestException('file_url is required');
      }
      if (!importDto.file_format && !importDto.fileFormat) {
        throw new BadRequestException('file_format is required');
      }

      const result = await this.financeService.importBankTransactions({
        bank_account_id: bankAccountId,
        file_url: importDto.file_url || importDto.fileUrl,
        file_format: importDto.file_format || importDto.fileFormat,
        mapping: importDto.mapping,
      });

      return {
        success: result.success,
        imported_count: result.importedCount || 0,
        errors: result.errors || [],
        transactions: (result.transactions || []).map((t: any) => ({
          id: t.id,
          organization_id: t.organizationId,
          bank_account_id: t.bankAccountId,
          bank_account_name: t.bankAccountName,
          transaction_date: t.transactionDate,
          transaction_type: t.transactionType,
          amount: parseFloat(t.amount || '0'),
          currency: t.currency,
          reference: t.reference,
          description: t.description,
          category: t.category,
          is_reconciled: t.isReconciled !== undefined ? t.isReconciled : false,
          reconciliation_id: t.reconciliationId,
        })),
      };
    } catch (error) {
      console.error('Error importing bank transactions:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Bad request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Bank account not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Get('BankTransaction')
  async getBankTransactions(
    @Query('sort') sort?: string,
    @Query('bank_account_id') bank_account_id?: string,
    @Query('category') category?: string,
    @Query('date_from') date_from?: string,
    @Query('date_to') date_to?: string,
  ) {
    try {
      const result = await this.financeService.getBankTransactions({ 
        sort, 
        bank_account_id, 
        category, 
        date_from, 
        date_to,
      });
      
      return (result.bankTransactions || []).map((transaction: any) => ({
        id: transaction.id,
        organization_id: transaction.organizationId,
        bank_account_id: transaction.bankAccountId,
        bank_account_name: transaction.bankAccountName,
        transaction_date: transaction.transactionDate,
        transaction_type: transaction.transactionType,
        amount: parseFloat(transaction.amount || '0'),
        currency: transaction.currency,
        reference: transaction.reference,
        description: transaction.description,
        category: transaction.category,
        is_reconciled: transaction.isReconciled !== undefined ? transaction.isReconciled : false,
        reconciliation_id: transaction.reconciliationId,
      }));
    } catch (error) {
      console.error('Error getting bank transactions:', error);
      if (error.code === 5) {
        throw new BadRequestException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Post('BankTransaction')
  async createBankTransaction(@Body() createDto: any) {
    try {
      console.log('BankTransaction create request:', JSON.stringify(createDto, null, 2));
      
      // Support both camelCase and snake_case from frontend
      const bankAccountId = createDto.bank_account_id || createDto.bankAccountId;
      if (!bankAccountId) {
        throw new BadRequestException('bank_account_id is required');
      }

      const result = await this.financeService.createBankTransaction({
        organization_id: createDto.organization_id || createDto.organizationId,
        bank_account_id: bankAccountId,
        transaction_date: createDto.transaction_date || createDto.transactionDate,
        transaction_type: createDto.transaction_type || createDto.transactionType,
        amount: createDto.amount,
        currency: createDto.currency,
        reference: createDto.reference,
        description: createDto.description,
        category: createDto.category,
      });

      return {
        id: result.id,
        organization_id: result.organizationId,
        bank_account_id: result.bankAccountId,
        bank_account_name: result.bankAccountName,
        transaction_date: result.transactionDate,
        transaction_type: result.transactionType,
        amount: parseFloat(result.amount || '0'),
        currency: result.currency,
        reference: result.reference,
        description: result.description,
        category: result.category,
        is_reconciled: result.isReconciled !== undefined ? result.isReconciled : false,
        reconciliation_id: result.reconciliationId,
      };
    } catch (error) {
      console.error('Error creating bank transaction:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Bad request');
      } else if (error.code === 6) {
        throw new BadRequestException(error.details || error.message || 'Conflict');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  // Bank Reconciliations endpoints
  // IMPORTANT: More specific routes must come before less specific ones
  @Get('BankReconciliation/:id/unmatched')
  async getUnmatchedTransactions(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.getUnmatchedTransactions(id);
      
      return {
        reconciliation_id: result.reconciliationId,
        unmatched_transactions: (result.unmatchedTransactions || []).map((t: any) => ({
          transaction_id: t.transactionId,
          transaction_date: t.transactionDate,
          amount: parseFloat(t.amount || '0'),
          description: t.description,
          type: t.type,
        })),
        unmatched_statement_items: (result.unmatchedStatementItems || []).map((item: any) => ({
          date: item.date,
          amount: parseFloat(item.amount || '0'),
          description: item.description,
          type: item.type,
        })),
      };
    } catch (error) {
      console.error('Error getting unmatched transactions:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Bad request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Bank reconciliation not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Post('BankReconciliation/:id/complete')
  async completeReconciliation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() completeDto: any,
  ) {
    try {
      const result = await this.financeService.completeReconciliation(id, completeDto.notes);
      
      return {
        id: result.id,
        organization_id: result.organizationId,
        bank_account_id: result.bankAccountId,
        bank_account_name: result.bankAccountName,
        reconciliation_date: result.reconciliationDate,
        statement_balance: parseFloat(result.statementBalance || '0'),
        book_balance: parseFloat(result.bookBalance || '0'),
        adjusted_balance: parseFloat(result.adjustedBalance || '0'),
        status: result.status,
        outstanding_deposits: parseFloat(result.outstandingDeposits || '0'),
        outstanding_checks: parseFloat(result.outstandingChecks || '0'),
        bank_charges: parseFloat(result.bankCharges || '0'),
        interest_earned: parseFloat(result.interestEarned || '0'),
        notes: result.notes,
      };
    } catch (error) {
      console.error('Error completing reconciliation:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Bad request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Bank reconciliation not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Post('BankReconciliation/match')
  async matchTransactions(@Body() matchDto: any) {
    try {
      console.log('BankReconciliation match request:', JSON.stringify(matchDto, null, 2));
      
      if (!matchDto.reconciliation_id && !matchDto.reconciliationId) {
        throw new BadRequestException('reconciliation_id is required');
      }

      const result = await this.financeService.matchTransactions({
        reconciliation_id: matchDto.reconciliation_id || matchDto.reconciliationId,
        matches: matchDto.matches || [],
      });

      return {
        id: result.id,
        organization_id: result.organizationId,
        bank_account_id: result.bankAccountId,
        bank_account_name: result.bankAccountName,
        reconciliation_date: result.reconciliationDate,
        statement_balance: parseFloat(result.statementBalance || '0'),
        book_balance: parseFloat(result.bookBalance || '0'),
        adjusted_balance: parseFloat(result.adjustedBalance || '0'),
        status: result.status,
        outstanding_deposits: parseFloat(result.outstandingDeposits || '0'),
        outstanding_checks: parseFloat(result.outstandingChecks || '0'),
        bank_charges: parseFloat(result.bankCharges || '0'),
        interest_earned: parseFloat(result.interestEarned || '0'),
        notes: result.notes,
      };
    } catch (error) {
      console.error('Error matching transactions:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Bad request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Bank reconciliation not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Get('BankReconciliation')
  async getBankReconciliations(
    @Query('sort') sort?: string,
    @Query('bank_account_id') bank_account_id?: string,
    @Query('status') status?: string,
  ) {
    try {
      const result = await this.financeService.getBankReconciliations({ sort, bank_account_id, status });
      
      return (result.bankReconciliations || []).map((reconciliation: any) => ({
        id: reconciliation.id,
        organization_id: reconciliation.organizationId,
        bank_account_id: reconciliation.bankAccountId,
        bank_account_name: reconciliation.bankAccountName,
        reconciliation_date: reconciliation.reconciliationDate,
        statement_balance: parseFloat(reconciliation.statementBalance || '0'),
        book_balance: parseFloat(reconciliation.bookBalance || '0'),
        adjusted_balance: parseFloat(reconciliation.adjustedBalance || '0'),
        status: reconciliation.status,
        outstanding_deposits: parseFloat(reconciliation.outstandingDeposits || '0'),
        outstanding_checks: parseFloat(reconciliation.outstandingChecks || '0'),
        bank_charges: parseFloat(reconciliation.bankCharges || '0'),
        interest_earned: parseFloat(reconciliation.interestEarned || '0'),
      }));
    } catch (error) {
      console.error('Error getting bank reconciliations:', error);
      if (error.code === 5) {
        throw new BadRequestException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Post('BankReconciliation')
  async createBankReconciliation(@Body() createDto: any) {
    try {
      console.log('BankReconciliation create request:', JSON.stringify(createDto, null, 2));
      
      // Support both camelCase and snake_case from frontend
      const bankAccountId = createDto.bank_account_id || createDto.bankAccountId;
      if (!bankAccountId) {
        throw new BadRequestException('bank_account_id is required');
      }

      const result = await this.financeService.createBankReconciliation({
        organization_id: createDto.organization_id || createDto.organizationId,
        bank_account_id: bankAccountId,
        reconciliation_date: createDto.reconciliation_date || createDto.reconciliationDate,
        statement_balance: createDto.statement_balance || createDto.statementBalance,
        outstanding_deposits: createDto.outstanding_deposits || createDto.outstandingDeposits,
        outstanding_checks: createDto.outstanding_checks || createDto.outstandingChecks,
        bank_charges: createDto.bank_charges || createDto.bankCharges,
        interest_earned: createDto.interest_earned || createDto.interestEarned,
        notes: createDto.notes,
      });

      return {
        id: result.id,
        organization_id: result.organizationId,
        bank_account_id: result.bankAccountId,
        bank_account_name: result.bankAccountName,
        reconciliation_date: result.reconciliationDate,
        statement_balance: parseFloat(result.statementBalance || '0'),
        book_balance: parseFloat(result.bookBalance || '0'),
        adjusted_balance: parseFloat(result.adjustedBalance || '0'),
        status: result.status,
        outstanding_deposits: parseFloat(result.outstandingDeposits || '0'),
        outstanding_checks: parseFloat(result.outstandingChecks || '0'),
        bank_charges: parseFloat(result.bankCharges || '0'),
        interest_earned: parseFloat(result.interestEarned || '0'),
      };
    } catch (error) {
      console.error('Error creating bank reconciliation:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Bad request');
      } else if (error.code === 6) {
        throw new BadRequestException(error.details || error.message || 'Conflict');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  // Cheques endpoints
  // IMPORTANT: More specific routes must come before less specific ones
  @Post('Cheque/:id/deposit')
  async depositCheque(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() depositDto: any,
  ) {
    try {
      const bankAccountId = depositDto.bank_account_id || depositDto.bankAccountId;
      if (!bankAccountId) {
        throw new BadRequestException('bank_account_id is required');
      }

      const result = await this.financeService.depositCheque(
        id,
        depositDto.deposit_date || depositDto.depositDate,
        bankAccountId,
      );
      
      return {
        id: result.id,
        organization_id: result.organizationId,
        cheque_number: result.chequeNumber,
        type: result.type,
        cheque_date: result.chequeDate,
        amount: parseFloat(result.amount || '0'),
        currency: result.currency,
        payee_name: result.payeeName,
        bank_name: result.bankName,
        status: result.status,
        bank_account_id: result.bankAccountId,
        deposit_date: result.depositDate,
        clear_date: result.clearDate,
      };
    } catch (error) {
      console.error('Error depositing cheque:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Bad request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Cheque or bank account not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Post('Cheque/:id/clear')
  async clearCheque(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() clearDto: any,
  ) {
    try {
      const result = await this.financeService.clearCheque(
        id,
        clearDto.clear_date || clearDto.clearDate,
      );
      
      return {
        id: result.id,
        organization_id: result.organizationId,
        cheque_number: result.chequeNumber,
        type: result.type,
        cheque_date: result.chequeDate,
        amount: parseFloat(result.amount || '0'),
        currency: result.currency,
        payee_name: result.payeeName,
        bank_name: result.bankName,
        status: result.status,
        bank_account_id: result.bankAccountId,
        deposit_date: result.depositDate,
        clear_date: result.clearDate,
      };
    } catch (error) {
      console.error('Error clearing cheque:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Bad request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Cheque not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Get('Cheque')
  async getCheques(
    @Query('sort') sort?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    try {
      const result = await this.financeService.getCheques({ sort, type, status });
      
      return (result.cheques || []).map((cheque: any) => ({
        id: cheque.id,
        organization_id: cheque.organizationId,
        cheque_number: cheque.chequeNumber,
        type: cheque.type,
        cheque_date: cheque.chequeDate,
        amount: parseFloat(cheque.amount || '0'),
        currency: cheque.currency,
        payee_name: cheque.payeeName,
        bank_name: cheque.bankName,
        status: cheque.status,
        bank_account_id: cheque.bankAccountId,
      }));
    } catch (error) {
      console.error('Error getting cheques:', error);
      if (error.code === 5) {
        throw new BadRequestException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Post('Cheque')
  async createCheque(@Body() createDto: any) {
    try {
      console.log('Cheque create request:', JSON.stringify(createDto, null, 2));
      
      // Support both camelCase and snake_case from frontend
      if (!createDto.cheque_number && !createDto.chequeNumber) {
        throw new BadRequestException('cheque_number is required');
      }
      if (!createDto.type) {
        throw new BadRequestException('type is required');
      }
      if (!createDto.cheque_date && !createDto.chequeDate) {
        throw new BadRequestException('cheque_date is required');
      }
      if (!createDto.payee_name && !createDto.payeeName) {
        throw new BadRequestException('payee_name is required');
      }

      const result = await this.financeService.createCheque({
        organization_id: createDto.organization_id || createDto.organizationId,
        cheque_number: createDto.cheque_number || createDto.chequeNumber,
        type: createDto.type,
        cheque_date: createDto.cheque_date || createDto.chequeDate,
        amount: createDto.amount,
        currency: createDto.currency,
        payee_name: createDto.payee_name || createDto.payeeName,
        bank_name: createDto.bank_name || createDto.bankName,
        bank_account_id: createDto.bank_account_id || createDto.bankAccountId,
      });

      return {
        id: result.id,
        organization_id: result.organizationId,
        cheque_number: result.chequeNumber,
        type: result.type,
        cheque_date: result.chequeDate,
        amount: parseFloat(result.amount || '0'),
        currency: result.currency,
        payee_name: result.payeeName,
        bank_name: result.bankName,
        status: result.status,
        bank_account_id: result.bankAccountId,
      };
    } catch (error) {
      console.error('Error creating cheque:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Bad request');
      } else if (error.code === 6) {
        throw new BadRequestException(error.details || error.message || 'Conflict');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  // Cash Flow endpoints
  // IMPORTANT: More specific routes must come before less specific ones
  @Get('CashFlow/forecast')
  async getCashFlowForecast(
    @Query('period_start') period_start: string,
    @Query('period_end') period_end: string,
    @Query('include_recurring') include_recurring?: string,
  ) {
    try {
      if (!period_start || !period_end) {
        throw new BadRequestException('period_start and period_end are required');
      }

      const includeRecurring = include_recurring !== undefined 
        ? (include_recurring === 'true' || include_recurring === '1')
        : false;

      const result = await this.financeService.getCashFlowForecast({
        period_start: period_start,
        period_end: period_end,
        include_recurring: includeRecurring,
      });

      return {
        period_start: result.periodStart,
        period_end: result.periodEnd,
        opening_balance: parseFloat(result.openingBalance || '0'),
        projected_inflows: parseFloat(result.projectedInflows || '0'),
        projected_outflows: parseFloat(result.projectedOutflows || '0'),
        projected_closing_balance: parseFloat(result.projectedClosingBalance || '0'),
        daily_forecast: (result.dailyForecast || []).map((day: any) => ({
          date: day.date,
          inflows: parseFloat(day.inflows || '0'),
          outflows: parseFloat(day.outflows || '0'),
          balance: parseFloat(day.balance || '0'),
        })),
        sources: {
          customer_payments: parseFloat(result.sources?.customerPayments || '0'),
          vendor_payments: parseFloat(result.sources?.vendorPayments || '0'),
          expenses: parseFloat(result.sources?.expenses || '0'),
        },
      };
    } catch (error) {
      console.error('Error getting cash flow forecast:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Bad request');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Get('CashFlow/actual')
  async getCashFlowActual(
    @Query('period_start') period_start: string,
    @Query('period_end') period_end: string,
  ) {
    try {
      if (!period_start || !period_end) {
        throw new BadRequestException('period_start and period_end are required');
      }

      console.log('CashFlow actual request query params:', { period_start, period_end });

      const result = await this.financeService.getCashFlowActual({
        period_start: period_start,
        period_end: period_end,
      });

      return {
        period_start: result.periodStart,
        period_end: result.periodEnd,
        opening_balance: parseFloat(result.openingBalance || '0'),
        actual_inflows: parseFloat(result.actualInflows || '0'),
        actual_outflows: parseFloat(result.actualOutflows || '0'),
        actual_closing_balance: parseFloat(result.actualClosingBalance || '0'),
        daily_actual: (result.dailyActual || []).map((day: any) => ({
          date: day.date,
          inflows: parseFloat(day.inflows || '0'),
          outflows: parseFloat(day.outflows || '0'),
          balance: parseFloat(day.balance || '0'),
        })),
      };
    } catch (error) {
      console.error('Error getting actual cash flow:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Bad request');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Post('CashFlow/calculate')
  async calculateCashFlow(@Body() calculateDto: any) {
    try {
      console.log('CashFlow calculate request:', JSON.stringify(calculateDto, null, 2));
      
      if (!calculateDto.period_start && !calculateDto.periodStart) {
        throw new BadRequestException('period_start is required');
      }
      if (!calculateDto.period_end && !calculateDto.periodEnd) {
        throw new BadRequestException('period_end is required');
      }

      console.log('CashFlow calculate - mapped data:', {
        period_start: calculateDto.period_start || calculateDto.periodStart,
        period_end: calculateDto.period_end || calculateDto.periodEnd,
        account_ids: calculateDto.account_ids || calculateDto.accountIds,
        include_forecast: calculateDto.include_forecast !== undefined 
          ? (typeof calculateDto.include_forecast === 'boolean' ? calculateDto.include_forecast : calculateDto.include_forecast === 'true')
          : false,
      });

      const result = await this.financeService.calculateCashFlow({
        period_start: calculateDto.period_start || calculateDto.periodStart,
        period_end: calculateDto.period_end || calculateDto.periodEnd,
        account_ids: calculateDto.account_ids || calculateDto.accountIds,
        include_forecast: calculateDto.include_forecast !== undefined 
          ? (typeof calculateDto.include_forecast === 'boolean' ? calculateDto.include_forecast : calculateDto.include_forecast === 'true')
          : false,
      });

      return {
        period_start: result.periodStart,
        period_end: result.periodEnd,
        accounts: (result.accounts || []).map((acc: any) => ({
          account_id: acc.accountId,
          account_name: acc.accountName,
          opening_balance: parseFloat(acc.openingBalance || '0'),
          inflows: parseFloat(acc.inflows || '0'),
          outflows: parseFloat(acc.outflows || '0'),
          closing_balance: parseFloat(acc.closingBalance || '0'),
        })),
        total_opening_balance: parseFloat(result.totalOpeningBalance || '0'),
        total_inflows: parseFloat(result.totalInflows || '0'),
        total_outflows: parseFloat(result.totalOutflows || '0'),
        total_closing_balance: parseFloat(result.totalClosingBalance || '0'),
      };
    } catch (error) {
      console.error('Error calculating cash flow:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Bad request');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Get('CashFlow')
  async getCashFlow(
    @Query('period_start') period_start?: string,
    @Query('period_end') period_end?: string,
    @Query('account_type') account_type?: string,
  ) {
    try {
      console.log('CashFlow GET request query params:', { period_start, period_end, account_type });
      
      const result = await this.financeService.getCashFlow({
        period_start: period_start,
        period_end: period_end,
        account_type: account_type,
      });

      return (result.cashFlows || []).map((flow: any) => ({
        id: flow.id,
        organization_id: flow.organizationId,
        period_start: flow.periodStart,
        period_end: flow.periodEnd,
        account_id: flow.accountId,
        account_name: flow.accountName,
        opening_balance: parseFloat(flow.openingBalance || '0'),
        inflows: parseFloat(flow.inflows || '0'),
        outflows: parseFloat(flow.outflows || '0'),
        closing_balance: parseFloat(flow.closingBalance || '0'),
      }));
    } catch (error) {
      console.error('Error getting cash flow:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Bad request');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  // Budget endpoints
  @Get('Budget')
  async getBudgets(@Query() query: any) {
    try {
      const result = await this.financeService.getBudgets(query) as any;
      console.log('Budgets result:', JSON.stringify(result, null, 2));
      
      // Handle case where result might be undefined or have different structure
      if (!result) {
        return [];
      }
      
      // Check if result has budgets array or if it's the array itself
      const budgets = result.budgets || result || [];
      if (!Array.isArray(budgets)) {
        console.error('Budgets is not an array:', budgets);
        return [];
      }
      
      return budgets.map((budget: any) => ({
        id: budget.id,
        organization_id: budget.organizationId || null,
        budget_name: budget.budgetName,
        fiscal_year: budget.fiscalYear,
        period_type: budget.periodType,
        department: budget.department || null,
        project_id: budget.projectId || null,
        account_id: budget.accountId,
        account_code: budget.accountCode || null,
        account_name: budget.accountName || null,
        budget_amount: parseFloat(budget.budgetAmount || '0'),
        currency: budget.currency || 'USD',
        status: budget.status,
        periods: (budget.periods || []).map((p: any) => ({
          period: p.period,
          amount: parseFloat(p.amount || '0'),
        })),
      }));
    } catch (error) {
      console.error('Error fetching budgets:', error);
      throw error;
    }
  }

  @Get('Budget/:id')
  async getBudget(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const budget = await this.financeService.getBudget(id) as any;
      return {
        id: budget.id,
        organization_id: budget.organizationId || null,
        budget_name: budget.budgetName,
        fiscal_year: budget.fiscalYear,
        period_type: budget.periodType,
        department: budget.department || null,
        project_id: budget.projectId || null,
        account_id: budget.accountId,
        account_code: budget.accountCode || null,
        account_name: budget.accountName || null,
        budget_amount: parseFloat(budget.budgetAmount || '0'),
        currency: budget.currency || 'USD',
        status: budget.status,
        periods: (budget.periods || []).map((p: any) => ({
          period: p.period,
          amount: parseFloat(p.amount || '0'),
        })),
      };
    } catch (error) {
      console.error('Error fetching budget:', error);
      throw error;
    }
  }

  @Post('Budget')
  async createBudget(@Body() createBudgetDto: any) {
    try {
      console.log('CreateBudget request:', JSON.stringify(createBudgetDto, null, 2));
      
      if (!createBudgetDto.budget_name) {
        throw new BadRequestException('budget_name is required');
      }
      if (!createBudgetDto.period_type) {
        throw new BadRequestException('period_type is required');
      }
      
      // Support both snake_case and camelCase for account_id (optional - will use default if not provided)
      const accountId = createBudgetDto.account_id || createBudgetDto.accountId;
      if (accountId) {
        createBudgetDto.account_id = accountId;
      }
      
      // Normalize period_type: accept "annual" -> "annually", "month" -> "monthly", "quarter" -> "quarterly"
      if (createBudgetDto.period_type) {
        const periodTypeMap: { [key: string]: string } = {
          'annual': 'annually',
          'month': 'monthly',
          'monthly': 'monthly',
          'quarter': 'quarterly',
          'quarterly': 'quarterly',
          'annually': 'annually',
        };
        createBudgetDto.period_type = periodTypeMap[createBudgetDto.period_type.toLowerCase()] || createBudgetDto.period_type;
      }
      
      // Support both budgeted_amount and budget_amount
      if (createBudgetDto.budgeted_amount !== undefined && createBudgetDto.budget_amount === undefined) {
        createBudgetDto.budget_amount = createBudgetDto.budgeted_amount;
      }

      const result = await this.financeService.createBudget(createBudgetDto) as any;
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        budget_name: result.budgetName,
        fiscal_year: result.fiscalYear,
        period_type: result.periodType,
        department: result.department || null,
        project_id: result.projectId || null,
        account_id: result.accountId,
        account_code: result.accountCode || null,
        account_name: result.accountName || null,
        budget_amount: parseFloat(result.budgetAmount || '0'),
        currency: result.currency || 'USD',
        status: result.status,
        periods: (result.periods || []).map((p: any) => ({
          period: p.period,
          amount: parseFloat(p.amount || '0'),
        })),
      };
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  }

  @Put('Budget/:id')
  async updateBudget(@Param('id', ParseUUIDPipe) id: string, @Body() updateBudgetDto: any) {
    try {
      console.log('UpdateBudget request:', JSON.stringify({ id, ...updateBudgetDto }, null, 2));
      
      // Support both snake_case and camelCase for account_id
      const accountId = updateBudgetDto.account_id || updateBudgetDto.accountId;
      if (accountId !== undefined) {
        updateBudgetDto.account_id = accountId;
      }
      
      // Normalize period_type: accept "annual" -> "annually", "month" -> "monthly", "quarter" -> "quarterly"
      if (updateBudgetDto.period_type) {
        const periodTypeMap: { [key: string]: string } = {
          'annual': 'annually',
          'month': 'monthly',
          'monthly': 'monthly',
          'quarter': 'quarterly',
          'quarterly': 'quarterly',
          'annually': 'annually',
        };
        updateBudgetDto.period_type = periodTypeMap[updateBudgetDto.period_type.toLowerCase()] || updateBudgetDto.period_type;
      }
      
      // Support both budgeted_amount and budget_amount
      if (updateBudgetDto.budgeted_amount !== undefined && updateBudgetDto.budget_amount === undefined) {
        updateBudgetDto.budget_amount = updateBudgetDto.budgeted_amount;
      }

      const result = await this.financeService.updateBudget(id, updateBudgetDto) as any;
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        budget_name: result.budgetName,
        fiscal_year: result.fiscalYear,
        period_type: result.periodType,
        department: result.department || null,
        project_id: result.projectId || null,
        account_id: result.accountId,
        account_code: result.accountCode || null,
        account_name: result.accountName || null,
        budget_amount: parseFloat(result.budgetAmount || '0'),
        currency: result.currency || 'USD',
        status: result.status,
        periods: (result.periods || []).map((p: any) => ({
          period: p.period,
          amount: parseFloat(p.amount || '0'),
        })),
      };
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  }

  @Delete('Budget/:id')
  async deleteBudget(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.financeService.deleteBudget(id);
      return { success: true, message: 'Budget deleted successfully' };
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  }

  // Expense endpoints
  @Get('Expense')
  async getExpenses(@Query() query: any) {
    try {
      const result = await this.financeService.getExpenses({
        sort: query.sort,
        status: query.status,
        employee_id: query.employee_id,
        category_id: query.category_id,
        limit: query.limit,
        page: query.page,
      });

      return (result.expenses || []).map(expense => ({
        id: expense.id,
        organization_id: expense.organizationId || null,
        expense_number: expense.expenseNumber || '',
        employee_id: expense.employeeId || '',
        employee_name: expense.employeeName || '',
        expense_date: expense.expenseDate || '',
        category_id: expense.categoryId || '',
        category_name: expense.categoryName || '',
        description: expense.description || '',
        amount: parseFloat(expense.amount || '0'),
        currency: expense.currency || 'USD',
        receipt_url: expense.receiptUrl || '',
        status: expense.status || 'draft',
        account_id: expense.accountId || '',
        is_posted_to_gl: expense.isPostedToGl !== undefined ? expense.isPostedToGl : false,
      }));
    } catch (error) {
      console.error('Error fetching expenses:', error);
      if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Expenses not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to fetch expenses');
      }
      throw error;
    }
  }

  @Get('Expense/:id')
  async getExpense(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const expense = await this.financeService.getExpense(id);
      return {
        id: expense.id,
        organization_id: expense.organizationId || null,
        expense_number: expense.expenseNumber || '',
        employee_id: expense.employeeId || '',
        employee_name: expense.employeeName || '',
        expense_date: expense.expenseDate || '',
        category_id: expense.categoryId || '',
        category_name: expense.categoryName || '',
        description: expense.description || '',
        amount: parseFloat(expense.amount || '0'),
        currency: expense.currency || 'USD',
        receipt_url: expense.receiptUrl || '',
        status: expense.status || 'draft',
        account_id: expense.accountId || '',
        is_posted_to_gl: expense.isPostedToGl !== undefined ? expense.isPostedToGl : false,
      };
    } catch (error) {
      console.error('Error fetching expense:', error);
      if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Expense not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to fetch expense');
      }
      throw error;
    }
  }

  @Post('Expense')
  async createExpense(@Body() createExpenseDto: any) {
    try {
      // Validate required fields
      if (!createExpenseDto.expense_date) {
        throw new BadRequestException('expense_date is required');
      }
      if (!createExpenseDto.category_id) {
        throw new BadRequestException('category_id is required');
      }
      if (!createExpenseDto.description) {
        throw new BadRequestException('description is required');
      }
      if (!createExpenseDto.account_id) {
        throw new BadRequestException('account_id is required');
      }

      const result = await this.financeService.createExpense(createExpenseDto);

      return {
        id: result.id,
        organization_id: result.organizationId || null,
        expense_number: result.expenseNumber || '',
        employee_id: result.employeeId || '',
        employee_name: result.employeeName || '',
        expense_date: result.expenseDate || '',
        category_id: result.categoryId || '',
        category_name: result.categoryName || '',
        description: result.description || '',
        amount: parseFloat(result.amount || '0'),
        currency: result.currency || 'USD',
        receipt_url: result.receiptUrl || '',
        status: result.status || 'draft',
        account_id: result.accountId || '',
        is_posted_to_gl: result.isPostedToGl !== undefined ? result.isPostedToGl : false,
      };
    } catch (error) {
      console.error('Error creating expense:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to create expense');
      }
      throw error;
    }
  }

  @Put('Expense/:id')
  async updateExpense(@Param('id', ParseUUIDPipe) id: string, @Body() updateExpenseDto: any) {
    try {
      const result = await this.financeService.updateExpense(id, updateExpenseDto);

      return {
        id: result.id,
        organization_id: result.organizationId || null,
        expense_number: result.expenseNumber || '',
        employee_id: result.employeeId || '',
        employee_name: result.employeeName || '',
        expense_date: result.expenseDate || '',
        category_id: result.categoryId || '',
        category_name: result.categoryName || '',
        description: result.description || '',
        amount: parseFloat(result.amount || '0'),
        currency: result.currency || 'USD',
        receipt_url: result.receiptUrl || '',
        status: result.status || 'draft',
        account_id: result.accountId || '',
        is_posted_to_gl: result.isPostedToGl !== undefined ? result.isPostedToGl : false,
      };
    } catch (error) {
      console.error('Error updating expense:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Expense not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to update expense');
      }
      throw error;
    }
  }

  @Post('Expense/:id/approve')
  async approveExpense(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.approveExpense(id);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        expense_number: result.expenseNumber || '',
        employee_id: result.employeeId || '',
        employee_name: result.employeeName || '',
        expense_date: result.expenseDate || '',
        category_id: result.categoryId || '',
        category_name: result.categoryName || '',
        description: result.description || '',
        amount: parseFloat(result.amount || '0'),
        currency: result.currency || 'USD',
        receipt_url: result.receiptUrl || '',
        status: result.status || 'draft',
        account_id: result.accountId || '',
        is_posted_to_gl: result.isPostedToGl !== undefined ? result.isPostedToGl : false,
      };
    } catch (error) {
      console.error('Error approving expense:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Expense not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to approve expense');
      }
      throw error;
    }
  }

  @Post('Expense/:id/reject')
  async rejectExpense(@Param('id', ParseUUIDPipe) id: string, @Body() body?: { reason?: string }) {
    try {
      const result = await this.financeService.rejectExpense(id, body?.reason);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        expense_number: result.expenseNumber || '',
        employee_id: result.employeeId || '',
        employee_name: result.employeeName || '',
        expense_date: result.expenseDate || '',
        category_id: result.categoryId || '',
        category_name: result.categoryName || '',
        description: result.description || '',
        amount: parseFloat(result.amount || '0'),
        currency: result.currency || 'USD',
        receipt_url: result.receiptUrl || '',
        status: result.status || 'draft',
        account_id: result.accountId || '',
        is_posted_to_gl: result.isPostedToGl !== undefined ? result.isPostedToGl : false,
      };
    } catch (error) {
      console.error('Error rejecting expense:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Expense not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to reject expense');
      }
      throw error;
    }
  }

  @Delete('Expense/:id')
  async deleteExpense(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.deleteExpense(id);
      return {
        success: result.success,
        message: result.message || 'Expense deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting expense:', error);
      if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Expense not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to delete expense');
      }
      throw error;
    }
  }

  @Post('Expense/:id/post-to-gl')
  async postExpenseToGl(@Param('id', ParseUUIDPipe) id: string, @Body() body?: { posting_date?: string; journal_entry_reference?: string }) {
    try {
      const result = await this.financeService.postExpenseToGl(id, body || {});
      return {
        success: result.success,
        message: result.message || 'Posted',
        journal_entry_id: result.journalEntryId || '',
      };
    } catch (error) {
      console.error('Error posting expense to GL:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Expense not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to post expense to General Ledger');
      }
      throw error;
    }
  }

  @Post('Expense/bulk-post-to-gl')
  async bulkPostExpensesToGl(@Body() body: { expense_ids: string[]; posting_date: string }) {
    try {
      if (!body.expense_ids || body.expense_ids.length === 0) {
        throw new BadRequestException('expense_ids is required and must contain at least one expense');
      }
      if (!body.posting_date) {
        throw new BadRequestException('posting_date is required');
      }

      const result = await this.financeService.bulkPostExpensesToGl(body);
      return {
        success: result.success,
        posted_count: result.postedCount || 0,
        errors: result.errors || [],
        journal_entry_id: result.journalEntryId || '',
      };
    } catch (error) {
      console.error('Error bulk posting expenses to GL:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to bulk post expenses to General Ledger');
      }
      throw error;
    }
  }

  // Expense Category endpoints
  @Get('ExpenseCategory')
  async getExpenseCategories(@Query() query: any) {
    try {
      const result = await this.financeService.getExpenseCategories({
        sort: query.sort,
        is_active: query.is_active,
        limit: query.limit,
        page: query.page,
      });

      return (result.categories || []).map(category => ({
        id: category.id,
        organization_id: category.organizationId || null,
        category_code: category.categoryCode || '',
        category_name: category.categoryName || '',
        description: category.description || '',
        account_id: category.accountId || '',
        requires_receipt: category.requiresReceipt !== undefined ? category.requiresReceipt : false,
        requires_approval: category.requiresApproval !== undefined ? category.requiresApproval : false,
        approval_limit: parseFloat(category.approvalLimit || '0'),
        is_active: category.isActive !== undefined ? category.isActive : true,
      }));
    } catch (error) {
      console.error('Error fetching expense categories:', error);
      if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Expense categories not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to fetch expense categories');
      }
      throw error;
    }
  }

  @Get('ExpenseCategory/:id')
  async getExpenseCategory(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const category = await this.financeService.getExpenseCategory(id);
      return {
        id: category.id,
        organization_id: category.organizationId || null,
        category_code: category.categoryCode || '',
        category_name: category.categoryName || '',
        description: category.description || '',
        account_id: category.accountId || '',
        requires_receipt: category.requiresReceipt !== undefined ? category.requiresReceipt : false,
        requires_approval: category.requiresApproval !== undefined ? category.requiresApproval : false,
        approval_limit: parseFloat(category.approvalLimit || '0'),
        is_active: category.isActive !== undefined ? category.isActive : true,
      };
    } catch (error) {
      console.error('Error fetching expense category:', error);
      if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Expense category not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to fetch expense category');
      }
      throw error;
    }
  }

  @Post('ExpenseCategory')
  async createExpenseCategory(@Body() createExpenseCategoryDto: any) {
    try {
      // Validate required fields
      if (!createExpenseCategoryDto.category_code) {
        throw new BadRequestException('category_code is required');
      }
      if (!createExpenseCategoryDto.category_name) {
        throw new BadRequestException('category_name is required');
      }
      if (!createExpenseCategoryDto.account_id) {
        throw new BadRequestException('account_id is required');
      }

      const result = await this.financeService.createExpenseCategory(createExpenseCategoryDto);

      return {
        id: result.id,
        organization_id: result.organizationId || null,
        category_code: result.categoryCode || '',
        category_name: result.categoryName || '',
        description: result.description || '',
        account_id: result.accountId || '',
        requires_receipt: result.requiresReceipt !== undefined ? result.requiresReceipt : false,
        requires_approval: result.requiresApproval !== undefined ? result.requiresApproval : false,
        approval_limit: parseFloat(result.approvalLimit || '0'),
        is_active: result.isActive !== undefined ? result.isActive : true,
      };
    } catch (error) {
      console.error('Error creating expense category:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to create expense category');
      }
      throw error;
    }
  }

  @Put('ExpenseCategory/:id')
  async updateExpenseCategory(@Param('id', ParseUUIDPipe) id: string, @Body() updateExpenseCategoryDto: any) {
    try {
      const result = await this.financeService.updateExpenseCategory(id, updateExpenseCategoryDto);

      return {
        id: result.id,
        organization_id: result.organizationId || null,
        category_code: result.categoryCode || '',
        category_name: result.categoryName || '',
        description: result.description || '',
        account_id: result.accountId || '',
        requires_receipt: result.requiresReceipt !== undefined ? result.requiresReceipt : false,
        requires_approval: result.requiresApproval !== undefined ? result.requiresApproval : false,
        approval_limit: parseFloat(result.approvalLimit || '0'),
        is_active: result.isActive !== undefined ? result.isActive : true,
      };
    } catch (error) {
      console.error('Error updating expense category:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Expense category not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to update expense category');
      }
      throw error;
    }
  }

  @Delete('ExpenseCategory/:id')
  async deleteExpenseCategory(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.deleteExpenseCategory(id);
      return {
        success: result.success,
        message: result.message || 'Expense category deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting expense category:', error);
      if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Expense category not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to delete expense category');
      }
      throw error;
    }
  }

  // Expense Claim endpoints
  @Get('ExpenseClaim')
  async getExpenseClaims(@Query() query: any) {
    try {
      const result = await this.financeService.getExpenseClaims({
        sort: query.sort,
        status: query.status,
        employee_id: query.employee_id,
        limit: query.limit,
        page: query.page,
      });

      return (result.claims || []).map(claim => ({
        id: claim.id,
        organization_id: claim.organizationId || null,
        claim_number: claim.claimNumber || '',
        employee_id: claim.employeeId || '',
        employee_name: claim.employeeName || '',
        claim_date: claim.claimDate || '',
        total_amount: parseFloat(claim.totalAmount || '0'),
        currency: claim.currency || 'USD',
        status: claim.status || 'draft',
        expenses: (claim.expenses || []).map((exp: any) => ({
          expense_id: exp.expenseId || '',
          description: exp.description || '',
          amount: parseFloat(exp.amount || '0'),
        })),
      }));
    } catch (error) {
      console.error('Error fetching expense claims:', error);
      if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Expense claims not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to fetch expense claims');
      }
      throw error;
    }
  }

  @Get('ExpenseClaim/:id')
  async getExpenseClaim(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const claim = await this.financeService.getExpenseClaim(id);
      return {
        id: claim.id,
        organization_id: claim.organizationId || null,
        claim_number: claim.claimNumber || '',
        employee_id: claim.employeeId || '',
        employee_name: claim.employeeName || '',
        claim_date: claim.claimDate || '',
        total_amount: parseFloat(claim.totalAmount || '0'),
        currency: claim.currency || 'USD',
        status: claim.status || 'draft',
        expenses: (claim.expenses || []).map((exp: any) => ({
          expense_id: exp.expenseId || '',
          description: exp.description || '',
          amount: parseFloat(exp.amount || '0'),
        })),
      };
    } catch (error) {
      console.error('Error fetching expense claim:', error);
      if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Expense claim not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to fetch expense claim');
      }
      throw error;
    }
  }

  @Post('ExpenseClaim')
  async createExpenseClaim(@Body() createExpenseClaimDto: any) {
    try {
      // Validate required fields
      if (!createExpenseClaimDto.claim_date) {
        throw new BadRequestException('claim_date is required');
      }
      if (!createExpenseClaimDto.expense_ids || createExpenseClaimDto.expense_ids.length === 0) {
        throw new BadRequestException('expense_ids is required and must contain at least one expense');
      }

      const result = await this.financeService.createExpenseClaim(createExpenseClaimDto);

      return {
        id: result.id,
        organization_id: result.organizationId || null,
        claim_number: result.claimNumber || '',
        employee_id: result.employeeId || '',
        employee_name: result.employeeName || '',
        claim_date: result.claimDate || '',
        total_amount: parseFloat(result.totalAmount || '0'),
        currency: result.currency || 'USD',
        status: result.status || 'draft',
        expenses: (result.expenses || []).map((exp: any) => ({
          expense_id: exp.expenseId || '',
          description: exp.description || '',
          amount: parseFloat(exp.amount || '0'),
        })),
      };
    } catch (error) {
      console.error('Error creating expense claim:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to create expense claim');
      }
      throw error;
    }
  }

  @Put('ExpenseClaim/:id')
  async updateExpenseClaim(@Param('id', ParseUUIDPipe) id: string, @Body() updateExpenseClaimDto: any) {
    try {
      const result = await this.financeService.updateExpenseClaim(id, updateExpenseClaimDto);

      return {
        id: result.id,
        organization_id: result.organizationId || null,
        claim_number: result.claimNumber || '',
        employee_id: result.employeeId || '',
        employee_name: result.employeeName || '',
        claim_date: result.claimDate || '',
        total_amount: parseFloat(result.totalAmount || '0'),
        currency: result.currency || 'USD',
        status: result.status || 'draft',
        expenses: (result.expenses || []).map((exp: any) => ({
          expense_id: exp.expenseId || '',
          description: exp.description || '',
          amount: parseFloat(exp.amount || '0'),
        })),
      };
    } catch (error) {
      console.error('Error updating expense claim:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Expense claim not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to update expense claim');
      }
      throw error;
    }
  }

  @Post('ExpenseClaim/:id/submit')
  async submitExpenseClaim(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.submitExpenseClaim(id);
      return {
        success: true,
        message: 'Submitted',
        claim: {
          id: result.id,
          organization_id: result.organizationId || null,
          claim_number: result.claimNumber || '',
          employee_id: result.employeeId || '',
          employee_name: result.employeeName || '',
          claim_date: result.claimDate || '',
          total_amount: parseFloat(result.totalAmount || '0'),
          currency: result.currency || 'USD',
          status: result.status || 'draft',
          expenses: (result.expenses || []).map((exp: any) => ({
            expense_id: exp.expenseId || '',
            description: exp.description || '',
            amount: parseFloat(exp.amount || '0'),
          })),
        },
      };
    } catch (error) {
      console.error('Error submitting expense claim:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Expense claim not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to submit expense claim');
      }
      throw error;
    }
  }

  @Post('ExpenseClaim/:id/approve')
  async approveExpenseClaim(@Param('id', ParseUUIDPipe) id: string, @Body() body?: { approved_by?: string; notes?: string }) {
    try {
      const result = await this.financeService.approveExpenseClaim(id, body || {});
      return {
        success: true,
        message: 'Approved',
        claim: {
          id: result.id,
          organization_id: result.organizationId || null,
          claim_number: result.claimNumber || '',
          employee_id: result.employeeId || '',
          employee_name: result.employeeName || '',
          claim_date: result.claimDate || '',
          total_amount: parseFloat(result.totalAmount || '0'),
          currency: result.currency || 'USD',
          status: result.status || 'draft',
          expenses: (result.expenses || []).map((exp: any) => ({
            expense_id: exp.expenseId || '',
            description: exp.description || '',
            amount: parseFloat(exp.amount || '0'),
          })),
        },
      };
    } catch (error) {
      console.error('Error approving expense claim:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Expense claim not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to approve expense claim');
      }
      throw error;
    }
  }

  @Post('ExpenseClaim/:id/reject')
  async rejectExpenseClaim(@Param('id', ParseUUIDPipe) id: string, @Body() body: { rejected_by?: string; rejection_reason: string; notes?: string }) {
    try {
      if (!body.rejection_reason) {
        throw new BadRequestException('rejection_reason is required');
      }

      const result = await this.financeService.rejectExpenseClaim(id, body);
      return {
        success: true,
        message: 'Rejected',
        claim: {
          id: result.id,
          organization_id: result.organizationId || null,
          claim_number: result.claimNumber || '',
          employee_id: result.employeeId || '',
          employee_name: result.employeeName || '',
          claim_date: result.claimDate || '',
          total_amount: parseFloat(result.totalAmount || '0'),
          currency: result.currency || 'USD',
          status: result.status || 'draft',
          expenses: (result.expenses || []).map((exp: any) => ({
            expense_id: exp.expenseId || '',
            description: exp.description || '',
            amount: parseFloat(exp.amount || '0'),
          })),
        },
      };
    } catch (error) {
      console.error('Error rejecting expense claim:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Expense claim not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to reject expense claim');
      }
      throw error;
    }
  }

  @Delete('ExpenseClaim/:id')
  async deleteExpenseClaim(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.deleteExpenseClaim(id);
      return {
        success: result.success,
        message: result.message || 'Expense claim deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting expense claim:', error);
      if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Expense claim not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to delete expense claim');
      }
      throw error;
    }
  }

  // Expense Approval endpoints
  @Get('ExpenseApproval')
  async getExpenseApprovals(@Query() query: any) {
    try {
      const result = await this.financeService.getExpenseApprovals({
        sort: query.sort,
        status: query.status,
        approver_id: query.approver_id,
        limit: query.limit,
        page: query.page,
      });

      return (result.approvals || []).map(approval => ({
        id: approval.id,
        organization_id: approval.organizationId || null,
        expense_id: approval.expenseId || '',
        expense_claim_id: approval.expenseClaimId || '',
        approver_id: approval.approverId || '',
        approver_name: approval.approverName || '',
        approval_level: approval.approvalLevel || 1,
        status: approval.status || 'pending',
        approved_date: approval.approvedDate || null,
        notes: approval.notes || '',
      }));
    } catch (error) {
      console.error('Error fetching expense approvals:', error);
      if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Expense approvals not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to fetch expense approvals');
      }
      throw error;
    }
  }

  @Get('ExpenseApproval/:id')
  async getExpenseApproval(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const approval = await this.financeService.getExpenseApproval(id);
      return {
        id: approval.id,
        organization_id: approval.organizationId || null,
        expense_id: approval.expenseId || '',
        expense_claim_id: approval.expenseClaimId || '',
        approver_id: approval.approverId || '',
        approver_name: approval.approverName || '',
        approval_level: approval.approvalLevel || 1,
        status: approval.status || 'pending',
        approved_date: approval.approvedDate || null,
        notes: approval.notes || '',
      };
    } catch (error) {
      console.error('Error fetching expense approval:', error);
      if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Expense approval not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to fetch expense approval');
      }
      throw error;
    }
  }

  @Post('ExpenseApproval')
  async createExpenseApproval(@Body() createExpenseApprovalDto: any) {
    try {
      // Validate required fields
      if (!createExpenseApprovalDto.approver_id) {
        throw new BadRequestException('approver_id is required');
      }
      if (!createExpenseApprovalDto.expense_id && !createExpenseApprovalDto.expense_claim_id) {
        throw new BadRequestException('Either expense_id or expense_claim_id is required');
      }

      const result = await this.financeService.createExpenseApproval(createExpenseApprovalDto);

      return {
        id: result.id,
        organization_id: result.organizationId || null,
        expense_id: result.expenseId || '',
        expense_claim_id: result.expenseClaimId || '',
        approver_id: result.approverId || '',
        approver_name: result.approverName || '',
        approval_level: result.approvalLevel || 1,
        status: result.status || 'pending',
        approved_date: result.approvedDate || null,
        notes: result.notes || '',
      };
    } catch (error) {
      console.error('Error creating expense approval:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to create expense approval');
      }
      throw error;
    }
  }

  @Put('ExpenseApproval/:id')
  async updateExpenseApproval(@Param('id', ParseUUIDPipe) id: string, @Body() updateExpenseApprovalDto: any) {
    try {
      const result = await this.financeService.updateExpenseApproval(id, updateExpenseApprovalDto);

      return {
        id: result.id,
        organization_id: result.organizationId || null,
        expense_id: result.expenseId || '',
        expense_claim_id: result.expenseClaimId || '',
        approver_id: result.approverId || '',
        approver_name: result.approverName || '',
        approval_level: result.approvalLevel || 1,
        status: result.status || 'pending',
        approved_date: result.approvedDate || null,
        notes: result.notes || '',
      };
    } catch (error) {
      console.error('Error updating expense approval:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Expense approval not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to update expense approval');
      }
      throw error;
    }
  }

  @Post('ExpenseApproval/:id/approve')
  async approveExpenseApproval(@Param('id', ParseUUIDPipe) id: string, @Body() body?: { notes?: string }) {
    try {
      const result = await this.financeService.approveExpenseApproval(id, body?.notes);
      return {
        success: true,
        message: 'Approved',
        approval: {
          id: result.id,
          organization_id: result.organizationId || null,
          expense_id: result.expenseId || '',
          expense_claim_id: result.expenseClaimId || '',
          approver_id: result.approverId || '',
          approver_name: result.approverName || '',
          approval_level: result.approvalLevel || 1,
          status: result.status || 'pending',
          approved_date: result.approvedDate || null,
          notes: result.notes || '',
        },
      };
    } catch (error) {
      console.error('Error approving expense approval:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Expense approval not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to approve expense approval');
      }
      throw error;
    }
  }

  @Post('ExpenseApproval/:id/reject')
  async rejectExpenseApproval(@Param('id', ParseUUIDPipe) id: string, @Body() body?: { notes?: string }) {
    try {
      const result = await this.financeService.rejectExpenseApproval(id, body?.notes);
      return {
        success: true,
        message: 'Rejected',
        approval: {
          id: result.id,
          organization_id: result.organizationId || null,
          expense_id: result.expenseId || '',
          expense_claim_id: result.expenseClaimId || '',
          approver_id: result.approverId || '',
          approver_name: result.approverName || '',
          approval_level: result.approvalLevel || 1,
          status: result.status || 'pending',
          approved_date: result.approvedDate || null,
          notes: result.notes || '',
        },
      };
    } catch (error) {
      console.error('Error rejecting expense approval:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Expense approval not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to reject expense approval');
      }
      throw error;
    }
  }

  @Delete('ExpenseApproval/:id')
  async deleteExpenseApproval(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.deleteExpenseApproval(id);
      return {
        success: result.success,
        message: result.message || 'Expense approval deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting expense approval:', error);
      if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Expense approval not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to delete expense approval');
      }
      throw error;
    }
  }

  // Currency Exchange Rate endpoint (returns mock exchange rates for now)
  @Get('CurrencyExchangeRate')
  async getCurrencyExchangeRates(@Query() query: any) {
    try {
      console.log('CurrencyExchangeRate query:', JSON.stringify(query, null, 2));
      
      // Support multiple query parameter formats
      const fromCurrency = (query.from || query.from_currency || query.fromCurrency || 'USD').toUpperCase();
      const toCurrency = (query.to || query.to_currency || query.toCurrency || 'USD').toUpperCase();
      
      console.log('Looking for exchange rate:', { fromCurrency, toCurrency });
      
      // Mock exchange rates (these should come from a real service in production)
      const exchangeRates: { [key: string]: { [key: string]: number } } = {
        'USD': {
          'EGP': 30.0,
          'EUR': 0.92,
          'GBP': 0.79,
        },
        'EGP': {
          'USD': 0.033,
          'EUR': 0.031,
          'GBP': 0.026,
        },
        'EUR': {
          'USD': 1.09,
          'EGP': 32.6,
          'GBP': 0.86,
        },
        'GBP': {
          'USD': 1.27,
          'EGP': 38.1,
          'EUR': 1.16,
        },
      };
      
      // Also handle reverse lookup (if EGP->USD not found, try USD->EGP and calculate inverse)
      let rate = exchangeRates[fromCurrency]?.[toCurrency];
      
      if (!rate && exchangeRates[toCurrency]?.[fromCurrency]) {
        // Calculate inverse rate
        rate = 1 / exchangeRates[toCurrency][fromCurrency];
        console.log('Using inverse rate:', rate);
      }
      
      if (rate) {
        const result = [{
          id: `${fromCurrency}_${toCurrency}`,
          from_currency: fromCurrency,
          to_currency: toCurrency,
          exchange_rate: rate,
          effective_date: new Date().toISOString().split('T')[0],
        }];
        console.log('Returning exchange rate:', result);
        return result;
      }
      
      console.log('No exchange rate found for', fromCurrency, 'to', toCurrency);
      // Return empty array if no rate found
      return [];
    } catch (error) {
      console.error('Error fetching currency exchange rates:', error);
      throw error;
    }
  }

  // Inventory Valuations endpoints
  @Get('InventoryValuation')
  async getInventoryValuations(
    @Query('as_of_date') as_of_date?: string,
    @Query('valuation_method') valuation_method?: string,
  ) {
    try {
      const result = await this.financeService.getInventoryValuations({
        as_of_date,
        valuation_method,
      });

      return (result.valuations || []).map((valuation: any) => ({
        id: valuation.id || '',
        organization_id: valuation.organizationId || '',
        item_id: valuation.itemId || '',
        item_code: valuation.itemCode || '',
        item_name: valuation.itemName || '',
        valuation_date: valuation.valuationDate || '',
        valuation_method: valuation.valuationMethod || '',
        quantity: parseFloat(valuation.quantity || '0'),
        unit_cost: parseFloat(valuation.unitCost || '0'),
        total_value: parseFloat(valuation.totalValue || '0'),
        currency: valuation.currency || 'USD',
      }));
    } catch (error) {
      console.error('Error fetching inventory valuations:', error);
      throw error;
    }
  }

  @Get('InventoryValuation/calculate')
  async calculateInventoryValuation(
    @Query('as_of_date') as_of_date?: string,
    @Query('valuation_method') valuation_method?: string,
  ) {
    try {
      if (!as_of_date) {
        throw new BadRequestException('as_of_date is required');
      }
      if (!valuation_method) {
        throw new BadRequestException('valuation_method is required');
      }

      const result = await this.financeService.calculateInventoryValuation(as_of_date, valuation_method);
      return {
        as_of_date: result.as_of_date || as_of_date,
        valuation_method: result.valuation_method || valuation_method,
        total_inventory_value: parseFloat(result.total_inventory_value || '0'),
        items: (result.items || []).map((item: any) => ({
          item_id: item.item_id || '',
          item_code: item.item_code || '',
          item_name: item.item_name || '',
          quantity: parseFloat(item.quantity || '0'),
          unit_cost: parseFloat(item.unit_cost || '0'),
          total_value: parseFloat(item.total_value || '0'),
        })),
      };
    } catch (error) {
      console.error('Error calculating inventory valuation:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to calculate inventory valuation');
      }
      throw error;
    }
  }

  @Get('InventoryValuation/:id')
  async getInventoryValuation(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.getInventoryValuation(id);
      return {
        id: result.id || '',
        organization_id: result.organizationId || '',
        item_id: result.itemId || '',
        item_code: result.itemCode || '',
        item_name: result.itemName || '',
        valuation_date: result.valuationDate || '',
        valuation_method: result.valuationMethod || '',
        quantity: parseFloat(result.quantity || '0'),
        unit_cost: parseFloat(result.unitCost || '0'),
        total_value: parseFloat(result.totalValue || '0'),
        currency: result.currency || 'USD',
      };
    } catch (error) {
      console.error('Error fetching inventory valuation:', error);
      if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Inventory valuation not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Post('InventoryValuation')
  async createInventoryValuation(@Body() createDto: any) {
    try {
      if (!createDto.organization_id) {
        throw new BadRequestException('organization_id is required');
      }
      if (!createDto.item_id) {
        throw new BadRequestException('item_id is required');
      }
      if (!createDto.valuation_date) {
        throw new BadRequestException('valuation_date is required');
      }
      if (!createDto.valuation_method) {
        throw new BadRequestException('valuation_method is required');
      }

      const result = await this.financeService.createInventoryValuation(createDto);
      return {
        id: result.id || '',
        organization_id: result.organizationId || '',
        item_id: result.itemId || '',
        item_code: result.itemCode || '',
        item_name: result.itemName || '',
        valuation_date: result.valuationDate || '',
        valuation_method: result.valuationMethod || '',
        quantity: parseFloat(result.quantity || '0'),
        unit_cost: parseFloat(result.unitCost || '0'),
        total_value: parseFloat(result.totalValue || '0'),
        currency: result.currency || 'USD',
      };
    } catch (error) {
      console.error('Error creating inventory valuation:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to create inventory valuation');
      }
      throw error;
    }
  }

  @Post('InventoryValuation/sync-from-batches')
  async syncInventoryValuationsFromBatches(
    @Query('valuation_method') valuation_method?: string,
  ) {
    try {
      const method = valuation_method || 'fifo';
      const result = await this.financeService.syncInventoryValuationsFromBatches(method);
      return {
        success: result.success,
        message: result.message,
        total_synced: result.total_synced,
        total_created: result.total_created,
        total_updated: result.total_updated,
        errors: result.errors || [],
      };
    } catch (error) {
      console.error('Error syncing inventory valuations from batches:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to sync inventory valuations');
      }
      throw error;
    }
  }

  // COGS endpoints
  @Get('COGS')
  async getCogs(
    @Query('period_start') period_start?: string,
    @Query('period_end') period_end?: string,
  ) {
    try {
      const result = await this.financeService.getCogs({
        period_start,
        period_end,
      });

      return (result.cogs || []).map((cogs: any) => ({
        id: cogs.id || '',
        organization_id: cogs.organizationId || '',
        period_start: cogs.periodStart || '',
        period_end: cogs.periodEnd || '',
        item_id: cogs.itemId || '',
        item_code: cogs.itemCode || '',
        item_name: cogs.itemName || '',
        quantity_sold: parseFloat(cogs.quantitySold || '0'),
        unit_cost: parseFloat(cogs.unitCost || '0'),
        total_cogs: parseFloat(cogs.totalCogs || '0'),
        currency: cogs.currency || 'USD',
      }));
    } catch (error) {
      console.error('Error fetching COGS:', error);
      throw error;
    }
  }

  @Get('COGS/report')
  async getCogsReport(
    @Query('period_start') period_start?: string,
    @Query('period_end') period_end?: string,
    @Query('format') format?: string,
    @Req() req?: any,
  ) {
    try {
      // Debug: Log everything we can see
      console.log('=== COGS Report Request Debug ===');
      console.log('Query params (individual):', { period_start, period_end, format });
      console.log('Full request query:', req?.query);
      console.log('Request URL:', req?.url);
      console.log('Request method:', req?.method);
      
      // Try to get from request query if individual params are missing
      const finalPeriodStart = period_start || req?.query?.period_start;
      const finalPeriodEnd = period_end || req?.query?.period_end;
      const finalFormat = format || req?.query?.format;
      
      console.log('Final extracted values:', { 
        period_start: finalPeriodStart, 
        period_end: finalPeriodEnd, 
        format: finalFormat 
      });
      
      if (!finalPeriodStart || finalPeriodStart.trim() === '') {
        console.error('COGS Report validation failed: period_start is missing or empty');
        throw new BadRequestException('period_start is required');
      }
      if (!finalPeriodEnd || finalPeriodEnd.trim() === '') {
        console.error('COGS Report validation failed: period_end is missing or empty');
        throw new BadRequestException('period_end is required');
      }

      console.log('Calling financeService.getCogsReport with:', { 
        period_start: finalPeriodStart, 
        period_end: finalPeriodEnd, 
        format: finalFormat 
      });
      const result = await this.financeService.getCogsReport(finalPeriodStart, finalPeriodEnd, finalFormat);
      console.log('COGS Report result received, returning response');

      return {
        period_start: result.periodstart || finalPeriodStart,
        period_end: result.periodend || finalPeriodEnd,
        summary: {
          total_cogs: parseFloat(result.summary?.totalcogs || '0'),
          total_revenue: parseFloat(result.summary?.totalrevenue || '0'),
          gross_profit: parseFloat(result.summary?.grossprofit || '0'),
          gross_profit_margin: parseFloat(result.summary?.grossprofitmargin || '0'),
        },
        items: (result.items || []).map((item: any) => ({
          item_id: item.itemid || '',
          item_code: item.itemcode || '',
          item_name: item.itemname || item.itemName || item.item_name || '',
          quantity_sold: parseFloat(item.quantitysold || '0'),
          unit_cost: parseFloat(item.unitcost || '0'),
          total_cogs: parseFloat(item.totalcogs || '0'),
          revenue: parseFloat(item.revenue || '0'),
          profit: parseFloat(item.profit || '0'),
        })),
      };
    } catch (error) {
      console.error('Error getting COGS report:', error);
      if (error.code === 2) {
        throw new BadRequestException(error.details || error.message || 'Failed to get COGS report');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Get('COGS/:id')
  async getCogsRecord(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.getCogsRecord(id);
      return {
        id: result.id || '',
        organization_id: result.organizationId || '',
        period_start: result.periodStart || '',
        period_end: result.periodEnd || '',
        item_id: result.itemId || '',
        item_code: result.itemCode || '',
        item_name: result.itemName || '',
        quantity_sold: parseFloat(result.quantitySold || '0'),
        unit_cost: parseFloat(result.unitCost || '0'),
        total_cogs: parseFloat(result.totalCogs || '0'),
        currency: result.currency || 'USD',
      };
    } catch (error) {
      console.error('Error fetching COGS record:', error);
      if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'COGS record not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Post('COGS')
  async createCogs(@Body() createDto: any) {
    try {
      if (!createDto.period_start) {
        throw new BadRequestException('period_start is required');
      }
      if (!createDto.period_end) {
        throw new BadRequestException('period_end is required');
      }
      if (!createDto.item_id) {
        throw new BadRequestException('item_id is required');
      }

      const result = await this.financeService.createCogs(createDto);
      return {
        id: result.id || '',
        organization_id: result.organizationId || '',
        period_start: result.periodStart || '',
        period_end: result.periodEnd || '',
        item_id: result.itemId || '',
        item_code: result.itemCode || '',
        item_name: result.itemName || '',
        quantity_sold: parseFloat(result.quantitySold || '0'),
        unit_cost: parseFloat(result.unitCost || '0'),
        total_cogs: parseFloat(result.totalCogs || '0'),
        currency: result.currency || 'USD',
      };
    } catch (error) {
      console.error('Error creating COGS:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to create COGS');
      }
      throw error;
    }
  }

  @Put('COGS/:id')
  async updateCogs(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: any) {
    try {
      const result = await this.financeService.updateCogs(id, updateDto);
      return {
        id: result.id || '',
        organization_id: result.organizationId || '',
        period_start: result.periodStart || '',
        period_end: result.periodEnd || '',
        item_id: result.itemId || '',
        item_code: result.itemCode || '',
        item_name: result.itemName || '',
        quantity_sold: parseFloat(result.quantitySold || '0'),
        unit_cost: parseFloat(result.unitCost || '0'),
        total_cogs: parseFloat(result.totalCogs || '0'),
        currency: result.currency || 'USD',
      };
    } catch (error) {
      console.error('Error updating COGS:', error);
      if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'COGS record not found');
      } else if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to update COGS');
      }
      throw error;
    }
  }

  @Delete('COGS/:id')
  async deleteCogs(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.financeService.deleteCogs(id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting COGS:', error);
      if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'COGS record not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to delete COGS');
      }
      throw error;
    }
  }

  @Post('COGS/calculate')
  async calculateCogs(@Body() calculateDto: any) {
    try {
      if (!calculateDto.period_start) {
        throw new BadRequestException('period_start is required');
      }
      if (!calculateDto.period_end) {
        throw new BadRequestException('period_end is required');
      }

      const result = await this.financeService.calculateCogs(
        calculateDto.period_start,
        calculateDto.period_end,
        calculateDto.item_ids,
      );

      return {
        period_start: result.period_start || calculateDto.period_start,
        period_end: result.period_end || calculateDto.period_end,
        total_cogs: parseFloat(result.total_cogs || '0'),
        items: (result.items || []).map((item: any) => ({
          item_id: item.item_id || '',
          item_code: item.item_code || '',
          item_name: item.item_name || '',
          quantity_sold: parseFloat(item.quantity_sold || '0'),
          unit_cost: parseFloat(item.unit_cost || '0'),
          total_cogs: parseFloat(item.total_cogs || '0'),
        })),
      };
    } catch (error) {
      console.error('Error calculating COGS:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to calculate COGS');
      }
      throw error;
    }
  }

  // Inventory Adjustments endpoints
  @Get('InventoryAdjustment')
  async getInventoryAdjustments(
    @Query('sort') sort?: string,
    @Query('adjustment_type') adjustment_type?: string,
  ) {
    try {
      const result = await this.financeService.getInventoryAdjustments({ sort, adjustment_type });
      return (result.adjustments || []).map((adjustment: any) => ({
        id: adjustment.id,
        organization_id: adjustment.organizationId || null,
        adjustment_number: adjustment.adjustmentNumber || null,
        adjustment_date: adjustment.adjustmentDate,
        adjustment_type: adjustment.adjustmentType,
        item_id: adjustment.itemId,
        item_code: adjustment.itemCode || null,
        quantity_adjusted: parseFloat(adjustment.quantityAdjusted || '0'),
        unit_cost: parseFloat(adjustment.unitCost || '0'),
        adjustment_amount: parseFloat(adjustment.adjustmentAmount || '0'),
        account_id: adjustment.accountId,
        reason: adjustment.reason || null,
        status: adjustment.status,
      }));
    } catch (error) {
      console.error('Error getting inventory adjustments:', error);
      throw error;
    }
  }

  @Get('InventoryAdjustment/:id')
  async getInventoryAdjustment(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.getInventoryAdjustment(id);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        adjustment_number: result.adjustmentNumber || null,
        adjustment_date: result.adjustmentDate,
        adjustment_type: result.adjustmentType,
        item_id: result.itemId,
        item_code: result.itemCode || null,
        quantity_adjusted: parseFloat(result.quantityAdjusted || '0'),
        unit_cost: parseFloat(result.unitCost || '0'),
        adjustment_amount: parseFloat(result.adjustmentAmount || '0'),
        account_id: result.accountId,
        reason: result.reason || null,
        status: result.status,
      };
    } catch (error) {
      console.error('Error getting inventory adjustment:', error);
      if (error.code === 2) {
        throw new NotFoundException('Inventory adjustment not found');
      }
      throw error;
    }
  }

  @Post('InventoryAdjustment')
  async createInventoryAdjustment(@Body() createDto: any) {
    try {
      const result = await this.financeService.createInventoryAdjustment(createDto);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        adjustment_number: result.adjustmentNumber || null,
        adjustment_date: result.adjustmentDate,
        adjustment_type: result.adjustmentType,
        item_id: result.itemId,
        item_code: result.itemCode || null,
        quantity_adjusted: parseFloat(result.quantityAdjusted || '0'),
        unit_cost: parseFloat(result.unitCost || '0'),
        adjustment_amount: parseFloat(result.adjustmentAmount || '0'),
        account_id: result.accountId,
        reason: result.reason || null,
        status: result.status,
      };
    } catch (error) {
      console.error('Error creating inventory adjustment:', error);
      throw error;
    }
  }

  @Post('InventoryAdjustment/:id/post')
  async postInventoryAdjustment(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.postInventoryAdjustment(id);
      return {
        success: result.success,
        journal_entry_id: result.journal_entry_id,
      };
    } catch (error) {
      console.error('Error posting inventory adjustment:', error);
      throw error;
    }
  }

  // Stock Impacts endpoints
  // IMPORTANT: More specific routes (like /calculate) must come before less specific ones (like /:id)
  @Post('StockImpact/calculate')
  async calculateStockImpacts(@Body() calculateDto: { period_start: string; period_end: string; item_ids?: string[] }) {
    try {
      if (!calculateDto.period_start || !calculateDto.period_end) {
        throw new BadRequestException('period_start and period_end are required');
      }

      const result = await this.financeService.calculateStockImpacts({
        period_start: calculateDto.period_start,
        period_end: calculateDto.period_end,
        item_ids: calculateDto.item_ids,
      });

      return (result.stockImpacts || []).map((impact: any) => ({
        id: impact.id,
        organization_id: impact.organizationId || null,
        transaction_date: impact.transactionDate,
        transaction_type: impact.transactionType,
        item_id: impact.itemId,
        quantity: parseFloat(impact.quantity || '0'),
        unit_cost: parseFloat(impact.unitCost || '0'),
        total_cost: parseFloat(impact.totalCost || '0'),
        account_impact: {
          inventory_account: impact.inventoryAccountId || null,
          cogs_account: impact.cogsAccountId || null,
          expense_account: impact.expenseAccountId || null,
        },
      }));
    } catch (error) {
      console.error('Error calculating stock impacts:', error);
      if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Failed to calculate stock impacts');
      }
      throw error;
    }
  }

  @Get('StockImpact')
  async getStockImpacts(
    @Query('period_start') period_start?: string,
    @Query('period_end') period_end?: string,
  ) {
    try {
      const result = await this.financeService.getStockImpacts({ period_start, period_end });
      return (result.stockImpacts || []).map((impact: any) => ({
        id: impact.id,
        organization_id: impact.organizationId || null,
        transaction_date: impact.transactionDate,
        transaction_type: impact.transactionType,
        item_id: impact.itemId,
        quantity: parseFloat(impact.quantity || '0'),
        unit_cost: parseFloat(impact.unitCost || '0'),
        total_cost: parseFloat(impact.totalCost || '0'),
        account_impact: {
          inventory_account: impact.inventoryAccountId || null,
          cogs_account: impact.cogsAccountId || null,
          expense_account: impact.expenseAccountId || null,
        },
      }));
    } catch (error) {
      console.error('Error getting stock impacts:', error);
      throw error;
    }
  }

  // Assets endpoints
  @Get('Asset')
  async getAssets(
    @Query('sort') sort?: string,
    @Query('status') status?: string,
    @Query('asset_type') asset_type?: string,
  ) {
    try {
      const result = await this.financeService.getAssets({ sort, status, asset_type });
      return (result.assets || []).map((asset: any) => ({
        id: asset.id,
        organization_id: asset.organizationId || null,
        asset_code: asset.assetCode || null,
        asset_name: asset.assetName,
        asset_type: asset.assetType,
        purchase_date: asset.purchaseDate,
        purchase_price: parseFloat(asset.purchasePrice || '0'),
        current_value: parseFloat(asset.currentValue || '0'),
        accumulated_depreciation: parseFloat(asset.accumulatedDepreciation || '0'),
        net_book_value: parseFloat(asset.netBookValue || '0'),
        depreciation_method: asset.depreciationMethod,
        useful_life_years: parseInt(asset.usefulLifeYears || '0'),
        salvage_value: parseFloat(asset.salvageValue || '0'),
        status: asset.status,
        location: asset.location || null,
        account_id: asset.accountId,
      }));
    } catch (error) {
      console.error('Error getting assets:', error);
      throw error;
    }
  }

  @Get('Asset/:id')
  async getAsset(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.getAsset(id);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        asset_code: result.assetCode || null,
        asset_name: result.assetName,
        asset_type: result.assetType,
        purchase_date: result.purchaseDate,
        purchase_price: parseFloat(result.purchasePrice || '0'),
        current_value: parseFloat(result.currentValue || '0'),
        accumulated_depreciation: parseFloat(result.accumulatedDepreciation || '0'),
        net_book_value: parseFloat(result.netBookValue || '0'),
        depreciation_method: result.depreciationMethod,
        useful_life_years: parseInt(result.usefulLifeYears || '0'),
        salvage_value: parseFloat(result.salvageValue || '0'),
        status: result.status,
        location: result.location || null,
        account_id: result.accountId,
      };
    } catch (error) {
      console.error('Error getting asset:', error);
      if (error.code === 2) {
        throw new NotFoundException('Asset not found');
      }
      throw error;
    }
  }

  @Post('Asset')
  async createAsset(@Body() createDto: any) {
    try {
      const result = await this.financeService.createAsset(createDto);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        asset_code: result.assetCode || null,
        asset_name: result.assetName,
        asset_type: result.assetType,
        purchase_date: result.purchaseDate,
        purchase_price: parseFloat(result.purchasePrice || '0'),
        current_value: parseFloat(result.currentValue || '0'),
        accumulated_depreciation: parseFloat(result.accumulatedDepreciation || '0'),
        net_book_value: parseFloat(result.netBookValue || '0'),
        depreciation_method: result.depreciationMethod,
        useful_life_years: parseInt(result.usefulLifeYears || '0'),
        salvage_value: parseFloat(result.salvageValue || '0'),
        status: result.status,
        location: result.location || null,
        account_id: result.accountId,
      };
    } catch (error) {
      console.error('Error creating asset:', error);
      throw error;
    }
  }

  @Put('Asset/:id')
  async updateAsset(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: any) {
    try {
      const result = await this.financeService.updateAsset(id, updateDto);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        asset_code: result.assetCode || null,
        asset_name: result.assetName,
        asset_type: result.assetType,
        purchase_date: result.purchaseDate,
        purchase_price: parseFloat(result.purchasePrice || '0'),
        current_value: parseFloat(result.currentValue || '0'),
        accumulated_depreciation: parseFloat(result.accumulatedDepreciation || '0'),
        net_book_value: parseFloat(result.netBookValue || '0'),
        depreciation_method: result.depreciationMethod,
        useful_life_years: parseInt(result.usefulLifeYears || '0'),
        salvage_value: parseFloat(result.salvageValue || '0'),
        status: result.status,
        location: result.location || null,
        account_id: result.accountId,
      };
    } catch (error) {
      console.error('Error updating asset:', error);
      throw error;
    }
  }

  // IMPORTANT: More specific routes (like /:id/dispose) must come before less specific ones (like /:id)
  @Post('Asset/:id/dispose')
  async disposeAsset(@Param('id', ParseUUIDPipe) id: string, @Body() disposeDto: any) {
    try {
      if (!disposeDto.disposal_date || !disposeDto.disposal_method || !disposeDto.reason || !disposeDto.account_id) {
        throw new BadRequestException('disposal_date, disposal_method, reason, and account_id are required');
      }

      const result = await this.financeService.disposeAsset(id, disposeDto);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        asset_id: result.assetId,
        asset_code: result.assetCode || null,
        asset_name: result.assetName || null,
        disposal_date: result.disposalDate,
        disposal_method: result.disposalMethod,
        disposal_amount: parseFloat(result.disposalAmount || '0'),
        net_book_value: parseFloat(result.netBookValue || '0'),
        gain_loss: parseFloat(result.gainLoss || '0'),
        reason: result.reason || null,
        status: result.status,
        account_id: result.accountId || null,
        journal_entry_id: result.journalEntryId || null,
      };
    } catch (error) {
      console.error('Error disposing asset:', error);
      throw error;
    }
  }

  @Delete('Asset/:id')
  async deleteAsset(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.financeService.deleteAsset(id);
      return { success: true, message: 'Asset deleted successfully' };
    } catch (error) {
      console.error('Error deleting asset:', error);
      throw error;
    }
  }

  // Depreciations endpoints
  // IMPORTANT: More specific routes (like /calculate, /schedule) must come before less specific ones (like /:id)
  @Post('Depreciation/calculate')
  async calculateDepreciation(@Body() calculateDto: { asset_id: string; period_start: string; period_end: string }) {
    try {
      if (!calculateDto.asset_id || !calculateDto.period_start || !calculateDto.period_end) {
        throw new BadRequestException('asset_id, period_start, and period_end are required');
      }

      const result = await this.financeService.calculateDepreciation(calculateDto);
      return {
        asset_id: result.assetId,
        asset_name: result.assetName,
        period_start: result.periodStart,
        period_end: result.periodEnd,
        depreciation_schedule: (result.depreciationSchedule || []).map((item: any) => ({
          period: item.period,
          depreciation_amount: parseFloat(item.depreciationAmount || '0'),
          accumulated_depreciation: parseFloat(item.accumulatedDepreciation || '0'),
          net_book_value: parseFloat(item.netBookValue || '0'),
        })),
        total_depreciation: parseFloat(result.totalDepreciation || '0'),
      };
    } catch (error) {
      console.error('Error calculating depreciation:', error);
      throw error;
    }
  }

  @Get('Depreciation/schedule/:assetId')
  async getDepreciationSchedule(@Param('assetId', ParseUUIDPipe) assetId: string) {
    try {
      const result = await this.financeService.getDepreciationSchedule(assetId);
      return {
        asset: {
          id: result.asset.id,
          asset_code: result.asset.assetCode || null,
          asset_name: result.asset.assetName,
          purchase_price: parseFloat(result.asset.purchasePrice || '0'),
          current_value: parseFloat(result.asset.currentValue || '0'),
          accumulated_depreciation: parseFloat(result.asset.accumulatedDepreciation || '0'),
          net_book_value: parseFloat(result.asset.netBookValue || '0'),
          depreciation_method: result.asset.depreciationMethod,
          useful_life_years: parseInt(result.asset.usefulLifeYears || '0'),
          salvage_value: parseFloat(result.asset.salvageValue || '0'),
        },
        depreciation_schedule: (result.depreciationSchedule || []).map((item: any) => ({
          period: item.period,
          depreciation_amount: parseFloat(item.depreciationAmount || '0'),
          accumulated_depreciation: parseFloat(item.accumulatedDepreciation || '0'),
          net_book_value: parseFloat(item.netBookValue || '0'),
          status: item.status,
        })),
        total_depreciation: parseFloat(result.totalDepreciation || '0'),
        remaining_life_years: parseFloat(result.remainingLifeYears || '0'),
      };
    } catch (error) {
      console.error('Error getting depreciation schedule:', error);
      throw error;
    }
  }

  @Post('Depreciation/:id/post')
  async postDepreciation(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.postDepreciation(id);
      return {
        success: result.success,
        journal_entry_id: result.journalEntryId,
      };
    } catch (error) {
      console.error('Error posting depreciation:', error);
      throw error;
    }
  }

  @Get('Depreciation')
  async getDepreciations(
    @Query('asset_id') asset_id?: string,
    @Query('period_start') period_start?: string,
    @Query('period_end') period_end?: string,
  ) {
    try {
      const result = await this.financeService.getDepreciations({ asset_id, period_start, period_end });
      return (result.depreciations || []).map((dep: any) => ({
        id: dep.id,
        organization_id: dep.organizationId || null,
        asset_id: dep.assetId,
        asset_code: dep.assetCode || null,
        asset_name: dep.assetName || null,
        depreciation_date: dep.depreciationDate,
        period: dep.period,
        depreciation_amount: parseFloat(dep.depreciationAmount || '0'),
        accumulated_depreciation: parseFloat(dep.accumulatedDepreciation || '0'),
        net_book_value: parseFloat(dep.netBookValue || '0'),
        status: dep.status,
        journal_entry_id: dep.journalEntryId || null,
      }));
    } catch (error) {
      console.error('Error getting depreciations:', error);
      throw error;
    }
  }

  @Get('Depreciation/:id')
  async getDepreciation(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.getDepreciation(id);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        asset_id: result.assetId,
        asset_code: result.assetCode || null,
        asset_name: result.assetName || null,
        depreciation_date: result.depreciationDate,
        period: result.period,
        depreciation_amount: parseFloat(result.depreciationAmount || '0'),
        accumulated_depreciation: parseFloat(result.accumulatedDepreciation || '0'),
        net_book_value: parseFloat(result.netBookValue || '0'),
        status: result.status,
        journal_entry_id: result.journalEntryId || null,
      };
    } catch (error) {
      console.error('Error getting depreciation:', error);
      if (error.code === 2) {
        throw new NotFoundException('Depreciation not found');
      }
      throw error;
    }
  }

  @Post('Depreciation')
  async createDepreciation(@Body() createDto: any) {
    try {
      const result = await this.financeService.createDepreciation(createDto);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        asset_id: result.assetId,
        asset_code: result.assetCode || null,
        asset_name: result.assetName || null,
        depreciation_date: result.depreciationDate,
        period: result.period,
        depreciation_amount: parseFloat(result.depreciationAmount || '0'),
        accumulated_depreciation: parseFloat(result.accumulatedDepreciation || '0'),
        net_book_value: parseFloat(result.netBookValue || '0'),
        status: result.status,
        journal_entry_id: result.journalEntryId || null,
      };
    } catch (error) {
      console.error('Error creating depreciation:', error);
      throw error;
    }
  }

  @Put('Depreciation/:id')
  async updateDepreciation(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: any) {
    try {
      const result = await this.financeService.updateDepreciation(id, updateDto);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        asset_id: result.assetId,
        asset_code: result.assetCode || null,
        asset_name: result.assetName || null,
        depreciation_date: result.depreciationDate,
        period: result.period,
        depreciation_amount: parseFloat(result.depreciationAmount || '0'),
        accumulated_depreciation: parseFloat(result.accumulatedDepreciation || '0'),
        net_book_value: parseFloat(result.netBookValue || '0'),
        status: result.status,
        journal_entry_id: result.journalEntryId || null,
      };
    } catch (error) {
      console.error('Error updating depreciation:', error);
      throw error;
    }
  }

  @Delete('Depreciation/:id')
  async deleteDepreciation(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.financeService.deleteDepreciation(id);
      return { success: true, message: 'Depreciation deleted successfully' };
    } catch (error) {
      console.error('Error deleting depreciation:', error);
      throw error;
    }
  }

  // Asset Revaluations endpoints
  // IMPORTANT: More specific routes (like /:id/post) must come before less specific ones (like /:id)
  @Post('AssetRevaluation/:id/post')
  async postAssetRevaluation(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.postAssetRevaluation(id);
      return {
        success: result.success,
        journal_entry_id: result.journalEntryId,
      };
    } catch (error) {
      console.error('Error posting asset revaluation:', error);
      throw error;
    }
  }

  @Get('AssetRevaluation')
  async getAssetRevaluations(
    @Query('asset_id') asset_id?: string,
    @Query('sort') sort?: string,
  ) {
    try {
      const result = await this.financeService.getAssetRevaluations({ asset_id, sort });
      return (result.assetRevaluations || []).map((reval: any) => ({
        id: reval.id,
        organization_id: reval.organizationId || null,
        asset_id: reval.assetId,
        asset_code: reval.assetCode || null,
        asset_name: reval.assetName || null,
        revaluation_date: reval.revaluationDate,
        previous_value: parseFloat(reval.previousValue || '0'),
        new_value: parseFloat(reval.newValue || '0'),
        revaluation_amount: parseFloat(reval.revaluationAmount || '0'),
        revaluation_type: reval.revaluationType,
        reason: reval.reason || null,
        status: reval.status,
        account_id: reval.accountId,
        journal_entry_id: reval.journalEntryId || null,
      }));
    } catch (error) {
      console.error('Error getting asset revaluations:', error);
      throw error;
    }
  }

  @Get('AssetRevaluation/:id')
  async getAssetRevaluation(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.getAssetRevaluation(id);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        asset_id: result.assetId,
        asset_code: result.assetCode || null,
        asset_name: result.assetName || null,
        revaluation_date: result.revaluationDate,
        previous_value: parseFloat(result.previousValue || '0'),
        new_value: parseFloat(result.newValue || '0'),
        revaluation_amount: parseFloat(result.revaluationAmount || '0'),
        revaluation_type: result.revaluationType,
        reason: result.reason || null,
        status: result.status,
        account_id: result.accountId,
        journal_entry_id: result.journalEntryId || null,
      };
    } catch (error) {
      console.error('Error getting asset revaluation:', error);
      if (error.code === 2) {
        throw new NotFoundException('Asset Revaluation not found');
      }
      throw error;
    }
  }

  @Post('AssetRevaluation')
  async createAssetRevaluation(@Body() createDto: any) {
    try {
      const result = await this.financeService.createAssetRevaluation(createDto);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        asset_id: result.assetId,
        asset_code: result.assetCode || null,
        asset_name: result.assetName || null,
        revaluation_date: result.revaluationDate,
        previous_value: parseFloat(result.previousValue || '0'),
        new_value: parseFloat(result.newValue || '0'),
        revaluation_amount: parseFloat(result.revaluationAmount || '0'),
        revaluation_type: result.revaluationType,
        reason: result.reason || null,
        status: result.status,
        account_id: result.accountId,
        journal_entry_id: result.journalEntryId || null,
      };
    } catch (error) {
      console.error('Error creating asset revaluation:', error);
      throw error;
    }
  }

  @Put('AssetRevaluation/:id')
  async updateAssetRevaluation(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: any) {
    try {
      const result = await this.financeService.updateAssetRevaluation(id, updateDto);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        asset_id: result.assetId,
        asset_code: result.assetCode || null,
        asset_name: result.assetName || null,
        revaluation_date: result.revaluationDate,
        previous_value: parseFloat(result.previousValue || '0'),
        new_value: parseFloat(result.newValue || '0'),
        revaluation_amount: parseFloat(result.revaluationAmount || '0'),
        revaluation_type: result.revaluationType,
        reason: result.reason || null,
        status: result.status,
        account_id: result.accountId,
        journal_entry_id: result.journalEntryId || null,
      };
    } catch (error) {
      console.error('Error updating asset revaluation:', error);
      throw error;
    }
  }

  @Delete('AssetRevaluation/:id')
  async deleteAssetRevaluation(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.financeService.deleteAssetRevaluation(id);
      return { success: true, message: 'Asset Revaluation deleted successfully' };
    } catch (error) {
      console.error('Error deleting asset revaluation:', error);
      throw error;
    }
  }

  // Asset Disposals endpoints
  // IMPORTANT: More specific routes (like /:id/post) must come before less specific ones (like /:id)
  @Post('AssetDisposal/:id/post')
  async postAssetDisposal(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.postAssetDisposal(id);
      return {
        success: result.success,
        journal_entry_id: result.journalEntryId,
      };
    } catch (error) {
      console.error('Error posting asset disposal:', error);
      throw error;
    }
  }

  @Get('AssetDisposal')
  async getAssetDisposals(
    @Query('asset_id') asset_id?: string,
    @Query('sort') sort?: string,
  ) {
    try {
      const result = await this.financeService.getAssetDisposals({ asset_id, sort });
      return (result.assetDisposals || []).map((disposal: any) => ({
        id: disposal.id,
        organization_id: disposal.organizationId || null,
        asset_id: disposal.assetId,
        asset_code: disposal.assetCode || null,
        asset_name: disposal.assetName || null,
        disposal_date: disposal.disposalDate,
        disposal_method: disposal.disposalMethod,
        disposal_amount: parseFloat(disposal.disposalAmount || '0'),
        net_book_value: parseFloat(disposal.netBookValue || '0'),
        gain_loss: parseFloat(disposal.gainLoss || '0'),
        reason: disposal.reason || null,
        status: disposal.status,
        account_id: disposal.accountId || null,
        journal_entry_id: disposal.journalEntryId || null,
      }));
    } catch (error) {
      console.error('Error getting asset disposals:', error);
      throw error;
    }
  }

  @Get('AssetDisposal/:id')
  async getAssetDisposal(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.getAssetDisposal(id);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        asset_id: result.assetId,
        asset_code: result.assetCode || null,
        asset_name: result.assetName || null,
        disposal_date: result.disposalDate,
        disposal_method: result.disposalMethod,
        disposal_amount: parseFloat(result.disposalAmount || '0'),
        net_book_value: parseFloat(result.netBookValue || '0'),
        gain_loss: parseFloat(result.gainLoss || '0'),
        reason: result.reason || null,
        status: result.status,
        account_id: result.accountId || null,
        journal_entry_id: result.journalEntryId || null,
      };
    } catch (error) {
      console.error('Error getting asset disposal:', error);
      if (error.code === 2) {
        throw new NotFoundException('Asset Disposal not found');
      }
      throw error;
    }
  }

  @Post('AssetDisposal')
  async createAssetDisposal(@Body() createDto: any) {
    try {
      const result = await this.financeService.createAssetDisposal(createDto);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        asset_id: result.assetId,
        asset_code: result.assetCode || null,
        asset_name: result.assetName || null,
        disposal_date: result.disposalDate,
        disposal_method: result.disposalMethod,
        disposal_amount: parseFloat(result.disposalAmount || '0'),
        net_book_value: parseFloat(result.netBookValue || '0'),
        gain_loss: parseFloat(result.gainLoss || '0'),
        reason: result.reason || null,
        status: result.status,
        account_id: result.accountId || null,
        journal_entry_id: result.journalEntryId || null,
      };
    } catch (error) {
      console.error('Error creating asset disposal:', error);
      throw error;
    }
  }

  @Put('AssetDisposal/:id')
  async updateAssetDisposal(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: any) {
    try {
      const result = await this.financeService.updateAssetDisposal(id, updateDto);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        asset_id: result.assetId,
        asset_code: result.assetCode || null,
        asset_name: result.assetName || null,
        disposal_date: result.disposalDate,
        disposal_method: result.disposalMethod,
        disposal_amount: parseFloat(result.disposalAmount || '0'),
        net_book_value: parseFloat(result.netBookValue || '0'),
        gain_loss: parseFloat(result.gainLoss || '0'),
        reason: result.reason || null,
        status: result.status,
        account_id: result.accountId || null,
        journal_entry_id: result.journalEntryId || null,
      };
    } catch (error) {
      console.error('Error updating asset disposal:', error);
      throw error;
    }
  }

  @Delete('AssetDisposal/:id')
  async deleteAssetDisposal(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.financeService.deleteAssetDisposal(id);
      return { success: true, message: 'Asset Disposal deleted successfully' };
    } catch (error) {
      console.error('Error deleting asset disposal:', error);
      throw error;
    }
  }

  // Loans endpoints
  @Get('Loan')
  async getLoans(
    @Query('sort') sort?: string,
    @Query('status') status?: string,
    @Query('loan_type') loan_type?: string,
  ) {
    try {
      const result = await this.financeService.getLoans({ sort, status, loan_type });
      return (result.loans || []).map((loan: any) => ({
        id: loan.id,
        organization_id: loan.organizationId || null,
        loan_number: loan.loanNumber,
        loan_name: loan.loanName,
        lender: loan.lender,
        loan_type: loan.loanType,
        loan_amount: parseFloat(loan.loanAmount || '0'),
        interest_rate: parseFloat(loan.interestRate || '0'),
        loan_date: loan.loanDate,
        maturity_date: loan.maturityDate,
        payment_frequency: loan.paymentFrequency,
        payment_amount: parseFloat(loan.paymentAmount || '0'),
        outstanding_balance: parseFloat(loan.outstandingBalance || '0'),
        status: loan.status,
        account_id: loan.accountId || null,
      }));
    } catch (error) {
      console.error('Error getting loans:', error);
      throw error;
    }
  }

  @Get('Loan/:id')
  async getLoan(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.getLoan(id);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        loan_number: result.loanNumber,
        loan_name: result.loanName,
        lender: result.lender,
        loan_type: result.loanType,
        loan_amount: parseFloat(result.loanAmount || '0'),
        interest_rate: parseFloat(result.interestRate || '0'),
        loan_date: result.loanDate,
        maturity_date: result.maturityDate,
        payment_frequency: result.paymentFrequency,
        payment_amount: parseFloat(result.paymentAmount || '0'),
        outstanding_balance: parseFloat(result.outstandingBalance || '0'),
        status: result.status,
        account_id: result.accountId || null,
      };
    } catch (error) {
      console.error('Error getting loan:', error);
      if (error.code === 2) {
        throw new NotFoundException('Loan not found');
      }
      throw error;
    }
  }

  @Post('Loan')
  async createLoan(@Body() createDto: any) {
    try {
      const result = await this.financeService.createLoan(createDto);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        loan_number: result.loanNumber,
        loan_name: result.loanName,
        lender: result.lender,
        loan_type: result.loanType,
        loan_amount: parseFloat(result.loanAmount || '0'),
        interest_rate: parseFloat(result.interestRate || '0'),
        loan_date: result.loanDate,
        maturity_date: result.maturityDate,
        payment_frequency: result.paymentFrequency,
        payment_amount: parseFloat(result.paymentAmount || '0'),
        outstanding_balance: parseFloat(result.outstandingBalance || '0'),
        status: result.status,
        account_id: result.accountId || null,
      };
    } catch (error) {
      console.error('Error creating loan:', error);
      throw error;
    }
  }

  @Put('Loan/:id')
  async updateLoan(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: any) {
    try {
      const result = await this.financeService.updateLoan(id, updateDto);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        loan_number: result.loanNumber,
        loan_name: result.loanName,
        lender: result.lender,
        loan_type: result.loanType,
        loan_amount: parseFloat(result.loanAmount || '0'),
        interest_rate: parseFloat(result.interestRate || '0'),
        loan_date: result.loanDate,
        maturity_date: result.maturityDate,
        payment_frequency: result.paymentFrequency,
        payment_amount: parseFloat(result.paymentAmount || '0'),
        outstanding_balance: parseFloat(result.outstandingBalance || '0'),
        status: result.status,
        account_id: result.accountId || null,
      };
    } catch (error) {
      console.error('Error updating loan:', error);
      throw error;
    }
  }

  @Delete('Loan/:id')
  async deleteLoan(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.financeService.deleteLoan(id);
      return { success: true, message: 'Loan deleted successfully' };
    } catch (error) {
      console.error('Error deleting loan:', error);
      throw error;
    }
  }

  @Post('Loan/:id/payment')
  async makeLoanPayment(@Param('id', ParseUUIDPipe) id: string, @Body() paymentDto: any) {
    try {
      const result = await this.financeService.makeLoanPayment(id, paymentDto);
      return {
        id: result.id,
        loan_id: result.loanId,
        payment_date: result.paymentDate,
        payment_number: result.paymentNumber,
        payment_amount: parseFloat(result.paymentAmount || '0'),
        principal_amount: parseFloat(result.principalAmount || '0'),
        interest_amount: parseFloat(result.interestAmount || '0'),
        outstanding_balance: parseFloat(result.outstandingBalance || '0'),
        status: result.status,
        bank_account_id: result.bankAccountId || null,
        journal_entry_id: result.journalEntryId || null,
      };
    } catch (error) {
      console.error('Error making loan payment:', error);
      throw error;
    }
  }

  @Get('Loan/:id/schedule')
  async getLoanSchedule(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.getLoanSchedule(id);
      return {
        loan: result.loan,
        payment_schedule: (result.paymentSchedule || []).map((item: any) => ({
          payment_number: item.paymentNumber,
          payment_date: item.paymentDate,
          payment_amount: parseFloat(item.paymentAmount || '0'),
          principal_amount: parseFloat(item.principalAmount || '0'),
          interest_amount: parseFloat(item.interestAmount || '0'),
          outstanding_balance: parseFloat(item.outstandingBalance || '0'),
          status: item.status,
        })),
        total_principal: parseFloat(result.totalPrincipal || '0'),
        total_interest: parseFloat(result.totalInterest || '0'),
        total_payments: parseFloat(result.totalPayments || '0'),
      };
    } catch (error) {
      console.error('Error getting loan schedule:', error);
      throw error;
    }
  }

  // Accrued Expenses endpoints
  @Get('AccruedExpense')
  async getAccruedExpenses(
    @Query('sort') sort?: string,
    @Query('status') status?: string,
  ) {
    try {
      const result = await this.financeService.getAccruedExpenses({ sort, status });
      return (result.accruedExpenses || []).map((accrued: any) => ({
        id: accrued.id,
        organization_id: accrued.organizationId || null,
        accrual_number: accrued.accrualNumber || null,
        expense_description: accrued.expenseDescription,
        accrual_date: accrued.accrualDate,
        amount: parseFloat(accrued.amount || '0'),
        currency: accrued.currency,
        account_id: accrued.accountId || null,
        vendor_id: accrued.vendorId || null,
        status: accrued.status,
        reversal_date: accrued.reversalDate || null,
      }));
    } catch (error) {
      console.error('Error getting accrued expenses:', error);
      throw error;
    }
  }

  @Get('AccruedExpense/:id')
  async getAccruedExpense(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.getAccruedExpense(id);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        accrual_number: result.accrualNumber || null,
        expense_description: result.expenseDescription,
        accrual_date: result.accrualDate,
        amount: parseFloat(result.amount || '0'),
        currency: result.currency,
        account_id: result.accountId || null,
        vendor_id: result.vendorId || null,
        status: result.status,
        reversal_date: result.reversalDate || null,
      };
    } catch (error) {
      console.error('Error getting accrued expense:', error);
      if (error.code === 2) {
        throw new NotFoundException('Accrued expense not found');
      }
      throw error;
    }
  }

  @Post('AccruedExpense')
  async createAccruedExpense(@Body() createDto: any) {
    try {
      const result = await this.financeService.createAccruedExpense(createDto);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        accrual_number: result.accrualNumber || null,
        expense_description: result.expenseDescription,
        accrual_date: result.accrualDate,
        amount: parseFloat(result.amount || '0'),
        currency: result.currency,
        account_id: result.accountId || null,
        vendor_id: result.vendorId || null,
        status: result.status,
        reversal_date: result.reversalDate || null,
      };
    } catch (error) {
      console.error('Error creating accrued expense:', error);
      throw error;
    }
  }

  @Put('AccruedExpense/:id')
  async updateAccruedExpense(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: any) {
    try {
      const result = await this.financeService.updateAccruedExpense(id, updateDto);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        accrual_number: result.accrualNumber || null,
        expense_description: result.expenseDescription,
        accrual_date: result.accrualDate,
        amount: parseFloat(result.amount || '0'),
        currency: result.currency,
        account_id: result.accountId || null,
        vendor_id: result.vendorId || null,
        status: result.status,
        reversal_date: result.reversalDate || null,
      };
    } catch (error) {
      console.error('Error updating accrued expense:', error);
      throw error;
    }
  }

  @Delete('AccruedExpense/:id')
  async deleteAccruedExpense(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.financeService.deleteAccruedExpense(id);
      return { success: true, message: 'Accrued expense deleted successfully' };
    } catch (error) {
      console.error('Error deleting accrued expense:', error);
      throw error;
    }
  }

  @Post('AccruedExpense/:id/reverse')
  async reverseAccruedExpense(@Param('id', ParseUUIDPipe) id: string, @Body() reverseDto: any) {
    try {
      const result = await this.financeService.reverseAccruedExpense(id, reverseDto);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        accrual_number: result.accrualNumber || null,
        expense_description: result.expenseDescription,
        accrual_date: result.accrualDate,
        amount: parseFloat(result.amount || '0'),
        currency: result.currency,
        account_id: result.accountId || null,
        vendor_id: result.vendorId || null,
        status: result.status,
        reversal_date: result.reversalDate || null,
      };
    } catch (error) {
      console.error('Error reversing accrued expense:', error);
      throw error;
    }
  }

  // Tax Payables endpoints
  @Get('TaxPayable/calculate')
  async calculateTaxPayable(
    @Query('tax_type') tax_type: string,
    @Query('period') period: string,
  ) {
    try {
      const result = await this.financeService.calculateTaxPayable({ tax_type, period });
      return {
        tax_type: result.taxType,
        period: result.period,
        calculated_amount: parseFloat(result.calculatedAmount || '0'),
        breakdown: {
          sales: parseFloat(result.breakdown?.sales || '0'),
          purchases: parseFloat(result.breakdown?.purchases || '0'),
          net_tax: parseFloat(result.breakdown?.netTax || '0'),
        },
      };
    } catch (error) {
      console.error('Error calculating tax:', error);
      throw error;
    }
  }

  @Get('TaxPayable')
  async getTaxPayables(
    @Query('sort') sort?: string,
    @Query('status') status?: string,
    @Query('tax_type') tax_type?: string,
  ) {
    try {
      const result = await this.financeService.getTaxPayables({ sort, status, tax_type });
      return (result.taxPayables || []).map((tax: any) => ({
        id: tax.id,
        organization_id: tax.organizationId || null,
        tax_type: tax.taxType,
        tax_period: tax.taxPeriod,
        due_date: tax.dueDate,
        amount: parseFloat(tax.amount || '0'),
        currency: tax.currency,
        status: tax.status,
        account_id: tax.accountId || null,
        paid_date: tax.paidDate || null,
      }));
    } catch (error) {
      console.error('Error getting tax payables:', error);
      throw error;
    }
  }

  @Get('TaxPayable/:id')
  async getTaxPayable(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.getTaxPayable(id);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        tax_type: result.taxType,
        tax_period: result.taxPeriod,
        due_date: result.dueDate,
        amount: parseFloat(result.amount || '0'),
        currency: result.currency,
        status: result.status,
        account_id: result.accountId || null,
        paid_date: result.paidDate || null,
      };
    } catch (error) {
      console.error('Error getting tax payable:', error);
      if (error.code === 2) {
        throw new NotFoundException('Tax payable not found');
      }
      throw error;
    }
  }

  @Post('TaxPayable')
  async createTaxPayable(@Body() createDto: any) {
    try {
      const result = await this.financeService.createTaxPayable(createDto);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        tax_type: result.taxType,
        tax_period: result.taxPeriod,
        due_date: result.dueDate,
        amount: parseFloat(result.amount || '0'),
        currency: result.currency,
        status: result.status,
        account_id: result.accountId || null,
        paid_date: result.paidDate || null,
      };
    } catch (error) {
      console.error('Error creating tax payable:', error);
      throw error;
    }
  }

  @Put('TaxPayable/:id')
  async updateTaxPayable(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: any) {
    try {
      const result = await this.financeService.updateTaxPayable(id, updateDto);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        tax_type: result.taxType,
        tax_period: result.taxPeriod,
        due_date: result.dueDate,
        amount: parseFloat(result.amount || '0'),
        currency: result.currency,
        status: result.status,
        account_id: result.accountId || null,
        paid_date: result.paidDate || null,
      };
    } catch (error) {
      console.error('Error updating tax payable:', error);
      throw error;
    }
  }

  @Delete('TaxPayable/:id')
  async deleteTaxPayable(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.financeService.deleteTaxPayable(id);
      return { success: true, message: 'Tax payable deleted successfully' };
    } catch (error) {
      console.error('Error deleting tax payable:', error);
      throw error;
    }
  }

  @Post('TaxPayable/:id/pay')
  async payTaxPayable(@Param('id', ParseUUIDPipe) id: string, @Body() payDto: any) {
    try {
      const result = await this.financeService.payTaxPayable(id, payDto);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        tax_type: result.taxType,
        tax_period: result.taxPeriod,
        due_date: result.dueDate,
        amount: parseFloat(result.amount || '0'),
        currency: result.currency,
        status: result.status,
        account_id: result.accountId || null,
        paid_date: result.paidDate || null,
      };
    } catch (error) {
      console.error('Error paying tax payable:', error);
      throw error;
    }
  }

  // Liabilities endpoints
  @Get('Liability/long-term')
  async getLongTermLiabilities() {
    try {
      const result = await this.financeService.getLongTermLiabilities();
      return (result.liabilities || []).map((liability: any) => ({
        id: liability.id,
        organization_id: liability.organizationId || null,
        liability_code: liability.liabilityCode,
        liability_name: liability.liabilityName,
        liability_type: liability.liabilityType,
        amount: parseFloat(liability.amount || '0'),
        currency: liability.currency,
        due_date: liability.dueDate || null,
        interest_rate: parseFloat(liability.interestRate || '0'),
        status: liability.status,
        account_id: liability.accountId || null,
      }));
    } catch (error) {
      console.error('Error getting long-term liabilities:', error);
      throw error;
    }
  }

  @Get('Liability/short-term')
  async getShortTermLiabilities() {
    try {
      const result = await this.financeService.getShortTermLiabilities();
      return (result.liabilities || []).map((liability: any) => ({
        id: liability.id,
        organization_id: liability.organizationId || null,
        liability_code: liability.liabilityCode,
        liability_name: liability.liabilityName,
        liability_type: liability.liabilityType,
        amount: parseFloat(liability.amount || '0'),
        currency: liability.currency,
        due_date: liability.dueDate || null,
        interest_rate: parseFloat(liability.interestRate || '0'),
        status: liability.status,
        account_id: liability.accountId || null,
      }));
    } catch (error) {
      console.error('Error getting short-term liabilities:', error);
      throw error;
    }
  }

  @Get('Liability')
  async getLiabilities(
    @Query('sort') sort?: string,
    @Query('liability_type') liability_type?: string,
  ) {
    try {
      const result = await this.financeService.getLiabilities({ sort, liability_type });
      return (result.liabilities || []).map((liability: any) => ({
        id: liability.id,
        organization_id: liability.organizationId || null,
        liability_code: liability.liabilityCode,
        liability_name: liability.liabilityName,
        liability_type: liability.liabilityType,
        amount: parseFloat(liability.amount || '0'),
        currency: liability.currency,
        due_date: liability.dueDate || null,
        interest_rate: parseFloat(liability.interestRate || '0'),
        status: liability.status,
        account_id: liability.accountId || null,
      }));
    } catch (error) {
      console.error('Error getting liabilities:', error);
      throw error;
    }
  }

  @Get('Liability/:id')
  async getLiability(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.getLiability(id);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        liability_code: result.liabilityCode,
        liability_name: result.liabilityName,
        liability_type: result.liabilityType,
        amount: parseFloat(result.amount || '0'),
        currency: result.currency,
        due_date: result.dueDate || null,
        interest_rate: parseFloat(result.interestRate || '0'),
        status: result.status,
        account_id: result.accountId || null,
      };
    } catch (error) {
      console.error('Error getting liability:', error);
      if (error.code === 2) {
        throw new NotFoundException('Liability not found');
      }
      throw error;
    }
  }

  @Post('Liability')
  async createLiability(@Body() createDto: any) {
    try {
      const result = await this.financeService.createLiability(createDto);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        liability_code: result.liabilityCode,
        liability_name: result.liabilityName,
        liability_type: result.liabilityType,
        amount: parseFloat(result.amount || '0'),
        currency: result.currency,
        due_date: result.dueDate || null,
        interest_rate: parseFloat(result.interestRate || '0'),
        status: result.status,
        account_id: result.accountId || null,
      };
    } catch (error) {
      console.error('Error creating liability:', error);
      throw error;
    }
  }

  @Put('Liability/:id')
  async updateLiability(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: any) {
    try {
      const result = await this.financeService.updateLiability(id, updateDto);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        liability_code: result.liabilityCode,
        liability_name: result.liabilityName,
        liability_type: result.liabilityType,
        amount: parseFloat(result.amount || '0'),
        currency: result.currency,
        due_date: result.dueDate || null,
        interest_rate: parseFloat(result.interestRate || '0'),
        status: result.status,
        account_id: result.accountId || null,
      };
    } catch (error) {
      console.error('Error updating liability:', error);
      throw error;
    }
  }

  @Delete('Liability/:id')
  async deleteLiability(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.financeService.deleteLiability(id);
      return { success: true, message: 'Liability deleted successfully' };
    } catch (error) {
      console.error('Error deleting liability:', error);
      throw error;
    }
  }

  // Projects endpoints
  @Get('Project/:id/budget')
  async getProjectBudget(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.getProjectBudget(id);
      return {
        project_id: result.projectId,
        project_name: result.projectName,
        budgeted_amount: parseFloat(result.budgetedAmount || '0'),
        actual_amount: parseFloat(result.actualAmount || '0'),
        variance: parseFloat(result.variance || '0'),
        variance_percent: parseFloat(result.variancePercent || '0'),
        breakdown: (result.breakdown || []).map((item: any) => ({
          account_id: item.accountId,
          account_code: item.accountCode,
          account_name: item.accountName,
          budgeted: parseFloat(item.budgeted || '0'),
          actual: parseFloat(item.actual || '0'),
          variance: parseFloat(item.variance || '0'),
        })),
      };
    } catch (error) {
      console.error('Error getting project budget:', error);
      if (error.code === 2) {
        throw new NotFoundException('Project not found');
      }
      throw error;
    }
  }

  @Get('Project')
  async getProjects(
    @Query('sort') sort?: string,
    @Query('status') status?: string,
    @Query('department') department?: string,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
  ) {
    try {
      const result = await this.financeService.getProjects({ sort, status, department, start_date, end_date });
      return (result.projects || []).map((project: any) => ({
        id: project.id,
        organization_id: project.organizationId || null,
        project_code: project.projectCode,
        project_name: project.projectName,
        description: project.description || null,
        project_type: project.projectType,
        status: project.status,
        start_date: project.startDate || null,
        end_date: project.endDate || null,
        budgeted_amount: parseFloat(project.budgetedAmount || '0'),
        actual_amount: parseFloat(project.actualAmount || '0'),
        currency: project.currency,
        department: project.department || null,
        project_manager_id: project.projectManagerId || null,
        project_manager_name: project.projectManagerName || null,
        cost_center_id: project.costCenterId || null,
        is_active: project.isActive,
        created_at: project.createdAt || null,
      }));
    } catch (error) {
      console.error('Error getting projects:', error);
      throw error;
    }
  }

  @Get('Project/:id')
  async getProject(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.getProject(id);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        project_code: result.projectCode,
        project_name: result.projectName,
        description: result.description || null,
        project_type: result.projectType,
        status: result.status,
        start_date: result.startDate || null,
        end_date: result.endDate || null,
        budgeted_amount: parseFloat(result.budgetedAmount || '0'),
        actual_amount: parseFloat(result.actualAmount || '0'),
        currency: result.currency,
        department: result.department || null,
        project_manager_id: result.projectManagerId || null,
        project_manager_name: result.projectManagerName || null,
        cost_center_id: result.costCenterId || null,
        is_active: result.isActive,
        created_at: result.createdAt || null,
      };
    } catch (error) {
      console.error('Error getting project:', error);
      if (error.code === 2) {
        throw new NotFoundException('Project not found');
      }
      throw error;
    }
  }

  @Post('Project')
  async createProject(@Body() createDto: any) {
    try {
      const result = await this.financeService.createProject(createDto);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        project_code: result.projectCode,
        project_name: result.projectName,
        description: result.description || null,
        project_type: result.projectType,
        status: result.status,
        start_date: result.startDate || null,
        end_date: result.endDate || null,
        budgeted_amount: parseFloat(result.budgetedAmount || '0'),
        actual_amount: parseFloat(result.actualAmount || '0'),
        currency: result.currency,
        department: result.department || null,
        project_manager_id: result.projectManagerId || null,
        project_manager_name: result.projectManagerName || null,
        cost_center_id: result.costCenterId || null,
        is_active: result.isActive,
        created_at: result.createdAt || null,
      };
    } catch (error) {
      console.error('Error creating project:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        stack: error.stack,
      });
      if (error.code === 2) {
        throw new BadRequestException(error.message || 'Failed to create project');
      }
      throw error;
    }
  }

  @Put('Project/:id')
  async updateProject(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: any) {
    try {
      const result = await this.financeService.updateProject(id, updateDto);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        project_code: result.projectCode,
        project_name: result.projectName,
        description: result.description || null,
        project_type: result.projectType,
        status: result.status,
        start_date: result.startDate || null,
        end_date: result.endDate || null,
        budgeted_amount: parseFloat(result.budgetedAmount || '0'),
        actual_amount: parseFloat(result.actualAmount || '0'),
        currency: result.currency,
        department: result.department || null,
        project_manager_id: result.projectManagerId || null,
        project_manager_name: result.projectManagerName || null,
        cost_center_id: result.costCenterId || null,
        is_active: result.isActive,
        created_at: result.createdAt || null,
      };
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  @Delete('Project/:id')
  async deleteProject(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.financeService.deleteProject(id);
      return { success: true, message: 'Project deleted' };
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Cost Centers endpoints
  @Get('CostCenter/:id/budget')
  async getCostCenterBudget(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('period_start') period_start?: string,
    @Query('period_end') period_end?: string,
  ) {
    try {
      const result = await this.financeService.getCostCenterBudget(id, { period_start, period_end });
      return {
        cost_center_id: result.costCenterId,
        cost_center_name: result.costCenterName,
        period_start: result.periodStart || null,
        period_end: result.periodEnd || null,
        budgeted_amount: parseFloat(result.budgetedAmount || '0'),
        actual_amount: parseFloat(result.actualAmount || '0'),
        variance: parseFloat(result.variance || '0'),
        variance_percent: parseFloat(result.variancePercent || '0'),
        breakdown: (result.breakdown || []).map((item: any) => ({
          account_id: item.accountId,
          account_code: item.accountCode,
          account_name: item.accountName,
          budgeted: parseFloat(item.budgeted || '0'),
          actual: parseFloat(item.actual || '0'),
        })),
      };
    } catch (error) {
      console.error('Error getting cost center budget:', error);
      if (error.code === 2) {
        throw new NotFoundException('Cost center not found');
      }
      throw error;
    }
  }

  @Get('CostCenter')
  async getCostCenters(
    @Query('sort') sort?: string,
    @Query('is_active') is_active?: string,
    @Query('department') department?: string,
    @Query('parent_id') parent_id?: string,
  ) {
    try {
      const isActive = is_active === 'true' ? true : is_active === 'false' ? false : undefined;
      const result = await this.financeService.getCostCenters({ sort, is_active: isActive, department, parent_id });
      return (result.costCenters || []).map((costCenter: any) => ({
        id: costCenter.id,
        organization_id: costCenter.organizationId || null,
        cost_center_code: costCenter.costCenterCode,
        cost_center_name: costCenter.costCenterName,
        description: costCenter.description || null,
        department: costCenter.department || null,
        parent_id: costCenter.parentId || null,
        parent_name: costCenter.parentName || null,
        manager_id: costCenter.managerId || null,
        manager_name: costCenter.managerName || null,
        budgeted_amount: parseFloat(costCenter.budgetedAmount || '0'),
        actual_amount: parseFloat(costCenter.actualAmount || '0'),
        currency: costCenter.currency,
        is_active: costCenter.isActive,
        created_at: costCenter.createdAt || null,
      }));
    } catch (error) {
      console.error('Error getting cost centers:', error);
      throw error;
    }
  }

  @Get('CostCenter/:id')
  async getCostCenter(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.getCostCenter(id);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        cost_center_code: result.costCenterCode,
        cost_center_name: result.costCenterName,
        description: result.description || null,
        department: result.department || null,
        parent_id: result.parentId || null,
        parent_name: result.parentName || null,
        manager_id: result.managerId || null,
        manager_name: result.managerName || null,
        budgeted_amount: parseFloat(result.budgetedAmount || '0'),
        actual_amount: parseFloat(result.actualAmount || '0'),
        currency: result.currency,
        is_active: result.isActive,
        created_at: result.createdAt || null,
      };
    } catch (error) {
      console.error('Error getting cost center:', error);
      if (error.code === 2) {
        throw new NotFoundException('Cost center not found');
      }
      throw error;
    }
  }

  @Post('CostCenter')
  async createCostCenter(@Body() createDto: any) {
    try {
      const result = await this.financeService.createCostCenter(createDto);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        cost_center_code: result.costCenterCode,
        cost_center_name: result.costCenterName,
        description: result.description || null,
        department: result.department || null,
        parent_id: result.parentId || null,
        parent_name: result.parentName || null,
        manager_id: result.managerId || null,
        manager_name: result.managerName || null,
        budgeted_amount: parseFloat(result.budgetedAmount || '0'),
        actual_amount: parseFloat(result.actualAmount || '0'),
        currency: result.currency,
        is_active: result.isActive,
        created_at: result.createdAt || null,
      };
    } catch (error) {
      console.error('Error creating cost center:', error);
      if (error.code === 2) {
        throw new BadRequestException(error.message || 'Failed to create cost center');
      }
      throw error;
    }
  }

  @Put('CostCenter/:id')
  async updateCostCenter(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: any) {
    try {
      const result = await this.financeService.updateCostCenter(id, updateDto);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        cost_center_code: result.costCenterCode,
        cost_center_name: result.costCenterName,
        description: result.description || null,
        department: result.department || null,
        parent_id: result.parentId || null,
        parent_name: result.parentName || null,
        manager_id: result.managerId || null,
        manager_name: result.managerName || null,
        budgeted_amount: parseFloat(result.budgetedAmount || '0'),
        actual_amount: parseFloat(result.actualAmount || '0'),
        currency: result.currency,
        is_active: result.isActive,
        created_at: result.createdAt || null,
      };
    } catch (error) {
      console.error('Error updating cost center:', error);
      throw error;
    }
  }

  @Delete('CostCenter/:id')
  async deleteCostCenter(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.financeService.deleteCostCenter(id);
      return { success: true, message: 'Cost center deleted' };
    } catch (error) {
      console.error('Error deleting cost center:', error);
      throw error;
    }
  }

  // Pricing endpoints
  @Get('Pricing/calculate')
  async calculatePricing(
    @Query('product_id') product_id: string,
    @Query('customer_id') customer_id?: string,
    @Query('quantity') quantity?: string,
    @Query('date') date?: string,
  ) {
    try {
      if (!product_id || !quantity) {
        throw new BadRequestException('product_id and quantity are required');
      }

      const result = await this.financeService.calculatePricing({
        product_id,
        customer_id,
        quantity: parseInt(quantity),
        date,
      });

      return {
        product_id: result.productId || null,
        product_code: result.productCode || null,
        product_name: result.productName || null,
        customer_id: result.customerId || null,
        customer_name: result.customerName || null,
        quantity: parseInt(result.quantity || '0'),
        base_price: parseFloat(result.basePrice || '0'),
        discount_percent: parseFloat(result.discountPercent || '0'),
        discount_amount: parseFloat(result.discountAmount || '0'),
        final_price: parseFloat(result.finalPrice || '0'),
        total_amount: parseFloat(result.totalAmount || '0'),
        currency: result.currency,
        pricing_tier: result.pricingTier || null,
        effective_date: result.effectiveDate || null,
      };
    } catch (error) {
      console.error('Error calculating pricing:', error);
      if (error.code === 2) {
        throw new NotFoundException(error.message || 'Pricing calculation failed');
      }
      throw error;
    }
  }

  @Get('Pricing')
  async getPricings(
    @Query('sort') sort?: string,
    @Query('product_id') product_id?: string,
    @Query('customer_id') customer_id?: string,
    @Query('is_active') is_active?: string,
    @Query('effective_date') effective_date?: string,
  ) {
    try {
      const isActive = is_active === 'true' ? true : is_active === 'false' ? false : undefined;
      const result = await this.financeService.getPricings({ sort, product_id, customer_id, is_active: isActive, effective_date });
      return (result.pricings || []).map((pricing: any) => ({
        id: pricing.id,
        organization_id: pricing.organizationId || null,
        pricing_code: pricing.pricingCode,
        product_id: pricing.productId || null,
        product_code: pricing.productCode || null,
        product_name: pricing.productName || null,
        customer_id: pricing.customerId || null,
        customer_name: pricing.customerName || null,
        pricing_type: pricing.pricingType,
        base_price: parseFloat(pricing.basePrice || '0'),
        discount_percent: parseFloat(pricing.discountPercent || '0'),
        discount_amount: parseFloat(pricing.discountAmount || '0'),
        final_price: parseFloat(pricing.finalPrice || '0'),
        currency: pricing.currency,
        minimum_quantity: parseInt(pricing.minimumQuantity || '0'),
        effective_date: pricing.effectiveDate || null,
        expiry_date: pricing.expiryDate || null,
        is_active: pricing.isActive,
        notes: pricing.notes || null,
      }));
    } catch (error) {
      console.error('Error getting pricings:', error);
      throw error;
    }
  }

  @Get('Pricing/:id')
  async getPricing(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.getPricing(id);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        pricing_code: result.pricingCode,
        product_id: result.productId || null,
        product_code: result.productCode || null,
        product_name: result.productName || null,
        customer_id: result.customerId || null,
        customer_name: result.customerName || null,
        pricing_type: result.pricingType,
        base_price: parseFloat(result.basePrice || '0'),
        discount_percent: parseFloat(result.discountPercent || '0'),
        discount_amount: parseFloat(result.discountAmount || '0'),
        final_price: parseFloat(result.finalPrice || '0'),
        currency: result.currency,
        minimum_quantity: parseInt(result.minimumQuantity || '0'),
        effective_date: result.effectiveDate || null,
        expiry_date: result.expiryDate || null,
        is_active: result.isActive,
        notes: result.notes || null,
      };
    } catch (error) {
      console.error('Error getting pricing:', error);
      if (error.code === 2) {
        throw new NotFoundException('Pricing not found');
      }
      throw error;
    }
  }

  @Post('Pricing')
  async createPricing(@Body() createDto: any) {
    try {
      const result = await this.financeService.createPricing(createDto);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        pricing_code: result.pricingCode,
        product_id: result.productId || null,
        product_code: result.productCode || null,
        product_name: result.productName || null,
        customer_id: result.customerId || null,
        customer_name: result.customerName || null,
        pricing_type: result.pricingType,
        base_price: parseFloat(result.basePrice || '0'),
        discount_percent: parseFloat(result.discountPercent || '0'),
        discount_amount: parseFloat(result.discountAmount || '0'),
        final_price: parseFloat(result.finalPrice || '0'),
        currency: result.currency,
        minimum_quantity: parseInt(result.minimumQuantity || '0'),
        effective_date: result.effectiveDate || null,
        expiry_date: result.expiryDate || null,
        is_active: result.isActive,
        notes: result.notes || null,
      };
    } catch (error) {
      console.error('Error creating pricing:', error);
      if (error.code === 2) {
        throw new BadRequestException(error.message || 'Failed to create pricing');
      }
      throw error;
    }
  }

  @Put('Pricing/:id')
  async updatePricing(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: any) {
    try {
      const result = await this.financeService.updatePricing(id, updateDto);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        pricing_code: result.pricingCode,
        product_id: result.productId || null,
        product_code: result.productCode || null,
        product_name: result.productName || null,
        customer_id: result.customerId || null,
        customer_name: result.customerName || null,
        pricing_type: result.pricingType,
        base_price: parseFloat(result.basePrice || '0'),
        discount_percent: parseFloat(result.discountPercent || '0'),
        discount_amount: parseFloat(result.discountAmount || '0'),
        final_price: parseFloat(result.finalPrice || '0'),
        currency: result.currency,
        minimum_quantity: parseInt(result.minimumQuantity || '0'),
        effective_date: result.effectiveDate || null,
        expiry_date: result.expiryDate || null,
        is_active: result.isActive,
        notes: result.notes || null,
      };
    } catch (error) {
      console.error('Error updating pricing:', error);
      throw error;
    }
  }

  @Delete('Pricing/:id')
  async deletePricing(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.financeService.deletePricing(id);
      return { success: true, message: 'Pricing deleted' };
    } catch (error) {
      console.error('Error deleting pricing:', error);
      throw error;
    }
  }

  // PricingRule endpoints (alias for Pricing)
  @Get('PricingRule/calculate')
  async calculatePricingRule(
    @Query('product_id') product_id?: string,
    @Query('customer_id') customer_id?: string,
    @Query('quantity') quantity?: string,
    @Query('date') date?: string,
  ) {
    return this.calculatePricing(product_id || '', customer_id, quantity, date);
  }

  @Get('PricingRule')
  async getPricingRules(
    @Query('sort') sort?: string,
    @Query('product_id') product_id?: string,
    @Query('customer_id') customer_id?: string,
    @Query('is_active') is_active?: string,
    @Query('effective_date') effective_date?: string,
  ) {
    return this.getPricings(sort, product_id, customer_id, is_active, effective_date);
  }

  @Get('PricingRule/:id')
  async getPricingRule(@Param('id', ParseUUIDPipe) id: string) {
    return this.getPricing(id);
  }

  @Post('PricingRule')
  async createPricingRule(@Body() createDto: any) {
    return this.createPricing(createDto);
  }

  @Put('PricingRule/:id')
  async updatePricingRule(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: any) {
    return this.updatePricing(id, updateDto);
  }

  @Delete('PricingRule/:id')
  async deletePricingRule(@Param('id', ParseUUIDPipe) id: string) {
    return this.deletePricing(id);
  }

  // Contracts endpoints
  @Get('Contract/:id/payments')
  async getContractPayments(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.getContractPayments(id);
      return {
        contract_id: result.contractId,
        contract_name: result.contractName,
        total_value: parseFloat(result.totalValue || '0'),
        paid_amount: parseFloat(result.paidAmount || '0'),
        outstanding_amount: parseFloat(result.outstandingAmount || '0'),
        payments: (result.payments || []).map((payment: any) => ({
          payment_id: payment.paymentId,
          payment_date: payment.paymentDate || null,
          amount: parseFloat(payment.amount || '0'),
          status: payment.status,
          due_date: payment.dueDate || null,
        })),
      };
    } catch (error) {
      console.error('Error getting contract payments:', error);
      if (error.code === 2) {
        throw new NotFoundException('Contract not found');
      }
      throw error;
    }
  }

  @Post('Contract/:id/terminate')
  async terminateContract(@Param('id', ParseUUIDPipe) id: string, @Body() terminateDto: any) {
    try {
      const result = await this.financeService.terminateContract(id, terminateDto);
      return {
        success: result.success,
        message: result.message,
        contract: {
          id: result.contract.id,
          organization_id: result.contract.organizationId || null,
          contract_number: result.contract.contractNumber,
          contract_name: result.contract.contractName,
          contract_type: result.contract.contractType,
          status: result.contract.status,
          party_type: result.contract.partyType,
          party_id: result.contract.partyId,
          party_name: result.contract.partyName || null,
          start_date: result.contract.startDate || null,
          end_date: result.contract.endDate || null,
          total_value: parseFloat(result.contract.totalValue || '0'),
          currency: result.contract.currency,
          payment_terms: result.contract.paymentTerms || null,
          billing_frequency: result.contract.billingFrequency || null,
          auto_renew: result.contract.autoRenew,
          renewal_date: result.contract.renewalDate || null,
          project_id: result.contract.projectId || null,
          cost_center_id: result.contract.costCenterId || null,
          notes: result.contract.notes || null,
          document_url: result.contract.documentUrl || null,
          created_at: result.contract.createdAt || null,
        },
      };
    } catch (error) {
      console.error('Error terminating contract:', error);
      if (error.code === 2) {
        throw new BadRequestException(error.message || 'Failed to terminate contract');
      }
      throw error;
    }
  }

  @Post('Contract/:id/renew')
  async renewContract(@Param('id', ParseUUIDPipe) id: string, @Body() renewDto: any) {
    try {
      const result = await this.financeService.renewContract(id, renewDto);
      return {
        success: result.success,
        message: result.message,
        contract: {
          id: result.contract.id,
          organization_id: result.contract.organizationId || null,
          contract_number: result.contract.contractNumber,
          contract_name: result.contract.contractName,
          contract_type: result.contract.contractType,
          status: result.contract.status,
          party_type: result.contract.partyType,
          party_id: result.contract.partyId,
          party_name: result.contract.partyName || null,
          start_date: result.contract.startDate || null,
          end_date: result.contract.endDate || null,
          total_value: parseFloat(result.contract.totalValue || '0'),
          currency: result.contract.currency,
          payment_terms: result.contract.paymentTerms || null,
          billing_frequency: result.contract.billingFrequency || null,
          auto_renew: result.contract.autoRenew,
          renewal_date: result.contract.renewalDate || null,
          project_id: result.contract.projectId || null,
          cost_center_id: result.contract.costCenterId || null,
          notes: result.contract.notes || null,
          document_url: result.contract.documentUrl || null,
          created_at: result.contract.createdAt || null,
        },
      };
    } catch (error) {
      console.error('Error renewing contract:', error);
      if (error.code === 2) {
        throw new BadRequestException(error.message || 'Failed to renew contract');
      }
      throw error;
    }
  }

  @Post('Contract/:id/activate')
  async activateContract(@Param('id', ParseUUIDPipe) id: string, @Body() activateDto: any) {
    try {
      const result = await this.financeService.activateContract(id, activateDto);
      return {
        success: result.success,
        message: result.message,
        contract: {
          id: result.contract.id,
          organization_id: result.contract.organizationId || null,
          contract_number: result.contract.contractNumber,
          contract_name: result.contract.contractName,
          contract_type: result.contract.contractType,
          status: result.contract.status,
          party_type: result.contract.partyType,
          party_id: result.contract.partyId,
          party_name: result.contract.partyName || null,
          start_date: result.contract.startDate || null,
          end_date: result.contract.endDate || null,
          total_value: parseFloat(result.contract.totalValue || '0'),
          currency: result.contract.currency,
          payment_terms: result.contract.paymentTerms || null,
          billing_frequency: result.contract.billingFrequency || null,
          auto_renew: result.contract.autoRenew,
          renewal_date: result.contract.renewalDate || null,
          project_id: result.contract.projectId || null,
          cost_center_id: result.contract.costCenterId || null,
          notes: result.contract.notes || null,
          document_url: result.contract.documentUrl || null,
          created_at: result.contract.createdAt || null,
        },
      };
    } catch (error) {
      console.error('Error activating contract:', error);
      if (error.code === 2) {
        throw new BadRequestException(error.message || 'Failed to activate contract');
      }
      throw error;
    }
  }

  @Get('Contract')
  async getContracts(
    @Query('sort') sort?: string,
    @Query('status') status?: string,
    @Query('contract_type') contract_type?: string,
    @Query('customer_id') customer_id?: string,
    @Query('vendor_id') vendor_id?: string,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
  ) {
    try {
      const result = await this.financeService.getContracts({ sort, status, contract_type, customer_id, vendor_id, start_date, end_date });
      return (result.contracts || []).map((contract: any) => ({
        id: contract.id,
        organization_id: contract.organizationId || null,
        contract_number: contract.contractNumber,
        contract_name: contract.contractName,
        contract_type: contract.contractType,
        status: contract.status,
        party_type: contract.partyType,
        party_id: contract.partyId,
        party_name: contract.partyName || null,
        start_date: contract.startDate || null,
        end_date: contract.endDate || null,
        total_value: parseFloat(contract.totalValue || '0'),
        currency: contract.currency,
        payment_terms: contract.paymentTerms || null,
        billing_frequency: contract.billingFrequency || null,
        auto_renew: contract.autoRenew,
        renewal_date: contract.renewalDate || null,
        project_id: contract.projectId || null,
        cost_center_id: contract.costCenterId || null,
        notes: contract.notes || null,
        document_url: contract.documentUrl || null,
        created_at: contract.createdAt || null,
      }));
    } catch (error) {
      console.error('Error getting contracts:', error);
      throw error;
    }
  }

  @Get('Contract/:id')
  async getContract(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.financeService.getContract(id);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        contract_number: result.contractNumber,
        contract_name: result.contractName,
        contract_type: result.contractType,
        status: result.status,
        party_type: result.partyType,
        party_id: result.partyId,
        party_name: result.partyName || null,
        start_date: result.startDate || null,
        end_date: result.endDate || null,
        total_value: parseFloat(result.totalValue || '0'),
        currency: result.currency,
        payment_terms: result.paymentTerms || null,
        billing_frequency: result.billingFrequency || null,
        auto_renew: result.autoRenew,
        renewal_date: result.renewalDate || null,
        project_id: result.projectId || null,
        cost_center_id: result.costCenterId || null,
        notes: result.notes || null,
        document_url: result.documentUrl || null,
        created_at: result.createdAt || null,
      };
    } catch (error) {
      console.error('Error getting contract:', error);
      if (error.code === 2) {
        throw new NotFoundException('Contract not found');
      }
      throw error;
    }
  }

  @Post('Contract')
  async createContract(@Body() createDto: any) {
    try {
      const result = await this.financeService.createContract(createDto);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        contract_number: result.contractNumber,
        contract_name: result.contractName,
        contract_type: result.contractType,
        status: result.status,
        party_type: result.partyType,
        party_id: result.partyId,
        party_name: result.partyName || null,
        start_date: result.startDate || null,
        end_date: result.endDate || null,
        total_value: parseFloat(result.totalValue || '0'),
        currency: result.currency,
        payment_terms: result.paymentTerms || null,
        billing_frequency: result.billingFrequency || null,
        auto_renew: result.autoRenew,
        renewal_date: result.renewalDate || null,
        project_id: result.projectId || null,
        cost_center_id: result.costCenterId || null,
        notes: result.notes || null,
        document_url: result.documentUrl || null,
        created_at: result.createdAt || null,
      };
    } catch (error) {
      console.error('Error creating contract:', error);
      if (error.code === 2) {
        throw new BadRequestException(error.message || 'Failed to create contract');
      }
      throw error;
    }
  }

  @Put('Contract/:id')
  async updateContract(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: any) {
    try {
      const result = await this.financeService.updateContract(id, updateDto);
      return {
        id: result.id,
        organization_id: result.organizationId || null,
        contract_number: result.contractNumber,
        contract_name: result.contractName,
        contract_type: result.contractType,
        status: result.status,
        party_type: result.partyType,
        party_id: result.partyId,
        party_name: result.partyName || null,
        start_date: result.startDate || null,
        end_date: result.endDate || null,
        total_value: parseFloat(result.totalValue || '0'),
        currency: result.currency,
        payment_terms: result.paymentTerms || null,
        billing_frequency: result.billingFrequency || null,
        auto_renew: result.autoRenew,
        renewal_date: result.renewalDate || null,
        project_id: result.projectId || null,
        cost_center_id: result.costCenterId || null,
        notes: result.notes || null,
        document_url: result.documentUrl || null,
        created_at: result.createdAt || null,
      };
    } catch (error) {
      console.error('Error updating contract:', error);
      throw error;
    }
  }

  @Delete('Contract/:id')
  async deleteContract(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.financeService.deleteContract(id);
      return { success: true, message: 'Contract deleted' };
    } catch (error) {
      console.error('Error deleting contract:', error);
      throw error;
    }
  }
}

