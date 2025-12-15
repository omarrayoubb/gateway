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
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import { DealsService, PaginatedDealsResult } from './deals.service';
import { JwtAuthGuard } from '../auth/jwt.authguard';
import { AuthorizationGuard } from '../auth/authorization.guard';
import { PaginationQueryDto } from './dto/pagination.dto';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { User } from '../users/users.entity';
import { DealResponseDto } from './dto/deal-response.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkDeleteResponse } from './dto/bulk-delete-response.dto';
import { BulkUpdateDealDto } from './dto/bulk-update.dto';
import { BulkUpdateResponse } from './dto/bulk-update-response.dto';

@UseGuards(JwtAuthGuard, AuthorizationGuard)
@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  /**
   * POST /deals
   * Creates a new deal.
   * Requires: name, accountId, ownerId, and either leadId OR contactId
   */
  @Post()
  create(
    @Body() createDealDto: CreateDealDto,
    @Request() req: any,
  ): Promise<DealResponseDto> {
    const currentUser: Omit<User, 'password'> = req.user;
    return this.dealsService.create(createDealDto, currentUser);
  }

  /**
   * GET /deals
   * Finds all deals with pagination.
   */
  @Get()
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedDealsResult> {
    return this.dealsService.findAll(paginationQuery);
  }

  /**
   * GET /deals/:id
   * Finds a single deal by its ID.
   */
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DealResponseDto> {
    return this.dealsService.findOne(id);
  }

  /**
   * PATCH /deals/bulk
   * Bulk update deals.
   */
  @Patch('bulk')
  bulkUpdate(
    @Body() bulkUpdateDto: BulkUpdateDealDto,
    @Request() req: any,
  ): Promise<BulkUpdateResponse> {
    const currentUser: Omit<User, 'password'> = req.user;
    return this.dealsService.bulkUpdate(bulkUpdateDto, currentUser);
  }

  /**
   * PATCH /deals/:id
   * Updates an existing deal.
   */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDealDto: UpdateDealDto,
    @Request() req: any,
  ): Promise<DealResponseDto> {
    const currentUser: Omit<User, 'password'> = req.user;
    return this.dealsService.update(id, updateDealDto, currentUser);
  }

  /**
   * POST /deals/bulk-delete
   * Bulk delete deals.
   */
  @Post('bulk-delete')
  bulkRemove(
    @Body() bulkDeleteDto: BulkDeleteDto,
  ): Promise<BulkDeleteResponse> {
    return this.dealsService.bulkRemove(bulkDeleteDto);
  }

  /**
   * DELETE /deals/:id
   * Deletes an existing deal.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.dealsService.remove(id);
  }
}

