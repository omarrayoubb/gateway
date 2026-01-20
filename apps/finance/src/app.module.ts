import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccountsModule } from './accounts/accounts.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { JournalEntriesModule } from './journal-entries/journal-entries.module';
import { GeneralLedgerModule } from './general-ledger/general-ledger.module';
import { AccountingPeriodsModule } from './accounting-periods/accounting-periods.module';
import { TaxConfigurationsModule } from './tax-configurations/tax-configurations.module';
import { InvoicesModule } from './invoices/invoices.module';
import { CreditNotesModule } from './credit-notes/credit-notes.module';
import { CustomerPaymentsModule } from './customer-payments/customer-payments.module';
import { CustomerCreditsModule } from './customer-credits/customer-credits.module';
import { ReportsModule } from './reports/reports.module';
import { PurchaseBillsModule } from './purchase-bills/purchase-bills.module';
import { VendorCreditNotesModule } from './vendor-credit-notes/vendor-credit-notes.module';
import { VendorPaymentsModule } from './vendor-payments/vendor-payments.module';
import { PaymentSchedulesModule } from './payment-schedules/payment-schedules.module';
import { RecurringBillsModule } from './recurring-bills/recurring-bills.module';
import { BankAccountsModule } from './bank-accounts/bank-accounts.module';
import { CashAccountsModule } from './cash-accounts/cash-accounts.module';
import { BankTransactionsModule } from './bank-transactions/bank-transactions.module';
import { BankReconciliationsModule } from './bank-reconciliations/bank-reconciliations.module';
import { ChequesModule } from './cheques/cheques.module';
import { CashFlowModule } from './cash-flow/cash-flow.module';
import { BudgetsModule } from './budgets/budgets.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ExpenseCategoriesModule } from './expense-categories/expense-categories.module';
import { ExpenseClaimsModule } from './expense-claims/expense-claims.module';
import { ExpenseApprovalsModule } from './expense-approvals/expense-approvals.module';
import { InventoryValuationsModule } from './inventory-valuations/inventory-valuations.module';
import { CogsModule } from './cogs/cogs.module';
import { InventoryAdjustmentsModule } from './inventory-adjustments/inventory-adjustments.module';
import { StockImpactsModule } from './stock-impacts/stock-impacts.module';
import { AssetsModule } from './assets/assets.module';
import { DepreciationsModule } from './depreciations/depreciations.module';
import { AssetRevaluationsModule } from './asset-revaluations/asset-revaluations.module';
import { AssetDisposalsModule } from './asset-disposals/asset-disposals.module';
import { LoansModule } from './loans/loans.module';
import { AccruedExpensesModule } from './accrued-expenses/accrued-expenses.module';
import { TaxPayablesModule } from './tax-payables/tax-payables.module';
import { LiabilitiesModule } from './liabilities/liabilities.module';
import { ProjectsModule } from './projects/projects.module';
import { CostCentersModule } from './cost-centers/cost-centers.module';
import { PricingModule } from './pricing/pricing.module';
import { ContractsModule } from './contracts/contracts.module';
import { Account } from './accounts/entities/account.entity';
import { Organization } from './organizations/entities/organization.entity';
import { JournalEntry } from './journal-entries/entities/journal-entry.entity';
import { JournalEntryLine } from './journal-entries/journal-entry-lines/entities/journal-entry-line.entity';
import { GeneralLedger } from './general-ledger/entities/general-ledger.entity';
import { AccountingPeriod } from './accounting-periods/entities/accounting-period.entity';
import { TaxConfiguration } from './tax-configurations/entities/tax-configuration.entity';
import { Invoice } from './invoices/entities/invoice.entity';
import { InvoiceItem } from './invoices/invoice-items/entities/invoice-item.entity';
import { CreditNote } from './credit-notes/entities/credit-note.entity';
import { CreditNoteItem } from './credit-notes/credit-note-items/entities/credit-note-item.entity';
import { CustomerPayment } from './customer-payments/entities/customer-payment.entity';
import { CustomerPaymentAllocation } from './customer-payments/payment-allocations/entities/payment-allocation.entity';
import { CustomerCredit } from './customer-credits/entities/customer-credit.entity';
import { PurchaseBill } from './purchase-bills/entities/purchase-bill.entity';
import { PurchaseBillItem } from './purchase-bills/purchase-bill-items/entities/purchase-bill-item.entity';
import { VendorCreditNote } from './vendor-credit-notes/entities/vendor-credit-note.entity';
import { VendorCreditNoteItem } from './vendor-credit-notes/vendor-credit-note-items/entities/vendor-credit-note-item.entity';
import { VendorPayment } from './vendor-payments/entities/vendor-payment.entity';
import { VendorPaymentAllocation } from './vendor-payments/payment-allocations/entities/vendor-payment-allocation.entity';
import { PaymentSchedule } from './payment-schedules/entities/payment-schedule.entity';
import { RecurringBill } from './recurring-bills/entities/recurring-bill.entity';
import { BankAccount } from './bank-accounts/entities/bank-account.entity';
import { CashAccount } from './cash-accounts/entities/cash-account.entity';
import { BankTransaction } from './bank-transactions/entities/bank-transaction.entity';
import { BankReconciliation } from './bank-reconciliations/entities/bank-reconciliation.entity';
import { Cheque } from './cheques/entities/cheque.entity';
import { Budget } from './budgets/entities/budget.entity';
import { BudgetPeriod } from './budgets/budget-periods/entities/budget-period.entity';
import { Expense } from './expenses/entities/expense.entity';
import { ExpenseCategory } from './expense-categories/entities/expense-category.entity';
import { ExpenseClaim } from './expense-claims/entities/expense-claim.entity';
import { ExpenseClaimExpense } from './expense-claims/entities/expense-claim-expense.entity';
import { ExpenseApproval } from './expense-approvals/entities/expense-approval.entity';
import { InventoryValuation } from './inventory-valuations/entities/inventory-valuation.entity';
import { COGS } from './cogs/entities/cogs.entity';
import { InventoryAdjustment } from './inventory-adjustments/entities/inventory-adjustment.entity';
import { StockImpact } from './stock-impacts/entities/stock-impact.entity';
import { Asset } from './assets/entities/asset.entity';
import { Depreciation } from './depreciations/entities/depreciation.entity';
import { AssetRevaluation } from './asset-revaluations/entities/asset-revaluation.entity';
import { AssetDisposal } from './asset-disposals/entities/asset-disposal.entity';
import { Loan } from './loans/entities/loan.entity';
import { LoanPayment } from './loans/entities/loan-payment.entity';
import { AccruedExpense } from './accrued-expenses/entities/accrued-expense.entity';
import { TaxPayable } from './tax-payables/entities/tax-payable.entity';
import { Liability } from './liabilities/entities/liability.entity';
import { Project } from './projects/entities/project.entity';
import { CostCenter } from './cost-centers/entities/cost-center.entity';
import { Pricing } from './pricing/entities/pricing.entity';
import { Contract } from './contracts/entities/contract.entity';
import { ContractPayment } from './contracts/entities/contract-payment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('FINANCE_DB_HOST') || configService.get('DB_HOST') || 'localhost',
        port: configService.get('FINANCE_DB_PORT') || configService.get('DB_PORT') || 5432,
        username: configService.get('FINANCE_DB_USERNAME') || configService.get('DB_USERNAME') || 'postgres',
        password: configService.get('FINANCE_DB_PASSWORD') || configService.get('DB_PASSWORD') || 'postgres',
        database: configService.get('FINANCE_DB_DATABASE') || configService.get('DB_DATABASE') || 'finance',
        entities: [Account, Organization, JournalEntry, JournalEntryLine, GeneralLedger, AccountingPeriod, TaxConfiguration, Invoice, InvoiceItem, CreditNote, CreditNoteItem, CustomerPayment, CustomerPaymentAllocation, CustomerCredit, PurchaseBill, PurchaseBillItem, VendorCreditNote, VendorCreditNoteItem, VendorPayment, VendorPaymentAllocation, PaymentSchedule, RecurringBill, BankAccount, CashAccount, BankTransaction, BankReconciliation, Cheque, Budget, BudgetPeriod, Expense, ExpenseCategory, ExpenseClaim, ExpenseClaimExpense, ExpenseApproval, InventoryValuation, COGS, InventoryAdjustment, StockImpact, Asset, Depreciation, AssetRevaluation, AssetDisposal, Loan, LoanPayment, AccruedExpense, TaxPayable, Liability, Project, CostCenter, Pricing, Contract, ContractPayment],
        synchronize: configService.get('FINANCE_DB_SYNCHRONIZE') === 'true' || configService.get('DB_SYNCHRONIZE') === 'true',
      }),
    }),
    AccountsModule,
    OrganizationsModule,
    JournalEntriesModule,
    GeneralLedgerModule,
    AccountingPeriodsModule,
    TaxConfigurationsModule,
    InvoicesModule,
    CreditNotesModule,
    CustomerPaymentsModule,
    CustomerCreditsModule,
    ReportsModule,
    PurchaseBillsModule,
    VendorCreditNotesModule,
    VendorPaymentsModule,
    PaymentSchedulesModule,
    RecurringBillsModule,
    BankAccountsModule,
    CashAccountsModule,
    BankTransactionsModule,
    BankReconciliationsModule,
    ChequesModule,
    CashFlowModule,
    BudgetsModule,
    ExpensesModule,
    ExpenseCategoriesModule,
    ExpenseClaimsModule,
    ExpenseApprovalsModule,
    InventoryValuationsModule,
    CogsModule,
    InventoryAdjustmentsModule,
    StockImpactsModule,
    AssetsModule,
    DepreciationsModule,
    AssetRevaluationsModule,
    AssetDisposalsModule,
    LoansModule,
    AccruedExpensesModule,
    TaxPayablesModule,
    LiabilitiesModule,
    ProjectsModule,
    CostCentersModule,
    PricingModule,
    ContractsModule,
  ],
})
export class AppModule {}

