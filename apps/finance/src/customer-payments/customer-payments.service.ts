import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, MoreThan } from 'typeorm';
import { CustomerPayment, PaymentStatus, PaymentMethod } from './entities/customer-payment.entity';
import { CustomerPaymentAllocation } from './payment-allocations/entities/payment-allocation.entity';
import { CreateCustomerPaymentDto } from './dto/create-customer-payment.dto';
import { UpdateCustomerPaymentDto } from './dto/update-customer-payment.dto';
import { CustomerPaymentPaginationDto } from './dto/pagination.dto';
import { AllocatePaymentDto } from './dto/allocate-payment.dto';
import { Invoice } from '../invoices/entities/invoice.entity';
import { GeneralLedgerService } from '../general-ledger/general-ledger.service';
import { TransactionType } from '../general-ledger/entities/general-ledger.entity';
import { CustomerCreditsService } from '../customer-credits/customer-credits.service';

@Injectable()
export class CustomerPaymentsService {
  constructor(
    @InjectRepository(CustomerPayment)
    private readonly customerPaymentRepository: Repository<CustomerPayment>,
    @InjectRepository(CustomerPaymentAllocation)
    private readonly paymentAllocationRepository: Repository<CustomerPaymentAllocation>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    private readonly generalLedgerService: GeneralLedgerService,
    private readonly customerCreditsService: CustomerCreditsService,
  ) {}

