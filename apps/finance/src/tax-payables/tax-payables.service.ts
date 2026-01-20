import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Between } from 'typeorm';
import { TaxPayable, TaxType, TaxPayableStatus } from './entities/tax-payable.entity';
import { CreateTaxPayableDto } from './dto/create-tax-payable.dto';
import { UpdateTaxPayableDto } from './dto/update-tax-payable.dto';
import { TaxPayablePaginationDto } from './dto/pagination.dto';
import { PayTaxPayableDto } from './dto/pay-tax-payable.dto';
import { CalculateTaxDto } from './dto/calculate-tax.dto';
import { Account } from '../accounts/entities/account.entity';
import { AccountType } from '../accounts/entities/account.entity';
import { JournalEntriesService } from '../journal-entries/journal-entries.service';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';
import { PurchaseBill, PurchaseBillStatus } from '../purchase-bills/entities/purchase-bill.entity';

@Injectable()
export class TaxPayablesService {
  constructor(
    @InjectRepository(TaxPayable)
    private readonly taxPayableRepository: Repository<TaxPayable>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(PurchaseBill)
    private readonly purchaseBillRepository: Repository<PurchaseBill>,
    private readonly journalEntriesService: JournalEntriesService,
  ) {}

  async create(createDto: CreateTaxPayableDto): Promise<TaxPayable> {
    const organizationId = createDto.organization_id || null;

    // Check for duplicate tax payable for the same period and type
    const existing = await this.taxPayableRepository.findOne({
      where: {
        taxType: createDto.tax_type,
        taxPeriod: createDto.tax_period,
        organizationId: organizationId === null ? IsNull() : organizationId,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Tax payable for ${createDto.tax_type} period ${createDto.tax_period} already exists`,
      );
    }

    // Validate account
    const account = await this.accountRepository.findOne({
      where: { id: createDto.account_id },
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${createDto.account_id} not found`);
    }

    const dueDate = new Date(createDto.due_date);
    const now = new Date();

    // Determine status based on due date
    let status = TaxPayableStatus.PENDING;
    if (dueDate < now) {
      status = TaxPayableStatus.OVERDUE;
    }

    const taxPayable = this.taxPayableRepository.create({
      organizationId,
      taxType: createDto.tax_type,
      taxPeriod: createDto.tax_period,
      dueDate,
      amount: createDto.amount || 0,
      currency: createDto.currency || 'USD',
      status,
      accountId: createDto.account_id,
      paidAmount: 0,
    });

    return await this.taxPayableRepository.save(taxPayable);
  }

  async findAll(paginationDto: TaxPayablePaginationDto): Promise<TaxPayable[]> {
    const where: any = {};

    if (paginationDto.status) {
      where.status = paginationDto.status;
    }

    if (paginationDto.tax_type) {
      where.taxType = paginationDto.tax_type;
    }

    const queryBuilder = this.taxPayableRepository.createQueryBuilder('tax').where(where);

    if (paginationDto.sort) {
      let sortField = paginationDto.sort.trim();
      let sortOrder: 'ASC' | 'DESC' = 'ASC';

      if (sortField.startsWith('-')) {
        sortField = sortField.substring(1).trim();
        sortOrder = 'DESC';
      } else if (sortField.includes(':')) {
        const [field, order] = sortField.split(':');
        sortField = field.trim();
        sortOrder = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      }

      const mappedField = this.mapSortField(sortField);
      const validSortFields = ['taxType', 'taxPeriod', 'dueDate', 'amount', 'status', 'paidDate', 'createdAt', 'updatedAt'];
      if (validSortFields.includes(mappedField)) {
        queryBuilder.orderBy(`tax.${mappedField}`, sortOrder);
      } else {
        queryBuilder.orderBy('tax.createdAt', 'DESC');
      }
    } else {
      queryBuilder.orderBy('tax.createdAt', 'DESC');
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<TaxPayable> {
    const taxPayable = await this.taxPayableRepository.findOne({
      where: { id },
      relations: ['account', 'bankAccount'],
    });

    if (!taxPayable) {
      throw new NotFoundException(`Tax payable with ID ${id} not found`);
    }

    return taxPayable;
  }

  async update(id: string, updateDto: UpdateTaxPayableDto): Promise<TaxPayable> {
    const taxPayable = await this.findOne(id);

    if (taxPayable.status === TaxPayableStatus.PAID) {
      throw new BadRequestException('Cannot update a paid tax payable');
    }

    Object.assign(taxPayable, {
      ...(updateDto.tax_type && { taxType: updateDto.tax_type }),
      ...(updateDto.tax_period && { taxPeriod: updateDto.tax_period }),
      ...(updateDto.due_date && { dueDate: new Date(updateDto.due_date) }),
      ...(updateDto.amount !== undefined && { amount: updateDto.amount }),
      ...(updateDto.currency && { currency: updateDto.currency }),
      ...(updateDto.account_id && { accountId: updateDto.account_id }),
      ...(updateDto.status && { status: updateDto.status }),
      ...(updateDto.paid_date && { paidDate: new Date(updateDto.paid_date) }),
      ...(updateDto.paid_amount !== undefined && { paidAmount: updateDto.paid_amount }),
    });

    // Update status based on due date if not explicitly set
    if (!updateDto.status && updateDto.due_date) {
      const dueDate = new Date(updateDto.due_date);
      const now = new Date();
      if (dueDate < now && taxPayable.status === TaxPayableStatus.PENDING) {
        taxPayable.status = TaxPayableStatus.OVERDUE;
      }
    }

    return await this.taxPayableRepository.save(taxPayable);
  }

  async remove(id: string): Promise<void> {
    const taxPayable = await this.findOne(id);

    if (taxPayable.status === TaxPayableStatus.PAID) {
      throw new BadRequestException('Cannot delete a paid tax payable');
    }

    await this.taxPayableRepository.remove(taxPayable);
  }

  async pay(id: string, payDto: PayTaxPayableDto): Promise<TaxPayable> {
    const taxPayable = await this.findOne(id);

    if (taxPayable.status === TaxPayableStatus.PAID) {
      throw new BadRequestException('Tax payable is already paid');
    }

    const paymentAmount = payDto.payment_amount;
    const paymentDate = new Date(payDto.payment_date);

    if (paymentAmount > taxPayable.amount - taxPayable.paidAmount) {
      throw new BadRequestException('Payment amount exceeds remaining tax amount');
    }

    // Update tax payable
    taxPayable.paidAmount += paymentAmount;
    taxPayable.paidDate = paymentDate;
    taxPayable.bankAccountId = payDto.bank_account_id || null;

    if (taxPayable.paidAmount >= taxPayable.amount) {
      taxPayable.status = TaxPayableStatus.PAID;
    }

    const saved = await this.taxPayableRepository.save(taxPayable);

    // Create journal entry for payment
    if (payDto.bank_account_id && taxPayable.accountId) {
      try {
        const bankAccount = await this.accountRepository.findOne({
          where: { id: payDto.bank_account_id },
        });

        if (!bankAccount) {
          throw new BadRequestException('Bank account not found');
        }

        const journalEntry = await this.journalEntriesService.create({
          organization_id: taxPayable.organizationId || undefined,
          entry_number: `TAX-PAY-${taxPayable.taxType.toUpperCase()}-${taxPayable.taxPeriod}`,
          entry_date: payDto.payment_date,
          entry_type: 'manual' as any,
          description: `Tax Payment: ${taxPayable.taxType} for ${taxPayable.taxPeriod}`,
          reference: `TAX-PAY-${taxPayable.taxType.toUpperCase()}-${taxPayable.taxPeriod}`,
          lines: [
            {
              account_id: taxPayable.accountId,
              debit: 0,
              credit: paymentAmount,
              description: `Tax payment: ${taxPayable.taxType} for ${taxPayable.taxPeriod}`,
            },
            {
              account_id: payDto.bank_account_id,
              debit: paymentAmount,
              credit: 0,
              description: `Tax payment: ${taxPayable.taxType} for ${taxPayable.taxPeriod}`,
            },
          ],
        });

        saved.journalEntryId = journalEntry.id;
        await this.taxPayableRepository.save(saved);
      } catch (error) {
        console.error('Error creating journal entry for tax payment:', error);
        // Don't fail the payment if journal entry creation fails
      }
    }

    return saved;
  }

  async calculate(calculateDto: CalculateTaxDto): Promise<any> {
    const [year, month] = calculateDto.period.split('-').map(Number);
    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0, 23, 59, 59, 999);

    let sales = 0;
    let purchases = 0;
    let netTax = 0;

    if (calculateDto.tax_type === TaxType.VAT || calculateDto.tax_type === TaxType.SALES_TAX) {
      // Calculate from invoices (sales)
      const invoices = await this.invoiceRepository.find({
        where: {
          invoiceDate: Between(periodStart, periodEnd),
          status: InvoiceStatus.PAID,
        },
      });

      for (const invoice of invoices) {
        const invoiceTotal = parseFloat(invoice.totalAmount?.toString() || '0');
        const taxAmount = parseFloat(invoice.taxAmount?.toString() || '0');
        sales += invoiceTotal;
        
        if (calculateDto.tax_type === TaxType.VAT) {
          netTax += taxAmount;
        } else if (calculateDto.tax_type === TaxType.SALES_TAX) {
          // For sales tax, calculate based on tax rate if available
          netTax += taxAmount;
        }
      }

      // Calculate from purchase bills (purchases/input tax)
      const purchaseBills = await this.purchaseBillRepository.find({
        where: {
          billDate: Between(periodStart, periodEnd),
          status: PurchaseBillStatus.APPROVED,
        },
      });

      for (const bill of purchaseBills) {
        const billTotal = parseFloat(bill.totalAmount?.toString() || '0');
        const taxAmount = parseFloat(bill.taxAmount?.toString() || '0');
        purchases += billTotal;
        
        if (calculateDto.tax_type === TaxType.VAT) {
          // For VAT, subtract input tax from output tax
          netTax -= taxAmount;
        }
      }
    } else if (calculateDto.tax_type === TaxType.INCOME_TAX) {
      // For income tax, calculate from invoices (revenue)
      const invoices = await this.invoiceRepository.find({
        where: {
          invoiceDate: Between(periodStart, periodEnd),
          status: InvoiceStatus.PAID,
        },
      });

      for (const invoice of invoices) {
        const invoiceTotal = parseFloat(invoice.totalAmount?.toString() || '0');
        sales += invoiceTotal;
      }

      // Income tax calculation would typically use a tax rate
      // This is a simplified calculation - in practice, you'd apply tax brackets
      netTax = sales * 0.15; // Example: 15% income tax rate
    } else if (calculateDto.tax_type === TaxType.WITHHOLDING) {
      // For withholding tax, calculate from purchase bills
      const purchaseBills = await this.purchaseBillRepository.find({
        where: {
          billDate: Between(periodStart, periodEnd),
          status: PurchaseBillStatus.APPROVED,
        },
      });

      for (const bill of purchaseBills) {
        const billTotal = parseFloat(bill.totalAmount?.toString() || '0');
        purchases += billTotal;
        
        // Withholding tax is typically a percentage of the bill amount
        const withholdingRate = 0.05; // Example: 5% withholding rate
        netTax += billTotal * withholdingRate;
      }
    }

    return {
      tax_type: calculateDto.tax_type,
      period: calculateDto.period,
      calculated_amount: netTax,
      breakdown: {
        sales,
        purchases,
        net_tax: netTax,
      },
    };
  }

  private mapSortField(field: string): string {
    const fieldMap: { [key: string]: string } = {
      'tax_type': 'taxType',
      'tax_period': 'taxPeriod',
      'due_date': 'dueDate',
      'amount': 'amount',
      'paid_date': 'paidDate',
      'created_at': 'createdAt',
    };

    return fieldMap[field] || field;
  }
}

