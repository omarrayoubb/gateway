import { 
  Controller, 
  Get, 
  Param, 
  Query, 
  UseGuards, 
  Request,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ContactsService, PaginatedContactsResult } from './contacts.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PaginationQueryDto } from './dto/pagination.dto';
import { ContactResponseDto } from './dto/contact-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('desk/contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  /**
   * GET /desk/contacts
   * Finds all contacts with pagination.
   * Fetches data from CRM microservice via gRPC.
   */
  @Get()
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @Request() req: any,
  ): Observable<PaginatedContactsResult> {
    return this.contactsService.findAllContacts(paginationQuery);
  }

  /**
   * GET /desk/contacts/:id
   * Finds a single contact by ID.
   * Fetches data from CRM microservice via gRPC.
   */
  @Get(':id')
  findOne(
    @Param('id') id: string,
  ): Observable<ContactResponseDto> {
    return this.contactsService.findOneContact(id);
  }
}

