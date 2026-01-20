import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerCredit, RiskLevel } from './entities/customer-credit.entity';
import { CustomerCreditPaginationDto } from './dto/pagination.dto';
import { CreateCustomerCreditDto } from './dto/create-customer-credit.dto';
import { UpdateCustomerCreditDto } from './dto/update-customer-credit.dto';
import { Invoice } from '../invoices/entities/invoice.entity';
import { CustomerPayment } from '../customer-payments/entities/customer-payment.entity';
import { CustomerPaymentAllocation } from '../customer-payments/payment-allocations/entities/payment-allocation.entity';

@Injectable()
export class CustomerCreditsService {
  constructor(
    @InjectRepository(CustomerCredit)
    private readonly customerCreditRepository: Repository<CustomerCredit>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(CustomerPayment)
    private readonly customerPaymentRepository: Repository<CustomerPayment>,
    @InjectRepository(CustomerPaymentAllocation)
    private readonly paymentAllocationRepository: Repository<CustomerPaymentAllocation>,
  ) {}

  async findAll(query: CustomerCreditPaginationDto): Promise<CustomerCredit[]> {
    try {
      const queryBuilder = this.customerCreditRepository.createQueryBuilder('credit');

      if (query.risk_level) {
        queryBuilder.where('credit.riskLevel = :riskLevel', { riskLevel: query.risk_level });
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
          'credit_limit': 'creditLimit',
          'current_balance': 'currentBalance',
          'available_credit': 'availableCredit',
          'credit_score': 'creditScore',
          'risk_level': 'riskLevel',
          'on_time_payment_rate': 'onTimePaymentRate',
          'average_days_to_pay': 'averageDaysToPay',
          'created_date': 'createdDate',
          'updated_at': 'updatedAt',
        };

        const entityField = fieldMap[sortField] || sortField;

        if (entityField && entityField.length > 0 && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(entityField)) {
          try {
            queryBuilder.orderBy(`credit.${entityField}`, sortOrder);
          } catch (error) {
            queryBuilder.orderBy('credit.createdDate', 'DESC');
          }
        } else {
          queryBuilder.orderBy('credit.createdDate', 'DESC');
        }
      } else {
        queryBuilder.orderBy('credit.createdDate', 'DESC');
      }

      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error in CustomerCreditsService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<CustomerCredit> {
    const credit = await this.customerCreditRepository.findOne({
      where: { id },
    });
    if (!credit) {
      throw new NotFoundException(`Customer credit with ID ${id} not found`);
    }
    return credit;
  }

  async create(createDto: CreateCustomerCreditDto): Promise<CustomerCredit> {
    // Check if credit already exists for this customer
    const existingCredit = await this.customerCreditRepository.findOne({
      where: { customerId: createDto.customer_id },
    });

    if (existingCredit) {
      throw new BadRequestException(`Customer credit already exists for customer ${createDto.customer_id}`);
    }

    const credit = this.customerCreditRepository.create({
      organizationId: createDto.organization_id || null,
      customerId: createDto.customer_id,
      customerName: createDto.customer_name || null,
      creditLimit: createDto.credit_limit,
      currentBalance: createDto.current_balance || 0,
      creditScore: createDto.credit_score || 0,
      riskLevel: createDto.risk_level || RiskLevel.MEDIUM,
      onTimePaymentRate: createDto.on_time_payment_rate || 0,
      averageDaysToPay: createDto.average_days_to_pay || 0,
    });

    // Calculate available credit
    credit.availableCredit = credit.creditLimit - credit.currentBalance;

    return await this.customerCreditRepository.save(credit);
  }

  async update(id: string, updateDto: UpdateCustomerCreditDto): Promise<CustomerCredit> {
    const credit = await this.findOne(id);

    if (updateDto.organization_id !== undefined) credit.organizationId = updateDto.organization_id || null;
    if (updateDto.customer_id !== undefined) credit.customerId = updateDto.customer_id;
    if (updateDto.customer_name !== undefined) credit.customerName = updateDto.customer_name || null;
    if (updateDto.credit_limit !== undefined) credit.creditLimit = updateDto.credit_limit;
    if (updateDto.current_balance !== undefined) credit.currentBalance = updateDto.current_balance;
    if (updateDto.credit_score !== undefined) credit.creditScore = updateDto.credit_score;
    if (updateDto.risk_level !== undefined) credit.riskLevel = updateDto.risk_level;
    if (updateDto.on_time_payment_rate !== undefined) credit.onTimePaymentRate = updateDto.on_time_payment_rate;
    if (updateDto.average_days_to_pay !== undefined) credit.averageDaysToPay = updateDto.average_days_to_pay;

    // Recalculate available credit
    credit.availableCredit = credit.creditLimit - credit.currentBalance;

    return await this.customerCreditRepository.save(credit);
  }

  async delete(id: string): Promise<void> {
    const credit = await this.findOne(id);
    await this.customerCreditRepository.remove(credit);
  }

  /**
   * Calculate credit score based on payment history and metrics
   */
  calculateCreditScore(
    onTimePaymentRate: number,
    averageDaysToPay: number,
    creditUtilization: number, // currentBalance / creditLimit
  ): number {
    let score = 0;

    // On-time payment rate (0-50 points)
    score += (onTimePaymentRate / 100) * 50;

    // Average days to pay (0-30 points)
    // Lower days = higher score
    if (averageDaysToPay <= 0) {
      score += 30; // No payment history, neutral
    } else if (averageDaysToPay <= 15) {
      score += 30; // Excellent
    } else if (averageDaysToPay <= 30) {
      score += 25; // Good
    } else if (averageDaysToPay <= 45) {
      score += 15; // Fair
    } else if (averageDaysToPay <= 60) {
      score += 10; // Poor
    } else {
      score += 5; // Very poor
    }

    // Credit utilization (0-20 points)
    // Lower utilization = higher score
    if (creditUtilization <= 0.3) {
      score += 20; // Excellent utilization
    } else if (creditUtilization <= 0.5) {
      score += 15; // Good utilization
    } else if (creditUtilization <= 0.7) {
      score += 10; // Fair utilization
    } else if (creditUtilization <= 0.9) {
      score += 5; // Poor utilization
    } else {
      score += 0; // Critical utilization
    }

    return Math.round(Math.min(100, Math.max(0, score)));
  }

  /**
   * Calculate risk level based on credit score and metrics
   */
  calculateRiskLevel(creditScore: number, creditUtilization: number): RiskLevel {
    if (creditScore >= 80 && creditUtilization < 0.7) {
      return RiskLevel.LOW;
    } else if (creditScore >= 60 && creditUtilization < 0.9) {
      return RiskLevel.MEDIUM;
    } else if (creditScore >= 40) {
      return RiskLevel.HIGH;
    } else {
      return RiskLevel.CRITICAL;
    }
  }

  /**
   * Update credit balance when invoice is created
   */
  async updateBalanceFromInvoice(customerId: string, invoiceAmount: number): Promise<void> {
    console.log('Updating credit balance from invoice:', { customerId, invoiceAmount });
    
    // Try to find credit by customerId (UUID or string)
    let credit = await this.customerCreditRepository.findOne({
      where: { customerId },
    });

    // If not found, try to find by customerId as string (in case customerAccountId is used)
    if (!credit && customerId) {
      credit = await this.customerCreditRepository.findOne({
        where: { customerId: customerId as any },
      });
    }

    if (!credit) {
      console.log('Credit record not found, auto-creating for customer:', customerId);
      // Auto-create credit record if it doesn't exist
      const newCredit = this.customerCreditRepository.create({
        customerId,
        creditLimit: 0, // Default, should be set manually
        currentBalance: invoiceAmount,
        availableCredit: -invoiceAmount, // Negative if over limit
        creditScore: 0,
        riskLevel: RiskLevel.MEDIUM,
      });
      const saved = await this.customerCreditRepository.save(newCredit);
      console.log('Auto-created credit record:', saved.id);
      return;
    }

    const previousBalance = credit.currentBalance || 0;
    credit.currentBalance = previousBalance + invoiceAmount;
    credit.availableCredit = credit.creditLimit - credit.currentBalance;
    
    console.log('Updated credit balance:', {
      creditId: credit.id,
      previousBalance,
      invoiceAmount,
      newBalance: credit.currentBalance,
      availableCredit: credit.availableCredit,
    });

    // Recalculate credit score and risk level
    const creditUtilization = credit.creditLimit > 0 ? credit.currentBalance / credit.creditLimit : 1;
    credit.creditScore = this.calculateCreditScore(
      credit.onTimePaymentRate,
      credit.averageDaysToPay,
      creditUtilization,
    );
    credit.riskLevel = this.calculateRiskLevel(credit.creditScore, creditUtilization);

    await this.customerCreditRepository.save(credit);
  }

  /**
   * Update credit balance when payment is received
   */
  async updateBalanceFromPayment(customerId: string, paymentAmount: number): Promise<void> {
    console.log('Updating credit balance from payment:', { customerId, paymentAmount });
    
    // Try to find credit by customerId (UUID or string)
    let credit = await this.customerCreditRepository.findOne({
      where: { customerId },
    });

    // If not found, try to find by customerId as string (in case customerAccountId is used)
    if (!credit && customerId) {
      credit = await this.customerCreditRepository.findOne({
        where: { customerId: customerId as any },
      });
    }

    if (!credit) {
      console.log('Credit record not found for payment, skipping update:', customerId);
      return; // No credit record, nothing to update
    }

    const previousBalance = credit.currentBalance || 0;
    credit.currentBalance = Math.max(0, previousBalance - paymentAmount);
    credit.availableCredit = credit.creditLimit - credit.currentBalance;
    
    console.log('Updated credit balance from payment:', {
      creditId: credit.id,
      previousBalance,
      paymentAmount,
      newBalance: credit.currentBalance,
      availableCredit: credit.availableCredit,
    });

    // Recalculate credit score and risk level
    const creditUtilization = credit.creditLimit > 0 ? credit.currentBalance / credit.creditLimit : 0;
    credit.creditScore = this.calculateCreditScore(
      credit.onTimePaymentRate,
      credit.averageDaysToPay,
      creditUtilization,
    );
    credit.riskLevel = this.calculateRiskLevel(credit.creditScore, creditUtilization);

    await this.customerCreditRepository.save(credit);
  }

  /**
   * Recalculate credit metrics for a customer based on payment history
   */
  async recalculateMetrics(customerId: string, invoices: any[], payments: any[]): Promise<void> {
    const credit = await this.customerCreditRepository.findOne({
      where: { customerId },
    });

    if (!credit) {
      return;
    }

    // Calculate on-time payment rate
    let onTimePayments = 0;
    let totalPayments = 0;
    let totalDays = 0;
    let paymentCount = 0;

    for (const payment of payments) {
      if (payment.paymentDate && payment.invoiceId) {
        const invoice = invoices.find((inv) => inv.id === payment.invoiceId);
        if (invoice && invoice.dueDate) {
          totalPayments++;
          const paymentDate = new Date(payment.paymentDate);
          const dueDate = new Date(invoice.dueDate);
          const daysDiff = Math.floor((paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          totalDays += daysDiff;
          paymentCount++;
          if (daysDiff <= 0) {
            onTimePayments++;
          }
        }
      }
    }

    credit.onTimePaymentRate = totalPayments > 0 ? (onTimePayments / totalPayments) * 100 : 0;
    credit.averageDaysToPay = paymentCount > 0 ? Math.round(totalDays / paymentCount) : 0;

    // Recalculate credit score and risk level
    const creditUtilization = credit.creditLimit > 0 ? credit.currentBalance / credit.creditLimit : 0;
    credit.creditScore = this.calculateCreditScore(
      credit.onTimePaymentRate,
      credit.averageDaysToPay,
      creditUtilization,
    );
    credit.riskLevel = this.calculateRiskLevel(credit.creditScore, creditUtilization);

    await this.customerCreditRepository.save(credit);
  }

  /**
   * Recalculate credit balance for a customer from all invoices and payments
   * This is useful to sync existing data or fix discrepancies
   */
  async recalculateBalance(customerId: string): Promise<CustomerCredit> {
    console.log('Recalculating credit balance for customer:', customerId);

    // Get or create credit record
    let credit = await this.customerCreditRepository.findOne({
      where: { customerId },
    });

    if (!credit) {
      credit = this.customerCreditRepository.create({
        customerId,
        creditLimit: 0,
        currentBalance: 0,
        availableCredit: 0,
        creditScore: 0,
        riskLevel: RiskLevel.MEDIUM,
      });
    }

    // Calculate total from invoices
    // customerAccountId in invoices should match customerId in credits
    // Try to find invoices by customerAccountId (which might be stored as string or UUID)
    const allInvoices = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .where('invoice.customerAccountId = :customerId', { customerId })
      .orWhere('CAST(invoice.customerAccountId AS TEXT) = :customerId', { customerId })
      .getMany();

    const uniqueInvoices = allInvoices;

    let totalInvoiceAmount = 0;
    for (const invoice of uniqueInvoices) {
      // Only count invoices that are not DRAFT and not fully paid
      if (invoice.status !== 'draft' && invoice.balanceDue > 0) {
        const balanceDue = parseFloat(invoice.balanceDue.toString()) || 0;
        if (!isNaN(balanceDue)) {
          totalInvoiceAmount += balanceDue;
        }
      }
    }

    // Calculate total payments allocated to invoices for this customer
    const payments = await this.customerPaymentRepository.find({
      where: { customerId },
      relations: ['allocations'],
    });

    let totalPaidAmount = 0;
    for (const payment of payments) {
      if (payment.allocations && payment.allocations.length > 0) {
        for (const allocation of payment.allocations) {
          // Verify the allocation is for an invoice belonging to this customer
          const allocatedInvoice = uniqueInvoices.find(inv => inv.id === allocation.invoiceId);
          if (allocatedInvoice) {
            const amount = parseFloat(allocation.amount.toString()) || 0;
            if (!isNaN(amount)) {
              totalPaidAmount += amount;
            }
          }
        }
      }
    }

    // Calculate current balance: total invoice amounts minus total payments
    const calculatedBalance = totalInvoiceAmount - totalPaidAmount;

    console.log('Recalculated credit balance:', {
      customerId,
      totalInvoiceAmount,
      totalPaidAmount,
      calculatedBalance,
      previousBalance: credit.currentBalance,
    });

    credit.currentBalance = Math.max(0, calculatedBalance);
    credit.availableCredit = credit.creditLimit - credit.currentBalance;

    // Recalculate credit score and risk level
    const creditUtilization = credit.creditLimit > 0 ? credit.currentBalance / credit.creditLimit : 0;
    credit.creditScore = this.calculateCreditScore(
      credit.onTimePaymentRate,
      credit.averageDaysToPay,
      creditUtilization,
    );
    credit.riskLevel = this.calculateRiskLevel(credit.creditScore, creditUtilization);

    return await this.customerCreditRepository.save(credit);
  }
}

