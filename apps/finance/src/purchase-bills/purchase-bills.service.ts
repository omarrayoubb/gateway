import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { PurchaseBill, PurchaseBillStatus } from './entities/purchase-bill.entity';
import { PurchaseBillItem } from './purchase-bill-items/entities/purchase-bill-item.entity';
import { CreatePurchaseBillDto } from './dto/create-purchase-bill.dto';
import { UpdatePurchaseBillDto } from './dto/update-purchase-bill.dto';
import { PurchaseBillPaginationDto } from './dto/pagination.dto';
import { OrganizationsService } from '../organizations/organizations.service';
import { GeneralLedgerService } from '../general-ledger/general-ledger.service';
import { TransactionType } from '../general-ledger/entities/general-ledger.entity';

@Injectable()
export class PurchaseBillsService {
  constructor(
    @InjectRepository(PurchaseBill)
    private readonly purchaseBillRepository: Repository<PurchaseBill>,
    @InjectRepository(PurchaseBillItem)
    private readonly purchaseBillItemRepository: Repository<PurchaseBillItem>,
    private readonly organizationsService: OrganizationsService,
    private readonly generalLedgerService: GeneralLedgerService,
  ) {}

  async create(createPurchaseBillDto: CreatePurchaseBillDto): Promise<PurchaseBill> {
    try {
      // Validate required fields
      if (!createPurchaseBillDto.vendor_id) {
        throw new BadRequestException('vendor_id is required');
      }
      if (!createPurchaseBillDto.bill_date) {
        throw new BadRequestException('bill_date is required');
      }
      if (!createPurchaseBillDto.items || createPurchaseBillDto.items.length === 0) {
        throw new BadRequestException('items are required');
      }

      // Auto-fetch organization_id if not provided
      let organizationId: string | null = createPurchaseBillDto.organization_id || null;
      if (!organizationId) {
        const organizations = await this.organizationsService.findAll({});
        if (organizations && organizations.length > 0) {
          organizationId = organizations[0].id;
        }
      }

      // Generate bill number if not provided
      let billNumber = createPurchaseBillDto.bill_number;
      if (!billNumber) {
        billNumber = await this.generateBillNumber(organizationId);
      }

      // Check for duplicate bill numbers
      if (billNumber) {
        const existingBill = await this.purchaseBillRepository.findOne({
          where: {
            billNumber: billNumber,
            organizationId: organizationId === null ? IsNull() : organizationId,
          },
        });
        if (existingBill) {
          throw new ConflictException(`Purchase bill with number ${billNumber} already exists`);
        }
      }

      // Fetch vendor name from supply chain (if needed, can be passed from frontend)
      const vendorName = createPurchaseBillDto.vendor_id; // Will be updated when we integrate with supply chain

      // Calculate totals from items
      let subtotal = 0;
      let taxAmount = 0;
      let totalAmount = 0;

      const taxRate = createPurchaseBillDto.tax_rate || 0;

      for (const itemDto of createPurchaseBillDto.items) {
        const quantity = itemDto.quantity || 1;
        const unitPrice = itemDto.unit_price || 0;
        const itemAmount = quantity * unitPrice;
        const itemTaxAmount = itemAmount * (taxRate / 100);

        subtotal += itemAmount;
        taxAmount += itemTaxAmount;
      }

      totalAmount = subtotal + taxAmount;
      const balanceDue = totalAmount;

      const purchaseBill = this.purchaseBillRepository.create({
        organizationId: organizationId,
        billNumber: billNumber,
        vendorId: createPurchaseBillDto.vendor_id,
        vendorName: vendorName,
        billDate: new Date(createPurchaseBillDto.bill_date),
        dueDate: createPurchaseBillDto.due_date ? new Date(createPurchaseBillDto.due_date) : null,
        status: createPurchaseBillDto.status || PurchaseBillStatus.DRAFT,
        currency: createPurchaseBillDto.currency || 'USD',
        subtotal: subtotal,
        taxAmount: taxAmount,
        totalAmount: totalAmount,
        paidAmount: 0,
        balanceDue: balanceDue,
        taxRate: taxRate || null,
        notes: null,
        attachmentUrl: createPurchaseBillDto.attachment_url || null,
        attachmentName: createPurchaseBillDto.attachment_name || null,
      });

      const savedBill = await this.purchaseBillRepository.save(purchaseBill);

      // Create bill items
      const items: PurchaseBillItem[] = [];
      for (const itemDto of createPurchaseBillDto.items) {
        const quantity = itemDto.quantity || 1;
        const unitPrice = itemDto.unit_price || 0;
        const itemAmount = quantity * unitPrice;

        const item = this.purchaseBillItemRepository.create({
          purchaseBillId: savedBill.id,
          description: itemDto.description,
          quantity: quantity,
          unitPrice: unitPrice,
          amount: itemAmount,
          accountId: itemDto.account_id || null,
        });

        items.push(item);
      }
      await this.purchaseBillItemRepository.save(items);

      return await this.findOne(savedBill.id);
    } catch (error) {
      console.error('Error in PurchaseBillsService.create:', error);
      throw error;
    }
  }

