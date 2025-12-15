import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountsService } from '../accounts/accounts.service';
import { ContactsService } from '../contacts/contacts.service';
import { ProfilesService } from '../profiles/profiles.service';
import { RolesService } from '../roles/roles.service';
import { 
  AccountOrchestratorResponse, 
  ContactLeadOrchestratorResponse,
  RegisterFormOrchestratorResponse,
  DealFormOrchestratorResponse,
  ActivityFormOrchestratorResponse 
} from './dto/orchestrator-response.dto';
import { ContactResponseDto } from '../contacts/dto/contact-response.dto';
import { CreateContactDto } from '../contacts/dto/create-contact.dto';
import { User } from '../users/entities/user.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Contact } from '../contacts/entities/contacts.entity';

@Injectable()
export class OrchestratorService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly contactsService: ContactsService,
    private readonly profilesService: ProfilesService,
    private readonly rolesService: RolesService,
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Returns options needed for the Account Creation form.
   * Needs: List of Users (for Owner)
   */
  async getAccountFormOptions(): Promise<AccountOrchestratorResponse> {
    const users = await this.userRepository.find({
      select: ['id', 'name', 'email'],
      order: { name: 'ASC' },
    });
    return {
      owners: users.map(u => ({ id: u.id, name: u.name, email: u.email || '' })),
    };
  }

  /**
   * Returns options needed for the Contact/Lead Creation forms (shared).
   * Needs: List of Users (Owner) AND List of Accounts (Linked Account)
   */
  async getContactLeadFormOptions(): Promise<ContactLeadOrchestratorResponse> {
    const [users, accounts] = await Promise.all([
      this.userRepository.find({
        select: ['id', 'name', 'email'],
        order: { name: 'ASC' },
      }),
      this.accountsService.findAllForDropdown(),
    ]);

    return {
      owners: users.map(u => ({ id: u.id, name: u.name, email: u.email || '' })),
      accounts: accounts.map(a => ({ id: a.id, name: a.name, accountNumber: a.accountNumber })),
    };
  }

  /**
   * Converts a lead to a contact by removing the lead and inserting all its data into contacts table.
   */
  async convertLeadToContact(leadId: string, currentUser: { id: string; name: string; email: string }): Promise<ContactResponseDto> {
    // Get the lead with all its data
    const lead = await this.leadRepository.findOne({
      where: { id: leadId },
      relations: ['owner', 'account'],
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${leadId} not found`);
    }

    // Fetch the full user from database
    const user = await this.userRepository.findOne({
      where: { id: currentUser.id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${currentUser.id} not found`);
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

    // Create the contact using ContactsService (it will check for email conflicts)
    const contact = await this.contactsService.create(createContactDto, user as Omit<User, 'password'>);

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
    const pagination = { page: 1, limit: 1000 };
    const [profilesResult, rolesResult] = await Promise.all([
      this.profilesService.findAll(pagination),
      this.rolesService.findAll(),
    ]);

    // Extract profiles with only id and name
    const profilesList = (profilesResult?.data || []).map(p => ({
      id: p.id,
      name: p.name,
    }));

    // Extract roles with only id and name (flatten the nested structure)
    const flattenRoles = (roles: any[]): Array<{ id: string; name: string }> => {
      if (!roles || !Array.isArray(roles)) {
        return [];
      }
      const result: Array<{ id: string; name: string }> = [];
      for (const role of roles) {
        if (role && role.id && role.name) {
          result.push({ id: role.id, name: role.name });
          if (role.children && Array.isArray(role.children) && role.children.length > 0) {
            result.push(...flattenRoles(role.children));
          }
        }
      }
      return result;
    };

    const rolesList = flattenRoles(rolesResult || []);

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
      this.userRepository.find({
        select: ['id', 'name', 'email'],
        order: { name: 'ASC' },
      }),
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

    // Transform users to { id, name, email } format
    const usersList = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email || '',
    }));

    return {
      leads: leadsList,
      contacts: contactsList,
      accounts: accounts, // Already matches SimpleAccount interface
      users: usersList, // Matches SimpleUser interface
    };
  }

  /**
   * Returns options needed for the Activity Creation form.
   * Needs: List of Leads (id and name) and Contacts (id and name)
   */
  async getActivityFormOptions(): Promise<ActivityFormOrchestratorResponse> {
    const [leads, contacts] = await Promise.all([
      this.leadRepository.find({
        select: ['id', 'first_name', 'last_name'],
        order: { first_name: 'ASC', last_name: 'ASC' },
      }),
      this.contactRepository.find({
        select: ['id', 'first_name', 'last_name'],
        order: { first_name: 'ASC', last_name: 'ASC' },
      }),
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

    return {
      leads: leadsList,
      contacts: contactsList,
    };
  }
}