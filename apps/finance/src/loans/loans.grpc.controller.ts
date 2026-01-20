import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { LoanPaginationDto } from './dto/pagination.dto';
import { MakePaymentDto } from './dto/make-payment.dto';

@Controller()
export class LoansGrpcController {
  constructor(private readonly loansService: LoansService) {}

  @GrpcMethod('LoansService', 'GetLoans')
  async getLoans(data: any) {
    const paginationDto: LoanPaginationDto = {
      sort: data.sort,
      status: data.status,
      loan_type: data.loanType,
    };

    const loans = await this.loansService.findAll(paginationDto);
    return {
      loans: loans.map((loan) => this.mapLoanToProto(loan)),
    };
  }

  @GrpcMethod('LoansService', 'GetLoan')
  async getLoan(data: { id: string }) {
    const loan = await this.loansService.findOne(data.id);
    return this.mapLoanToProto(loan);
  }

  @GrpcMethod('LoansService', 'CreateLoan')
  async createLoan(data: any) {
    const createDto: CreateLoanDto = {
      organization_id: data.organizationId,
      loan_number: data.loanNumber,
      loan_name: data.loanName,
      lender: data.lender,
      loan_type: data.loanType,
      loan_amount: data.loanAmount ? parseFloat(data.loanAmount) : undefined,
      interest_rate: data.interestRate ? parseFloat(data.interestRate) : undefined,
      loan_date: data.loanDate,
      maturity_date: data.maturityDate,
      payment_frequency: data.paymentFrequency,
      account_id: data.accountId,
    };

    const loan = await this.loansService.create(createDto);
    return this.mapLoanToProto(loan);
  }

  @GrpcMethod('LoansService', 'UpdateLoan')
  async updateLoan(data: any) {
    const updateDto: UpdateLoanDto = {
      ...(data.loanNumber && { loan_number: data.loanNumber }),
      ...(data.loanName && { loan_name: data.loanName }),
      ...(data.lender && { lender: data.lender }),
      ...(data.loanType && { loan_type: data.loanType }),
      ...(data.loanAmount !== undefined && { loan_amount: parseFloat(data.loanAmount) }),
      ...(data.interestRate !== undefined && { interest_rate: parseFloat(data.interestRate) }),
      ...(data.loanDate && { loan_date: data.loanDate }),
      ...(data.maturityDate && { maturity_date: data.maturityDate }),
      ...(data.paymentFrequency && { payment_frequency: data.paymentFrequency }),
      ...(data.paymentAmount !== undefined && { payment_amount: parseFloat(data.paymentAmount) }),
      ...(data.outstandingBalance !== undefined && { outstanding_balance: parseFloat(data.outstandingBalance) }),
      ...(data.status && { status: data.status }),
      ...(data.accountId && { account_id: data.accountId }),
    };

    const loan = await this.loansService.update(data.id, updateDto);
    return this.mapLoanToProto(loan);
  }

  @GrpcMethod('LoansService', 'DeleteLoan')
  async deleteLoan(data: { id: string }) {
    await this.loansService.remove(data.id);
    return { success: true, message: 'Loan deleted successfully' };
  }

  @GrpcMethod('LoansService', 'MakePayment')
  async makePayment(data: any) {
    const paymentDto: MakePaymentDto = {
      payment_date: data.paymentDate,
      payment_amount: parseFloat(data.paymentAmount),
      principal_amount: data.principalAmount ? parseFloat(data.principalAmount) : undefined,
      interest_amount: data.interestAmount ? parseFloat(data.interestAmount) : undefined,
      bank_account_id: data.bankAccountId,
    };

    const payment = await this.loansService.makePayment(data.loanId, paymentDto);
    return {
      id: payment.id,
      loanId: payment.loanId,
      paymentDate: payment.paymentDate.toISOString().split('T')[0],
      paymentNumber: payment.paymentNumber,
      paymentAmount: payment.paymentAmount.toString(),
      principalAmount: payment.principalAmount.toString(),
      interestAmount: payment.interestAmount.toString(),
      outstandingBalance: payment.outstandingBalance.toString(),
      status: payment.status,
      bankAccountId: payment.bankAccountId || '',
      journalEntryId: payment.journalEntryId || '',
    };
  }

  @GrpcMethod('LoansService', 'GetSchedule')
  async getSchedule(data: { id: string }) {
    const schedule = await this.loansService.getSchedule(data.id);
    return {
      loan: schedule.loan,
      paymentSchedule: schedule.payment_schedule.map((p: any) => ({
        paymentNumber: p.payment_number,
        paymentDate: p.payment_date,
        paymentAmount: p.payment_amount.toString(),
        principalAmount: p.principal_amount.toString(),
        interestAmount: p.interest_amount.toString(),
        outstandingBalance: p.outstanding_balance.toString(),
        status: p.status,
      })),
      totalPrincipal: schedule.total_principal.toString(),
      totalInterest: schedule.total_interest.toString(),
      totalPayments: schedule.total_payments.toString(),
    };
  }

  private mapLoanToProto(loan: any) {
    return {
      id: loan.id,
      organizationId: loan.organizationId || '',
      loanNumber: loan.loanNumber,
      loanName: loan.loanName,
      lender: loan.lender,
      loanType: loan.loanType,
      loanAmount: loan.loanAmount.toString(),
      interestRate: loan.interestRate.toString(),
      loanDate: loan.loanDate instanceof Date
        ? loan.loanDate.toISOString().split('T')[0]
        : loan.loanDate,
      maturityDate: loan.maturityDate instanceof Date
        ? loan.maturityDate.toISOString().split('T')[0]
        : loan.maturityDate,
      paymentFrequency: loan.paymentFrequency,
      paymentAmount: loan.paymentAmount.toString(),
      outstandingBalance: loan.outstandingBalance.toString(),
      status: loan.status,
      accountId: loan.accountId || '',
    };
  }
}