  async findAll(query: PurchaseBillPaginationDto): Promise<PurchaseBill[]> {
    try {
      const queryBuilder = this.purchaseBillRepository
        .createQueryBuilder('purchaseBill')
        .leftJoinAndSelect('purchaseBill.items', 'items');

      let hasStatusFilter = false;
      if (query.status) {
        // Handle comma-separated status values (e.g., "pending,approved,overdue")
        if (query.status.includes(',')) {
          const statuses = query.status.split(',').map(s => s.trim()).filter(s => s);
          if (statuses.length > 0) {
            queryBuilder.where('purchaseBill.status IN (:...statuses)', { statuses });
            hasStatusFilter = true;
          }
        } else {
          queryBuilder.where('purchaseBill.status = :status', { status: query.status });
          hasStatusFilter = true;
        }
      }

      if (query.vendor_id) {
        const whereCondition = hasStatusFilter ? 'andWhere' : 'where';
        queryBuilder[whereCondition]('purchaseBill.vendorId = :vendorId', { vendorId: query.vendor_id });
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
          'bill_date': 'billDate',
          'due_date': 'dueDate',
          'bill_number': 'billNumber',
          'total_amount': 'totalAmount',
          'created_date': 'createdDate',
          'updated_at': 'updatedAt',
        };

        const entityField = fieldMap[sortField] || sortField;

        if (entityField && entityField.length > 0 && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(entityField)) {
          try {
            queryBuilder.orderBy(`purchaseBill.${entityField}`, sortOrder);
          } catch (error) {
            queryBuilder.orderBy('purchaseBill.createdDate', 'DESC');
          }
        } else {
          queryBuilder.orderBy('purchaseBill.createdDate', 'DESC');
        }
      } else {
        queryBuilder.orderBy('purchaseBill.createdDate', 'DESC');
      }

      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error in PurchaseBillsService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<PurchaseBill> {
    const bill = await this.purchaseBillRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!bill) {
      throw new NotFoundException(`Purchase bill with ID ${id} not found`);
    }
    return bill;
  }

