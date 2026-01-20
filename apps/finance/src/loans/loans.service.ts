import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Loan, LoanStatus, LoanType, PaymentFrequency } from './entities/loan.entity';
import { LoanPayment, PaymentStatus } from './entities/loan-payment.entity';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { LoanPaginationDto } from './dto/pagination.dto';
import { MakePaymentDto } from './dto/make-payment.dto';
import { Account } from '../accounts/entities/account.entity';
import { JournalEntriesService } from '../journal-entries/journal-entries.service';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    @InjectRepository(LoanPayment)
    private readonly loanPaymentRepository: Repository<LoanPayment>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly journalEntriesService: JournalEntriesService,
  ) {}

  async create(createDto: CreateLoanDto): Promise<Loan> {
    const organizationId = createDto.organization_id || null;

    // Check for duplicate loan number
    const existingLoan = await this.loanRepository.findOne({
      where: {
        loanNumber: createDto.loan_number,
        organizationId: organizationId === null ? IsNull() : organizationId,
      },
    });

    if (existingLoan) {
      throw new BadRequestException(`Loan with number ${createDto.loan_number} already exists`);
    }

    // Validate account
    const account = await this.accountRepository.findOne({
      where: { id: createDto.account_id },
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${createDto.account_id} not found`);
    }

    // Calculate payment amount based on loan terms
    const loanAmount = createDto.loan_amount || 0;
    const interestRate = createDto.interest_rate || 0;
    const loanDate = new Date(createDto.loan_date);
    const maturityDate = new Date(createDto.maturity_date);

    if (maturityDate <= loanDate) {
      throw new BadRequestException('Maturity date must be after loan date');
    }

    // Calculate number of payments
    const numPayments = this.calculateNumberOfPayments(
      loanDate,
      maturityDate,
      createDto.payment_frequency,
    );

    // Calculate payment amount using amortization formula
    const paymentAmount = this.calculatePaymentAmount(
      loanAmount,
      interestRate / 100,
      numPayments,
      createDto.payment_frequency,
    );

    const loan = this.loanRepository.create({
      organizationId: organizationId ?? null,
      loanNumber: createDto.loan_number,
      loanName: createDto.loan_name,
      lender: createDto.lender,
      loanType: createDto.loan_type,
      loanAmount,
      interestRate,
      loanDate,
      maturityDate,
      paymentFrequency: createDto.payment_frequency,
      paymentAmount,
      outstandingBalance: loanAmount,
      status: LoanStatus.ACTIVE,
      accountId: createDto.account_id,
    });

    return await this.loanRepository.save(loan);
  }

  async findAll(paginationDto: LoanPaginationDto): Promise<Loan[]> {
    const where: any = {};

    if (paginationDto.status) {
      where.status = paginationDto.status;
    }

    if (paginationDto.loan_type) {
      where.loanType = paginationDto.loan_type;
    }

    const queryBuilder = this.loanRepository.createQueryBuilder('loan').where(where);

    if (paginationDto.sort) {
      let sortField = paginationDto.sort.trim();
      let sortOrder: 'ASC' | 'DESC' = 'ASC';

      // Handle -field format (minus prefix for descending)
      if (sortField.startsWith('-')) {
        sortField = sortField.substring(1).trim();
        sortOrder = 'DESC';
      } else if (sortField.includes(':')) {
        // Handle field:direction format
        const [field, order] = sortField.split(':');
        sortField = field.trim();
        sortOrder = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      }

      // Map snake_case to camelCase
      const mappedField = this.mapSortField(sortField);
      
      // Validate sort field to prevent SQL injection
      const validSortFields = ['loanNumber', 'loanName', 'loanDate', 'maturityDate', 'loanAmount', 'outstandingBalance', 'status', 'createdAt', 'updatedAt'];
      if (validSortFields.includes(mappedField)) {
        queryBuilder.orderBy(`loan.${mappedField}`, sortOrder);
      } else {
        queryBuilder.orderBy('loan.createdAt', 'DESC');
      }
    } else {
      queryBuilder.orderBy('loan.createdAt', 'DESC');
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id },
      relations: ['account', 'payments'],
    });

    if (!loan) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }

    return loan;
  }

  async update(id: string, updateDto: UpdateLoanDto): Promise<Loan> {
    const loan = await this.findOne(id);

    if (updateDto.loan_number && updateDto.loan_number !== loan.loanNumber) {
      const existingLoan = await this.loanRepository.findOne({
        where: { loanNumber: updateDto.loan_number },
      });

      if (existingLoan && existingLoan.id !== id) {
        throw new BadRequestException(`Loan with number ${updateDto.loan_number} already exists`);
      }
    }

    Object.assign(loan, {
      ...(updateDto.loan_number && { loanNumber: updateDto.loan_number }),
      ...(updateDto.loan_name && { loanName: updateDto.loan_name }),
      ...(updateDto.lender && { lender: updateDto.lender }),
      ...(updateDto.loan_type && { loanType: updateDto.loan_type }),
      ...(updateDto.loan_amount !== undefined && { loanAmount: updateDto.loan_amount }),
      ...(updateDto.interest_rate !== undefined && { interestRate: updateDto.interest_rate }),
      ...(updateDto.loan_date && { loanDate: new Date(updateDto.loan_date) }),
      ...(updateDto.maturity_date && { maturityDate: new Date(updateDto.maturity_date) }),
      ...(updateDto.payment_frequency && { paymentFrequency: updateDto.payment_frequency }),
      ...(updateDto.payment_amount !== undefined && { paymentAmount: updateDto.payment_amount }),
      ...(updateDto.outstanding_balance !== undefined && { outstandingBalance: updateDto.outstanding_balance }),
      ...(updateDto.status && { status: updateDto.status }),
      ...(updateDto.account_id && { accountId: updateDto.account_id }),
    });

    return await this.loanRepository.save(loan);
  }

  async remove(id: string): Promise<void> {
    const loan = await this.findOne(id);
    await this.loanRepository.remove(loan);
  }

  async makePayment(id: string, paymentDto: MakePaymentDto): Promise<LoanPayment> {
    const loan = await this.findOne(id);

    if (loan.status === LoanStatus.PAID_OFF) {
      throw new BadRequestException('Loan is already paid off');
    }

    if (loan.status === LoanStatus.DEFAULTED) {
      throw new BadRequestException('Cannot make payment on defaulted loan');
    }

    const paymentDate = new Date(paymentDto.payment_date);
    const paymentAmount = paymentDto.payment_amount;

    if (paymentAmount > loan.outstandingBalance) {
      throw new BadRequestException('Payment amount cannot exceed outstanding balance');
    }

    // Calculate principal and interest if not provided
    let principalAmount = paymentDto.principal_amount;
    let interestAmount = paymentDto.interest_amount;

    if (principalAmount === undefined || interestAmount === undefined) {
      const calculated = this.calculatePaymentBreakdown(
        loan.outstandingBalance,
        loan.interestRate / 100,
        loan.paymentAmount,
        loan.paymentFrequency,
      );
      principalAmount = principalAmount ?? calculated.principal;
      interestAmount = interestAmount ?? calculated.interest;
    }

    // Get next payment number
    const lastPayment = await this.loanPaymentRepository.findOne({
      where: { loanId: id },
      order: { paymentNumber: 'DESC' },
    });

    const paymentNumber = lastPayment ? lastPayment.paymentNumber + 1 : 1;

    // Calculate new outstanding balance
    const newOutstandingBalance = loan.outstandingBalance - principalAmount;

    // Create payment record
    const payment = this.loanPaymentRepository.create({
      loanId: id,
      paymentDate,
      paymentNumber,
      paymentAmount,
      principalAmount,
      interestAmount,
      outstandingBalance: newOutstandingBalance,
      status: PaymentStatus.PAID,
      bankAccountId: paymentDto.bank_account_id || undefined,
    });

    const savedPayment = await this.loanPaymentRepository.save(payment);

    // Update loan outstanding balance
    loan.outstandingBalance = newOutstandingBalance;

    // Update loan status if fully paid
    if (newOutstandingBalance <= 0) {
      loan.status = LoanStatus.PAID_OFF;
      loan.outstandingBalance = 0;
    }

    await this.loanRepository.save(loan);

    // Create journal entry for payment
    if (loan.accountId && paymentDto.bank_account_id) {
      try {
        const journalEntry = await this.journalEntriesService.create({
          organization_id: loan.organizationId || undefined,
          entry_number: `LOAN-PMT-${loan.loanNumber}-${paymentNumber}`,
          entry_date: paymentDate.toISOString().split('T')[0],
          entry_type: 'manual' as any,
          description: `Loan payment for ${loan.loanName}`,
          reference: `Loan Payment ${paymentNumber}`,
          lines: [
            {
              account_id: loan.accountId,
              debit: 0,
              credit: principalAmount,
              description: `Principal payment for loan ${loan.loanNumber}`,
            },
            {
              account_id: loan.accountId,
              debit: 0,
              credit: interestAmount,
              description: `Interest payment for loan ${loan.loanNumber}`,
            },
            {
              account_id: paymentDto.bank_account_id,
              debit: paymentAmount,
              credit: 0,
              description: `Payment for loan ${loan.loanNumber}`,
            },
          ],
        });

        savedPayment.journalEntryId = journalEntry.id;
        await this.loanPaymentRepository.save(savedPayment);
      } catch (error) {
        console.error('Error creating journal entry for loan payment:', error);
        // Don't fail the payment if journal entry creation fails
      }
    }

    return savedPayment;
  }

  async getSchedule(id: string): Promise<any> {
    const loan = await this.findOne(id);

    // Get existing payments
    const existingPayments = await this.loanPaymentRepository.find({
      where: { loanId: id },
      order: { paymentNumber: 'ASC' },
    });

    // Generate payment schedule
    const schedule = this.generatePaymentSchedule(
      loan,
      existingPayments,
    );

    const totalPrincipal = schedule.reduce((sum, p) => sum + p.principalAmount, 0);
    const totalInterest = schedule.reduce((sum, p) => sum + p.interestAmount, 0);
    const totalPayments = schedule.reduce((sum, p) => sum + p.paymentAmount, 0);

    return {
      loan: {
        id: loan.id,
        loan_number: loan.loanNumber,
        loan_name: loan.loanName,
        lender: loan.lender,
        loan_type: loan.loanType,
        loan_amount: parseFloat(loan.loanAmount.toString()),
        interest_rate: parseFloat(loan.interestRate.toString()),
        loan_date: loan.loanDate.toISOString().split('T')[0],
        maturity_date: loan.maturityDate.toISOString().split('T')[0],
        payment_frequency: loan.paymentFrequency,
        payment_amount: parseFloat(loan.paymentAmount.toString()),
        outstanding_balance: parseFloat(loan.outstandingBalance.toString()),
        status: loan.status,
      },
      payment_schedule: schedule,
      total_principal: totalPrincipal,
      total_interest: totalInterest,
      total_payments: totalPayments,
    };
  }

  private calculateNumberOfPayments(
    startDate: Date,
    endDate: Date,
    frequency: PaymentFrequency,
  ): number {
    const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth());

    switch (frequency) {
      case PaymentFrequency.MONTHLY:
        return monthsDiff;
      case PaymentFrequency.QUARTERLY:
        return Math.floor(monthsDiff / 3);
      case PaymentFrequency.ANNUALLY:
        return Math.floor(monthsDiff / 12);
      default:
        return monthsDiff;
    }
  }

  private calculatePaymentAmount(
    principal: number,
    monthlyRate: number,
    numPayments: number,
    frequency: PaymentFrequency,
  ): number {
    if (numPayments === 0) return principal;
    if (monthlyRate === 0) return principal / numPayments;

    // Adjust rate based on frequency
    let adjustedRate = monthlyRate;
    switch (frequency) {
      case PaymentFrequency.QUARTERLY:
        adjustedRate = monthlyRate * 3;
        break;
      case PaymentFrequency.ANNUALLY:
        adjustedRate = monthlyRate * 12;
        break;
    }

    // Amortization formula: P * (r * (1 + r)^n) / ((1 + r)^n - 1)
    const numerator = adjustedRate * Math.pow(1 + adjustedRate, numPayments);
    const denominator = Math.pow(1 + adjustedRate, numPayments) - 1;
    return principal * (numerator / denominator);
  }

  private calculatePaymentBreakdown(
    outstandingBalance: number,
    annualRate: number,
    paymentAmount: number,
    frequency: PaymentFrequency,
  ): { principal: number; interest: number } {
    // Adjust rate based on frequency
    let periodRate = annualRate / 12;
    switch (frequency) {
      case PaymentFrequency.QUARTERLY:
        periodRate = annualRate / 4;
        break;
      case PaymentFrequency.ANNUALLY:
        periodRate = annualRate;
        break;
    }

    const interest = outstandingBalance * periodRate;
    const principal = paymentAmount - interest;

    return {
      principal: Math.max(0, principal),
      interest: Math.max(0, interest),
    };
  }

  private generatePaymentSchedule(loan: Loan, existingPayments: LoanPayment[]): any[] {
    const schedule: any[] = [];
    let currentBalance = parseFloat(loan.loanAmount.toString());
    let paymentNumber = 1;
    const startDate = new Date(loan.loanDate);
    const endDate = new Date(loan.maturityDate);

    // Calculate payment interval in months
    let intervalMonths = 1;
    switch (loan.paymentFrequency) {
      case PaymentFrequency.QUARTERLY:
        intervalMonths = 3;
        break;
      case PaymentFrequency.ANNUALLY:
        intervalMonths = 12;
        break;
    }

    let currentDate = new Date(startDate);
    const paymentAmount = parseFloat(loan.paymentAmount.toString());
    const annualRate = parseFloat(loan.interestRate.toString()) / 100;

    while (currentDate <= endDate && currentBalance > 0) {
      // Check if payment already exists
      const existingPayment = existingPayments.find(p => p.paymentNumber === paymentNumber);

      if (existingPayment) {
        schedule.push({
          payment_number: existingPayment.paymentNumber,
          payment_date: existingPayment.paymentDate.toISOString().split('T')[0],
          payment_amount: parseFloat(existingPayment.paymentAmount.toString()),
          principal_amount: parseFloat(existingPayment.principalAmount.toString()),
          interest_amount: parseFloat(existingPayment.interestAmount.toString()),
          outstanding_balance: parseFloat(existingPayment.outstandingBalance.toString()),
          status: existingPayment.status,
        });
        currentBalance = parseFloat(existingPayment.outstandingBalance.toString());
      } else {
        // Calculate payment breakdown
        const breakdown = this.calculatePaymentBreakdown(
          currentBalance,
          annualRate,
          paymentAmount,
          loan.paymentFrequency,
        );

        const finalPaymentAmount = currentBalance < paymentAmount ? currentBalance : paymentAmount;
        const finalPrincipal = currentBalance < paymentAmount ? currentBalance : breakdown.principal;
        const finalInterest = currentBalance < paymentAmount ? 0 : breakdown.interest;
        const newBalance = Math.max(0, currentBalance - finalPrincipal);

        schedule.push({
          payment_number: paymentNumber,
          payment_date: currentDate.toISOString().split('T')[0],
          payment_amount: finalPaymentAmount,
          principal_amount: finalPrincipal,
          interest_amount: finalInterest,
          outstanding_balance: newBalance,
          status: PaymentStatus.PENDING,
        });

        currentBalance = newBalance;
      }

      // Move to next payment date
      currentDate = new Date(currentDate);
      currentDate.setMonth(currentDate.getMonth() + intervalMonths);
      paymentNumber++;

      if (currentBalance <= 0) break;
    }

    return schedule;
  }

  private mapSortField(field: string): string {
    const fieldMap: { [key: string]: string } = {
      'loan_number': 'loanNumber',
      'loan_name': 'loanName',
      'loan_date': 'loanDate',
      'maturity_date': 'maturityDate',
      'loan_amount': 'loanAmount',
      'outstanding_balance': 'outstandingBalance',
      'created_at': 'createdAt',
    };

    return fieldMap[field] || field;
  }
}

