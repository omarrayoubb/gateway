import { 
  Controller, 
  Get, 
  Param, 
  Query, 
  UseGuards, 
  Request,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AccountsService, PaginatedAccountsResult } from './accounts.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PaginationQueryDto } from './dto/pagination.dto';
import { AccountResponseDto } from './dto/account-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('desk/accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  /**
   * GET /desk/accounts
   * Finds all accounts with pagination.
   * Fetches data from CRM microservice via gRPC.
   */
  @Get()
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @Request() req: any,
  ): Observable<PaginatedAccountsResult> {
    return this.accountsService.findAllAccounts(paginationQuery);
  }

  /**
   * GET /desk/accounts/:id
   * Finds a single account by ID.
   * Fetches data from CRM microservice via gRPC.
   */
  @Get(':id')
  findOne(
    @Param('id') id: string,
  ): Observable<AccountResponseDto> {
    return this.accountsService.findOneAccount(id);
  }
}

