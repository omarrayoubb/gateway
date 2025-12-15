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
import { LeadsService, PaginatedLeadsResult } from './leads.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PaginationQueryDto } from './dto/pagination.dto';
import { CreateLeadDto } from './dto/create-lead.dto copy';
import { UpdateLeadDto } from './dto/update-lead.dto copy';
import { LeadResponseDto } from './dto/lead-response.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkDeleteResponse } from './dto/bulk-delete-response.dto';
import { BulkUpdateLeadDto } from './dto/bulk-update.dto';
import { BulkUpdateResponse } from './dto/bulk-update-response.dto';

/**
 * All endpoints in this controller are protected by the JwtAuthGuard.
 */
@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  /**
   * REQUEST/RESPONSE CYCLE - CreateLead (HTTP Endpoint):
   * 1. Client sends HTTP POST /leads with CreateLeadDto in request body
   * 2. JWT token required in Authorization header (Bearer token)
   * 3. JwtAuthGuard validates token and extracts user info → req.user
   * 4. Controller extracts currentUser from req.user
   * 5. Calls LeadsService.createLead() with DTO + user context
   * 6. Service handles gRPC communication with CRM microservice
   * 7. Returns Observable<LeadResponseDto>
   * 8. NestJS automatically converts Observable to HTTP response
   * 
   * POST /leads
   * Creates a new lead.
   */
  @Post()
  create(
    @Body() createLeadDto: CreateLeadDto,
    @Request() req: any,
  ): Observable<LeadResponseDto> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.leadsService.createLead(createLeadDto, currentUser);
  }

  /**
   * REQUEST/RESPONSE CYCLE - FindAllLeads (HTTP Endpoint):
   * 1. Client sends HTTP GET /leads?page=1&limit=10
   * 2. JWT token required in Authorization header (Bearer token)
   * 3. JwtAuthGuard validates token
   * 4. Controller receives PaginationQueryDto from query params
   * 5. Calls LeadsService.findAllLeads() with pagination DTO
   * 6. Service handles gRPC communication with CRM microservice
   * 7. Returns Observable<PaginatedLeadsResult>
   * 8. NestJS automatically converts Observable to HTTP response
   * 
   * GET /leads
   * Finds all leads with pagination.
   */
  @Get()
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Observable<PaginatedLeadsResult> {
    return this.leadsService.findAllLeads(paginationQuery);
  }

  /**
   * GET /leads/:id
   * Finds a single lead by its ID.
   */
  @Get(':id')
  findOne(
    @Param('id') id: string,
  ): Observable<LeadResponseDto> {
    return this.leadsService.findOneLead(id);
  }

  /**
   * PATCH /leads/bulk
   * Bulk update leads.
   */
  @Patch('bulk')
  bulkUpdate(
    @Body() bulkUpdateDto: BulkUpdateLeadDto,
    @Request() req: any,
  ): Observable<BulkUpdateResponse> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.leadsService.bulkUpdate(bulkUpdateDto, currentUser);
  }

  /**
   * PATCH /leads/:id
   * Updates an existing lead.
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
    @Request() req: any,
  ): Observable<LeadResponseDto> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.leadsService.updateLead(id, updateLeadDto, currentUser);
  }

  /**
   * POST /leads/bulk-delete
   * Bulk delete leads.
   */
  @Post('bulk-delete')
  bulkRemove(
    @Body() bulkDeleteDto: BulkDeleteDto,
  ): Observable<BulkDeleteResponse> {
    return this.leadsService.bulkRemove(bulkDeleteDto);
  }

  /**
   * DELETE /leads/:id
   * Deletes an existing lead.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Observable<void> {
    return this.leadsService.remove(id);
  }
}