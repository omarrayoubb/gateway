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
import { DealsService, PaginatedDealsResult } from './deals.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PaginationQueryDto } from '../leads/dto/pagination.dto';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { DealResponseDto } from './dto/deal-response.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkDeleteResponse } from './dto/bulk-delete-response.dto';
import { BulkUpdateDealDto } from './dto/bulk-update.dto';
import { BulkUpdateResponse } from './dto/bulk-update-response.dto';

/**
 * All endpoints in this controller are protected by the JwtAuthGuard.
 */
@UseGuards(JwtAuthGuard)
@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  /**
   * REQUEST/RESPONSE CYCLE - CreateDeal (HTTP Endpoint):
   * 1. Client sends HTTP POST /deals with CreateDealDto in request body
   * 2. JWT token required in Authorization header (Bearer token)
   * 3. JwtAuthGuard validates token and extracts user info → req.user
   * 4. Controller extracts currentUser from req.user
   * 5. Calls DealsService.createDeal() with DTO + user context
   * 6. Service handles gRPC communication with CRM microservice
   * 7. Returns Observable<DealResponseDto>
   * 8. NestJS automatically converts Observable to HTTP response
   * 
   * POST /deals
   * Creates a new deal.
   * Requires: name, accountId, ownerId, and either leadId OR contactId
   */
  @Post()
  create(
    @Body() createDealDto: CreateDealDto,
    @Request() req: any,
  ): Observable<DealResponseDto> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.dealsService.createDeal(createDealDto, currentUser);
  }

  /**
   * REQUEST/RESPONSE CYCLE - FindAllDeals (HTTP Endpoint):
   * 1. Client sends HTTP GET /deals?page=1&limit=10
   * 2. JWT token required in Authorization header (Bearer token)
   * 3. JwtAuthGuard validates token
   * 4. Controller receives PaginationQueryDto from query params
   * 5. Calls DealsService.findAllDeals() with pagination DTO
   * 6. Service handles gRPC communication with CRM microservice
   * 7. Returns Observable<PaginatedDealsResult>
   * 8. NestJS automatically converts Observable to HTTP response
   * 
   * GET /deals
   * Finds all deals with pagination.
   */
  @Get()
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Observable<PaginatedDealsResult> {
    return this.dealsService.findAllDeals(paginationQuery);
  }

  /**
   * GET /deals/:id
   * Finds a single deal by its ID.
   */
  @Get(':id')
  findOne(
    @Param('id') id: string,
  ): Observable<DealResponseDto> {
    return this.dealsService.findOneDeal(id);
  }

  /**
   * PATCH /deals/bulk
   * Bulk update deals.
   */
  @Patch('bulk')
  bulkUpdate(
    @Body() bulkUpdateDto: BulkUpdateDealDto,
    @Request() req: any,
  ): Observable<BulkUpdateResponse> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.dealsService.bulkUpdate(bulkUpdateDto, currentUser);
  }

  /**
   * PATCH /deals/:id
   * Updates an existing deal.
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDealDto: UpdateDealDto,
    @Request() req: any,
  ): Observable<DealResponseDto> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.dealsService.updateDeal(id, updateDealDto, currentUser);
  }

  /**
   * POST /deals/bulk-delete
   * Bulk delete deals.
   */
  @Post('bulk-delete')
  bulkRemove(
    @Body() bulkDeleteDto: BulkDeleteDto,
  ): Observable<BulkDeleteResponse> {
    return this.dealsService.bulkRemove(bulkDeleteDto);
  }

  /**
   * DELETE /deals/:id
   * Deletes an existing deal.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Observable<void> {
    return this.dealsService.remove(id);
  }
}

