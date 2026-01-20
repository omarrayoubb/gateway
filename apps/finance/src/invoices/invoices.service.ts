import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { InvoiceItem } from './invoice-items/entities/invoice-item.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoicePaginationDto } from './dto/pagination.dto';
import { SendInvoiceDto } from './dto/send-invoice.dto';
import { GeneralLedgerService } from '../general-ledger/general-ledger.service';
import { TransactionType } from '../general-ledger/entities/general-ledger.entity';
import { CustomerCreditsService } from '../customer-credits/customer-credits.service';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
    private readonly generalLedgerService: GeneralLedgerService,
    private readonly customerCreditsService: CustomerCreditsService,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    try {
      // Validate required fields
      if (!createInvoiceDto.customer_account_name) {
        throw new BadRequestException('customer_account_name is required');
      }
      if (!createInvoiceDto.invoice_date) {
        throw new BadRequestException('invoice_date is required');
      }

      const organizationId = createInvoiceDto.organization_id || null;
      const isProforma = createInvoiceDto.is_proforma || false;

      // Generate invoice number if not provided
      let invoiceNumber = createInvoiceDto.invoice_number;
      if (!invoiceNumber && !isProforma) {
        invoiceNumber = await this.generateInvoiceNumber(organizationId);
      }

      // Generate proforma number if not provided
      let proformaNumber = createInvoiceDto.proforma_number;
      if (!proformaNumber && isProforma) {
        proformaNumber = await this.generateProformaNumber(organizationId);
      }

      // Check for duplicate invoice numbers
      if (invoiceNumber) {
        const existingInvoice = await this.invoiceRepository.findOne({
          where: {
            invoiceNumber: invoiceNumber,
            organizationId: organizationId === null ? IsNull() : organizationId,
          },
        });
        if (existingInvoice) {
          throw new ConflictException(`Invoice with number ${invoiceNumber} already exists`);
        }
      }

      if (proformaNumber) {
        const existingProforma = await this.invoiceRepository.findOne({
          where: {
            proformaNumber: proformaNumber,
            organizationId: organizationId === null ? IsNull() : organizationId,
          },
        });
        if (existingProforma) {
          throw new ConflictException(`Proforma with number ${proformaNumber} already exists`);
        }
      }

      // Calculate totals from items
      let subtotal = 0;
      let taxAmount = 0;
      let totalAmount = 0;

      if (createInvoiceDto.items && createInvoiceDto.items.length > 0) {
        for (const itemDto of createInvoiceDto.items) {
          const quantity = itemDto.quantity || 1;
          const unitPrice = itemDto.unit_price || 0;
          const discountPercent = itemDto.discount_percent || 0;
          const itemTaxRate = itemDto.tax_rate || createInvoiceDto.tax_rate || 0;

          // Calculate item amount
          let itemAmount = quantity * unitPrice;

          // Apply discount
          const discountAmount = itemAmount * (discountPercent / 100);
          itemAmount = itemAmount - discountAmount;

          // Calculate tax
          const itemTaxAmount = itemAmount * (itemTaxRate / 100);

          subtotal += itemAmount;
          taxAmount += itemTaxAmount;
        }
      }

      totalAmount = subtotal + taxAmount;
      const balanceDue = totalAmount;

      const invoice = this.invoiceRepository.create({
        organizationId: organizationId,
        invoiceNumber: invoiceNumber,
        proformaNumber: proformaNumber,
        isProforma: isProforma,
        customerAccountId: createInvoiceDto.customer_account_id || null,
        customerAccountName: createInvoiceDto.customer_account_name,
        customerName: createInvoiceDto.customer_name || null,
        invoiceDate: new Date(createInvoiceDto.invoice_date),
        dueDate: createInvoiceDto.due_date ? new Date(createInvoiceDto.due_date) : null,
        status: createInvoiceDto.status || InvoiceStatus.DRAFT,
        currency: createInvoiceDto.currency || 'USD',
        subtotal: subtotal,
        taxAmount: taxAmount,
        totalAmount: totalAmount,
        paidAmount: 0,
        balanceDue: balanceDue,
        taxRate: createInvoiceDto.tax_rate || null,
        notes: createInvoiceDto.notes || null,
      });

      const savedInvoice = await this.invoiceRepository.save(invoice);

      // Create invoice items
      if (createInvoiceDto.items && createInvoiceDto.items.length > 0) {
        const items: InvoiceItem[] = [];
        for (let i = 0; i < createInvoiceDto.items.length; i++) {
          const itemDto = createInvoiceDto.items[i];
          const quantity = itemDto.quantity || 1;
          const unitPrice = itemDto.unit_price || 0;
          const discountPercent = itemDto.discount_percent || 0;
          const itemTaxRate = itemDto.tax_rate || createInvoiceDto.tax_rate || 0;

          // Calculate item amount
          let itemAmount = quantity * unitPrice;
          const discountAmount = itemAmount * (discountPercent / 100);
          itemAmount = itemAmount - discountAmount;
          const itemTaxAmount = itemAmount * (itemTaxRate / 100);

          const item = this.invoiceItemRepository.create({
            invoiceId: savedInvoice.id,
            description: itemDto.description,
            quantity: quantity,
            unitPrice: unitPrice,
            amount: itemAmount,
            taxRate: itemTaxRate,
            taxAmount: itemTaxAmount,
            discountPercent: discountPercent,
            discountAmount: discountAmount,
          });

          items.push(item);
        }
        await this.invoiceItemRepository.save(items);
      }

      // Auto-sync to customer credit when invoice is created
      if (savedInvoice.customerAccountId && savedInvoice.status !== InvoiceStatus.DRAFT) {
        try {
          await this.customerCreditsService.updateBalanceFromInvoice(
            savedInvoice.customerAccountId,
            savedInvoice.totalAmount,
          );
        } catch (error) {
          console.error('Error updating customer credit from invoice:', error);
          // Don't fail invoice creation if credit update fails
        }
      }

      return await this.findOne(savedInvoice.id);
    } catch (error) {
      console.error('Error in InvoicesService.create:', error);
      throw error;
    }
  }

  async findAll(query: InvoicePaginationDto): Promise<Invoice[]> {
    try {
      const queryBuilder = this.invoiceRepository
        .createQueryBuilder('invoice')
        .leftJoinAndSelect('invoice.items', 'items');

      let hasStatusFilter = false;
      if (query.status) {
        // Handle comma-separated status values (e.g., "draft,sent,partial")
        if (query.status.includes(',')) {
          const statuses = query.status.split(',').map(s => s.trim()).filter(s => s);
          if (statuses.length > 0) {
            queryBuilder.where('invoice.status IN (:...statuses)', { statuses });
            hasStatusFilter = true;
          }
        } else {
          queryBuilder.where('invoice.status = :status', { status: query.status });
          hasStatusFilter = true;
        }
      }

      if (query.customer_id) {
        const whereCondition = hasStatusFilter ? 'andWhere' : 'where';
        queryBuilder[whereCondition]('invoice.customerAccountId = :customerId', { customerId: query.customer_id });
      }

      if (query.is_proforma !== undefined) {
        const whereCondition = hasStatusFilter || query.customer_id ? 'andWhere' : 'where';
        queryBuilder[whereCondition]('invoice.isProforma = :isProforma', { isProforma: query.is_proforma });
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
          'invoice_date': 'invoiceDate',
          'due_date': 'dueDate',
          'invoice_number': 'invoiceNumber',
          'total_amount': 'totalAmount',
          'created_date': 'createdDate',
          'updated_at': 'updatedAt',
        };

        const entityField = fieldMap[sortField] || sortField;

        if (entityField && entityField.length > 0 && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(entityField)) {
          try {
            queryBuilder.orderBy(`invoice.${entityField}`, sortOrder);
          } catch (error) {
            queryBuilder.orderBy('invoice.createdDate', 'DESC');
          }
        } else {
          queryBuilder.orderBy('invoice.createdDate', 'DESC');
        }
      } else {
        queryBuilder.orderBy('invoice.createdDate', 'DESC');
      }

      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error in InvoicesService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.findOne(id);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot update a paid invoice');
    }

    // Update invoice fields
    if (updateInvoiceDto.customer_account_name !== undefined) invoice.customerAccountName = updateInvoiceDto.customer_account_name;
    if (updateInvoiceDto.customer_name !== undefined) invoice.customerName = updateInvoiceDto.customer_name;
    if (updateInvoiceDto.customer_account_id !== undefined) invoice.customerAccountId = updateInvoiceDto.customer_account_id;
    if (updateInvoiceDto.invoice_date !== undefined) invoice.invoiceDate = new Date(updateInvoiceDto.invoice_date);
    if (updateInvoiceDto.due_date !== undefined) invoice.dueDate = updateInvoiceDto.due_date ? new Date(updateInvoiceDto.due_date) : null;
    if (updateInvoiceDto.status !== undefined) invoice.status = updateInvoiceDto.status;
    if (updateInvoiceDto.currency !== undefined) invoice.currency = updateInvoiceDto.currency;
    if (updateInvoiceDto.tax_rate !== undefined) invoice.taxRate = updateInvoiceDto.tax_rate;
    if (updateInvoiceDto.notes !== undefined) invoice.notes = updateInvoiceDto.notes;

    // If items are updated, recalculate totals
    if (updateInvoiceDto.items && updateInvoiceDto.items.length > 0) {
      // Delete existing items
      await this.invoiceItemRepository.delete({ invoiceId: id });

      // Calculate new totals
      let subtotal = 0;
      let taxAmount = 0;

      const items: InvoiceItem[] = [];
      for (const itemDto of updateInvoiceDto.items) {
        const quantity = itemDto.quantity || 1;
        const unitPrice = itemDto.unit_price || 0;
        const discountPercent = itemDto.discount_percent || 0;
        const itemTaxRate = itemDto.tax_rate || updateInvoiceDto.tax_rate || invoice.taxRate || 0;

        let itemAmount = quantity * unitPrice;
        const discountAmount = itemAmount * (discountPercent / 100);
        itemAmount = itemAmount - discountAmount;
        const itemTaxAmount = itemAmount * (itemTaxRate / 100);

        subtotal += itemAmount;
        taxAmount += itemTaxAmount;

        const item = this.invoiceItemRepository.create({
          invoiceId: id,
          description: itemDto.description,
          quantity: quantity,
          unitPrice: unitPrice,
          amount: itemAmount,
          taxRate: itemTaxRate,
          taxAmount: itemTaxAmount,
          discountPercent: discountPercent,
          discountAmount: discountAmount,
        });

        items.push(item);
      }

      await this.invoiceItemRepository.save(items);

      invoice.subtotal = subtotal;
      invoice.taxAmount = taxAmount;
      invoice.totalAmount = subtotal + taxAmount;
      invoice.balanceDue = invoice.totalAmount - invoice.paidAmount;
    }

    return await this.invoiceRepository.save(invoice);
  }

  async send(id: string, sendDto: SendInvoiceDto, sentBy?: string): Promise<Invoice> {
    const invoice = await this.findOne(id);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot send a paid invoice');
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Cannot send a cancelled invoice');
    }

    // Update invoice status and sent information
    if (invoice.status === InvoiceStatus.DRAFT) {
      invoice.status = InvoiceStatus.SENT;
    }

    invoice.sentAt = new Date();
    invoice.sentBy = sentBy || null;

    // TODO: Implement actual email/print sending logic here
    // For now, we just update the status

    const savedInvoice = await this.invoiceRepository.save(invoice);

    // Auto-sync to customer credit when invoice is sent (status changes from DRAFT to SENT)
    if (savedInvoice.customerAccountId && savedInvoice.status === InvoiceStatus.SENT) {
      try {
        // Use customerAccountId as customerId (they should be the same)
        await this.customerCreditsService.updateBalanceFromInvoice(
          savedInvoice.customerAccountId,
          savedInvoice.totalAmount,
        );
      } catch (error) {
        console.error('Error updating customer credit from invoice send:', error);
        // Don't fail invoice send if credit update fails
      }
    }

    // Sync to general ledger when invoice is sent
    try {
      await this.generalLedgerService.syncInvoiceToLedger(
        savedInvoice.id,
        savedInvoice.invoiceDate,
        savedInvoice.totalAmount,
      );
    } catch (error) {
      console.error('Error syncing invoice to general ledger:', error);
      // Don't fail the send operation if ledger sync fails
    }

    return savedInvoice;
  }

  async convertProforma(id: string): Promise<Invoice> {
    const invoice = await this.findOne(id);

    if (!invoice.isProforma) {
      throw new BadRequestException('Invoice is not a proforma invoice');
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot convert a paid proforma');
    }

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber(invoice.organizationId);

    // Check for duplicate
    const existingInvoice = await this.invoiceRepository.findOne({
      where: {
        invoiceNumber: invoiceNumber,
        organizationId: invoice.organizationId === null ? IsNull() : invoice.organizationId,
      },
    });
    if (existingInvoice) {
      throw new ConflictException(`Invoice with number ${invoiceNumber} already exists`);
    }

    // Convert proforma to invoice
    invoice.isProforma = false;
    invoice.invoiceNumber = invoiceNumber;
    invoice.proformaNumber = invoice.proformaNumber; // Keep the proforma number for reference

    return await this.invoiceRepository.save(invoice);
  }

  async remove(id: string): Promise<void> {
    const invoice = await this.findOne(id);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot delete a paid invoice');
    }

    // Remove from general ledger if it was synced
    try {
      await this.generalLedgerService.removeTransactionFromLedger(id, TransactionType.INVOICE);
    } catch (error) {
      console.error('Error removing invoice from general ledger:', error);
      // Continue with deletion even if ledger removal fails
    }

    await this.invoiceRepository.remove(invoice);
  }

  private async generateInvoiceNumber(organizationId: string | null): Promise<string> {
    const prefix = 'INV';
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    // Find the last invoice number for this year/month
    const queryBuilder = this.invoiceRepository
      .createQueryBuilder('invoice')
      .where('invoice.invoiceNumber LIKE :pattern', { pattern: `${prefix}-${year}${month}-%` });

    if (organizationId) {
      queryBuilder.andWhere('invoice.organizationId = :organizationId', { organizationId });
    } else {
      queryBuilder.andWhere('invoice.organizationId IS NULL');
    }

    queryBuilder.orderBy('invoice.invoiceNumber', 'DESC').limit(1);

    const lastInvoice = await queryBuilder.getOne();

    let sequence = 1;
    if (lastInvoice && lastInvoice.invoiceNumber) {
      const parts = lastInvoice.invoiceNumber.split('-');
      if (parts.length === 3) {
        const lastSequence = parseInt(parts[2]);
        if (!isNaN(lastSequence)) {
          sequence = lastSequence + 1;
        }
      }
    }

    return `${prefix}-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }

  private async generateProformaNumber(organizationId: string | null): Promise<string> {
    const prefix = 'PRO';
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    const queryBuilder = this.invoiceRepository
      .createQueryBuilder('invoice')
      .where('invoice.proformaNumber LIKE :pattern', { pattern: `${prefix}-${year}${month}-%` });

    if (organizationId) {
      queryBuilder.andWhere('invoice.organizationId = :organizationId', { organizationId });
    } else {
      queryBuilder.andWhere('invoice.organizationId IS NULL');
    }

    queryBuilder.orderBy('invoice.proformaNumber', 'DESC').limit(1);

    const lastProforma = await queryBuilder.getOne();

    let sequence = 1;
    if (lastProforma && lastProforma.proformaNumber) {
      const parts = lastProforma.proformaNumber.split('-');
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

