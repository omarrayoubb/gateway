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
import { ContactsService, PaginatedContactsResult } from './contacts.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PaginationQueryDto } from '../leads/dto/pagination.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ContactResponseDto } from './dto/contact-response.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkDeleteResponse } from './dto/bulk-delete-response.dto';
import { BulkUpdateContactDto } from './dto/bulk-update.dto';
import { BulkUpdateResponse } from './dto/bulk-update-response.dto';

/**
 * All endpoints in this controller are protected by the JwtAuthGuard.
 */
@UseGuards(JwtAuthGuard)
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  /**
   * REQUEST/RESPONSE CYCLE - CreateContact (HTTP Endpoint):
   * 1. Client sends HTTP POST /contacts with CreateContactDto in request body
   * 2. JWT token required in Authorization header (Bearer token)
   * 3. JwtAuthGuard validates token and extracts user info → req.user
   * 4. Controller extracts currentUser from req.user
   * 5. Calls ContactsService.createContact() with DTO + user context
   * 6. Service handles gRPC communication with CRM microservice
   * 7. Returns Observable<ContactResponseDto>
   * 8. NestJS automatically converts Observable to HTTP response
   * 
   * POST /contacts
   * Creates a new contact.
   */
  @Post()
  create(
    @Body() createContactDto: CreateContactDto,
    @Request() req: any,
  ): Observable<ContactResponseDto> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.contactsService.createContact(createContactDto, currentUser);
  }

  /**
   * REQUEST/RESPONSE CYCLE - FindAllContacts (HTTP Endpoint):
   * 1. Client sends HTTP GET /contacts?page=1&limit=10
   * 2. JWT token required in Authorization header (Bearer token)
   * 3. JwtAuthGuard validates token
   * 4. Controller receives PaginationQueryDto from query params
   * 5. Calls ContactsService.findAllContacts() with pagination DTO
   * 6. Service handles gRPC communication with CRM microservice
   * 7. Returns Observable<PaginatedContactsResult>
   * 8. NestJS automatically converts Observable to HTTP response
   * 
   * GET /contacts
   * Finds all contacts with pagination.
   */
  @Get()
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Observable<PaginatedContactsResult> {
    return this.contactsService.findAllContacts(paginationQuery);
  }

  /**
   * GET /contacts/:id
   * Finds a single contact by its ID.
   */
  @Get(':id')
  findOne(
    @Param('id') id: string,
  ): Observable<ContactResponseDto> {
    return this.contactsService.findOneContact(id);
  }

  /**
   * PATCH /contacts/bulk
   * Bulk update contacts.
   */
  @Patch('bulk')
  bulkUpdate(
    @Body() bulkUpdateDto: BulkUpdateContactDto,
    @Request() req: any,
  ): Observable<BulkUpdateResponse> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.contactsService.bulkUpdate(bulkUpdateDto, currentUser);
  }

  /**
   * PATCH /contacts/:id
   * Updates an existing contact.
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateContactDto: UpdateContactDto,
    @Request() req: any,
  ): Observable<ContactResponseDto> {
    const currentUser: { id: string; name: string; email: string } = req.user;
    return this.contactsService.updateContact(id, updateContactDto, currentUser);
  }

  /**
   * POST /contacts/bulk-delete
   * Bulk delete contacts.
   */
  @Post('bulk-delete')
  bulkRemove(
    @Body() bulkDeleteDto: BulkDeleteDto,
  ): Observable<BulkDeleteResponse> {
    return this.contactsService.bulkRemove(bulkDeleteDto);
  }

  /**
   * DELETE /contacts/:id
   * Deletes an existing contact.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Observable<void> {
    return this.contactsService.remove(id);
  }
}