  async update(id: string, updatePurchaseBillDto: UpdatePurchaseBillDto): Promise<PurchaseBill> {
    // Load bill without items relationship to avoid cascade save issues
    // We'll manually handle items if they need to be updated
    const bill = await this.purchaseBillRepository.findOne({
      where: { id },
      relations: [], // Don't load items to prevent cascade save issues
    });

    if (!bill) {
      throw new NotFoundException(`Purchase bill with ID ${id} not found`);
    }

    // Ensure bill ID is preserved
    if (bill.id !== id) {
      throw new BadRequestException('Purchase bill ID mismatch');
    }

    // Prevent updating approved or paid bills
    if (bill.status === PurchaseBillStatus.APPROVED || bill.status === PurchaseBillStatus.PAID) {
      throw new BadRequestException('Cannot update an approved or paid purchase bill');
    }

    console.log('Updating purchase bill:', {
      id: bill.id,
      hasAttachmentUrl: updatePurchaseBillDto.attachment_url !== undefined,
      hasAttachmentName: updatePurchaseBillDto.attachment_name !== undefined,
      hasItems: updatePurchaseBillDto.items !== undefined,
      itemsLength: updatePurchaseBillDto.items?.length || 0,
    });

    // Update bill fields
    if (updatePurchaseBillDto.vendor_id !== undefined) {
      bill.vendorId = updatePurchaseBillDto.vendor_id;
    }
    if (updatePurchaseBillDto.bill_date !== undefined) {
      bill.billDate = new Date(updatePurchaseBillDto.bill_date);
    }
    if (updatePurchaseBillDto.due_date !== undefined) {
      bill.dueDate = updatePurchaseBillDto.due_date ? new Date(updatePurchaseBillDto.due_date) : null;
    }
    if (updatePurchaseBillDto.status !== undefined) {
      bill.status = updatePurchaseBillDto.status;
    }
    if (updatePurchaseBillDto.currency !== undefined) {
      bill.currency = updatePurchaseBillDto.currency;
    }
    if (updatePurchaseBillDto.tax_rate !== undefined) {
      bill.taxRate = updatePurchaseBillDto.tax_rate;
    }
    if (updatePurchaseBillDto.notes !== undefined) {
      bill.notes = updatePurchaseBillDto.notes || null;
    }
    // Handle attachment_url - allow empty string to clear attachment
    if (updatePurchaseBillDto.attachment_url !== undefined) {
      bill.attachmentUrl = updatePurchaseBillDto.attachment_url && updatePurchaseBillDto.attachment_url.trim() !== '' 
        ? updatePurchaseBillDto.attachment_url 
        : null;
      console.log('Updating attachment_url:', bill.attachmentUrl);
    }
    // Handle attachment_name - allow empty string to clear attachment
    if (updatePurchaseBillDto.attachment_name !== undefined) {
      bill.attachmentName = updatePurchaseBillDto.attachment_name && updatePurchaseBillDto.attachment_name.trim() !== '' 
        ? updatePurchaseBillDto.attachment_name 
        : null;
      console.log('Updating attachment_name:', bill.attachmentName);
    }

    // If items are explicitly provided and not empty, update them
    // Only update items if the array is provided AND has items
    // If items is undefined or empty array, don't touch existing items
    const itemsProvided = updatePurchaseBillDto.items !== undefined;
    const itemsIsArray = itemsProvided && Array.isArray(updatePurchaseBillDto.items);
    const itemsLength = itemsIsArray && updatePurchaseBillDto.items ? updatePurchaseBillDto.items.length : 0;
    const shouldUpdateItems = itemsProvided && itemsIsArray && itemsLength > 0;
    
    console.log('Should update items?', {
      shouldUpdateItems,
      itemsProvided,
      itemsIsArray,
      itemsLength,
      itemsValue: updatePurchaseBillDto.items,
    });
    
    // CRITICAL: If items is provided but empty, explicitly set to undefined to prevent any processing
    if (itemsProvided && (!itemsIsArray || itemsLength === 0)) {
      console.log('Items provided but empty - setting to undefined to prevent processing');
      // Don't modify the DTO, just ensure we don't process items
    }
    
    if (shouldUpdateItems) {
      if (!bill.id) {
        throw new BadRequestException('Purchase bill ID is required to update items');
      }

      const billId = bill.id; // Store in variable to ensure it's not lost
      console.log('Updating purchase bill items for bill ID:', billId);

      // Delete existing items
      await this.purchaseBillItemRepository.delete({ purchaseBillId: billId });

      // Calculate totals from new items
      let subtotal = 0;
      let taxAmount = 0;
      const taxRate = updatePurchaseBillDto.tax_rate !== undefined ? updatePurchaseBillDto.tax_rate : (bill.taxRate || 0);

      // Create new items
      const items: PurchaseBillItem[] = [];
      if (!updatePurchaseBillDto.items || updatePurchaseBillDto.items.length === 0) {
        throw new BadRequestException('Items array is required and cannot be empty when updating items');
      }
      for (const itemDto of updatePurchaseBillDto.items) {
        const quantity = itemDto.quantity || 1;
        const unitPrice = itemDto.unit_price || 0;
        const itemAmount = quantity * unitPrice;
        const itemTaxAmount = itemAmount * (taxRate / 100);

        subtotal += itemAmount;
        taxAmount += itemTaxAmount;

        // Create item with explicit purchaseBillId
        const item = new PurchaseBillItem();
        item.purchaseBillId = billId;
        item.description = itemDto.description || '';
        item.quantity = quantity;
        item.unitPrice = unitPrice;
        item.amount = itemAmount;
        item.accountId = itemDto.account_id || null;
        
        // Verify purchaseBillId is set
        if (!item.purchaseBillId) {
          console.error('ERROR: purchaseBillId is null for item:', item);
          throw new BadRequestException(`Failed to set purchaseBillId for item. Bill ID: ${billId}`);
        }
        
        items.push(item);
      }

      // Final safety check - don't save if no items or billId is invalid
      if (items.length === 0) {
        console.log('No items to save, skipping item save');
      } else if (!billId) {
        console.error('ERROR: Cannot save items - billId is null/undefined');
        throw new BadRequestException('Purchase bill ID is required to save items');
      } else {
        console.log(`Saving ${items.length} items for bill ID: ${billId}`);
        // Verify all items have purchaseBillId before saving
        for (const item of items) {
          if (!item.purchaseBillId) {
            console.error('ERROR: Item missing purchaseBillId:', item);
            throw new BadRequestException(`Item is missing purchaseBillId. Bill ID: ${billId}`);
          }
        }
        await this.purchaseBillItemRepository.save(items);
      }

      const totalAmount = subtotal + taxAmount;
      bill.subtotal = subtotal;
      bill.taxAmount = taxAmount;
      bill.totalAmount = totalAmount;
      bill.balanceDue = totalAmount - bill.paidAmount;
      bill.taxRate = taxRate;
    } else if (updatePurchaseBillDto.tax_rate !== undefined) {
      // Recalculate totals with new tax rate if items haven't changed
      // Load existing items separately since we didn't load them with the bill
      const existingItems = await this.purchaseBillItemRepository.find({
        where: { purchaseBillId: bill.id },
      });
      
      const taxRate = updatePurchaseBillDto.tax_rate;
      let subtotal = 0;
      let taxAmount = 0;

      for (const item of existingItems) {
        const itemAmount = (item.quantity || 1) * (item.unitPrice || 0);
        subtotal += itemAmount;
        taxAmount += itemAmount * (taxRate / 100);
      }

      const totalAmount = subtotal + taxAmount;
      bill.subtotal = subtotal;
      bill.taxAmount = taxAmount;
      bill.totalAmount = totalAmount;
      bill.balanceDue = totalAmount - bill.paidAmount;
      bill.taxRate = taxRate;
    }

    // Ensure bill ID is preserved before saving
    if (!bill.id || bill.id !== id) {
      console.error('ERROR: Bill ID mismatch or null:', { billId: bill.id, expectedId: id });
      throw new BadRequestException(`Invalid bill ID. Expected: ${id}, Got: ${bill.id}`);
    }
    
    bill.id = id;
    
    console.log('Saving purchase bill with attachments:', {
      id: bill.id,
      attachmentUrl: bill.attachmentUrl,
      attachmentName: bill.attachmentName,
      hasItems: updatePurchaseBillDto.items !== undefined,
      itemsLength: updatePurchaseBillDto.items?.length || 0,
    });

    // Final check: ensure we're not accidentally trying to save items
    if (updatePurchaseBillDto.items !== undefined && !shouldUpdateItems) {
      console.log('Items provided but shouldUpdateItems is false - this is correct, items will not be updated');
    }

    // CRITICAL: Clear items from bill object to prevent cascade save
    // The @OneToMany relationship has cascade: true, which means TypeORM will try to save
    // any items in bill.items when we save the bill. If items don't have purchase_bill_id,
    // this will cause the null constraint error. We only want to save items if we explicitly
    // updated them above using purchaseBillItemRepository.save().
    delete (bill as any).items;
    
    const savedBill = await this.purchaseBillRepository.save(bill);
    
    console.log('Purchase bill saved successfully:', {
      id: savedBill.id,
      attachmentUrl: savedBill.attachmentUrl,
      attachmentName: savedBill.attachmentName,
    });

    return savedBill;
  }

