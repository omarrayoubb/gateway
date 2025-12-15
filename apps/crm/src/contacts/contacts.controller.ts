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
import { ContactsService } from './contacts.service';
import { JwtAuthGuard } from '../auth/jwt.authguard';
import { AuthorizationGuard } from '../auth/authorization.guard';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { User } from '../users/users.entity';
import { PaginationQueryDto } from '../leads/dto/pagination.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkDeleteResponse } from './dto/bulk-delete-response.dto';
import { BulkUpdateContactDto } from './dto/bulk-update.dto';
import { BulkUpdateResponse } from './dto/bulk-update-response.dto';

@UseGuards(JwtAuthGuard, AuthorizationGuard) // All endpoints in this module are protected
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  /**
   * POST /contacts
   * Creates a new contact.
   */
  @Post()
  create(
    @Body() createContactDto: CreateContactDto,
    @Request() req: any,
  ) {
    const currentUser: Omit<User, 'password'> = req.user;
    return this.contactsService.create(createContactDto, currentUser);
  }

  /**
   * GET /contacts
   * Finds all contacts with pagination.
   */
  @Get()
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.contactsService.findAll(paginationQuery);
  }

  /**
   * GET /contacts/:id
   * Finds a single contact by its ID.
   */
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.contactsService.findOne(id);
  }

  /**
   * PATCH /contacts/bulk
   * Bulk update contacts.
   */
  @Patch('bulk')
  bulkUpdate(
    @Body() bulkUpdateDto: BulkUpdateContactDto,
    @Request() req: any,
  ): Promise<BulkUpdateResponse> {
    const currentUser: Omit<User, 'password'> = req.user;
    return this.contactsService.bulkUpdate(bulkUpdateDto, currentUser);
  }

  /**
   * PATCH /contacts/:id
   * Updates an existing contact.
   */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContactDto: UpdateContactDto,
    @Request() req: any,
  ) {
    const currentUser: Omit<User, 'password'> = req.user;
    return this.contactsService.update(id, updateContactDto, currentUser);
  }

  /**
   * POST /contacts/bulk-delete
   * Bulk delete contacts.
   */
  @Post('bulk-delete')
  bulkRemove(
    @Body() bulkDeleteDto: BulkDeleteDto,
  ): Promise<BulkDeleteResponse> {
    return this.contactsService.bulkRemove(bulkDeleteDto);
  }

  /**
   * DELETE /contacts/:id
   * Deletes an existing contact.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Returns a 204 No Content on success
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.contactsService.remove(id);
  }
}