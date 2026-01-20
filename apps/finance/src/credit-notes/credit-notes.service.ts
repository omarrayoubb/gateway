import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CreditNote, CreditNoteStatus, CreditNoteReason } from './entities/credit-note.entity';
import { CreditNoteItem } from './credit-note-items/entities/credit-note-item.entity';
import { CreateCreditNoteDto } from './dto/create-credit-note.dto';
import { UpdateCreditNoteDto } from './dto/update-credit-note.dto';
import { CreditNotePaginationDto } from './dto/pagination.dto';
import { ApplyCreditNoteDto } from './dto/apply-credit-note.dto';
import { Invoice } from '../invoices/entities/invoice.entity';

@Injectable()
export class CreditNotesService {
  constructor(
    @InjectRepository(CreditNote)
    private readonly creditNoteRepository: Repository<CreditNote>,
    @InjectRepository(CreditNoteItem)
    private readonly creditNoteItemRepository: Repository<CreditNoteItem>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async create(createCreditNoteDto: CreateCreditNoteDto): Promise<CreditNote> {
    try {
      // Validate required fields
      if (!createCreditNoteDto.customer_id) {
        throw new BadRequestException('customer_id is required');
      }
      if (!createCreditNoteDto.credit_date) {
        throw new BadRequestException('credit_date is required');
      }
      if (!createCreditNoteDto.reason) {
        throw new BadRequestException('reason is required');
      }
      if (!createCreditNoteDto.description) {
        throw new BadRequestException('description is required');
      }

      // organization_id is optional - can be null
      const organizationId = createCreditNoteDto.organization_id || null;

      // Generate credit note number if not provided
      let creditNoteNumber = createCreditNoteDto.credit_note_number;
      if (!creditNoteNumber) {
        creditNoteNumber = await this.generateCreditNoteNumber(organizationId);
      }

      // Check for duplicate credit note number
      const existingCreditNote = await this.creditNoteRepository.findOne({
        where: {
          creditNoteNumber: creditNoteNumber,
          organizationId: organizationId === null ? IsNull() : organizationId,
        },
      });
      if (existingCreditNote) {
        throw new ConflictException(`Credit note with number ${creditNoteNumber} already exists`);
      }

      // Verify invoice exists if provided
      if (createCreditNoteDto.invoice_id) {
        const invoice = await this.invoiceRepository.findOne({
          where: { id: createCreditNoteDto.invoice_id },
        });
        if (!invoice) {
          throw new NotFoundException(`Invoice with ID ${createCreditNoteDto.invoice_id} not found`);
        }
      }

      // Calculate total from items
      let totalAmount = 0;

      if (createCreditNoteDto.items && createCreditNoteDto.items.length > 0) {
        for (const itemDto of createCreditNoteDto.items) {
          const quantity = itemDto.quantity || 1;
          const unitPrice = itemDto.unit_price || 0;
          const itemAmount = quantity * unitPrice;
          totalAmount += itemAmount;
        }
      } else if (createCreditNoteDto.total_amount !== undefined) {
        totalAmount = createCreditNoteDto.total_amount;
      } else {
        throw new BadRequestException('Either items or total_amount must be provided');
      }

      const creditNote = this.creditNoteRepository.create({
        organizationId: organizationId,
        creditNoteNumber: creditNoteNumber,
        customerId: createCreditNoteDto.customer_id,
        customerName: createCreditNoteDto.customer_id, // Will be populated from CRM if needed
        invoiceId: createCreditNoteDto.invoice_id || null,
        creditDate: new Date(createCreditNoteDto.credit_date),
        reason: createCreditNoteDto.reason,
        status: createCreditNoteDto.status || CreditNoteStatus.DRAFT,
        totalAmount: totalAmount,
        appliedAmount: 0,
        balance: totalAmount,
        description: createCreditNoteDto.description,
      });

      const savedCreditNote = await this.creditNoteRepository.save(creditNote);

      // Create credit note items
      if (createCreditNoteDto.items && createCreditNoteDto.items.length > 0) {
        const items: CreditNoteItem[] = [];
        for (const itemDto of createCreditNoteDto.items) {
          const quantity = itemDto.quantity || 1;
          const unitPrice = itemDto.unit_price || 0;
          const itemAmount = quantity * unitPrice;

          const item = this.creditNoteItemRepository.create({
            creditNoteId: savedCreditNote.id,
            description: itemDto.description,
            quantity: quantity,
            unitPrice: unitPrice,
            amount: itemAmount,
          });

          items.push(item);
        }
        await this.creditNoteItemRepository.save(items);
      }

      return await this.findOne(savedCreditNote.id);
    } catch (error) {
      console.error('Error in CreditNotesService.create:', error);
      throw error;
    }
  }

  async findAll(query: CreditNotePaginationDto): Promise<CreditNote[]> {
    try {
      const queryBuilder = this.creditNoteRepository
        .createQueryBuilder('creditNote')
        .leftJoinAndSelect('creditNote.items', 'items');

      if (query.status) {
        queryBuilder.where('creditNote.status = :status', { status: query.status });
      }

      if (query.customer_id) {
        const whereCondition = query.status ? 'andWhere' : 'where';
        queryBuilder[whereCondition]('creditNote.customerId = :customerId', { customerId: query.customer_id });
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
            queryBuilder.orderBy(`creditNote.${entityField}`, sortOrder);
          } catch (error) {
            queryBuilder.orderBy('creditNote.createdDate', 'DESC');
          }
        } else {
          queryBuilder.orderBy('creditNote.createdDate', 'DESC');
        }
      } else {
        queryBuilder.orderBy('creditNote.createdDate', 'DESC');
      }

      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error in CreditNotesService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<CreditNote> {
    const creditNote = await this.creditNoteRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!creditNote) {
      throw new NotFoundException(`Credit note with ID ${id} not found`);
    }
    return creditNote;
  }