  async approve(id: string, approvedBy: string, notes?: string): Promise<PurchaseBill> {
    const bill = await this.findOne(id);

    if (bill.status === PurchaseBillStatus.APPROVED) {
      throw new BadRequestException('Purchase bill is already approved');
    }

    if (bill.status === PurchaseBillStatus.PAID) {
      throw new BadRequestException('Cannot approve a paid purchase bill');
    }

    bill.status = PurchaseBillStatus.APPROVED;
    bill.approvedBy = approvedBy;
    bill.approvedAt = new Date();
    if (notes) {
      bill.notes = notes;
    }

    return await this.purchaseBillRepository.save(bill);
  }

  async post(id: string): Promise<{ success: boolean; journal_entry_id: string }> {
    const bill = await this.findOne(id);

    if (bill.status !== PurchaseBillStatus.APPROVED) {
      throw new BadRequestException('Purchase bill must be approved before posting');
    }

    if (bill.journalEntryId) {
      throw new BadRequestException('Purchase bill is already posted');
    }

    // TODO: Create journal entry
    // For now, we'll just mark it as posted
    const journalEntryId = 'temp-' + bill.id; // Placeholder

    bill.journalEntryId = journalEntryId;
    bill.postedAt = new Date();
    await this.purchaseBillRepository.save(bill);

    // Sync to general ledger when bill is posted
    try {
      const items = bill.items || [];
      const billItems = items.map(item => ({
        accountId: item.accountId,
        amount: item.amount || 0,
      }));
      await this.generalLedgerService.syncPurchaseBillToLedger(
        bill.id,
        bill.billDate,
        billItems,
      );
    } catch (error) {
      console.error('Error syncing purchase bill to general ledger:', error);
      // Don't fail the post operation if ledger sync fails
    }

    return {
      success: true,
      journal_entry_id: journalEntryId,
    };
  }

