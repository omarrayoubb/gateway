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
  HttpCode,
  HttpStatus,
  ParseUUIDPipe
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/jwt.authguard';
import { AuthorizationGuard } from '../auth/authorization.guard';
import { PaginationQueryDto } from '../leads/dto/pagination.dto';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { User } from '../users/users.entity';
import { AccountCreateResponse } from './dto/account-response.dto';
import { PaginatedAccountsResult } from './accounts.service'; // <-- Import interface
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkDeleteResponse } from './dto/bulk-delete-response.dto';
import { BulkUpdateAccountDto } from './dto/bulk-update.dto';
import { BulkUpdateResponse } from './dto/bulk-update-response.dto';

@UseGuards(JwtAuthGuard, AuthorizationGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  create(
    @Body() createAccountDto: CreateAccountDto,
    @Request() req: any,
  ): Promise<AccountCreateResponse> {
    const currentUser: Omit<User, 'password'> = req.user;
    return this.accountsService.create(createAccountDto, currentUser);
  }

  @Get()
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedAccountsResult> {
    return this.accountsService.findAll(paginationQuery);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AccountCreateResponse> {
    return this.accountsService.findOne(id);
  }

  @Patch('bulk')
  bulkUpdate(
    @Body() bulkUpdateDto: BulkUpdateAccountDto,
    @Request() req: any,
  ): Promise<BulkUpdateResponse> {
    const currentUser: Omit<User, 'password'> = req.user;
    return this.accountsService.bulkUpdate(bulkUpdateDto, currentUser);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @Request() req: any,
  ): Promise<AccountCreateResponse> { // <-- Updated return type
    const currentUser: Omit<User, 'password'> = req.user;
    return this.accountsService.update(id, updateAccountDto, currentUser);
  }

  @Post('bulk-delete')
  bulkRemove(
    @Body() bulkDeleteDto: BulkDeleteDto,
  ): Promise<BulkDeleteResponse> {
    return this.accountsService.bulkRemove(bulkDeleteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountsService.remove(id);
  }
}