  async create(createPaymentDto: CreateCustomerPaymentDto): Promise<CustomerPayment> {
    try {
      // Validate required fields
      if (!createPaymentDto.customer_id) {
        throw new BadRequestException('customer_id is required');
      }
      if (!createPaymentDto.payment_date) {
        throw new BadRequestException('payment_date is required');
      }
      if (!createPaymentDto.payment_method) {
        throw new BadRequestException('payment_method is required');
      }
      if (!createPaymentDto.amount || createPaymentDto.amount <= 0) {
        throw new BadRequestException('amount is required and must be greater than 0');
      }

      const organizationId = createPaymentDto.organization_id || null;

      // Generate payment number if not provided
      let paymentNumber = createPaymentDto.payment_number;
      if (!paymentNumber) {
        paymentNumber = await this.generatePaymentNumber(organizationId);
      }

      // Check for duplicate payment number
      const existingPayment = await this.customerPaymentRepository.findOne({
        where: {
          paymentNumber: paymentNumber,
          organizationId: organizationId === null ? IsNull() : organizationId,
        },
      });
      if (existingPayment) {
        throw new ConflictException(`Payment with number ${paymentNumber} already exists`);
      }

      // Validate allocations if provided
      let allocatedAmount = 0;
      if (createPaymentDto.allocations && createPaymentDto.allocations.length > 0) {
        for (const allocation of createPaymentDto.allocations) {
          // Verify invoice exists
          const invoice = await this.invoiceRepository.findOne({
            where: { id: allocation.invoice_id },
          });
          if (!invoice) {
            throw new NotFoundException(`Invoice with ID ${allocation.invoice_id} not found`);
          }

          if (allocation.amount <= 0) {
            throw new BadRequestException('Allocation amount must be greater than 0');
          }

          allocatedAmount += allocation.amount;
        }

        if (allocatedAmount > createPaymentDto.amount) {
          throw new BadRequestException('Total allocation amount cannot exceed payment amount');
        }
      }

      const unallocatedAmount = createPaymentDto.amount - allocatedAmount;
      const status = allocatedAmount > 0
        ? (unallocatedAmount > 0 ? PaymentStatus.PENDING : PaymentStatus.ALLOCATED)
        : PaymentStatus.UNALLOCATED;

      const payment = this.customerPaymentRepository.create({
        organizationId: organizationId,
        paymentNumber: paymentNumber,
        customerId: createPaymentDto.customer_id,
        customerName: createPaymentDto.customer_id, // Will be populated from CRM if needed
        paymentDate: new Date(createPaymentDto.payment_date),
        paymentMethod: createPaymentDto.payment_method,
        paymentReference: createPaymentDto.payment_reference || null,
        amount: createPaymentDto.amount,
        currency: createPaymentDto.currency || 'USD',
        status: createPaymentDto.status || status,
        allocatedAmount: allocatedAmount,
        unallocatedAmount: unallocatedAmount,
        bankAccountId: createPaymentDto.bank_account_id || null,
      });

      const savedPayment = await this.customerPaymentRepository.save(payment);

      // Create allocations
      if (createPaymentDto.allocations && createPaymentDto.allocations.length > 0) {
        if (!savedPayment.id) {
          throw new BadRequestException('Payment ID is required to create allocations');
        }

        const paymentId = savedPayment.id; // Store in variable to ensure it's not lost
        console.log('Creating payment allocations for payment ID:', paymentId);

        const allocations: CustomerPaymentAllocation[] = [];
        for (const allocationDto of createPaymentDto.allocations) {
          // CRITICAL: Convert amount to number to prevent string concatenation
          const allocationAmount = typeof allocationDto.amount === 'string' 
            ? parseFloat(allocationDto.amount) 
            : Number(allocationDto.amount);

          if (isNaN(allocationAmount) || allocationAmount <= 0) {
            throw new BadRequestException(`Invalid allocation amount: ${allocationDto.amount}. Must be a positive number.`);
          }

          const allocation = new CustomerPaymentAllocation();
          allocation.customerPaymentId = paymentId;
          allocation.invoiceId = allocationDto.invoice_id;
          allocation.amount = allocationAmount; // Use the converted number

          // Verify customerPaymentId is set
          if (!allocation.customerPaymentId) {
            console.error('ERROR: customerPaymentId is null for allocation:', allocation);
            throw new BadRequestException(`Failed to set customerPaymentId for allocation. Payment ID: ${paymentId}`);
          }

          allocations.push(allocation);

          // Update invoice paid amount
          const invoice = await this.invoiceRepository.findOne({
            where: { id: allocationDto.invoice_id },
          });
          if (invoice) {
            // CRITICAL: Convert amount to number to prevent string concatenation
            const allocationAmount = typeof allocationDto.amount === 'string' 
              ? parseFloat(allocationDto.amount) 
              : Number(allocationDto.amount);
            
            const currentPaidAmount = typeof invoice.paidAmount === 'string' 
              ? parseFloat(invoice.paidAmount) 
              : (invoice.paidAmount || 0);
            const invoiceTotalAmount = typeof invoice.totalAmount === 'string'
              ? parseFloat(invoice.totalAmount)
              : invoice.totalAmount;
            
            invoice.paidAmount = currentPaidAmount + allocationAmount;
            invoice.balanceDue = Math.max(0, invoiceTotalAmount - invoice.paidAmount);

            if (invoice.balanceDue <= 0) {
              invoice.status = 'paid' as any;
            } else if (invoice.status === 'draft' as any) {
              invoice.status = 'partial' as any;
            }

            await this.invoiceRepository.save(invoice);
          }
        }

        // Final safety check - verify all allocations have customerPaymentId before saving
        for (const allocation of allocations) {
          if (!allocation.customerPaymentId) {
            console.error('ERROR: Allocation missing customerPaymentId:', allocation);
            throw new BadRequestException(`Allocation is missing customerPaymentId. Payment ID: ${paymentId}`);
          }
        }

        console.log(`Saving ${allocations.length} allocations for payment ID: ${paymentId}`);
        await this.paymentAllocationRepository.save(allocations);
      }

      // Auto-sync to customer credit when payment is created
      if (savedPayment.customerId) {
        try {
          await this.customerCreditsService.updateBalanceFromPayment(
            savedPayment.customerId,
            savedPayment.amount,
          );
        } catch (error) {
          console.error('Error updating customer credit from payment:', error);
          // Don't fail payment creation if credit update fails
        }
      }

      return await this.findOne(savedPayment.id);
    } catch (error) {
      console.error('Error in CustomerPaymentsService.create:', error);
      throw error;
    }
  }