  async remove(id: string): Promise<void> {
    const bill = await this.findOne(id);

    if (bill.status === PurchaseBillStatus.PAID) {
      throw new BadRequestException('Cannot delete a paid purchase bill');
    }

    // Remove from general ledger if it was synced
    try {
      await this.generalLedgerService.removeTransactionFromLedger(id, TransactionType.BILL);
    } catch (error) {
      console.error('Error removing purchase bill from general ledger:', error);
      // Continue with deletion even if ledger removal fails
    }

    await this.purchaseBillRepository.remove(bill);
  }

  private async generateBillNumber(organizationId: string | null): Promise<string> {
    const prefix = 'PB';
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    // Find the last bill number for this year/month
    const queryBuilder = this.purchaseBillRepository
      .createQueryBuilder('purchaseBill')
      .where('purchaseBill.billNumber LIKE :pattern', { pattern: `${prefix}-${year}${month}-%` });

    if (organizationId) {
      queryBuilder.andWhere('purchaseBill.organizationId = :organizationId', { organizationId });
    } else {
      queryBuilder.andWhere('purchaseBill.organizationId IS NULL');
    }

    queryBuilder.orderBy('purchaseBill.billNumber', 'DESC').limit(1);

    const lastBill = await queryBuilder.getOne();

    let sequence = 1;
    if (lastBill && lastBill.billNumber) {
      const parts = lastBill.billNumber.split('-');
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

