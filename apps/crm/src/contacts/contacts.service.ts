import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Contact } from './entities/contacts.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { PaginationQueryDto } from '../leads/dto/pagination.dto';
import { User } from '../users/entities/user.entity';
import { ContactResponseDto } from './dto/contact-response.dto'; // <-- 1. Import new DTO
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkDeleteResponse } from './dto/bulk-delete-response.dto';
import { BulkUpdateContactDto } from './dto/bulk-update.dto';
import { BulkUpdateResponse } from './dto/bulk-update-response.dto';



// 2. Define the PaginatedContactsResult interface
export interface PaginatedContactsResult {
  data: ContactResponseDto[]; // <-- Use the new DTO
  total: number;
  page: number;
  lastPage: number;
}

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  /**
   * Creates a new contact
   */
  async create(createContactDto: CreateContactDto, currentUser: Omit<User, 'password'>): Promise<ContactResponseDto> {
    const existingContact = await this.contactRepository.findOneBy({ 
      email: createContactDto.email 
    });

    if (existingContact) {
      throw new ConflictException(`Contact with email ${createContactDto.email} already exists`);
    }

    const newContact = this.contactRepository.create({
      ...createContactDto,
      createdBy: currentUser.name,
      modifiedBy: currentUser.name,
      // Default owner to the creator if not specified
      ownerId: createContactDto.ownerId || currentUser.id,
    });

    const savedContact = await this.contactRepository.save(newContact);

    // Get the full contact data and transform it
    const fullContact = await this.getFullContactById(savedContact.id);
    return this._transformContactToResponse(fullContact);
  }

  /**
   * Finds all contacts with pagination.
   */
  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedContactsResult> {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    // 3. Load all relations
    const [data, total] = await this.contactRepository.findAndCount({
      take: limit,
      skip: skip,
      order: {
        createdAt: 'DESC',
      },
      relations: ['owner', 'account', 'deals', 'activities'],
    });

    const lastPage = Math.ceil(total / limit);

    // 4. Transform the data
    const transformedData = data.map(contact => this._transformContactToResponse(contact));

    return {
      data: transformedData,
      total,
      page,
      lastPage,
    };
  }

  /**
   * Finds a single contact by its ID.
   */
  async findOne(id: string): Promise<ContactResponseDto> {
    const contact = await this.getFullContactById(id);
    return this._transformContactToResponse(contact);
  }

  /**
   * Updates an existing contact
   */
  async update(
    id: string, 
    updateContactDto: UpdateContactDto, 
    currentUser: Omit<User, 'password'>
  ): Promise<ContactResponseDto> {
    const contact = await this.contactRepository.preload({
      id: id,
      ...updateContactDto,
      modifiedBy: currentUser.name, // Always update the modifier
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    await this.contactRepository.save(contact);
    
    // Get the full contact data and transform it
    const fullContact = await this.getFullContactById(id);
    return this._transformContactToResponse(fullContact);
  }

  /**
   * Deletes a contact
   */
  async remove(id: string): Promise<void> {
    // 5. Update remove to use findOneBy to get the entity
    const contact = await this.contactRepository.findOneBy({ id });
    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }
    
    await this.contactRepository.remove(contact);
  }

  /**
   * Bulk delete contacts
   */
  async bulkRemove(bulkDeleteDto: BulkDeleteDto): Promise<BulkDeleteResponse> {
    const { ids } = bulkDeleteDto;
    const failedIds: Array<{ id: string; error: string }> = [];
    let deletedCount = 0;

    // Find all contacts that exist
    const contacts = await this.contactRepository.find({
      where: { id: In(ids) },
    });

    const foundIds = new Set(contacts.map((c) => c.id));

    // Track which IDs were not found
    for (const id of ids) {
      if (!foundIds.has(id)) {
        failedIds.push({ id, error: 'Contact not found' });
      }
    }

    // Delete all found contacts
    if (contacts.length > 0) {
      await this.contactRepository.remove(contacts);
      deletedCount = contacts.length;
    }

    return {
      deletedCount,
      ...(failedIds.length > 0 && { failedIds }),
    };
  }

  /**
   * Bulk update contacts - applies the same update fields to multiple contacts
   */
  async bulkUpdate(
    bulkUpdateDto: BulkUpdateContactDto,
    currentUser: Omit<User, 'password'>,
  ): Promise<BulkUpdateResponse> {
    const { ids, updateFields } = bulkUpdateDto;
    const failedItems: Array<{ id: string; error: string }> = [];
    let updatedCount = 0;

    // Find all contacts that exist
    const contacts = await this.contactRepository.find({
      where: { id: In(ids) },
    });

    const foundIds = new Set(contacts.map((c) => c.id));

    // Track which IDs were not found
    for (const id of ids) {
      if (!foundIds.has(id)) {
        failedItems.push({ id, error: 'Contact not found' });
      }
    }

    // Process each contact
    for (const contact of contacts) {
      try {
        const updatedContact = await this.contactRepository.preload({
          id: contact.id,
          ...updateFields,
          modifiedBy: currentUser.name, // Always update the modifier
        });

        if (!updatedContact) {
          failedItems.push({ id: contact.id, error: 'Contact not found' });
          continue;
        }

        await this.contactRepository.save(updatedContact);
        updatedCount++;
      } catch (error) {
        failedItems.push({
          id: contact.id,
          error: error.message || 'Failed to update contact',
        });
      }
    }

    return {
      updatedCount,
      ...(failedItems.length > 0 && { failedItems }),
    };
  }

  // --- PRIVATE HELPER FUNCTIONS ---

  /**
   * Gets a single contact by ID with all relations loaded.
   */
  private async getFullContactById(id: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id },
      relations: [
        'owner', 
        'account',
        'deals',
        'activities'
      ]
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }
    return contact;
  }

  /**
   * Transforms a full Contact entity into the rich response format.
   */
  private _transformContactToResponse(contact: Contact): ContactResponseDto {
    
    let ownerFirstName = '';
    let ownerLastName = '';

    // Split the single 'name' field from the User entity
    if (contact.owner?.name) {
      const nameParts = contact.owner.name.split(' ');
      ownerFirstName = nameParts[0] || '';
      ownerLastName = nameParts.slice(1).join(' ') || '';
    }

    return {
      // Base Contact fields
      id: contact.id,
      salutation: contact.salutation,
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      phone: contact.phone,
      mobile_phone: contact.mobile_phone,
      department: contact.department,
      government_code: contact.government_code,
      territory: contact.territory,
      secondary_phone: contact.secondary_phone,
      assistant_name: contact.assistant_name,
      currency_code: contact.currency_code,
      username: contact.username,
      wp_number: contact.wp_number,
      box_folder_id: contact.box_folder_id,
      assigned_profile: contact.assigned_profile,
      user_permissions: contact.user_permissions,
      mailing_street: contact.mailing_street,
      mailing_city: contact.mailing_city,
      mailing_state: contact.mailing_state,
      mailing_zip: contact.mailing_zip,
      mailing_country: contact.mailing_country,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,

      // Transformed fields (with names)
      Deals: (contact.deals || []).map(deal => ({
        id: deal.id,
        name: deal.name,
      })),
      Activities: (contact.activities || []).map(activity => ({
        id: activity.id,
        activityType: activity.activityType,
        subject: activity.subject,
      })),
      OwnerData: contact.owner ? {
        id: contact.owner.id,
        firstName: ownerFirstName,
        lastName: ownerLastName
      } : null,
      Created_by: contact.createdBy || '',
      Modified_by: contact.modifiedBy || '',
      Account_details: contact.account ? {
        id: contact.account.id,
        name: contact.account.name,
        accountNumber: contact.account.accountNumber
      } : null,
    };
  }
}