  async update(id: string, updateCreditNoteDto: UpdateCreditNoteDto): Promise<CreditNote> {
    const creditNote = await this.findOne(id);

    if (creditNote.status === CreditNoteStatus.APPLIED) {
      throw new BadRequestException('Cannot update an applied credit note');
    }

    if (creditNote.status === CreditNoteStatus.VOID) {
      throw new BadRequestException('Cannot update a void credit note');
    }

    // Update fields
    if (updateCreditNoteDto.customer_id !== undefined) creditNote.customerId = updateCreditNoteDto.customer_id;
    if (updateCreditNoteDto.invoice_id !== undefined) creditNote.invoiceId = updateCreditNoteDto.invoice_id;
    if (updateCreditNoteDto.credit_date !== undefined) creditNote.creditDate = new Date(updateCreditNoteDto.credit_date);
    if (updateCreditNoteDto.reason !== undefined) creditNote.reason = updateCreditNoteDto.reason;
    if (updateCreditNoteDto.description !== undefined) creditNote.description = updateCreditNoteDto.description;
    if (updateCreditNoteDto.status !== undefined) creditNote.status = updateCreditNoteDto.status;

    // If items are updated, recalculate total
    if (updateCreditNoteDto.items && updateCreditNoteDto.items.length > 0) {
      // Delete existing items
      await this.creditNoteItemRepository.delete({ creditNoteId: id });

      // Calculate new total
      let totalAmount = 0;
      const items: CreditNoteItem[] = [];

      for (const itemDto of updateCreditNoteDto.items) {
        const quantity = itemDto.quantity || 1;
        const unitPrice = itemDto.unit_price || 0;
        const itemAmount = quantity * unitPrice;
        totalAmount += itemAmount;

        const item = this.creditNoteItemRepository.create({
          creditNoteId: id,
          description: itemDto.description,
          quantity: quantity,
          unitPrice: unitPrice,
          amount: itemAmount,
        });

        items.push(item);
      }

      await this.creditNoteItemRepository.save(items);

      creditNote.totalAmount = totalAmount;
      creditNote.balance = totalAmount - creditNote.appliedAmount;
    } else if (updateCreditNoteDto.total_amount !== undefined) {
      creditNote.totalAmount = updateCreditNoteDto.total_amount;
      creditNote.balance = updateCreditNoteDto.total_amount - creditNote.appliedAmount;
    }

    return await this.creditNoteRepository.save(creditNote);
  }

  async apply(id: string, applyDto: ApplyCreditNoteDto): Promise<any> {
    const creditNote = await this.findOne(id);

    if (creditNote.status === CreditNoteStatus.VOID) {
      throw new BadRequestException('Cannot apply a void credit note');
    }

    if (creditNote.status === CreditNoteStatus.APPLIED && creditNote.balance <= 0) {
      throw new BadRequestException('Credit note is already fully applied');
    }

    // Verify invoice exists
    const invoice = await this.invoiceRepository.findOne({
      where: { id: applyDto.invoice_id },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${applyDto.invoice_id} not found`);
    }

    // Validate amount
    if (applyDto.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    if (applyDto.amount > creditNote.balance) {
      throw new BadRequestException(`Amount cannot exceed credit note balance of ${creditNote.balance}`);
    }

    // Apply credit note to invoice
    const newAppliedAmount = creditNote.appliedAmount + applyDto.amount;
    const newBalance = creditNote.totalAmount - newAppliedAmount;

    creditNote.appliedAmount = newAppliedAmount;
    creditNote.balance = newBalance;

    if (newBalance <= 0) {
      creditNote.status = CreditNoteStatus.APPLIED;
    } else if (creditNote.status === CreditNoteStatus.DRAFT) {
      creditNote.status = CreditNoteStatus.ISSUED;
    }

    await this.creditNoteRepository.save(creditNote);

    // Update invoice balance (reduce by credit note amount)
    invoice.balanceDue = Math.max(0, invoice.balanceDue - applyDto.amount);
    invoice.paidAmount = invoice.paidAmount + applyDto.amount;

    if (invoice.balanceDue <= 0) {
      invoice.status = 'paid' as any;
    } else if (invoice.status === 'draft' as any) {
      invoice.status = 'partial' as any;
    }

    await this.invoiceRepository.save(invoice);

    return {
      creditNote: creditNote,
      invoice: invoice,
      appliedAmount: applyDto.amount,
    };
  }

  async remove(id: string): Promise<void> {
    const creditNote = await this.findOne(id);

    if (creditNote.status === CreditNoteStatus.APPLIED) {
      throw new BadRequestException('Cannot delete an applied credit note');
    }

    await this.creditNoteRepository.remove(creditNote);
  }

  private async generateCreditNoteNumber(organizationId: string | null): Promise<string> {
    const prefix = 'CN';
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    const queryBuilder = this.creditNoteRepository
      .createQueryBuilder('creditNote')
      .where('creditNote.creditNoteNumber LIKE :pattern', { pattern: `${prefix}-${year}${month}-%` });

    if (organizationId) {
      queryBuilder.andWhere('creditNote.organizationId = :organizationId', { organizationId });
    } else {
      queryBuilder.andWhere('creditNote.organizationId IS NULL');
    }

    queryBuilder.orderBy('creditNote.creditNoteNumber', 'DESC').limit(1);

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

