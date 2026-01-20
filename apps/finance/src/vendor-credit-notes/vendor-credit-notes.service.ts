import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { VendorCreditNote, VendorCreditNoteStatus, VendorCreditNoteReason } from './entities/vendor-credit-note.entity';
import { VendorCreditNoteItem } from './vendor-credit-note-items/entities/vendor-credit-note-item.entity';
import { CreateVendorCreditNoteDto } from './dto/create-vendor-credit-note.dto';
import { VendorCreditNotePaginationDto } from './dto/pagination.dto';
import { PurchaseBill } from '../purchase-bills/entities/purchase-bill.entity';
import { OrganizationsService } from '../organizations/organizations.service';

@Injectable()
export class VendorCreditNotesService {
  constructor(
    @InjectRepository(VendorCreditNote)
    private readonly vendorCreditNoteRepository: Repository<VendorCreditNote>,
    @InjectRepository(VendorCreditNoteItem)
    private readonly vendorCreditNoteItemRepository: Repository<VendorCreditNoteItem>,
    @InjectRepository(PurchaseBill)
    private readonly purchaseBillRepository: Repository<PurchaseBill>,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async create(createVendorCreditNoteDto: CreateVendorCreditNoteDto): Promise<VendorCreditNote> {
    try {
      // Validate required fields
      if (!createVendorCreditNoteDto.vendor_id) {
        throw new BadRequestException('vendor_id is required');
      }
      if (!createVendorCreditNoteDto.credit_date) {
        throw new BadRequestException('credit_date is required');
      }
      if (!createVendorCreditNoteDto.reason) {
        throw new BadRequestException('reason is required');
      }
      if (!createVendorCreditNoteDto.description) {
        throw new BadRequestException('description is required');
      }

      // Auto-fetch organization_id if not provided
      let organizationId: string | null = createVendorCreditNoteDto.organization_id || null;
      if (!organizationId) {
        const organizations = await this.organizationsService.findAll({});
        if (organizations && organizations.length > 0) {
          organizationId = organizations[0].id;
        }
      }

      // Generate credit note number if not provided
      let creditNoteNumber = createVendorCreditNoteDto.credit_note_number;
      if (!creditNoteNumber) {
        creditNoteNumber = await this.generateCreditNoteNumber(organizationId);
      }

      // Check for duplicate credit note number
      const existingCreditNote = await this.vendorCreditNoteRepository.findOne({
        where: {
          creditNoteNumber: creditNoteNumber,
          organizationId: organizationId === null ? IsNull() : organizationId,
        },
      });
      if (existingCreditNote) {
        throw new ConflictException(`Vendor credit note with number ${creditNoteNumber} already exists`);
      }

      // Verify purchase bill exists if provided
      if (createVendorCreditNoteDto.bill_id) {
        const bill = await this.purchaseBillRepository.findOne({
          where: { id: createVendorCreditNoteDto.bill_id },
        });
        if (!bill) {
          throw new NotFoundException(`Purchase bill with ID ${createVendorCreditNoteDto.bill_id} not found`);
        }
      }

      // Calculate total from items
      let totalAmount = 0;

      if (createVendorCreditNoteDto.items && createVendorCreditNoteDto.items.length > 0) {
        for (const itemDto of createVendorCreditNoteDto.items) {
          const quantity = itemDto.quantity || 1;
          const unitPrice = itemDto.unit_price || 0;
          const itemAmount = itemDto.amount || (quantity * unitPrice);
          totalAmount += itemAmount;
        }
      } else if (createVendorCreditNoteDto.total_amount !== undefined) {
        totalAmount = createVendorCreditNoteDto.total_amount;
      } else {
        throw new BadRequestException('Either items or total_amount must be provided');
      }

      const vendorCreditNote = this.vendorCreditNoteRepository.create({
        organizationId: organizationId,
        creditNoteNumber: creditNoteNumber,
        vendorId: createVendorCreditNoteDto.vendor_id,
        vendorName: createVendorCreditNoteDto.vendor_id, // Will be populated from supply chain if needed
        billId: createVendorCreditNoteDto.bill_id || null,
        creditDate: new Date(createVendorCreditNoteDto.credit_date),
        reason: createVendorCreditNoteDto.reason,
        status: createVendorCreditNoteDto.status || VendorCreditNoteStatus.DRAFT,
        totalAmount: totalAmount,
        appliedAmount: 0,
        balance: totalAmount,
        description: createVendorCreditNoteDto.description,
      });

      const savedCreditNote = await this.vendorCreditNoteRepository.save(vendorCreditNote);

      // Create credit note items
      if (createVendorCreditNoteDto.items && createVendorCreditNoteDto.items.length > 0) {
        const items: VendorCreditNoteItem[] = [];
        for (const itemDto of createVendorCreditNoteDto.items) {
          const quantity = itemDto.quantity || 1;
          const unitPrice = itemDto.unit_price || 0;
          const itemAmount = itemDto.amount || (quantity * unitPrice);

          const item = this.vendorCreditNoteItemRepository.create({
            vendorCreditNoteId: savedCreditNote.id,
            description: itemDto.description,
            quantity: quantity,
            unitPrice: unitPrice,
            amount: itemAmount,
          });

          items.push(item);
        }
        await this.vendorCreditNoteItemRepository.save(items);
      }

      return await this.findOne(savedCreditNote.id);
    } catch (error) {
      console.error('Error in VendorCreditNotesService.create:', error);
      throw error;
    }
  }

  async findAll(query: VendorCreditNotePaginationDto): Promise<VendorCreditNote[]> {
    try {
      const queryBuilder = this.vendorCreditNoteRepository
        .createQueryBuilder('vendorCreditNote')
        .leftJoinAndSelect('vendorCreditNote.items', 'items');

      if (query.status) {
        queryBuilder.where('vendorCreditNote.status = :status', { status: query.status });
      }

      if (query.vendor_id) {
        const whereCondition = query.status ? 'andWhere' : 'where';
        queryBuilder[whereCondition]('vendorCreditNote.vendorId = :vendorId', { vendorId: query.vendor_id });
      }

      // Apply sorting
      if (query.sort) {
        let sortField = query.sort.trim();
        let sortOrder: 'ASC' | 'DESC' = 'ASC';

        if (sortField.startsWith('-')) {
          sortField = sortField.substring(1).trim();
          sortOrder = 'DESC';
        } else if (sortField.includes(':')) {
          const [field, order] = sortField.split(':');
          sortField = field.trim();
          sortOrder = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        }

        const fieldMap: { [key: string]: string } = {
          'credit_date': 'creditDate',
          'credit_note_number': 'creditNoteNumber',
          'total_amount': 'totalAmount',
          'created_date': 'createdDate',
          'updated_at': 'updatedAt',
        };

        const entityField = fieldMap[sortField] || sortField;

        if (entityField && entityField.length > 0 && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(entityField)) {
          try {
            queryBuilder.orderBy(`vendorCreditNote.${entityField}`, sortOrder);
          } catch (error) {
            queryBuilder.orderBy('vendorCreditNote.createdDate', 'DESC');
          }
        } else {
          queryBuilder.orderBy('vendorCreditNote.createdDate', 'DESC');
        }
      } else {
        queryBuilder.orderBy('vendorCreditNote.createdDate', 'DESC');
      }

      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error in VendorCreditNotesService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<VendorCreditNote> {
    const creditNote = await this.vendorCreditNoteRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!creditNote) {
      throw new NotFoundException(`Vendor credit note with ID ${id} not found`);
    }
    return creditNote;
  }

  async apply(id: string, billId: string, amount: number): Promise<VendorCreditNote> {
    const creditNote = await this.findOne(id);
    const bill = await this.purchaseBillRepository.findOne({ where: { id: billId } });

    if (!bill) {
      throw new NotFoundException(`Purchase bill with ID ${billId} not found`);
    }

    if (creditNote.status === VendorCreditNoteStatus.VOID) {
      throw new BadRequestException('Cannot apply a voided credit note');
    }

    if (creditNote.status === VendorCreditNoteStatus.APPLIED && creditNote.balance <= 0) {
      throw new BadRequestException('Credit note is already fully applied');
    }

    if (amount > creditNote.balance) {
      throw new BadRequestException(`Amount ${amount} exceeds available balance ${creditNote.balance}`);
    }

    // Update credit note
    creditNote.appliedAmount += amount;
    creditNote.balance -= amount;
    if (creditNote.balance <= 0) {
      creditNote.status = VendorCreditNoteStatus.APPLIED;
    } else {
      creditNote.status = VendorCreditNoteStatus.ISSUED;
    }
    creditNote.billId = billId;

    // Update purchase bill balance
    bill.balanceDue = Math.max(0, bill.balanceDue - amount);
    bill.paidAmount += amount;
    if (bill.balanceDue <= 0) {
      bill.status = 'paid' as any;
    }

    await this.vendorCreditNoteRepository.save(creditNote);
    await this.purchaseBillRepository.save(bill);

    return await this.findOne(id);
  }

  private async generateCreditNoteNumber(organizationId: string | null): Promise<string> {
    const prefix = 'VCN';
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    const queryBuilder = this.vendorCreditNoteRepository
      .createQueryBuilder('vendorCreditNote')
      .where('vendorCreditNote.creditNoteNumber LIKE :pattern', { pattern: `${prefix}-${year}${month}-%` });

    if (organizationId) {
      queryBuilder.andWhere('vendorCreditNote.organizationId = :organizationId', { organizationId });
    } else {
      queryBuilder.andWhere('vendorCreditNote.organizationId IS NULL');
    }

    queryBuilder.orderBy('vendorCreditNote.creditNoteNumber', 'DESC').limit(1);

    const lastCreditNote = await queryBuilder.getOne();

    let sequence = 1;
    if (lastCreditNote && lastCreditNote.creditNoteNumber) {
      const parts = lastCreditNote.creditNoteNumber.split('-');
      if (parts.length === 3) {
        const lastSequence = parseInt(parts[2]);
        if (!isNaN(lastSequence)) {
          sequence = lastSequence + 1;
        }
      }
    }

    return `${prefix}-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }
}

