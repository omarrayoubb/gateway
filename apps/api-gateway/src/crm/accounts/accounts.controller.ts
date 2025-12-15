import { 
  Controller, 
  Get, 
  Param, 
  Query, 
  UseGuards, 
  Post, 
  Body, 
  Request,
  Patch,
  Delete,
  HttpStatus, 
  HttpCode
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AccountsService, PaginatedAccountsResult } from './accounts.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PaginationQueryDto } from '../leads/dto/pagination.dto';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountResponseDto } from './dto/account-response.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkDeleteResponse } from './dto/bulk-delete-response.dto';
import { BulkUpdateAccountDto } from './dto/bulk-update.dto';
import { BulkUpdateResponse } from './dto/bulk-update-response.dto';

/**
 * All endpoints in this controller are protected by the JwtAuthGuard.
 */
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  /**
   * REQUEST/RESPONSE CYCLE - CreateAccount (HTTP Endpoint):
   * 1. Client sends HTTP POST /accounts with CreateAccountDto in request body
   * 2. JWT token required in Authorization header (Bearer token)
   * 3. JwtAuthGuard validates token and extracts user info → req.user
   * 4. Controller extracts currentUser from req.user
   * 5. Calls AccountsService.createAccount() with DTO + user context
   * 6. Service handles gRPC communication with CRM microservice
   * 7. Returns Observable<AccountResponseDto>
   * 8. NestJS automatically converts Observable to HTTP response
   * 
   * POST /accounts
   * Creates a new account.
   * Requires: name, phone, and userIds array
   */
  @Post()
  create(
    @Body() createAccountDto: CreateAccountDto,
    @Request() req: any,
  ): Observable<AccountResponseDto> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.accountsService.createAccount(createAccountDto, currentUser);
  }

  /**
   * REQUEST/RESPONSE CYCLE - FindAllAccounts (HTTP Endpoint):
   * 1. Client sends HTTP GET /accounts?page=1&limit=10
   * 2. JWT token required in Authorization header (Bearer token)
   * 3. JwtAuthGuard validates token
   * 4. Controller receives PaginationQueryDto from query params
   * 5. Calls AccountsService.findAllAccounts() with pagination DTO
   * 6. Service handles gRPC communication with CRM microservice
   * 7. Returns Observable<PaginatedAccountsResult>
   * 8. NestJS automatically converts Observable to HTTP response
   * 
   * GET /accounts
   * Finds all accounts with pagination.
   */
  @Get()
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Observable<PaginatedAccountsResult> {
    return this.accountsService.findAllAccounts(paginationQuery);
  }

  /**
   * GET /accounts/:id
   * Finds a single account by its ID.
   */
  @Get(':id')
  findOne(
    @Param('id') id: string,
  ): Observable<AccountResponseDto> {
    return this.accountsService.findOneAccount(id);
  }

  /**
   * PATCH /accounts/bulk
   * Bulk update accounts.
   */
  @Patch('bulk')
  bulkUpdate(
    @Body() bulkUpdateDto: BulkUpdateAccountDto,
    @Request() req: any,
  ): Observable<BulkUpdateResponse> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.accountsService.bulkUpdate(bulkUpdateDto, currentUser);
  }

  /**
   * PATCH /accounts/:id
   * Updates an existing account.
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @Request() req: any,
  ): Observable<AccountResponseDto> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.accountsService.updateAccount(id, updateAccountDto, currentUser);
  }

  /**
   * POST /accounts/bulk-delete
   * Bulk delete accounts.
   */
  @Post('bulk-delete')
  bulkRemove(
    @Body() bulkDeleteDto: BulkDeleteDto,
  ): Observable<BulkDeleteResponse> {
    return this.accountsService.bulkRemove(bulkDeleteDto);
  }

  /**
   * DELETE /accounts/:id
   * Deletes an existing account.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Observable<void> {
    return this.accountsService.remove(id);
  }
}

