import { 
  Controller, 
  Get, 
  Param, 
  Query, 
  UseGuards, 
  Post, 
  Body, 
  Request,
  Patch,  // <-- 1. Import Patch
  Delete, // <-- 2. Import Delete
  HttpStatus, 
  HttpCode
} from '@nestjs/common';
import { LeadsService, PaginatedLeadsResult } from './leads.service'; // <-- 1. Import PaginatedLeadsResult
import { JwtAuthGuard } from '../auth/jwt.authguard';
import { AuthorizationGuard } from '../auth/authorization.guard';
import { PaginationQueryDto } from './dto/pagination.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { User } from '../users/users.entity';
import { LeadResponseDto } from './dto/lead-response.dto'; // <-- 2. Import LeadResponseDto
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkDeleteResponse } from './dto/bulk-delete-response.dto';
import { BulkUpdateLeadDto } from './dto/bulk-update.dto';
import { BulkUpdateResponse } from './dto/bulk-update-response.dto';

/**
 * All endpoints in this controller are protected by the JwtAuthGuard and AuthorizationGuard.
 */
@UseGuards(JwtAuthGuard, AuthorizationGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  /**
   * POST /leads
   * Creates a new lead.
   */
  @Post()
  create(
    @Body() createLeadDto: CreateLeadDto,
    @Request() req: any,
  ): Promise<LeadResponseDto> { // <-- 3. Update return type
    const currentUser: Omit<User, 'password'> = req.user;
    return this.leadsService.create(createLeadDto, currentUser);
  }

  /**
   * GET /leads
   * Finds all leads with pagination.
   */
  @Get()
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedLeadsResult> {
    return this.leadsService.findAll(paginationQuery);
  }

  /**
   * GET /leads/:id
   * Finds a single lead by its ID.
   */
  @Get(':id')
  findOne(
    @Param('id') id: string,
  ): Promise<LeadResponseDto> {
    return this.leadsService.findOne(id);
  }

  /**
   * PATCH /leads/bulk
   * Bulk update leads.
   */
  @Patch('bulk')
  bulkUpdate(
    @Body() bulkUpdateDto: BulkUpdateLeadDto,
    @Request() req: any,
  ): Promise<BulkUpdateResponse> {
    const currentUser: Omit<User, 'password'> = req.user;
    return this.leadsService.bulkUpdate(bulkUpdateDto, currentUser);
  }

  /**
   * NEW: PATCH /leads/:id
   * Updates an existing lead.
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
    @Request() req: any,
  ): Promise<LeadResponseDto> { // <-- 6. Update return type
    // The ValidationPipe has already validated the DTO.
    const currentUser: Omit<User, 'password'> = req.user;
    return this.leadsService.update(id, updateLeadDto, currentUser);
  }

  /**
   * POST /leads/bulk-delete
   * Bulk delete leads.
   */
  @Post('bulk-delete')
  bulkRemove(
    @Body() bulkDeleteDto: BulkDeleteDto,
  ): Promise<BulkDeleteResponse> {
    return this.leadsService.bulkRemove(bulkDeleteDto);
  }

  /**
   * NEW: DELETE /leads/:id
   * Deletes an existing lead.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Returns a 204 No Content on success
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}