  async findAll(query: CustomerPaymentPaginationDto): Promise<CustomerPayment[]> {
    try {
      const queryBuilder = this.customerPaymentRepository
        .createQueryBuilder('payment')
        .leftJoinAndSelect('payment.allocations', 'allocations');

      if (query.status) {
        queryBuilder.where('payment.status = :status', { status: query.status });
      }

      if (query.customer_id) {
        const whereCondition = query.status ? 'andWhere' : 'where';
        queryBuilder[whereCondition]('payment.customerId = :customerId', { customerId: query.customer_id });
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
          'payment_date': 'paymentDate',
          'payment_number': 'paymentNumber',
          'amount': 'amount',
          'created_date': 'createdDate',
          'updated_at': 'updatedAt',
        };

        const entityField = fieldMap[sortField] || sortField;

        if (entityField && entityField.length > 0 && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(entityField)) {
          try {
            queryBuilder.orderBy(`payment.${entityField}`, sortOrder);
          } catch (error) {
            queryBuilder.orderBy('payment.createdDate', 'DESC');
          }
        } else {
          queryBuilder.orderBy('payment.createdDate', 'DESC');
        }
      } else {
        queryBuilder.orderBy('payment.createdDate', 'DESC');
      }

      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error in CustomerPaymentsService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<CustomerPayment> {
    const payment = await this.customerPaymentRepository.findOne({
      where: { id },
      relations: ['allocations'],
    });
    if (!payment) {
      throw new NotFoundException(`Customer payment with ID ${id} not found`);
    }
    return payment;
  }

  async update(id: string, updatePaymentDto: UpdateCustomerPaymentDto): Promise<CustomerPayment> {
    const payment = await this.findOne(id);

    // CRITICAL: Convert allocatedAmount to number for comparison
    const allocatedAmount = typeof payment.allocatedAmount === 'string'
      ? parseFloat(payment.allocatedAmount)
      : Number(payment.allocatedAmount || 0);
    
    if (payment.status === PaymentStatus.ALLOCATED && allocatedAmount > 0) {
      throw new BadRequestException('Cannot update a fully allocated payment');
    }

    // Update fields
    if (updatePaymentDto.customer_id !== undefined) payment.customerId = updatePaymentDto.customer_id;
    if (updatePaymentDto.payment_date !== undefined) payment.paymentDate = new Date(updatePaymentDto.payment_date);
    if (updatePaymentDto.payment_method !== undefined) payment.paymentMethod = updatePaymentDto.payment_method;
    if (updatePaymentDto.payment_reference !== undefined) payment.paymentReference = updatePaymentDto.payment_reference;
    if (updatePaymentDto.amount !== undefined) {
      payment.amount = updatePaymentDto.amount;
      // CRITICAL: Convert amounts to numbers to prevent string concatenation
      const paymentAmountForUpdate = typeof payment.amount === 'string' 
        ? parseFloat(payment.amount) 
        : Number(payment.amount || 0);
      const allocatedAmountForUpdate = typeof payment.allocatedAmount === 'string'
        ? parseFloat(payment.allocatedAmount)
        : Number(payment.allocatedAmount || 0);
      payment.unallocatedAmount = paymentAmountForUpdate - allocatedAmountForUpdate;
    }
    if (updatePaymentDto.currency !== undefined) payment.currency = updatePaymentDto.currency;
    if (updatePaymentDto.bank_account_id !== undefined) payment.bankAccountId = updatePaymentDto.bank_account_id;
    if (updatePaymentDto.status !== undefined) payment.status = updatePaymentDto.status;

    return await this.customerPaymentRepository.save(payment);
  }

  async allocate(id: string, allocateDto: AllocatePaymentDto): Promise<CustomerPayment> {
    // Load payment without allocations to avoid cascade save issues
    const payment = await this.customerPaymentRepository.findOne({
      where: { id },
      relations: [], // Don't load allocations to prevent cascade save issues
    });

    if (!payment) {
      throw new NotFoundException(`Customer payment with ID ${id} not found`);
    }

    if (payment.status === PaymentStatus.ALLOCATED && payment.unallocatedAmount <= 0) {
      throw new BadRequestException('Payment is already fully allocated');
    }

    // Validate allocations
    let totalAllocationAmount = 0;
    for (const allocation of allocateDto.allocations) {
      // Verify invoice exists
      const invoice = await this.invoiceRepository.findOne({
        where: { id: allocation.invoice_id },
      });
      if (!invoice) {
        throw new NotFoundException(`Invoice with ID ${allocation.invoice_id} not found`);
      }

      // CRITICAL: Convert amount to number to prevent string concatenation
      // The amount might come as a string from gRPC, so we need to ensure it's a number
      const allocationAmount = typeof allocation.amount === 'string' 
        ? parseFloat(allocation.amount) 
        : Number(allocation.amount);

      if (isNaN(allocationAmount) || allocationAmount <= 0) {
        throw new BadRequestException(`Invalid allocation amount: ${allocation.amount}. Must be a positive number.`);
      }

      totalAllocationAmount += allocationAmount;
    }

    // CRITICAL: Convert payment amounts to numbers for comparison
    const paymentAmountForValidation = typeof payment.amount === 'string' 
      ? parseFloat(payment.amount) 
      : Number(payment.amount || 0);
    const currentAllocatedAmount = typeof payment.allocatedAmount === 'string'
      ? parseFloat(payment.allocatedAmount)
      : Number(payment.allocatedAmount || 0);
    const currentUnallocatedAmount = paymentAmountForValidation - currentAllocatedAmount;
    
    if (totalAllocationAmount > currentUnallocatedAmount) {
      throw new BadRequestException(`Total allocation amount (${totalAllocationAmount}) cannot exceed unallocated amount (${currentUnallocatedAmount})`);
    }

    // Ensure payment ID is valid
    if (!payment.id || payment.id !== id) {
      throw new BadRequestException(`Payment ID mismatch. Expected: ${id}, Got: ${payment.id}`);
    }

    const paymentId = payment.id; // Store in variable to ensure it's not lost
    console.log('Creating payment allocations for payment ID:', paymentId);

    // Create allocations using repository.create() with explicit field assignment
    const allocations: CustomerPaymentAllocation[] = [];
    for (const allocationDto of allocateDto.allocations) {
      // CRITICAL: Convert amount to number to prevent string concatenation
      const allocationAmount = typeof allocationDto.amount === 'string' 
        ? parseFloat(allocationDto.amount) 
        : Number(allocationDto.amount);

      if (isNaN(allocationAmount) || allocationAmount <= 0) {
        throw new BadRequestException(`Invalid allocation amount: ${allocationDto.amount}. Must be a positive number.`);
      }

      // Use repository.create() to ensure TypeORM metadata is properly set
      const allocation = this.paymentAllocationRepository.create({
        customerPaymentId: paymentId,
        invoiceId: allocationDto.invoice_id,
        amount: allocationAmount, // Use the converted number
      });

      // Explicitly set customerPaymentId again to ensure it's not lost
      allocation.customerPaymentId = paymentId;

      // Verify customerPaymentId is set
      if (!allocation.customerPaymentId) {
        console.error('ERROR: customerPaymentId is null for allocation:', allocation);
        throw new BadRequestException(`Failed to set customerPaymentId for allocation. Payment ID: ${paymentId}`);
      }

      console.log('Created allocation:', {
        customerPaymentId: allocation.customerPaymentId,
        invoiceId: allocation.invoiceId,
        amount: allocation.amount,
      });

      allocations.push(allocation);

      // Update invoice paid amount
      const invoice = await this.invoiceRepository.findOne({
        where: { id: allocationDto.invoice_id },
      });
      if (invoice) {
        // CRITICAL: Use the converted numeric allocationAmount, not allocationDto.amount
        // to prevent string concatenation
        const currentPaidAmount = typeof invoice.paidAmount === 'string' 
          ? parseFloat(invoice.paidAmount) 
          : (invoice.paidAmount || 0);
        const invoiceTotalAmount = typeof invoice.totalAmount === 'string'
          ? parseFloat(invoice.totalAmount)
          : invoice.totalAmount;
        
        invoice.paidAmount = currentPaidAmount + allocationAmount;
        invoice.balanceDue = Math.max(0, invoiceTotalAmount - invoice.paidAmount);

        if (invoice.balanceDue <= 0) {
          invoice.status = 'paid' as any;
        } else if (invoice.status === 'draft' as any) {
          invoice.status = 'partial' as any;
        }

        await this.invoiceRepository.save(invoice);
      }
    }

    // Final safety check - verify all allocations have customerPaymentId before saving
    console.log('Final check before saving allocations:', {
      count: allocations.length,
      paymentId: paymentId,
      allocations: allocations.map(a => ({
        customerPaymentId: a.customerPaymentId,
        invoiceId: a.invoiceId,
        amount: a.amount,
      })),
    });

    for (const allocation of allocations) {
      if (!allocation.customerPaymentId) {
        console.error('ERROR: Allocation missing customerPaymentId:', {
          allocation: allocation,
          paymentId: paymentId,
          hasCustomerPaymentId: 'customerPaymentId' in allocation,
          customerPaymentIdValue: allocation.customerPaymentId,
        });
        throw new BadRequestException(`Allocation is missing customerPaymentId. Payment ID: ${paymentId}`);
      }
    }

    console.log(`Saving ${allocations.length} allocations for payment ID: ${paymentId}`);
    try {
      await this.paymentAllocationRepository.save(allocations);
      console.log('Allocations saved successfully');
    } catch (error) {
      console.error('Error saving allocations:', error);
      console.error('Allocations that failed:', allocations.map(a => ({
        customerPaymentId: a.customerPaymentId,
        invoiceId: a.invoiceId,
        amount: a.amount,
      })));
      throw error;
    }

    // Update payment amounts and status
    // CRITICAL: Convert payment amounts to numbers to prevent string concatenation
    // TypeORM may return decimal fields as strings from PostgreSQL
    const paymentAmount = typeof payment.amount === 'string' 
      ? parseFloat(payment.amount) 
      : Number(payment.amount || 0);
    const previousAllocatedAmount = typeof payment.allocatedAmount === 'string'
      ? parseFloat(payment.allocatedAmount)
      : Number(payment.allocatedAmount || 0);
    
    payment.allocatedAmount = previousAllocatedAmount + totalAllocationAmount;
    payment.unallocatedAmount = paymentAmount - payment.allocatedAmount;

    console.log('Payment status update:', {
      paymentId: paymentId,
      amount: payment.amount,
      previousAllocatedAmount: previousAllocatedAmount,
      totalAllocationAmount: totalAllocationAmount,
      newAllocatedAmount: payment.allocatedAmount,
      unallocatedAmount: payment.unallocatedAmount,
      previousStatus: payment.status,
    });

    // Update status based on allocation
    // If fully allocated (unallocated amount is 0 or negative due to rounding), mark as ALLOCATED
    // If partially allocated, keep as PENDING (or PARTIAL if that status exists)
    if (payment.unallocatedAmount <= 0.01) { // Allow small rounding differences
      payment.status = PaymentStatus.ALLOCATED;
      console.log('Payment status changed to ALLOCATED');
    } else if (payment.allocatedAmount > 0) {
      // Keep as PENDING if partially allocated
      payment.status = PaymentStatus.PENDING;
      console.log('Payment status remains PENDING (partially allocated)');
    }

    console.log('Final payment status:', payment.status);

    // CRITICAL: Clear allocations from payment object to prevent cascade save
    // The @OneToMany relationship has cascade: true, which means TypeORM will try to save
    // any allocations in payment.allocations when we save the payment. We only want to save
    // allocations if we explicitly created them above using paymentAllocationRepository.save().
    delete (payment as any).allocations;

    await this.customerPaymentRepository.save(payment);

    // Sync to general ledger when payment is allocated
    try {
      await this.generalLedgerService.syncCustomerPaymentToLedger(
        payment.id,
        payment.paymentDate,
        payment.amount,
        payment.bankAccountId || undefined,
      );
    } catch (error) {
      console.error('Error syncing customer payment to general ledger:', error);
      // Don't fail the allocation operation if ledger sync fails
    }

    // Auto-sync to customer credit when payment is allocated
    if (payment.customerId) {
      try {
        await this.customerCreditsService.updateBalanceFromPayment(
          payment.customerId,
          totalAllocationAmount,
        );
      } catch (error) {
        console.error('Error updating customer credit from payment allocation:', error);
        // Don't fail the allocation operation if credit update fails
      }
    }

    // Reload payment to get the latest status and amounts
    const updatedPayment = await this.customerPaymentRepository.findOne({
      where: { id },
      relations: [], // Don't load allocations to avoid cascade issues
    });

    if (!updatedPayment) {
      throw new NotFoundException(`Customer payment with ID ${id} not found after allocation`);
    }

    console.log('Payment after allocation:', {
      id: updatedPayment.id,
      status: updatedPayment.status,
      allocatedAmount: updatedPayment.allocatedAmount,
      unallocatedAmount: updatedPayment.unallocatedAmount,
      amount: updatedPayment.amount,
    });

    return updatedPayment;
  }

  async getUnallocated(): Promise<CustomerPayment[]> {
    try {
      const payments = await this.customerPaymentRepository.find({
        where: {
          unallocatedAmount: MoreThan(0),
        },
        relations: ['allocations'],
        order: {
          createdDate: 'DESC',
        },
      });

      return payments;
    } catch (error) {
      console.error('Error in CustomerPaymentsService.getUnallocated:', error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const payment = await this.findOne(id);

    if (payment.allocatedAmount > 0) {
      throw new BadRequestException('Cannot delete a payment with allocations. Remove allocations first.');
    }

    // Remove from general ledger if it was synced
    try {
      await this.generalLedgerService.removeTransactionFromLedger(id, TransactionType.PAYMENT);
    } catch (error) {
      console.error('Error removing customer payment from general ledger:', error);
      // Continue with deletion even if ledger removal fails
    }

    await this.customerPaymentRepository.remove(payment);
  }

  private async generatePaymentNumber(organizationId: string | null): Promise<string> {
    const prefix = 'PAY';
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    const queryBuilder = this.customerPaymentRepository
      .createQueryBuilder('payment')
      .where('payment.paymentNumber LIKE :pattern', { pattern: `${prefix}-${year}${month}-%` });

    if (organizationId) {
      queryBuilder.andWhere('payment.organizationId = :organizationId', { organizationId });
    } else {
      queryBuilder.andWhere('payment.organizationId IS NULL');
    }

    queryBuilder.orderBy('payment.paymentNumber', 'DESC').limit(1);

    const lastPayment = await queryBuilder.getOne();

    let sequence = 1;
    if (lastPayment && lastPayment.paymentNumber) {
      const parts = lastPayment.paymentNumber.split('-');
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

