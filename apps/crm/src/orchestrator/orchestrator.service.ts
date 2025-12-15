import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { AccountsService } from '../accounts/accounts.service';
import { LeadsService } from '../leads/leads.service';
import { ContactsService } from '../contacts/contacts.service';
import { ProfilesService } from '../profiles/profiles.service';
import { RolesService } from '../roles/roles.service';
import { 
  AccountOrchestratorResponse, 
  ContactLeadOrchestratorResponse,
  RegisterFormOrchestratorResponse,
  DealFormOrchestratorResponse 
} from './dto/orchestrator-response.dto';
import { ContactResponseDto } from '../contacts/dto/contact-response.dto';
import { CreateContactDto } from '../contacts/dto/create-contact.dto';
import { User } from '../users/users.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Contact } from '../contacts/entities/contacts.entity';

@Injectable()
export class OrchestratorService {
  constructor(
    private readonly usersService: UsersService,
    private readonly accountsService: AccountsService,
    private readonly leadsService: LeadsService,
    private readonly contactsService: ContactsService,
    private readonly profilesService: ProfilesService,
    private readonly rolesService: RolesService,
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  /**
   * Returns options needed for the Account Creation form.
   * Needs: List of Users (for Owner)
   */
  async getAccountFormOptions(): Promise<AccountOrchestratorResponse> {
    const users = await this.usersService.findAllForDropdown();
    return {
      owners: users.map(u => ({ id: u.id, name: u.name, email: u.email })),
    };
  }

  /**
   * Returns options needed for the Contact/Lead Creation forms (shared).
   * Needs: List of Users (Owner) AND List of Accounts (Linked Account)
   */
  async getContactLeadFormOptions(): Promise<ContactLeadOrchestratorResponse> {
    const [users, accounts] = await Promise.all([
      this.usersService.findAllForDropdown(),
      this.accountsService.findAllForDropdown(),
    ]);

    return {
      owners: users.map(u => ({ id: u.id, name: u.name, email: u.email })),
      accounts: accounts.map(a => ({ id: a.id, name: a.name, accountNumber: a.accountNumber })),
    };
  }

  /**
   * Converts a lead to a contact by removing the lead and inserting all its data into contacts table.
   */
  async convertLeadToContact(leadId: string, currentUser: Omit<User, 'password'>): Promise<ContactResponseDto> {
    // Get the lead with all its data
    console.log("hereeee2");
    const lead = await this.leadRepository.findOne({
      where: { id: leadId },
      relations: ['owner', 'account'],
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${leadId} not found`);
    }

    // Map all lead fields to contact fields
    const createContactDto: CreateContactDto = {
      first_name: lead.first_name,
      last_name: lead.last_name,
      email: lead.email,
      phone: lead.phone,
      accountId: lead.accountId || undefined,
      ownerId: lead.ownerId || undefined,
      currency_code: lead.currency_code || undefined,
      // Map shipping address fields to mailing address fields
      mailing_street: lead.shipping_street || undefined,
      mailing_city: lead.shipping_city || undefined,
      mailing_state: lead.shipping_state || undefined,
      mailing_zip: lead.shipping_zip_code || undefined,
      mailing_country: lead.shipping_country || undefined,
    };
    console.log("hereeee");
    // Create the contact using ContactsService (it will check for email conflicts)
    const contact = await this.contactsService.create(createContactDto, currentUser);

    // Delete the lead after successful contact creation
    await this.leadRepository.remove(lead);

    // Return the created contact
    return contact;
  }

  /**
   * Returns options needed for the Register form.
   * Needs: List of Profiles (id and name) and List of Roles (id and name)
   */
  async getRegisterFormOptions(): Promise<RegisterFormOrchestratorResponse> {
    const [profiles, roles] = await Promise.all([
      this.profilesService.findAll(),
      this.rolesService.findAll(),
    ]);

    // Extract profiles with only id and name
    const profilesList = profiles.map(p => ({
      id: p.id,
      name: p.name,
    }));

    // Extract roles with only id and name (flatten nested structure if needed)
    const rolesList: Array<{ id: string; name: string }> = [];
    
    const flattenRoles = (rolesArray: Array<{ id: string; name: string; children?: any[] }>): void => {
      for (const role of rolesArray) {
        rolesList.push({
          id: role.id,
          name: role.name,
        });
        if (role.children && role.children.length > 0) {
          flattenRoles(role.children);
        }
      }
    };

    flattenRoles(roles);

    return {
      profiles: profilesList,
      roles: rolesList,
    };
  }

  /**
   * Returns options needed for the Deal Creation form.
   * Needs: List of Leads (id and name), Contacts (id and name), Accounts (id and name), Users (id and name)
   */
  async getDealFormOptions(): Promise<DealFormOrchestratorResponse> {
    const [leads, contacts, accounts, users] = await Promise.all([
      this.leadRepository.find({
        select: ['id', 'first_name', 'last_name'],
        order: { first_name: 'ASC', last_name: 'ASC' },
      }),
      this.contactRepository.find({
        select: ['id', 'first_name', 'last_name'],
        order: { first_name: 'ASC', last_name: 'ASC' },
      }),
      this.accountsService.findAllForDropdown(),
      this.usersService.findAllForDropdown(),
    ]);

    // Transform leads to { id, name } format
    const leadsList = leads.map(lead => ({
      id: lead.id,
      name: `${lead.first_name} ${lead.last_name}`.trim(),
    }));

    // Transform contacts to { id, name } format
    const contactsList = contacts.map(contact => ({
      id: contact.id,
      name: `${contact.first_name} ${contact.last_name}`.trim(),
    }));

    // Accounts and users already have the correct format from dropdown methods
    // accounts: { id, name, accountNumber }[]
    // users: { id, name, email }[]

    return {
      leads: leadsList,
      contacts: contactsList,
      accounts: accounts, // Already matches SimpleAccount interface
      users: users, // Already matches SimpleUser interface
    };
  }
}