import { Injectable, OnModuleInit, Inject, BadRequestException } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom, throwError, of } from 'rxjs';
import { catchError, timeout, take, tap } from 'rxjs/operators';
import { Metadata } from '@grpc/grpc-js';

interface AccountsService {
  GetAccount(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetAccounts(data: { limit?: number; sort?: string; filter?: string }, metadata?: Metadata): Observable<any>;
  CreateAccount(data: any, metadata?: Metadata): Observable<any>;
  UpdateAccount(data: any, metadata?: Metadata): Observable<any>;
  DeleteAccount(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface OrganizationsService {
  GetOrganization(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetOrganizations(data: { limit?: number; sort?: string; filter?: string }, metadata?: Metadata): Observable<any>;
  CreateOrganization(data: any, metadata?: Metadata): Observable<any>;
  UpdateOrganization(data: any, metadata?: Metadata): Observable<any>;
  DeleteOrganization(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface JournalEntriesService {
  GetJournalEntry(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetJournalEntries(data: { limit?: number; sort?: string; entry_type?: string; status?: string }, metadata?: Metadata): Observable<any>;
  CreateJournalEntry(data: any, metadata?: Metadata): Observable<any>;
  UpdateJournalEntry(data: any, metadata?: Metadata): Observable<any>;
  PostJournalEntry(data: { id: string }, metadata?: Metadata): Observable<any>;
  VoidJournalEntry(data: { id: string; reason?: string }, metadata?: Metadata): Observable<any>;
  DeleteJournalEntry(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface JournalEntryLinesService {
  GetJournalEntryLines(data: { journal_entry_id: string }, metadata?: Metadata): Observable<any>;
  CreateJournalEntryLine(data: any, metadata?: Metadata): Observable<any>;
  DeleteJournalEntryLine(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface GeneralLedgerService {
  GetGeneralLedger(data: { account_id?: string; period_start?: string; period_end?: string; sort?: string }, metadata?: Metadata): Observable<any>;
  GetAccountLedger(data: { account_id: string; period_start?: string; period_end?: string }, metadata?: Metadata): Observable<any>;
  GetGeneralLedgerReport(data: { period_start: string; period_end: string; account_type?: string; format?: string }, metadata?: Metadata): Observable<any>;
}

interface AccountingPeriodsService {
  GetAccountingPeriods(data: { status?: string; year?: string }, metadata?: Metadata): Observable<any>;
  GetAccountingPeriod(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetCurrentAccountingPeriod(data: { organization_id?: string }, metadata?: Metadata): Observable<any>;
  CreateAccountingPeriod(data: any, metadata?: Metadata): Observable<any>;
  UpdateAccountingPeriod(data: any, metadata?: Metadata): Observable<any>;
  CloseAccountingPeriod(data: { id: string; notes?: string; force?: boolean; closed_by?: string }, metadata?: Metadata): Observable<any>;
  DeleteAccountingPeriod(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface TaxConfigurationsService {
  GetTaxConfigurations(data: { tax_type?: string; is_active?: boolean; sort?: string }, metadata?: Metadata): Observable<any>;
  GetTaxConfiguration(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateTaxConfiguration(data: any, metadata?: Metadata): Observable<any>;
  UpdateTaxConfiguration(data: any, metadata?: Metadata): Observable<any>;
  CalculateTax(data: { amount: number; tax_code: string; date?: string; organization_id?: string }, metadata?: Metadata): Observable<any>;
  DeleteTaxConfiguration(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface AccountsGrpcService {
  findAllAccounts(data: { page: number; limit: number }, metadata?: Metadata): Observable<any>;
  findOneAccount(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface InvoicesService {
  GetInvoices(data: { sort?: string; status?: string; customer_id?: string; is_proforma?: boolean }, metadata?: Metadata): Observable<any>;
  GetInvoice(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateInvoice(data: any, metadata?: Metadata): Observable<any>;
  UpdateInvoice(data: any, metadata?: Metadata): Observable<any>;
  SendInvoice(data: { id: string; send_method?: string; email_to?: string[]; email_subject?: string; email_message?: string; sent_by?: string }, metadata?: Metadata): Observable<any>;
  ConvertProforma(data: { id: string }, metadata?: Metadata): Observable<any>;
  DeleteInvoice(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface CreditNotesService {
  GetCreditNotes(data: { sort?: string; status?: string; customer_id?: string }, metadata?: Metadata): Observable<any>;
  GetCreditNote(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateCreditNote(data: any, metadata?: Metadata): Observable<any>;
  UpdateCreditNote(data: any, metadata?: Metadata): Observable<any>;
  ApplyCreditNote(data: { id: string; invoice_id: string; amount: number }, metadata?: Metadata): Observable<any>;
  DeleteCreditNote(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface CustomerPaymentsService {
  GetCustomerPayments(data: { sort?: string; customer_id?: string; status?: string }, metadata?: Metadata): Observable<any>;
  GetCustomerPayment(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetUnallocatedPayments(data: {}, metadata?: Metadata): Observable<any>;
  CreateCustomerPayment(data: any, metadata?: Metadata): Observable<any>;
  UpdateCustomerPayment(data: any, metadata?: Metadata): Observable<any>;
  AllocatePayment(data: { id: string; allocations: any[] }, metadata?: Metadata): Observable<any>;
  DeleteCustomerPayment(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface CustomerCreditsService {
  GetCustomerCredits(data: { sort?: string; risk_level?: string }, metadata?: Metadata): Observable<any>;
  GetCustomerCredit(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateCustomerCredit(data: any, metadata?: Metadata): Observable<any>;
  UpdateCustomerCredit(data: any, metadata?: Metadata): Observable<any>;
  DeleteCustomerCredit(data: { id: string }, metadata?: Metadata): Observable<any>;
  RecalculateBalance(data: { customerId: string }, metadata?: Metadata): Observable<any>;
}

interface ReportsService {
  GetArAgingReport(data: { as_of_date: string; customer_id?: string; format?: string }, metadata?: Metadata): Observable<any>;
  GetBudgetVsActual(data: { fiscalYear: number; department?: string; projectId?: string; accountId?: string; format?: string }, metadata?: Metadata): Observable<any>;
}

interface VendorsService {
  GetVendor(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetVendors(data: { page?: number; limit?: number; sort?: string; status?: string; search?: string }, metadata?: Metadata): Observable<any>;
}

interface ShipmentsService {
  GetShipment(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetShipments(data: { page?: number; limit?: number; sort?: string; status?: string; type?: string; warehouseId?: string; shipmentDate?: string }, metadata?: Metadata): Observable<any>;
}

interface PurchaseOrdersService {
  GetPurchaseOrder(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetPurchaseOrders(data: { page?: number; limit?: number; sort?: string; status?: string; vendorId?: string; warehouseId?: string; orderDate?: string }, metadata?: Metadata): Observable<any>;
}

interface ProductsService {
  GetProduct(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetProducts(data: { page?: number; limit?: number; search?: string; sort?: string; status?: string; category?: string; type?: string; vendorId?: string }, metadata?: Metadata): Observable<any>;
}

interface InventoryBatchesService {
  GetInventoryBatch(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetInventoryBatches(data: { page?: number; limit?: number; sort?: string; productId?: string; warehouseId?: string; status?: string; batchNumber?: string; search?: string }, metadata?: Metadata): Observable<any>;
}

interface PurchaseBillsService {
  GetPurchaseBills(data: { sort?: string; status?: string; vendor_id?: string }, metadata?: Metadata): Observable<any>;
  GetPurchaseBill(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreatePurchaseBill(data: any, metadata?: Metadata): Observable<any>;
  UpdatePurchaseBill(data: any, metadata?: Metadata): Observable<any>;
  ApprovePurchaseBill(data: { id: string; approved_by: string; notes?: string }, metadata?: Metadata): Observable<any>;
  PostPurchaseBill(data: { id: string }, metadata?: Metadata): Observable<any>;
  DeletePurchaseBill(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface VendorCreditNotesService {
  GetVendorCreditNotes(data: { sort?: string; status?: string; vendor_id?: string }, metadata?: Metadata): Observable<any>;
  GetVendorCreditNote(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateVendorCreditNote(data: any, metadata?: Metadata): Observable<any>;
  ApplyVendorCreditNote(data: { id: string; bill_id: string; amount: number }, metadata?: Metadata): Observable<any>;
}

interface VendorPaymentsService {
  GetVendorPayments(data: { sort?: string; vendor_id?: string; status?: string }, metadata?: Metadata): Observable<any>;
  GetVendorPayment(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateVendorPayment(data: any, metadata?: Metadata): Observable<any>;
  ProcessVendorPayment(data: { id: string }, metadata?: Metadata): Observable<any>;
  DeleteVendorPayment(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface PaymentSchedulesService {
  GetPaymentSchedules(data: { vendor_id?: string; status?: string; due_date_from?: string; due_date_to?: string; sort?: string }, metadata?: Metadata): Observable<any>;
  GetPaymentSchedule(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreatePaymentSchedule(data: any, metadata?: Metadata): Observable<any>;
  DeletePaymentSchedule(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface RecurringBillsService {
  GetRecurringBills(data: { sort?: string; is_active?: boolean }, metadata?: Metadata): Observable<any>;
  GetRecurringBill(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateRecurringBill(data: any, metadata?: Metadata): Observable<any>;
  DeleteRecurringBill(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface BankAccountsService {
  GetBankAccounts(data: { sort?: string; is_active?: boolean }, metadata?: Metadata): Observable<any>;
  GetBankAccount(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateBankAccount(data: any, metadata?: Metadata): Observable<any>;
  GetBankAccountBalance(data: { id: string; as_of_date?: string }, metadata?: Metadata): Observable<any>;
  DeleteBankAccount(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface CashAccountsService {
  GetCashAccounts(data: { sort?: string; is_active?: boolean }, metadata?: Metadata): Observable<any>;
  GetCashAccount(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateCashAccount(data: any, metadata?: Metadata): Observable<any>;
  DeleteCashAccount(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface BankTransactionsService {
  GetBankTransactions(data: { sort?: string; bank_account_id?: string; category?: string; date_from?: string; date_to?: string }, metadata?: Metadata): Observable<any>;
  GetBankTransaction(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateBankTransaction(data: any, metadata?: Metadata): Observable<any>;
  ImportBankTransactions(data: any, metadata?: Metadata): Observable<any>;
  DeleteBankTransaction(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface BankReconciliationsService {
  GetBankReconciliations(data: { sort?: string; bank_account_id?: string; status?: string }, metadata?: Metadata): Observable<any>;
  GetBankReconciliation(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateBankReconciliation(data: any, metadata?: Metadata): Observable<any>;
  GetUnmatchedTransactions(data: { id: string }, metadata?: Metadata): Observable<any>;
  MatchTransactions(data: any, metadata?: Metadata): Observable<any>;
  CompleteReconciliation(data: { id: string; notes?: string }, metadata?: Metadata): Observable<any>;
  DeleteBankReconciliation(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface ChequesService {
  GetCheques(data: { sort?: string; type?: string; status?: string }, metadata?: Metadata): Observable<any>;
  GetCheque(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateCheque(data: any, metadata?: Metadata): Observable<any>;
  DepositCheque(data: { id: string; deposit_date?: string; bank_account_id: string }, metadata?: Metadata): Observable<any>;
  ClearCheque(data: { id: string; clear_date?: string }, metadata?: Metadata): Observable<any>;
  DeleteCheque(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface CashFlowService {
  GetCashFlow(data: { periodStart?: string; periodEnd?: string; accountType?: string }, metadata?: Metadata): Observable<any>;
  GetForecast(data: { periodStart: string; periodEnd: string; includeRecurring?: boolean }, metadata?: Metadata): Observable<any>;
  GetActual(data: { periodStart: string; periodEnd: string }, metadata?: Metadata): Observable<any>;
  CalculateCashFlow(data: any, metadata?: Metadata): Observable<any>;
}

interface BudgetsService {
  GetBudgets(data: { page?: number; limit?: number; sort?: string; fiscalYear?: number; department?: string; projectId?: string }, metadata?: Metadata): Observable<any>;
  GetBudget(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateBudget(data: any, metadata?: Metadata): Observable<any>;
  UpdateBudget(data: any, metadata?: Metadata): Observable<any>;
  DeleteBudget(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface ExpensesService {
  GetExpenses(data: { limit?: number; page?: number; sort?: string; status?: string; employeeId?: string; categoryId?: string }, metadata?: Metadata): Observable<any>;
  GetExpense(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateExpense(data: any, metadata?: Metadata): Observable<any>;
  UpdateExpense(data: any, metadata?: Metadata): Observable<any>;
  ApproveExpense(data: { id: string }, metadata?: Metadata): Observable<any>;
  RejectExpense(data: { id: string; reason?: string }, metadata?: Metadata): Observable<any>;
  DeleteExpense(data: { id: string }, metadata?: Metadata): Observable<any>;
  PostExpenseToGl(data: any, metadata?: Metadata): Observable<any>;
  BulkPostExpensesToGl(data: any, metadata?: Metadata): Observable<any>;
}

interface ExpenseCategoriesService {
  GetExpenseCategories(data: { limit?: number; page?: number; sort?: string; isActive?: boolean }, metadata?: Metadata): Observable<any>;
  GetExpenseCategory(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateExpenseCategory(data: any, metadata?: Metadata): Observable<any>;
  UpdateExpenseCategory(data: any, metadata?: Metadata): Observable<any>;
  DeleteExpenseCategory(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface ExpenseClaimsService {
  GetExpenseClaims(data: { limit?: number; page?: number; sort?: string; status?: string; employeeId?: string }, metadata?: Metadata): Observable<any>;
  GetExpenseClaim(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateExpenseClaim(data: any, metadata?: Metadata): Observable<any>;
  UpdateExpenseClaim(data: any, metadata?: Metadata): Observable<any>;
  SubmitExpenseClaim(data: { id: string }, metadata?: Metadata): Observable<any>;
  ApproveExpenseClaim(data: any, metadata?: Metadata): Observable<any>;
  RejectExpenseClaim(data: any, metadata?: Metadata): Observable<any>;
  DeleteExpenseClaim(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface ExpenseApprovalsService {
  GetExpenseApprovals(data: { limit?: number; page?: number; sort?: string; status?: string; approverId?: string }, metadata?: Metadata): Observable<any>;
  GetExpenseApproval(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateExpenseApproval(data: any, metadata?: Metadata): Observable<any>;
  UpdateExpenseApproval(data: any, metadata?: Metadata): Observable<any>;
  ApproveExpenseApproval(data: { id: string; notes?: string }, metadata?: Metadata): Observable<any>;
  RejectExpenseApproval(data: { id: string; notes?: string }, metadata?: Metadata): Observable<any>;
  DeleteExpenseApproval(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface InventoryValuationsService {
  GetInventoryValuations(data: { as_of_date?: string; valuation_method?: string }, metadata?: Metadata): Observable<any>;
  GetInventoryValuation(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateInventoryValuation(data: any, metadata?: Metadata): Observable<any>;
  UpdateInventoryValuation(data: any, metadata?: Metadata): Observable<any>;
  DeleteInventoryValuation(data: { id: string }, metadata?: Metadata): Observable<any>;
  CalculateInventoryValuation(data: { as_of_date: string; valuation_method: string }, metadata?: Metadata): Observable<any>;
  SyncInventoryValuations(data: { valuation_method?: string; batches?: any[] }, metadata?: Metadata): Observable<any>;
}

interface CogsService {
  GetCogs(data: { period_start?: string; period_end?: string }, metadata?: Metadata): Observable<any>;
  GetCogsRecord(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateCogs(data: any, metadata?: Metadata): Observable<any>;
  UpdateCogs(data: any, metadata?: Metadata): Observable<any>;
  DeleteCogs(data: { id: string }, metadata?: Metadata): Observable<any>;
  CalculateCogs(data: { period_start: string; period_end: string; item_ids?: string[] }, metadata?: Metadata): Observable<any>;
  GetCogsReport(data: { periodstart: string; periodend: string; format?: string }, metadata?: Metadata): Observable<any>;
}

interface InventoryAdjustmentsService {
  GetInventoryAdjustments(data: { sort?: string; adjustment_type?: string }, metadata?: Metadata): Observable<any>;
  GetInventoryAdjustment(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateInventoryAdjustment(data: any, metadata?: Metadata): Observable<any>;
  UpdateInventoryAdjustment(data: any, metadata?: Metadata): Observable<any>;
  DeleteInventoryAdjustment(data: { id: string }, metadata?: Metadata): Observable<any>;
  PostInventoryAdjustment(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface StockImpactsService {
  GetStockImpacts(data: { periodstart?: string; periodend?: string }, metadata?: Metadata): Observable<any>;
  GetStockImpact(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateStockImpact(data: any, metadata?: Metadata): Observable<any>;
  UpdateStockImpact(data: any, metadata?: Metadata): Observable<any>;
  DeleteStockImpact(data: { id: string }, metadata?: Metadata): Observable<any>;
  CalculateStockImpacts(data: { periodstart: string; periodend: string; itemids?: string[] }, metadata?: Metadata): Observable<any>;
}

interface AssetsService {
  GetAssets(data: { sort?: string; status?: string; asset_type?: string }, metadata?: Metadata): Observable<any>;
  GetAsset(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateAsset(data: any, metadata?: Metadata): Observable<any>;
  UpdateAsset(data: any, metadata?: Metadata): Observable<any>;
  DeleteAsset(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface DepreciationsService {
  GetDepreciations(data: { assetId?: string; periodStart?: string; periodEnd?: string }, metadata?: Metadata): Observable<any>;
  GetDepreciation(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateDepreciation(data: any, metadata?: Metadata): Observable<any>;
  UpdateDepreciation(data: any, metadata?: Metadata): Observable<any>;
  DeleteDepreciation(data: { id: string }, metadata?: Metadata): Observable<any>;
  CalculateDepreciation(data: { assetId: string; periodStart: string; periodEnd: string }, metadata?: Metadata): Observable<any>;
  GetDepreciationSchedule(data: { assetId: string }, metadata?: Metadata): Observable<any>;
  PostDepreciation(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface AssetRevaluationsService {
  GetAssetRevaluations(data: { assetId?: string; sort?: string }, metadata?: Metadata): Observable<any>;
  GetAssetRevaluation(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateAssetRevaluation(data: any, metadata?: Metadata): Observable<any>;
  UpdateAssetRevaluation(data: any, metadata?: Metadata): Observable<any>;
  DeleteAssetRevaluation(data: { id: string }, metadata?: Metadata): Observable<any>;
  PostAssetRevaluation(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface AssetDisposalsService {
  GetAssetDisposals(data: { assetId?: string; sort?: string }, metadata?: Metadata): Observable<any>;
  GetAssetDisposal(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateAssetDisposal(data: any, metadata?: Metadata): Observable<any>;
  DisposeAsset(data: { assetId: string; disposalDate: string; disposalMethod: string; disposalAmount?: string; reason: string; accountId: string }, metadata?: Metadata): Observable<any>;
  UpdateAssetDisposal(data: any, metadata?: Metadata): Observable<any>;
  DeleteAssetDisposal(data: { id: string }, metadata?: Metadata): Observable<any>;
  PostAssetDisposal(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface LoansService {
  GetLoans(data: { sort?: string; status?: string; loanType?: string }, metadata?: Metadata): Observable<any>;
  GetLoan(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateLoan(data: any, metadata?: Metadata): Observable<any>;
  UpdateLoan(data: any, metadata?: Metadata): Observable<any>;
  DeleteLoan(data: { id: string }, metadata?: Metadata): Observable<any>;
  MakePayment(data: any, metadata?: Metadata): Observable<any>;
  GetSchedule(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface AccruedExpensesService {
  GetAccruedExpenses(data: { sort?: string; status?: string }, metadata?: Metadata): Observable<any>;
  GetAccruedExpense(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateAccruedExpense(data: any, metadata?: Metadata): Observable<any>;
  UpdateAccruedExpense(data: any, metadata?: Metadata): Observable<any>;
  DeleteAccruedExpense(data: { id: string }, metadata?: Metadata): Observable<any>;
  ReverseAccruedExpense(data: any, metadata?: Metadata): Observable<any>;
}

interface TaxPayablesService {
  GetTaxPayables(data: { sort?: string; status?: string; taxType?: string }, metadata?: Metadata): Observable<any>;
  GetTaxPayable(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateTaxPayable(data: any, metadata?: Metadata): Observable<any>;
  UpdateTaxPayable(data: any, metadata?: Metadata): Observable<any>;
  DeleteTaxPayable(data: { id: string }, metadata?: Metadata): Observable<any>;
  PayTaxPayable(data: any, metadata?: Metadata): Observable<any>;
  CalculateTaxPayable(data: { taxType: string; period: string }, metadata?: Metadata): Observable<any>;
}

interface LiabilitiesService {
  GetLiabilities(data: { sort?: string; liabilityType?: string }, metadata?: Metadata): Observable<any>;
  GetLiability(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateLiability(data: any, metadata?: Metadata): Observable<any>;
  UpdateLiability(data: any, metadata?: Metadata): Observable<any>;
  DeleteLiability(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetLongTermLiabilities(data: {}, metadata?: Metadata): Observable<any>;
  GetShortTermLiabilities(data: {}, metadata?: Metadata): Observable<any>;
}

interface ProjectsService {
  GetProjects(data: { sort?: string; status?: string; department?: string; startDate?: string; endDate?: string }, metadata?: Metadata): Observable<any>;
  GetProject(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateProject(data: any, metadata?: Metadata): Observable<any>;
  UpdateProject(data: any, metadata?: Metadata): Observable<any>;
  DeleteProject(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetProjectBudget(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface CostCentersService {
  GetCostCenters(data: { sort?: string; isActive?: boolean; department?: string; parentId?: string }, metadata?: Metadata): Observable<any>;
  GetCostCenter(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateCostCenter(data: any, metadata?: Metadata): Observable<any>;
  UpdateCostCenter(data: any, metadata?: Metadata): Observable<any>;
  DeleteCostCenter(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetCostCenterBudget(data: { id: string; periodStart?: string; periodEnd?: string }, metadata?: Metadata): Observable<any>;
}

interface PricingService {
  GetPricings(data: { sort?: string; productId?: string; customerId?: string; isActive?: boolean; effectiveDate?: string }, metadata?: Metadata): Observable<any>;
  GetPricing(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreatePricing(data: any, metadata?: Metadata): Observable<any>;
  UpdatePricing(data: any, metadata?: Metadata): Observable<any>;
  DeletePricing(data: { id: string }, metadata?: Metadata): Observable<any>;
  CalculatePricing(data: { productId: string; customerId?: string; quantity: string; date?: string }, metadata?: Metadata): Observable<any>;
}

interface ContractsService {
  GetContracts(data: { sort?: string; status?: string; contractType?: string; customerId?: string; vendorId?: string; startDate?: string; endDate?: string }, metadata?: Metadata): Observable<any>;
  GetContract(data: { id: string }, metadata?: Metadata): Observable<any>;
  CreateContract(data: any, metadata?: Metadata): Observable<any>;
  UpdateContract(data: any, metadata?: Metadata): Observable<any>;
  DeleteContract(data: { id: string }, metadata?: Metadata): Observable<any>;
  ActivateContract(data: { id: string; activationDate?: string }, metadata?: Metadata): Observable<any>;
  RenewContract(data: { id: string; newEndDate: string; renewalTerms?: string; updatedValue?: string }, metadata?: Metadata): Observable<any>;
  TerminateContract(data: { id: string; terminationDate: string; terminationReason: string; notes?: string }, metadata?: Metadata): Observable<any>;
  GetContractPayments(data: { id: string }, metadata?: Metadata): Observable<any>;
}

@Injectable()
export class FinanceService implements OnModuleInit {
  private accountsService: AccountsService;
  private organizationsService: OrganizationsService;
  private journalEntriesService: JournalEntriesService;
  private journalEntryLinesService: JournalEntryLinesService;
  private generalLedgerService: GeneralLedgerService;
  private accountingPeriodsService: AccountingPeriodsService;
  private taxConfigurationsService: TaxConfigurationsService;
  private crmAccountsService: AccountsGrpcService;
  private invoicesService: InvoicesService;
  private creditNotesService: CreditNotesService;
  private customerPaymentsService: CustomerPaymentsService;
  private customerCreditsService: CustomerCreditsService;
  private reportsService: ReportsService;
  private vendorsService: VendorsService;
  private shipmentsService: ShipmentsService;
  private purchaseOrdersService: PurchaseOrdersService;
  private productsService: ProductsService;
  private inventoryBatchesService: InventoryBatchesService;
  private purchaseBillsService: PurchaseBillsService;
  private vendorCreditNotesService: VendorCreditNotesService;
  private vendorPaymentsService: VendorPaymentsService;
  private paymentSchedulesService: PaymentSchedulesService;
  private recurringBillsService: RecurringBillsService;
  private bankAccountsService: BankAccountsService;
  private cashAccountsService: CashAccountsService;
  private bankTransactionsService: BankTransactionsService;
  private bankReconciliationsService: BankReconciliationsService;
  private chequesService: ChequesService;
  private cashFlowService: CashFlowService;
  private budgetsService: BudgetsService;
  private expensesService: ExpensesService;
  private expenseCategoriesService: ExpenseCategoriesService;
  private expenseClaimsService: ExpenseClaimsService;
  private expenseApprovalsService: ExpenseApprovalsService;
  private inventoryValuationsService: InventoryValuationsService;
  private cogsService: CogsService;
  private inventoryAdjustmentsService: InventoryAdjustmentsService;
  private stockImpactsService: StockImpactsService;
  private assetsService: AssetsService;
  private depreciationsService: DepreciationsService;
  private assetRevaluationsService: AssetRevaluationsService;
  private assetDisposalsService: AssetDisposalsService;
  private loansService: LoansService;
  private accruedExpensesService: AccruedExpensesService;
  private taxPayablesService: TaxPayablesService;
  private liabilitiesService: LiabilitiesService;
  private projectsService: ProjectsService;
  private costCentersService: CostCentersService;
  private pricingService: PricingService;
  private contractsService: ContractsService;

  constructor(
    @Inject('FINANCE_PACKAGE') private client: ClientGrpc,
    @Inject('CRM_PACKAGE') private crmClient: ClientGrpc,
    @Inject('SUPPLYCHAIN_PACKAGE') private supplyChainClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.accountsService = this.client.getService<AccountsService>('AccountsService');
    this.organizationsService = this.client.getService<OrganizationsService>('OrganizationsService');
    this.journalEntriesService = this.client.getService<JournalEntriesService>('JournalEntriesService');
    this.journalEntryLinesService = this.client.getService<JournalEntryLinesService>('JournalEntryLinesService');
    this.generalLedgerService = this.client.getService<GeneralLedgerService>('GeneralLedgerService');
    this.accountingPeriodsService = this.client.getService<AccountingPeriodsService>('AccountingPeriodsService');
    this.taxConfigurationsService = this.client.getService<TaxConfigurationsService>('TaxConfigurationsService');
    this.crmAccountsService = this.crmClient.getService<AccountsGrpcService>('AccountsService');
    this.invoicesService = this.client.getService<InvoicesService>('InvoicesService');
    this.creditNotesService = this.client.getService<CreditNotesService>('CreditNotesService');
    this.customerPaymentsService = this.client.getService<CustomerPaymentsService>('CustomerPaymentsService');
    this.customerCreditsService = this.client.getService<CustomerCreditsService>('CustomerCreditsService');
    this.reportsService = this.client.getService<ReportsService>('ReportsService');
    this.vendorsService = this.supplyChainClient.getService<VendorsService>('VendorsService');
    this.shipmentsService = this.supplyChainClient.getService<ShipmentsService>('ShipmentsService');
    this.purchaseOrdersService = this.supplyChainClient.getService<PurchaseOrdersService>('PurchaseOrdersService');
    this.productsService = this.supplyChainClient.getService<ProductsService>('ProductsService');
    this.inventoryBatchesService = this.supplyChainClient.getService<InventoryBatchesService>('InventoryBatchesService');
    this.purchaseBillsService = this.client.getService<PurchaseBillsService>('PurchaseBillsService');
    this.vendorCreditNotesService = this.client.getService<VendorCreditNotesService>('VendorCreditNotesService');
    this.vendorPaymentsService = this.client.getService<VendorPaymentsService>('VendorPaymentsService');
    this.paymentSchedulesService = this.client.getService<PaymentSchedulesService>('PaymentSchedulesService');
    this.recurringBillsService = this.client.getService<RecurringBillsService>('RecurringBillsService');
    this.bankAccountsService = this.client.getService<BankAccountsService>('BankAccountsService');
    this.cashAccountsService = this.client.getService<CashAccountsService>('CashAccountsService');
    this.bankTransactionsService = this.client.getService<BankTransactionsService>('BankTransactionsService');
    this.bankReconciliationsService = this.client.getService<BankReconciliationsService>('BankReconciliationsService');
    this.chequesService = this.client.getService<ChequesService>('ChequesService');
    this.cashFlowService = this.client.getService<CashFlowService>('CashFlowService');
    this.budgetsService = this.client.getService<BudgetsService>('BudgetsService');
    this.expensesService = this.client.getService<ExpensesService>('ExpensesService');
    this.expenseCategoriesService = this.client.getService<ExpenseCategoriesService>('ExpenseCategoriesService');
    this.expenseClaimsService = this.client.getService<ExpenseClaimsService>('ExpenseClaimsService');
    this.expenseApprovalsService = this.client.getService<ExpenseApprovalsService>('ExpenseApprovalsService');
    this.inventoryValuationsService = this.client.getService<InventoryValuationsService>('InventoryValuationsService');
    this.cogsService = this.client.getService<CogsService>('CogsService');
    this.inventoryAdjustmentsService = this.client.getService<InventoryAdjustmentsService>('InventoryAdjustmentsService');
    this.stockImpactsService = this.client.getService<StockImpactsService>('StockImpactsService');
    this.assetsService = this.client.getService<AssetsService>('AssetsService');
    this.depreciationsService = this.client.getService<DepreciationsService>('DepreciationsService');
    this.assetRevaluationsService = this.client.getService<AssetRevaluationsService>('AssetRevaluationsService');
    this.assetDisposalsService = this.client.getService<AssetDisposalsService>('AssetDisposalsService');
    
    // Verify service initialization
    if (!this.vendorsService) {
      console.error('VendorsService failed to initialize from SUPPLYCHAIN_PACKAGE');
    } else {
      console.log('VendorsService initialized successfully');
    }
    if (!this.shipmentsService) {
      console.error('ShipmentsService failed to initialize from SUPPLYCHAIN_PACKAGE');
    } else {
      console.log('ShipmentsService initialized successfully');
    }
    if (!this.purchaseOrdersService) {
      console.error('PurchaseOrdersService failed to initialize from SUPPLYCHAIN_PACKAGE');
    } else {
      console.log('PurchaseOrdersService initialized successfully');
    }
    if (!this.productsService) {
      console.error('ProductsService failed to initialize from SUPPLYCHAIN_PACKAGE');
    } else {
      console.log('ProductsService initialized successfully');
    }
    if (!this.inventoryBatchesService) {
      console.error('InventoryBatchesService failed to initialize from SUPPLYCHAIN_PACKAGE');
    } else {
      console.log('InventoryBatchesService initialized successfully');
    }
    if (this.cogsService) {
      console.log('✓ CogsService initialized');
    } else {
      console.error('✗ CogsService failed to initialize');
    }

    if (this.inventoryAdjustmentsService) {
      console.log('✓ InventoryAdjustmentsService initialized');
    } else {
      console.error('✗ InventoryAdjustmentsService failed to initialize');
    }

    if (this.stockImpactsService) {
      console.log('✓ StockImpactsService initialized');
    } else {
      console.error('✗ StockImpactsService failed to initialize');
    }

    if (this.assetsService) {
      console.log('✓ AssetsService initialized');
    } else {
      console.error('✗ AssetsService failed to initialize');
    }

    if (this.depreciationsService) {
      console.log('✓ DepreciationsService initialized');
    } else {
      console.error('✗ DepreciationsService failed to initialize');
    }

    if (this.assetRevaluationsService) {
      console.log('✓ AssetRevaluationsService initialized');
    } else {
      console.error('✗ AssetRevaluationsService failed to initialize');
    }

    if (this.assetDisposalsService) {
      console.log('✓ AssetDisposalsService initialized');
    } else {
      console.error('✗ AssetDisposalsService failed to initialize');
    }

    this.loansService = this.client.getService<LoansService>('LoansService');
    if (this.loansService) {
      console.log('✓ LoansService initialized');
    } else {
      console.error('✗ LoansService failed to initialize');
    }

    this.accruedExpensesService = this.client.getService<AccruedExpensesService>('AccruedExpensesService');
    if (this.accruedExpensesService) {
      console.log('✓ AccruedExpensesService initialized');
    } else {
      console.error('✗ AccruedExpensesService failed to initialize');
    }

    this.taxPayablesService = this.client.getService<TaxPayablesService>('TaxPayablesService');
    if (this.taxPayablesService) {
      console.log('✓ TaxPayablesService initialized');
    } else {
      console.error('✗ TaxPayablesService failed to initialize');
    }

    this.liabilitiesService = this.client.getService<LiabilitiesService>('LiabilitiesService');
    if (this.liabilitiesService) {
      console.log('✓ LiabilitiesService initialized');
    } else {
      console.error('✗ LiabilitiesService failed to initialize');
    }

    this.projectsService = this.client.getService<ProjectsService>('ProjectsService');
    if (this.projectsService) {
      console.log('✓ ProjectsService initialized');
    } else {
      console.error('✗ ProjectsService failed to initialize');
    }

    this.costCentersService = this.client.getService<CostCentersService>('CostCentersService');
    if (this.costCentersService) {
      console.log('✓ CostCentersService initialized');
    } else {
      console.error('✗ CostCentersService failed to initialize');
    }

    this.pricingService = this.client.getService<PricingService>('PricingService');
    if (this.pricingService) {
      console.log('✓ PricingService initialized');
    } else {
      console.error('✗ PricingService failed to initialize');
    }

    this.contractsService = this.client.getService<ContractsService>('ContractsService');
    if (this.contractsService) {
      console.log('✓ ContractsService initialized');
    } else {
      console.error('✗ ContractsService failed to initialize');
    }
  }

  private createMetadata(token?: string): Metadata {
    const metadata = new Metadata();
    if (token) {
      metadata.add('authorization', `Bearer ${token}`);
    }
    return metadata;
  }

  async getAccount(id: string) {
    return await firstValueFrom(this.accountsService.GetAccount({ id }));
  }

  async getAccounts(query: any) {
    return await firstValueFrom(this.accountsService.GetAccounts(query));
  }

  async createAccount(data: any) {
    return await firstValueFrom(this.accountsService.CreateAccount(data));
  }

  async updateAccount(id: string, data: any) {
    return await firstValueFrom(this.accountsService.UpdateAccount({ id, ...data }));
  }

  async deleteAccount(id: string) {
    return await firstValueFrom(this.accountsService.DeleteAccount({ id }));
  }

  // Organization methods
  async getOrganization(id: string) {
    return await firstValueFrom(this.organizationsService.GetOrganization({ id }));
  }

  async getOrganizations(query: any) {
    return await firstValueFrom(this.organizationsService.GetOrganizations(query));
  }

  async createOrganization(data: any) {
    return await firstValueFrom(this.organizationsService.CreateOrganization(data));
  }

  async updateOrganization(id: string, data: any) {
    return await firstValueFrom(this.organizationsService.UpdateOrganization({ id, ...data }));
  }

  async deleteOrganization(id: string) {
    return await firstValueFrom(this.organizationsService.DeleteOrganization({ id }));
  }

  // Journal Entry methods
  async getJournalEntry(id: string) {
    return await firstValueFrom(this.journalEntriesService.GetJournalEntry({ id }));
  }

  async getJournalEntries(query: any) {
    return await firstValueFrom(this.journalEntriesService.GetJournalEntries(query));
  }

  async createJournalEntry(data: any) {
    return await firstValueFrom(this.journalEntriesService.CreateJournalEntry(data));
  }

  async updateJournalEntry(id: string, data: any) {
    return await firstValueFrom(this.journalEntriesService.UpdateJournalEntry({ id, ...data }));
  }

  async postJournalEntry(id: string) {
    return await firstValueFrom(this.journalEntriesService.PostJournalEntry({ id }));
  }

  async voidJournalEntry(id: string, reason?: string) {
    return await firstValueFrom(this.journalEntriesService.VoidJournalEntry({ id, reason }));
  }

  async deleteJournalEntry(id: string) {
    return await firstValueFrom(this.journalEntriesService.DeleteJournalEntry({ id }));
  }

  // Journal Entry Line methods
  async getJournalEntryLines(journalEntryId: string) {
    return await firstValueFrom(this.journalEntryLinesService.GetJournalEntryLines({ journal_entry_id: journalEntryId }));
  }

  async createJournalEntryLine(data: any) {
    return await firstValueFrom(this.journalEntryLinesService.CreateJournalEntryLine(data));
  }

  async deleteJournalEntryLine(id: string) {
    return await firstValueFrom(this.journalEntryLinesService.DeleteJournalEntryLine({ id }));
  }

  // General Ledger methods
  async getGeneralLedger(query: any) {
    return await firstValueFrom(this.generalLedgerService.GetGeneralLedger(query));
  }

  async getAccountLedger(accountId: string, query: any) {
    return await firstValueFrom(this.generalLedgerService.GetAccountLedger({ account_id: accountId, ...query }));
  }

  async getGeneralLedgerReport(query: any) {
    return await firstValueFrom(this.generalLedgerService.GetGeneralLedgerReport(query));
  }

  // Accounting Period methods
  async getAccountingPeriods(query: any) {
    return await firstValueFrom(this.accountingPeriodsService.GetAccountingPeriods(query));
  }

  async getAccountingPeriod(id: string) {
    return await firstValueFrom(this.accountingPeriodsService.GetAccountingPeriod({ id }));
  }

  async getCurrentAccountingPeriod(organizationId?: string) {
    return await firstValueFrom(this.accountingPeriodsService.GetCurrentAccountingPeriod({ organization_id: organizationId }));
  }

  async createAccountingPeriod(data: any) {
    return await firstValueFrom(this.accountingPeriodsService.CreateAccountingPeriod(data));
  }

  async updateAccountingPeriod(id: string, data: any) {
    return await firstValueFrom(this.accountingPeriodsService.UpdateAccountingPeriod({ id, ...data }));
  }

  async closeAccountingPeriod(id: string, data: any) {
    return await firstValueFrom(this.accountingPeriodsService.CloseAccountingPeriod({ id, ...data }));
  }

  async deleteAccountingPeriod(id: string) {
    return await firstValueFrom(this.accountingPeriodsService.DeleteAccountingPeriod({ id }));
  }

  // Tax Configuration methods
  async getTaxConfigurations(query: any) {
    return await firstValueFrom(this.taxConfigurationsService.GetTaxConfigurations(query));
  }

  async getTaxConfiguration(id: string) {
    return await firstValueFrom(this.taxConfigurationsService.GetTaxConfiguration({ id }));
  }

  async createTaxConfiguration(data: any) {
    return await firstValueFrom(this.taxConfigurationsService.CreateTaxConfiguration(data));
  }

  async updateTaxConfiguration(id: string, data: any) {
    return await firstValueFrom(this.taxConfigurationsService.UpdateTaxConfiguration({ id, ...data }));
  }

  async calculateTax(data: any) {
    return await firstValueFrom(this.taxConfigurationsService.CalculateTax(data));
  }

  async deleteTaxConfiguration(id: string) {
    return await firstValueFrom(this.taxConfigurationsService.DeleteTaxConfiguration({ id }));
  }

  // CRM Accounts methods
  async getCrmAccounts(page = 1, limit = 10, token?: string) {
    try {
      return await firstValueFrom(
        this.crmAccountsService.findAllAccounts({ page, limit }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error getting CRM accounts:', error);
      throw error;
    }
  }

  async getCrmAccount(id: string, token?: string) {
    try {
      return await firstValueFrom(
        this.crmAccountsService.findOneAccount({ id }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error getting CRM account:', error);
      throw error;
    }
  }

  // Invoice methods
  async getInvoices(query: any) {
    return await firstValueFrom(this.invoicesService.GetInvoices(query));
  }

  async getInvoice(id: string) {
    return await firstValueFrom(this.invoicesService.GetInvoice({ id }));
  }

  async createInvoice(data: any) {
    return await firstValueFrom(this.invoicesService.CreateInvoice(data));
  }

  async updateInvoice(id: string, data: any) {
    return await firstValueFrom(this.invoicesService.UpdateInvoice({ id, ...data }));
  }

  async sendInvoice(id: string, data: any) {
    return await firstValueFrom(this.invoicesService.SendInvoice({ id, ...data }));
  }

  async convertProforma(id: string) {
    return await firstValueFrom(this.invoicesService.ConvertProforma({ id }));
  }

  async deleteInvoice(id: string) {
    return await firstValueFrom(this.invoicesService.DeleteInvoice({ id }));
  }

  // Credit Note methods
  async getCreditNotes(query: any) {
    return await firstValueFrom(this.creditNotesService.GetCreditNotes(query));
  }

  async getCreditNote(id: string) {
    return await firstValueFrom(this.creditNotesService.GetCreditNote({ id }));
  }

  async createCreditNote(data: any) {
    return await firstValueFrom(this.creditNotesService.CreateCreditNote(data));
  }

  async updateCreditNote(id: string, data: any) {
    return await firstValueFrom(this.creditNotesService.UpdateCreditNote({ id, ...data }));
  }

  async applyCreditNote(id: string, data: any) {
    return await firstValueFrom(this.creditNotesService.ApplyCreditNote({ id, ...data }));
  }

  async deleteCreditNote(id: string) {
    return await firstValueFrom(this.creditNotesService.DeleteCreditNote({ id }));
  }

  // Customer Payment methods
  async getCustomerPayments(query: any) {
    return await firstValueFrom(this.customerPaymentsService.GetCustomerPayments(query));
  }

  async getCustomerPayment(id: string) {
    return await firstValueFrom(this.customerPaymentsService.GetCustomerPayment({ id }));
  }

  async getUnallocatedPayments() {
    return await firstValueFrom(this.customerPaymentsService.GetUnallocatedPayments({}));
  }

  async createCustomerPayment(data: any) {
    return await firstValueFrom(this.customerPaymentsService.CreateCustomerPayment(data));
  }

  async updateCustomerPayment(id: string, data: any) {
    return await firstValueFrom(this.customerPaymentsService.UpdateCustomerPayment({ id, ...data }));
  }

  async allocatePayment(id: string, data: any) {
    return await firstValueFrom(this.customerPaymentsService.AllocatePayment({ id, ...data }));
  }

  async deleteCustomerPayment(id: string) {
    return await firstValueFrom(this.customerPaymentsService.DeleteCustomerPayment({ id }));
  }

  // Customer Credit methods
  async getCustomerCredits(query: any) {
    return await firstValueFrom(this.customerCreditsService.GetCustomerCredits(query));
  }

  async getCustomerCredit(id: string) {
    return await firstValueFrom(this.customerCreditsService.GetCustomerCredit({ id }));
  }

  async createCustomerCredit(data: any) {
    return await firstValueFrom(this.customerCreditsService.CreateCustomerCredit(data));
  }

  async updateCustomerCredit(id: string, data: any) {
    return await firstValueFrom(this.customerCreditsService.UpdateCustomerCredit({ id, ...data }));
  }

  async deleteCustomerCredit(id: string) {
    return await firstValueFrom(this.customerCreditsService.DeleteCustomerCredit({ id }));
  }

  async recalculateCreditBalance(customerId: string) {
    return await firstValueFrom(this.customerCreditsService.RecalculateBalance({ customerId }));
  }

  // Reports methods
  async getArAgingReport(query: any) {
    return await firstValueFrom(this.reportsService.GetArAgingReport(query));
  }

  async getBudgetVsActual(query: any, token?: string) {
    const requestData: any = {
      fiscalYear: query.fiscal_year ? parseInt(query.fiscal_year.toString()) : undefined,
    };
    if (query.department) requestData.department = String(query.department);
    if (query.project_id) requestData.projectId = String(query.project_id);
    if (query.account_id) requestData.accountId = String(query.account_id);
    if (query.format) requestData.format = String(query.format);
    return await firstValueFrom(this.reportsService.GetBudgetVsActual(requestData, this.createMetadata(token)));
  }

  // Supply Chain Vendors methods
  async getVendors(page = 1, limit = 10, sort?: string, status?: string, search?: string, token?: string) {
    try {
      if (!this.vendorsService) {
        throw new Error('VendorsService is not initialized. Check SUPPLYCHAIN_PACKAGE connection.');
      }
      
      console.log('Finance Service - Calling GetVendors with:', { page, limit, sort, status, search });
      const result = await firstValueFrom(
        this.vendorsService.GetVendors({ page, limit, sort, status, search }, this.createMetadata(token))
      );
      console.log('Finance Service - GetVendors response:', JSON.stringify({
        hasResult: !!result,
        resultKeys: result ? Object.keys(result) : [],
        vendorsCount: result?.vendors?.length || 0,
        total: result?.total,
        sampleVendor: result?.vendors?.[0] || null,
      }, null, 2));
      return result;
    } catch (error) {
      console.error('gRPC Error getting vendors:', error);
      console.error('gRPC Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        stack: error.stack,
      });
      throw error;
    }
  }

  async getVendor(id: string, token?: string) {
    try {
      return await firstValueFrom(
        this.vendorsService.GetVendor({ id }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error getting vendor:', error);
      throw error;
    }
  }

  // Supply Chain Shipments methods
  async getShipments(page = 1, limit = 10, sort?: string, status?: string, type?: string, warehouse_id?: string, shipment_date?: string, token?: string) {
    try {
      if (!this.shipmentsService) {
        throw new Error('ShipmentsService is not initialized. Check SUPPLYCHAIN_PACKAGE connection.');
      }
      
      console.log('Finance Service - Calling GetShipments with:', { page, limit, sort, status, type, warehouse_id, shipment_date });
      const result = await firstValueFrom(
        this.shipmentsService.GetShipments(
          { page, limit, sort, status, type, warehouseId: warehouse_id, shipmentDate: shipment_date },
          this.createMetadata(token)
        )
      );
      console.log('Finance Service - GetShipments response:', JSON.stringify({
        hasResult: !!result,
        resultKeys: result ? Object.keys(result) : [],
        shipmentsCount: result?.shipments?.length || 0,
        total: result?.total,
        sampleShipment: result?.shipments?.[0] || null,
      }, null, 2));
      return result;
    } catch (error) {
      console.error('gRPC Error getting shipments:', error);
      console.error('gRPC Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        stack: error.stack,
      });
      throw error;
    }
  }

  async getShipment(id: string, token?: string) {
    try {
      if (!this.shipmentsService) {
        throw new Error('ShipmentsService is not initialized. Check SUPPLYCHAIN_PACKAGE connection.');
      }
      return await firstValueFrom(
        this.shipmentsService.GetShipment({ id }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error getting shipment:', error);
      throw error;
    }
  }

  // Supply Chain Purchase Orders methods
  async getPurchaseOrders(page = 1, limit = 10, sort?: string, status?: string, vendor_id?: string, warehouse_id?: string, order_date?: string, token?: string) {
    try {
      if (!this.purchaseOrdersService) {
        throw new Error('PurchaseOrdersService is not initialized. Check SUPPLYCHAIN_PACKAGE connection.');
      }
      
      console.log('Finance Service - Calling GetPurchaseOrders with:', { page, limit, sort, status, vendor_id, warehouse_id, order_date });
      
      const observable = this.purchaseOrdersService.GetPurchaseOrders(
        { page, limit, sort, status, vendorId: vendor_id, warehouseId: warehouse_id, orderDate: order_date },
        this.createMetadata(token)
      );
      
      const result = await firstValueFrom(
        observable.pipe(
          take(1), // Only take the first value to ensure completion
          timeout(30000), // 30 second timeout
          catchError(error => {
            // Suppress internal NestJS gRPC client subscription errors
            // These are often non-fatal and occur during connection setup
            const errorStack = String(error?.stack || '');
            const errorMessage = String(error?.message || '');
            const isInternalSubscriptionError = (errorStack.includes('client-grpc.js') || errorMessage.includes('client-grpc')) && 
                                                (errorStack.includes('_subscribe') || errorStack.includes('_trySubscribe'));
            
            if (!isInternalSubscriptionError) {
              console.error('gRPC Observable error in GetPurchaseOrders:', {
                message: errorMessage,
                code: error?.code,
                details: error?.details,
              });
            }
            return throwError(() => error);
          })
        )
      );
      
      console.log('Finance Service - GetPurchaseOrders response:', JSON.stringify({
        hasResult: !!result,
        resultKeys: result ? Object.keys(result) : [],
        purchaseOrdersCount: result?.purchaseOrders?.length || result?.data?.length || 0,
        total: result?.total,
        samplePurchaseOrder: result?.purchaseOrders?.[0] || result?.data?.[0] || null,
      }, null, 2));
      return result;
    } catch (error) {
      console.error('gRPC Error getting purchase orders:', error);
      console.error('gRPC Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        stack: error.stack,
      });
      throw error;
    }
  }

  async getPurchaseOrder(id: string, token?: string) {
    try {
      if (!this.purchaseOrdersService) {
        throw new Error('PurchaseOrdersService is not initialized. Check SUPPLYCHAIN_PACKAGE connection.');
      }
      return await firstValueFrom(
        this.purchaseOrdersService.GetPurchaseOrder({ id }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error getting purchase order:', error);
      throw error;
    }
  }

  // Supply Chain Products/Inventory methods
  async getProducts(page = 1, limit = 10, search?: string, sort?: string, status?: string, category?: string, type?: string, vendor_id?: string, token?: string) {
    try {
      if (!this.productsService) {
        throw new Error('ProductsService is not initialized. Check SUPPLYCHAIN_PACKAGE connection.');
      }
      
      console.log('Finance Service - Calling GetProducts with:', { page, limit, search, sort, status, category, type, vendor_id });
      const observable = this.productsService.GetProducts(
        { page, limit, search, sort, status, category, type, vendorId: vendor_id },
        this.createMetadata(token)
      );
      
      const result = await firstValueFrom(
        observable.pipe(
          take(1), // Only take the first value to ensure completion
          timeout(30000), // 30 second timeout
          catchError(error => {
            // Suppress subscription errors that don't prevent the request from completing
            const errorMessage = error?.message || String(error);
            const errorStack = error?.stack || '';
            const isSubscriptionError = errorMessage.includes('_subscribe') || 
                                       errorMessage.includes('_trySubscribe') ||
                                       errorStack.includes('_subscribe') ||
                                       errorStack.includes('_trySubscribe');
            
            if (!isSubscriptionError) {
              console.error('gRPC Observable error in GetProducts:', error);
            }
            return throwError(() => error);
          })
        )
      );
      console.log('Finance Service - GetProducts response:', JSON.stringify({
        hasResult: !!result,
        resultKeys: result ? Object.keys(result) : [],
        productsCount: result?.products?.length || 0,
        total: result?.total,
        sampleProduct: result?.products?.[0] || null,
      }, null, 2));
      return result;
    } catch (error) {
      console.error('gRPC Error getting products:', error);
      console.error('gRPC Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        stack: error.stack,
      });
      throw error;
    }
  }

  async getProduct(id: string, token?: string) {
    try {
      if (!this.productsService) {
        throw new Error('ProductsService is not initialized. Check SUPPLYCHAIN_PACKAGE connection.');
      }
      return await firstValueFrom(
        this.productsService.GetProduct({ id }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error getting product:', error);
      throw error;
    }
  }

  // Purchase Bills methods
  async getPurchaseBills(query: any, token?: string) {
    return await firstValueFrom(this.purchaseBillsService.GetPurchaseBills(query, this.createMetadata(token)));
  }

  async getPurchaseBill(id: string, token?: string) {
    return await firstValueFrom(this.purchaseBillsService.GetPurchaseBill({ id }, this.createMetadata(token)));
  }

  async createPurchaseBill(data: any, token?: string) {
    // Map snake_case to camelCase for gRPC
    const grpcData = {
      organizationId: data.organization_id,
      organization_id: data.organization_id,
      billNumber: data.bill_number,
      bill_number: data.bill_number,
      vendorId: data.vendor_id,
      vendor_id: data.vendor_id,
      billDate: data.bill_date,
      bill_date: data.bill_date,
      dueDate: data.due_date,
      due_date: data.due_date,
      status: data.status,
      currency: data.currency,
      taxRate: data.tax_rate,
      tax_rate: data.tax_rate,
      attachmentUrl: data.attachment_url,
      attachment_url: data.attachment_url,
      attachmentName: data.attachment_name,
      attachment_name: data.attachment_name,
      items: (data.items || []).map((item: any) => ({
        description: item.description,
        quantity: item.quantity?.toString() || '1',
        unitPrice: item.unitPrice?.toString() || item.unit_price?.toString() || '0',
        unit_price: item.unitPrice?.toString() || item.unit_price?.toString() || '0',
        accountId: item.accountId || item.account_id,
        account_id: item.accountId || item.account_id,
      })),
    };
    return await firstValueFrom(this.purchaseBillsService.CreatePurchaseBill(grpcData, this.createMetadata(token)));
  }

  async updatePurchaseBill(id: string, data: any, token?: string) {
    // Map snake_case to camelCase for gRPC
    const grpcData = {
      id: id,
      organizationId: data.organization_id,
      organization_id: data.organization_id,
      billNumber: data.bill_number,
      bill_number: data.bill_number,
      vendorId: data.vendor_id,
      vendor_id: data.vendor_id,
      billDate: data.bill_date,
      bill_date: data.bill_date,
      dueDate: data.due_date,
      due_date: data.due_date,
      status: data.status,
      currency: data.currency,
      taxRate: data.tax_rate,
      tax_rate: data.tax_rate,
      attachmentUrl: data.attachment_url,
      attachment_url: data.attachment_url,
      attachmentName: data.attachment_name,
      attachment_name: data.attachment_name,
      // Only include items if they're explicitly provided and not empty
      items: (data.items && Array.isArray(data.items) && data.items.length > 0) ? data.items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity?.toString() || '1',
        unitPrice: item.unitPrice?.toString() || item.unit_price?.toString() || '0',
        unit_price: item.unitPrice?.toString() || item.unit_price?.toString() || '0',
        accountId: item.accountId || item.account_id,
        account_id: item.accountId || item.account_id,
      })) : undefined,
    };
    return await firstValueFrom(this.purchaseBillsService.UpdatePurchaseBill(grpcData, this.createMetadata(token)));
  }

  async approvePurchaseBill(id: string, approvedBy: string, notes?: string, token?: string) {
    return await firstValueFrom(
      this.purchaseBillsService.ApprovePurchaseBill({ id, approved_by: approvedBy, notes }, this.createMetadata(token))
    );
  }

  async postPurchaseBill(id: string, token?: string) {
    return await firstValueFrom(this.purchaseBillsService.PostPurchaseBill({ id }, this.createMetadata(token)));
  }

  async deletePurchaseBill(id: string, token?: string) {
    return await firstValueFrom(this.purchaseBillsService.DeletePurchaseBill({ id }, this.createMetadata(token)));
  }

  // Vendor Credit Notes methods
  async getVendorCreditNotes(query: any, token?: string) {
    return await firstValueFrom(this.vendorCreditNotesService.GetVendorCreditNotes(query, this.createMetadata(token)));
  }

  async getVendorCreditNote(id: string, token?: string) {
    return await firstValueFrom(this.vendorCreditNotesService.GetVendorCreditNote({ id }, this.createMetadata(token)));
  }

  async createVendorCreditNote(data: any, token?: string) {
    // Map snake_case to camelCase for gRPC (support both formats)
    const grpcData = {
      organizationId: data.organization_id,
      organization_id: data.organization_id,
      creditNoteNumber: data.credit_note_number,
      credit_note_number: data.credit_note_number,
      vendorId: data.vendor_id,
      vendor_id: data.vendor_id,
      billId: data.bill_id,
      bill_id: data.bill_id,
      creditDate: data.credit_date,
      credit_date: data.credit_date,
      reason: data.reason,
      status: data.status,
      totalAmount: data.total_amount?.toString(),
      total_amount: data.total_amount?.toString(),
      description: data.description,
      items: (data.items || []).map((item: any) => ({
        description: item.description,
        quantity: item.quantity?.toString() || '1',
        unitPrice: item.unit_price?.toString() || item.unitPrice?.toString() || '0',
        unit_price: item.unit_price?.toString() || item.unitPrice?.toString() || '0',
        amount: item.amount?.toString() || '0',
      })),
    };
    return await firstValueFrom(this.vendorCreditNotesService.CreateVendorCreditNote(grpcData, this.createMetadata(token)));
  }

  async applyVendorCreditNote(id: string, billId: string, amount: number, token?: string) {
    return await firstValueFrom(
      this.vendorCreditNotesService.ApplyVendorCreditNote({ id, bill_id: billId, amount }, this.createMetadata(token))
    );
  }

  // Vendor Payments methods
  async getVendorPayments(query: any, token?: string) {
    return await firstValueFrom(this.vendorPaymentsService.GetVendorPayments(query, this.createMetadata(token)));
  }

  async getVendorPayment(id: string, token?: string) {
    return await firstValueFrom(this.vendorPaymentsService.GetVendorPayment({ id }, this.createMetadata(token)));
  }

  async createVendorPayment(data: any, token?: string) {
    // Map snake_case to camelCase for gRPC (support both formats)
    const grpcData = {
      organizationId: data.organization_id,
      organization_id: data.organization_id,
      paymentNumber: data.payment_number,
      payment_number: data.payment_number,
      vendorId: data.vendor_id,
      vendor_id: data.vendor_id,
      paymentDate: data.payment_date,
      payment_date: data.payment_date,
      paymentMethod: data.payment_method,
      payment_method: data.payment_method,
      amount: data.amount?.toString(),
      currency: data.currency,
      bankAccountId: data.bank_account_id,
      bank_account_id: data.bank_account_id,
      allocations: (data.allocations || []).map((alloc: any) => ({
        billId: alloc.bill_id || alloc.billId,
        bill_id: alloc.bill_id || alloc.billId,
        amount: alloc.amount?.toString(),
      })),
    };
    return await firstValueFrom(this.vendorPaymentsService.CreateVendorPayment(grpcData, this.createMetadata(token)));
  }

  async processVendorPayment(id: string, token?: string) {
    return await firstValueFrom(this.vendorPaymentsService.ProcessVendorPayment({ id }, this.createMetadata(token)));
  }

  async deleteVendorPayment(id: string, token?: string) {
    return await firstValueFrom(this.vendorPaymentsService.DeleteVendorPayment({ id }, this.createMetadata(token)));
  }

  // Payment Schedules methods
  async getPaymentSchedules(query: any, token?: string) {
    return await firstValueFrom(this.paymentSchedulesService.GetPaymentSchedules(query, this.createMetadata(token)));
  }

  async getPaymentSchedule(id: string, token?: string) {
    return await firstValueFrom(this.paymentSchedulesService.GetPaymentSchedule({ id }, this.createMetadata(token)));
  }

  async createPaymentSchedule(data: any, token?: string) {
    // Map snake_case to camelCase for gRPC (support both formats)
    const grpcData = {
      organizationId: data.organization_id,
      organization_id: data.organization_id,
      vendorId: data.vendor_id,
      vendor_id: data.vendor_id,
      billId: data.bill_id,
      bill_id: data.bill_id,
      dueDate: data.due_date,
      due_date: data.due_date,
      amountDue: data.amount_due?.toString(),
      amount_due: data.amount_due?.toString(),
      paymentMethod: data.payment_method,
      payment_method: data.payment_method,
      scheduledPaymentDate: data.scheduled_payment_date,
      scheduled_payment_date: data.scheduled_payment_date,
      priority: data.priority,
    };
    return await firstValueFrom(this.paymentSchedulesService.CreatePaymentSchedule(grpcData, this.createMetadata(token)));
  }

  async deletePaymentSchedule(id: string, token?: string) {
    return await firstValueFrom(this.paymentSchedulesService.DeletePaymentSchedule({ id }, this.createMetadata(token)));
  }

  // Recurring Bills methods
  async getRecurringBills(query: any, token?: string) {
    return await firstValueFrom(this.recurringBillsService.GetRecurringBills(query, this.createMetadata(token)));
  }

  async getRecurringBill(id: string, token?: string) {
    return await firstValueFrom(this.recurringBillsService.GetRecurringBill({ id }, this.createMetadata(token)));
  }

  async createRecurringBill(data: any, token?: string) {
    // Map snake_case to camelCase for gRPC (support both formats)
    const grpcData = {
      organizationId: data.organization_id,
      organization_id: data.organization_id,
      billName: data.bill_name,
      bill_name: data.bill_name,
      vendorId: data.vendor_id,
      vendor_id: data.vendor_id,
      category: data.category,
      amount: data.amount?.toString(),
      currency: data.currency,
      frequency: data.frequency,
      startDate: data.start_date,
      start_date: data.start_date,
      endDate: data.end_date,
      end_date: data.end_date,
      isActive: data.is_active !== undefined 
        ? (typeof data.is_active === 'boolean' ? data.is_active : data.is_active === 'true' || data.is_active === true)
        : undefined,
      is_active: data.is_active !== undefined 
        ? (typeof data.is_active === 'boolean' ? data.is_active : data.is_active === 'true' || data.is_active === true)
        : undefined,
      autoCreate: data.auto_create !== undefined 
        ? (typeof data.auto_create === 'boolean' ? data.auto_create : data.auto_create === 'true' || data.auto_create === true)
        : undefined,
      auto_create: data.auto_create !== undefined 
        ? (typeof data.auto_create === 'boolean' ? data.auto_create : data.auto_create === 'true' || data.auto_create === true)
        : undefined,
      accountId: data.account_id,
      account_id: data.account_id,
    };
    return await firstValueFrom(this.recurringBillsService.CreateRecurringBill(grpcData, this.createMetadata(token)));
  }

  async deleteRecurringBill(id: string, token?: string) {
    return await firstValueFrom(this.recurringBillsService.DeleteRecurringBill({ id }, this.createMetadata(token)));
  }

  // Bank Accounts methods
  async getBankAccounts(query: any, token?: string) {
    return await firstValueFrom(this.bankAccountsService.GetBankAccounts(query, this.createMetadata(token)));
  }

  async getBankAccount(id: string, token?: string) {
    return await firstValueFrom(this.bankAccountsService.GetBankAccount({ id }, this.createMetadata(token)));
  }

  async createBankAccount(data: any, token?: string) {
    // Map snake_case to camelCase for gRPC (support both formats)
    const grpcData = {
      organizationId: data.organization_id,
      organization_id: data.organization_id,
      accountName: data.account_name,
      account_name: data.account_name,
      accountNumber: data.account_number,
      account_number: data.account_number,
      bankName: data.bank_name,
      bank_name: data.bank_name,
      accountType: data.account_type,
      account_type: data.account_type,
      currency: data.currency,
      openingBalance: data.opening_balance?.toString(),
      opening_balance: data.opening_balance?.toString(),
      isActive: data.is_active !== undefined 
        ? (typeof data.is_active === 'boolean' ? data.is_active : data.is_active === 'true' || data.is_active === true)
        : undefined,
      is_active: data.is_active !== undefined 
        ? (typeof data.is_active === 'boolean' ? data.is_active : data.is_active === 'true' || data.is_active === true)
        : undefined,
    };
    return await firstValueFrom(this.bankAccountsService.CreateBankAccount(grpcData, this.createMetadata(token)));
  }

  async getBankAccountBalance(id: string, asOfDate?: string, token?: string) {
    return await firstValueFrom(this.bankAccountsService.GetBankAccountBalance({ id, as_of_date: asOfDate }, this.createMetadata(token)));
  }

  async deleteBankAccount(id: string, token?: string) {
    return await firstValueFrom(this.bankAccountsService.DeleteBankAccount({ id }, this.createMetadata(token)));
  }

  // Cash Accounts methods
  async getCashAccounts(query: any, token?: string) {
    return await firstValueFrom(this.cashAccountsService.GetCashAccounts(query, this.createMetadata(token)));
  }

  async getCashAccount(id: string, token?: string) {
    return await firstValueFrom(this.cashAccountsService.GetCashAccount({ id }, this.createMetadata(token)));
  }

  async createCashAccount(data: any, token?: string) {
    // Map snake_case to camelCase for gRPC (support both formats)
    const grpcData = {
      organizationId: data.organization_id,
      organization_id: data.organization_id,
      accountName: data.account_name,
      account_name: data.account_name,
      accountCode: data.account_code,
      account_code: data.account_code,
      location: data.location,
      currency: data.currency,
      openingBalance: data.opening_balance?.toString(),
      opening_balance: data.opening_balance?.toString(),
      isActive: data.is_active !== undefined 
        ? (typeof data.is_active === 'boolean' ? data.is_active : data.is_active === 'true' || data.is_active === true)
        : undefined,
      is_active: data.is_active !== undefined 
        ? (typeof data.is_active === 'boolean' ? data.is_active : data.is_active === 'true' || data.is_active === true)
        : undefined,
    };
    return await firstValueFrom(this.cashAccountsService.CreateCashAccount(grpcData, this.createMetadata(token)));
  }

  async deleteCashAccount(id: string, token?: string) {
    return await firstValueFrom(this.cashAccountsService.DeleteCashAccount({ id }, this.createMetadata(token)));
  }

  // Bank Transactions methods
  async getBankTransactions(query: any, token?: string) {
    return await firstValueFrom(this.bankTransactionsService.GetBankTransactions(query, this.createMetadata(token)));
  }

  async getBankTransaction(id: string, token?: string) {
    return await firstValueFrom(this.bankTransactionsService.GetBankTransaction({ id }, this.createMetadata(token)));
  }

  async createBankTransaction(data: any, token?: string) {
    // Map snake_case to camelCase for gRPC (support both formats)
    const grpcData = {
      organizationId: data.organization_id,
      organization_id: data.organization_id,
      bankAccountId: data.bank_account_id,
      bank_account_id: data.bank_account_id,
      transactionDate: data.transaction_date,
      transaction_date: data.transaction_date,
      transactionType: data.transaction_type,
      transaction_type: data.transaction_type,
      amount: data.amount?.toString(),
      currency: data.currency,
      reference: data.reference,
      description: data.description,
      category: data.category,
    };
    return await firstValueFrom(this.bankTransactionsService.CreateBankTransaction(grpcData, this.createMetadata(token)));
  }

  async importBankTransactions(data: any, token?: string) {
    // Map snake_case to camelCase for gRPC (support both formats)
    const grpcData = {
      bankAccountId: data.bank_account_id,
      bank_account_id: data.bank_account_id,
      fileUrl: data.file_url,
      file_url: data.file_url,
      fileFormat: data.file_format,
      file_format: data.file_format,
      mapping: data.mapping || undefined,
    };
    return await firstValueFrom(this.bankTransactionsService.ImportBankTransactions(grpcData, this.createMetadata(token)));
  }

  async deleteBankTransaction(id: string, token?: string) {
    return await firstValueFrom(this.bankTransactionsService.DeleteBankTransaction({ id }, this.createMetadata(token)));
  }

  // Bank Reconciliations methods
  async getBankReconciliations(query: any, token?: string) {
    return await firstValueFrom(this.bankReconciliationsService.GetBankReconciliations(query, this.createMetadata(token)));
  }

  async getBankReconciliation(id: string, token?: string) {
    return await firstValueFrom(this.bankReconciliationsService.GetBankReconciliation({ id }, this.createMetadata(token)));
  }

  async createBankReconciliation(data: any, token?: string) {
    // Map snake_case to camelCase for gRPC (support both formats)
    const grpcData = {
      organizationId: data.organization_id,
      organization_id: data.organization_id,
      bankAccountId: data.bank_account_id,
      bank_account_id: data.bank_account_id,
      reconciliationDate: data.reconciliation_date,
      reconciliation_date: data.reconciliation_date,
      statementBalance: data.statement_balance?.toString(),
      statement_balance: data.statement_balance?.toString(),
      outstandingDeposits: data.outstanding_deposits?.toString(),
      outstanding_deposits: data.outstanding_deposits?.toString(),
      outstandingChecks: data.outstanding_checks?.toString(),
      outstanding_checks: data.outstanding_checks?.toString(),
      bankCharges: data.bank_charges?.toString(),
      bank_charges: data.bank_charges?.toString(),
      interestEarned: data.interest_earned?.toString(),
      interest_earned: data.interest_earned?.toString(),
      notes: data.notes,
    };
    return await firstValueFrom(this.bankReconciliationsService.CreateBankReconciliation(grpcData, this.createMetadata(token)));
  }

  async getUnmatchedTransactions(id: string, token?: string) {
    return await firstValueFrom(this.bankReconciliationsService.GetUnmatchedTransactions({ id }, this.createMetadata(token)));
  }

  async matchTransactions(data: any, token?: string) {
    const grpcData = {
      reconciliationId: data.reconciliation_id,
      reconciliation_id: data.reconciliation_id,
      matches: (data.matches || []).map((m: any) => ({
        transactionId: m.transaction_id || m.transactionId,
        transaction_id: m.transaction_id || m.transactionId,
        statementItemIndex: m.statement_item_index !== undefined ? parseInt(m.statement_item_index.toString()) : m.statementItemIndex,
        statement_item_index: m.statement_item_index !== undefined ? parseInt(m.statement_item_index.toString()) : m.statementItemIndex,
      })),
    };
    return await firstValueFrom(this.bankReconciliationsService.MatchTransactions(grpcData, this.createMetadata(token)));
  }

  async completeReconciliation(id: string, notes?: string, token?: string) {
    return await firstValueFrom(this.bankReconciliationsService.CompleteReconciliation({ id, notes }, this.createMetadata(token)));
  }

  async deleteBankReconciliation(id: string, token?: string) {
    return await firstValueFrom(this.bankReconciliationsService.DeleteBankReconciliation({ id }, this.createMetadata(token)));
  }

  // Cheques methods
  async getCheques(query: any, token?: string) {
    return await firstValueFrom(this.chequesService.GetCheques(query, this.createMetadata(token)));
  }

  async getCheque(id: string, token?: string) {
    return await firstValueFrom(this.chequesService.GetCheque({ id }, this.createMetadata(token)));
  }

  async createCheque(data: any, token?: string) {
    // Map snake_case to camelCase for gRPC (support both formats)
    const grpcData = {
      organizationId: data.organization_id,
      organization_id: data.organization_id,
      chequeNumber: data.cheque_number,
      cheque_number: data.cheque_number,
      type: data.type,
      chequeDate: data.cheque_date,
      cheque_date: data.cheque_date,
      amount: data.amount?.toString(),
      currency: data.currency,
      payeeName: data.payee_name,
      payee_name: data.payee_name,
      bankName: data.bank_name,
      bank_name: data.bank_name,
      bankAccountId: data.bank_account_id,
      bank_account_id: data.bank_account_id,
    };
    return await firstValueFrom(this.chequesService.CreateCheque(grpcData, this.createMetadata(token)));
  }

  async depositCheque(id: string, depositDate: string | undefined, bankAccountId: string, token?: string) {
    return await firstValueFrom(this.chequesService.DepositCheque({ id, deposit_date: depositDate, bank_account_id: bankAccountId }, this.createMetadata(token)));
  }

  async clearCheque(id: string, clearDate: string | undefined, token?: string) {
    return await firstValueFrom(this.chequesService.ClearCheque({ id, clear_date: clearDate }, this.createMetadata(token)));
  }

  async deleteCheque(id: string, token?: string) {
    return await firstValueFrom(this.chequesService.DeleteCheque({ id }, this.createMetadata(token)));
  }

  // Cash Flow methods
  async getCashFlow(query: any, token?: string) {
    // Support both snake_case (from frontend) and camelCase (proto expects)
    const periodStart = query.period_start || query.periodStart;
    const periodEnd = query.period_end || query.periodEnd;
    const accountType = query.account_type || query.accountType;
    
    const requestData: any = {};
    if (periodStart) requestData.periodStart = String(periodStart);
    if (periodEnd) requestData.periodEnd = String(periodEnd);
    if (accountType) requestData.accountType = String(accountType);
    
    console.log('FinanceService.getCashFlow - sending to gRPC:', JSON.stringify(requestData, null, 2));
    return await firstValueFrom(this.cashFlowService.GetCashFlow(requestData, this.createMetadata(token)));
  }

  async getCashFlowForecast(query: any, token?: string) {
    // Support both snake_case (from frontend) and camelCase (proto expects)
    const periodStart = query.period_start || query.periodStart;
    const periodEnd = query.period_end || query.periodEnd;
    const includeRecurring = query.include_recurring !== undefined 
      ? (typeof query.include_recurring === 'boolean' ? query.include_recurring : query.include_recurring === 'true')
      : query.includeRecurring !== undefined
      ? (typeof query.includeRecurring === 'boolean' ? query.includeRecurring : query.includeRecurring === 'true')
      : false;
    
    const requestData: any = {
      periodStart: String(periodStart),
      periodEnd: String(periodEnd),
    };
    if (includeRecurring !== undefined) requestData.includeRecurring = includeRecurring;
    
    console.log('FinanceService.getCashFlowForecast - sending to gRPC:', JSON.stringify(requestData, null, 2));
    return await firstValueFrom(this.cashFlowService.GetForecast(requestData, this.createMetadata(token)));
  }

  async getCashFlowActual(query: any, token?: string) {
    // Support both snake_case (from frontend) and camelCase (proto expects)
    const periodStart = query.period_start || query.periodStart;
    const periodEnd = query.period_end || query.periodEnd;
    
    if (!periodStart || !periodEnd) {
      throw new BadRequestException('period_start and period_end are required');
    }
    
    // Create object with camelCase field names as proto expects
    const requestData = {
      periodStart: String(periodStart),
      periodEnd: String(periodEnd),
    };
    
    console.log('FinanceService.getCashFlowActual - sending to gRPC:', JSON.stringify(requestData, null, 2));
    return await firstValueFrom(this.cashFlowService.GetActual(requestData, this.createMetadata(token)));
  }

  async calculateCashFlow(data: any, token?: string) {
    // Support both snake_case (from frontend) and camelCase (proto expects)
    const periodStart = data.period_start || data.periodStart;
    const periodEnd = data.period_end || data.periodEnd;
    const accountIds = data.account_ids || data.accountIds;
    const includeForecast = data.include_forecast !== undefined 
      ? (typeof data.include_forecast === 'boolean' ? data.include_forecast : data.include_forecast === 'true')
      : data.includeForecast !== undefined
      ? (typeof data.includeForecast === 'boolean' ? data.includeForecast : data.includeForecast === 'true')
      : false;
    
    const requestData: any = {
      periodStart: String(periodStart),
      periodEnd: String(periodEnd),
    };
    if (accountIds && Array.isArray(accountIds) && accountIds.length > 0) {
      requestData.accountIds = accountIds.map((id: any) => String(id));
    }
    if (includeForecast !== undefined) requestData.includeForecast = includeForecast;
    
    console.log('FinanceService.calculateCashFlow - sending to gRPC:', JSON.stringify(requestData, null, 2));
    return await firstValueFrom(this.cashFlowService.CalculateCashFlow(requestData, this.createMetadata(token)));
  }

  // Budgets methods
  async getBudgets(query: any, token?: string) {
    const requestData: any = {};
    if (query.page) requestData.page = parseInt(query.page.toString());
    if (query.limit) requestData.limit = parseInt(query.limit.toString());
    if (query.sort) requestData.sort = String(query.sort);
    if (query.fiscal_year) requestData.fiscalYear = parseInt(query.fiscal_year.toString());
    if (query.department) requestData.department = String(query.department);
    if (query.project_id) requestData.projectId = String(query.project_id);
    return await firstValueFrom(this.budgetsService.GetBudgets(requestData, this.createMetadata(token)));
  }

  async getBudget(id: string, token?: string) {
    return await firstValueFrom(this.budgetsService.GetBudget({ id }, this.createMetadata(token)));
  }

  async createBudget(data: any, token?: string) {
    const requestData: any = {
      organizationId: data.organization_id || data.organizationId,
      budgetName: data.budget_name || data.budgetName,
      fiscalYear: data.fiscal_year || data.fiscalYear,
      periodType: data.period_type || data.periodType,
    };
    // accountId is optional - will use default if not provided
    if (data.account_id || data.accountId) {
      requestData.accountId = data.account_id || data.accountId;
    }
    if (data.department) requestData.department = String(data.department);
    if (data.project_id || data.projectId) requestData.projectId = String(data.project_id || data.projectId);
    if (data.budget_amount !== undefined || data.budgetAmount !== undefined) {
      requestData.budgetAmount = String(data.budget_amount || data.budgetAmount);
    }
    if (data.currency) requestData.currency = String(data.currency);
    if (data.status) requestData.status = String(data.status);
    if (data.periods && Array.isArray(data.periods)) {
      requestData.periods = data.periods.map((p: any) => ({
        period: String(p.period),
        amount: String(p.amount),
      }));
    }
    return await firstValueFrom(this.budgetsService.CreateBudget(requestData, this.createMetadata(token)));
  }

  async updateBudget(id: string, data: any, token?: string) {
    const requestData: any = {
      id: id,
    };
    if (data.organization_id !== undefined || data.organizationId !== undefined) {
      requestData.organizationId = data.organization_id || data.organizationId;
    }
    if (data.budget_name !== undefined || data.budgetName !== undefined) {
      requestData.budgetName = data.budget_name || data.budgetName;
    }
    if (data.fiscal_year !== undefined || data.fiscalYear !== undefined) {
      requestData.fiscalYear = data.fiscal_year || data.fiscalYear;
    }
    if (data.period_type !== undefined || data.periodType !== undefined) {
      requestData.periodType = data.period_type || data.periodType;
    }
    if (data.department !== undefined) {
      requestData.department = String(data.department);
    }
    if (data.project_id !== undefined || data.projectId !== undefined) {
      requestData.projectId = String(data.project_id || data.projectId);
    }
    if (data.account_id !== undefined || data.accountId !== undefined) {
      requestData.accountId = data.account_id || data.accountId;
    }
    if (data.budget_amount !== undefined || data.budgetAmount !== undefined) {
      requestData.budgetAmount = String(data.budget_amount || data.budgetAmount);
    }
    if (data.currency !== undefined) {
      requestData.currency = String(data.currency);
    }
    if (data.status !== undefined) {
      requestData.status = String(data.status);
    }
    if (data.periods !== undefined && Array.isArray(data.periods)) {
      requestData.periods = data.periods.map((p: any) => ({
        period: String(p.period),
        amount: String(p.amount),
      }));
    }
    return await firstValueFrom(this.budgetsService.UpdateBudget(requestData, this.createMetadata(token)));
  }

  async deleteBudget(id: string, token?: string) {
    return await firstValueFrom(this.budgetsService.DeleteBudget({ id }, this.createMetadata(token)));
  }

  // Expenses methods
  async getExpenses(query: any, token?: string) {
    const requestData: any = {};
    if (query.limit !== undefined) requestData.limit = parseInt(query.limit);
    if (query.page !== undefined) requestData.page = parseInt(query.page);
    if (query.sort !== undefined) requestData.sort = String(query.sort);
    if (query.status !== undefined) requestData.status = String(query.status);
    if (query.employee_id !== undefined) requestData.employeeId = String(query.employee_id);
    if (query.category_id !== undefined) requestData.categoryId = String(query.category_id);
    return await firstValueFrom(this.expensesService.GetExpenses(requestData, this.createMetadata(token)));
  }

  async getExpense(id: string, token?: string) {
    return await firstValueFrom(this.expensesService.GetExpense({ id }, this.createMetadata(token)));
  }

  async createExpense(data: any, token?: string) {
    const requestData: any = {};
    if (data.organization_id !== undefined || data.organizationId !== undefined) {
      requestData.organizationId = data.organization_id || data.organizationId;
    }
    if (data.expense_number !== undefined || data.expenseNumber !== undefined) {
      requestData.expenseNumber = data.expense_number || data.expenseNumber;
    }
    if (data.employee_id !== undefined || data.employeeId !== undefined) {
      requestData.employeeId = data.employee_id || data.employeeId;
    }
    if (data.expense_date !== undefined || data.expenseDate !== undefined) {
      requestData.expenseDate = data.expense_date || data.expenseDate;
    }
    if (data.category_id !== undefined || data.categoryId !== undefined) {
      requestData.categoryId = data.category_id || data.categoryId;
    }
    if (data.description !== undefined) {
      requestData.description = String(data.description);
    }
    if (data.amount !== undefined) {
      requestData.amount = String(data.amount);
    }
    if (data.currency !== undefined) {
      requestData.currency = String(data.currency);
    }
    if (data.receipt_url !== undefined || data.receiptUrl !== undefined) {
      requestData.receiptUrl = data.receipt_url || data.receiptUrl;
    }
    if (data.account_id !== undefined || data.accountId !== undefined) {
      requestData.accountId = data.account_id || data.accountId;
    }
    return await firstValueFrom(this.expensesService.CreateExpense(requestData, this.createMetadata(token)));
  }

  async updateExpense(id: string, data: any, token?: string) {
    const requestData: any = { id };
    if (data.organization_id !== undefined || data.organizationId !== undefined) {
      requestData.organizationId = data.organization_id || data.organizationId;
    }
    if (data.expense_number !== undefined || data.expenseNumber !== undefined) {
      requestData.expenseNumber = data.expense_number || data.expenseNumber;
    }
    if (data.employee_id !== undefined || data.employeeId !== undefined) {
      requestData.employeeId = data.employee_id || data.employeeId;
    }
    if (data.expense_date !== undefined || data.expenseDate !== undefined) {
      requestData.expenseDate = data.expense_date || data.expenseDate;
    }
    if (data.category_id !== undefined || data.categoryId !== undefined) {
      requestData.categoryId = data.category_id || data.categoryId;
    }
    if (data.description !== undefined) {
      requestData.description = String(data.description);
    }
    if (data.amount !== undefined) {
      requestData.amount = String(data.amount);
    }
    if (data.currency !== undefined) {
      requestData.currency = String(data.currency);
    }
    if (data.receipt_url !== undefined || data.receiptUrl !== undefined) {
      requestData.receiptUrl = data.receipt_url || data.receiptUrl;
    }
    if (data.status !== undefined) {
      requestData.status = String(data.status);
    }
    if (data.account_id !== undefined || data.accountId !== undefined) {
      requestData.accountId = data.account_id || data.accountId;
    }
    return await firstValueFrom(this.expensesService.UpdateExpense(requestData, this.createMetadata(token)));
  }

  async approveExpense(id: string, token?: string) {
    return await firstValueFrom(this.expensesService.ApproveExpense({ id }, this.createMetadata(token)));
  }

  async rejectExpense(id: string, reason?: string, token?: string) {
    return await firstValueFrom(this.expensesService.RejectExpense({ id, reason }, this.createMetadata(token)));
  }

  async deleteExpense(id: string, token?: string) {
    return await firstValueFrom(this.expensesService.DeleteExpense({ id }, this.createMetadata(token)));
  }

  async postExpenseToGl(id: string, data: any, token?: string) {
    const requestData: any = { id };
    if (data.posting_date !== undefined || data.postingDate !== undefined) {
      requestData.postingDate = data.posting_date || data.postingDate;
    }
    if (data.journal_entry_reference !== undefined || data.journalEntryReference !== undefined) {
      requestData.journalEntryReference = data.journal_entry_reference || data.journalEntryReference;
    }
    return await firstValueFrom(this.expensesService.PostExpenseToGl(requestData, this.createMetadata(token)));
  }

  async bulkPostExpensesToGl(data: any, token?: string) {
    const requestData: any = {};
    if (data.expense_ids !== undefined || data.expenseIds !== undefined) {
      requestData.expenseIds = data.expense_ids || data.expenseIds;
    }
    if (data.posting_date !== undefined || data.postingDate !== undefined) {
      requestData.postingDate = data.posting_date || data.postingDate;
    }
    return await firstValueFrom(this.expensesService.BulkPostExpensesToGl(requestData, this.createMetadata(token)));
  }

  // Expense Categories methods
  async getExpenseCategories(query: any, token?: string) {
    const requestData: any = {};
    if (query.limit !== undefined) requestData.limit = parseInt(query.limit);
    if (query.page !== undefined) requestData.page = parseInt(query.page);
    if (query.sort !== undefined) requestData.sort = String(query.sort);
    if (query.is_active !== undefined) requestData.isActive = query.is_active === 'true' || query.is_active === true;
    return await firstValueFrom(this.expenseCategoriesService.GetExpenseCategories(requestData, this.createMetadata(token)));
  }

  async getExpenseCategory(id: string, token?: string) {
    return await firstValueFrom(this.expenseCategoriesService.GetExpenseCategory({ id }, this.createMetadata(token)));
  }

  async createExpenseCategory(data: any, token?: string) {
    const requestData: any = {};
    if (data.organization_id !== undefined || data.organizationId !== undefined) {
      requestData.organizationId = data.organization_id || data.organizationId;
    }
    if (data.category_code !== undefined || data.categoryCode !== undefined) {
      requestData.categoryCode = data.category_code || data.categoryCode;
    }
    if (data.category_name !== undefined || data.categoryName !== undefined) {
      requestData.categoryName = data.category_name || data.categoryName;
    }
    if (data.description !== undefined) {
      requestData.description = String(data.description);
    }
    if (data.account_id !== undefined || data.accountId !== undefined) {
      requestData.accountId = data.account_id || data.accountId;
    }
    if (data.requires_receipt !== undefined || data.requiresReceipt !== undefined) {
      requestData.requiresReceipt = data.requires_receipt !== undefined ? data.requires_receipt : data.requiresReceipt;
    }
    if (data.requires_approval !== undefined || data.requiresApproval !== undefined) {
      requestData.requiresApproval = data.requires_approval !== undefined ? data.requires_approval : data.requiresApproval;
    }
    if (data.approval_limit !== undefined || data.approvalLimit !== undefined) {
      requestData.approvalLimit = String(data.approval_limit || data.approvalLimit);
    }
    if (data.is_active !== undefined || data.isActive !== undefined) {
      requestData.isActive = data.is_active !== undefined ? data.is_active : data.isActive;
    }
    return await firstValueFrom(this.expenseCategoriesService.CreateExpenseCategory(requestData, this.createMetadata(token)));
  }

  async updateExpenseCategory(id: string, data: any, token?: string) {
    const requestData: any = { id };
    if (data.organization_id !== undefined || data.organizationId !== undefined) {
      requestData.organizationId = data.organization_id || data.organizationId;
    }
    if (data.category_code !== undefined || data.categoryCode !== undefined) {
      requestData.categoryCode = data.category_code || data.categoryCode;
    }
    if (data.category_name !== undefined || data.categoryName !== undefined) {
      requestData.categoryName = data.category_name || data.categoryName;
    }
    if (data.description !== undefined) {
      requestData.description = String(data.description);
    }
    if (data.account_id !== undefined || data.accountId !== undefined) {
      requestData.accountId = data.account_id || data.accountId;
    }
    if (data.requires_receipt !== undefined || data.requiresReceipt !== undefined) {
      requestData.requiresReceipt = data.requires_receipt !== undefined ? data.requires_receipt : data.requiresReceipt;
    }
    if (data.requires_approval !== undefined || data.requiresApproval !== undefined) {
      requestData.requiresApproval = data.requires_approval !== undefined ? data.requires_approval : data.requiresApproval;
    }
    if (data.approval_limit !== undefined || data.approvalLimit !== undefined) {
      requestData.approvalLimit = String(data.approval_limit || data.approvalLimit);
    }
    if (data.is_active !== undefined || data.isActive !== undefined) {
      requestData.isActive = data.is_active !== undefined ? data.is_active : data.isActive;
    }
    return await firstValueFrom(this.expenseCategoriesService.UpdateExpenseCategory(requestData, this.createMetadata(token)));
  }

  async deleteExpenseCategory(id: string, token?: string) {
    return await firstValueFrom(this.expenseCategoriesService.DeleteExpenseCategory({ id }, this.createMetadata(token)));
  }

  // Expense Claims methods
  async getExpenseClaims(query: any, token?: string) {
    const requestData: any = {};
    if (query.limit !== undefined) requestData.limit = parseInt(query.limit);
    if (query.page !== undefined) requestData.page = parseInt(query.page);
    if (query.sort !== undefined) requestData.sort = String(query.sort);
    if (query.status !== undefined) requestData.status = String(query.status);
    if (query.employee_id !== undefined) requestData.employeeId = String(query.employee_id);
    return await firstValueFrom(this.expenseClaimsService.GetExpenseClaims(requestData, this.createMetadata(token)));
  }

  async getExpenseClaim(id: string, token?: string) {
    return await firstValueFrom(this.expenseClaimsService.GetExpenseClaim({ id }, this.createMetadata(token)));
  }

  async createExpenseClaim(data: any, token?: string) {
    const requestData: any = {};
    if (data.organization_id !== undefined || data.organizationId !== undefined) {
      requestData.organizationId = data.organization_id || data.organizationId;
    }
    if (data.claim_number !== undefined || data.claimNumber !== undefined) {
      requestData.claimNumber = data.claim_number || data.claimNumber;
    }
    if (data.employee_id !== undefined || data.employeeId !== undefined) {
      requestData.employeeId = data.employee_id || data.employeeId;
    }
    if (data.claim_date !== undefined || data.claimDate !== undefined) {
      requestData.claimDate = data.claim_date || data.claimDate;
    }
    if (data.expense_ids !== undefined || data.expenseIds !== undefined) {
      requestData.expenseIds = data.expense_ids || data.expenseIds;
    }
    if (data.notes !== undefined) {
      requestData.notes = String(data.notes);
    }
    return await firstValueFrom(this.expenseClaimsService.CreateExpenseClaim(requestData, this.createMetadata(token)));
  }

  async updateExpenseClaim(id: string, data: any, token?: string) {
    const requestData: any = { id };
    if (data.organization_id !== undefined || data.organizationId !== undefined) {
      requestData.organizationId = data.organization_id || data.organizationId;
    }
    if (data.claim_number !== undefined || data.claimNumber !== undefined) {
      requestData.claimNumber = data.claim_number || data.claimNumber;
    }
    if (data.employee_id !== undefined || data.employeeId !== undefined) {
      requestData.employeeId = data.employee_id || data.employeeId;
    }
    if (data.claim_date !== undefined || data.claimDate !== undefined) {
      requestData.claimDate = data.claim_date || data.claimDate;
    }
    if (data.expense_ids !== undefined || data.expenseIds !== undefined) {
      requestData.expenseIds = data.expense_ids || data.expenseIds;
    }
    if (data.notes !== undefined) {
      requestData.notes = String(data.notes);
    }
    if (data.status !== undefined) {
      requestData.status = String(data.status);
    }
    return await firstValueFrom(this.expenseClaimsService.UpdateExpenseClaim(requestData, this.createMetadata(token)));
  }

  async submitExpenseClaim(id: string, token?: string) {
    return await firstValueFrom(this.expenseClaimsService.SubmitExpenseClaim({ id }, this.createMetadata(token)));
  }

  async approveExpenseClaim(id: string, data: any, token?: string) {
    const requestData: any = { id };
    if (data.approved_by !== undefined || data.approvedBy !== undefined) {
      requestData.approvedBy = data.approved_by || data.approvedBy;
    }
    if (data.notes !== undefined) {
      requestData.notes = String(data.notes);
    }
    return await firstValueFrom(this.expenseClaimsService.ApproveExpenseClaim(requestData, this.createMetadata(token)));
  }

  async rejectExpenseClaim(id: string, data: any, token?: string) {
    const requestData: any = { id };
    if (data.rejected_by !== undefined || data.rejectedBy !== undefined) {
      requestData.rejectedBy = data.rejected_by || data.rejectedBy;
    }
    if (data.rejection_reason !== undefined || data.rejectionReason !== undefined) {
      requestData.rejectionReason = data.rejection_reason || data.rejectionReason;
    }
    if (data.notes !== undefined) {
      requestData.notes = String(data.notes);
    }
    return await firstValueFrom(this.expenseClaimsService.RejectExpenseClaim(requestData, this.createMetadata(token)));
  }

  async deleteExpenseClaim(id: string, token?: string) {
    return await firstValueFrom(this.expenseClaimsService.DeleteExpenseClaim({ id }, this.createMetadata(token)));
  }

  // Expense Approvals methods
  async getExpenseApprovals(query: any, token?: string) {
    const requestData: any = {};
    if (query.limit !== undefined) requestData.limit = parseInt(query.limit);
    if (query.page !== undefined) requestData.page = parseInt(query.page);
    if (query.sort !== undefined) requestData.sort = String(query.sort);
    if (query.status !== undefined) requestData.status = String(query.status);
    if (query.approver_id !== undefined) requestData.approverId = String(query.approver_id);
    return await firstValueFrom(this.expenseApprovalsService.GetExpenseApprovals(requestData, this.createMetadata(token)));
  }

  async getExpenseApproval(id: string, token?: string) {
    return await firstValueFrom(this.expenseApprovalsService.GetExpenseApproval({ id }, this.createMetadata(token)));
  }

  async createExpenseApproval(data: any, token?: string) {
    const requestData: any = {};
    if (data.organization_id !== undefined || data.organizationId !== undefined) {
      requestData.organizationId = data.organization_id || data.organizationId;
    }
    if (data.expense_id !== undefined || data.expenseId !== undefined) {
      requestData.expenseId = data.expense_id || data.expenseId;
    }
    if (data.expense_claim_id !== undefined || data.expenseClaimId !== undefined) {
      requestData.expenseClaimId = data.expense_claim_id || data.expenseClaimId;
    }
    if (data.approver_id !== undefined || data.approverId !== undefined) {
      requestData.approverId = data.approver_id || data.approverId;
    }
    if (data.approval_level !== undefined || data.approvalLevel !== undefined) {
      requestData.approvalLevel = parseInt((data.approval_level || data.approvalLevel).toString());
    }
    return await firstValueFrom(this.expenseApprovalsService.CreateExpenseApproval(requestData, this.createMetadata(token)));
  }

  async updateExpenseApproval(id: string, data: any, token?: string) {
    const requestData: any = { id };
    if (data.organization_id !== undefined || data.organizationId !== undefined) {
      requestData.organizationId = data.organization_id || data.organizationId;
    }
    if (data.expense_id !== undefined || data.expenseId !== undefined) {
      requestData.expenseId = data.expense_id || data.expenseId;
    }
    if (data.expense_claim_id !== undefined || data.expenseClaimId !== undefined) {
      requestData.expenseClaimId = data.expense_claim_id || data.expenseClaimId;
    }
    if (data.approver_id !== undefined || data.approverId !== undefined) {
      requestData.approverId = data.approver_id || data.approverId;
    }
    if (data.approval_level !== undefined || data.approvalLevel !== undefined) {
      requestData.approvalLevel = parseInt((data.approval_level || data.approvalLevel).toString());
    }
    if (data.status !== undefined) {
      requestData.status = String(data.status);
    }
    if (data.approved_date !== undefined || data.approvedDate !== undefined) {
      requestData.approvedDate = data.approved_date || data.approvedDate;
    }
    if (data.notes !== undefined) {
      requestData.notes = String(data.notes);
    }
    return await firstValueFrom(this.expenseApprovalsService.UpdateExpenseApproval(requestData, this.createMetadata(token)));
  }

  async approveExpenseApproval(id: string, notes?: string, token?: string) {
    return await firstValueFrom(this.expenseApprovalsService.ApproveExpenseApproval({ id, notes }, this.createMetadata(token)));
  }

  async rejectExpenseApproval(id: string, notes?: string, token?: string) {
    return await firstValueFrom(this.expenseApprovalsService.RejectExpenseApproval({ id, notes }, this.createMetadata(token)));
  }

  async deleteExpenseApproval(id: string, token?: string) {
    return await firstValueFrom(this.expenseApprovalsService.DeleteExpenseApproval({ id }, this.createMetadata(token)));
  }

  // Inventory Valuations methods
  async getInventoryValuations(query: any, token?: string) {
    const requestData: any = {};
    if (query.as_of_date !== undefined) requestData.as_of_date = String(query.as_of_date);
    if (query.valuation_method !== undefined) requestData.valuation_method = String(query.valuation_method);
    return await firstValueFrom(this.inventoryValuationsService.GetInventoryValuations(requestData, this.createMetadata(token)));
  }

  async getInventoryValuation(id: string, token?: string) {
    return await firstValueFrom(this.inventoryValuationsService.GetInventoryValuation({ id }, this.createMetadata(token)));
  }

  async createInventoryValuation(data: any, token?: string) {
    const requestData: any = {
      organizationId: data.organization_id || data.organizationId,
      itemId: data.item_id || data.itemId,
      valuationDate: data.valuation_date || data.valuationDate,
      valuationMethod: data.valuation_method || data.valuationMethod,
      quantity: data.quantity ? data.quantity.toString() : '0',
      unitCost: data.unit_cost !== undefined ? data.unit_cost.toString() : (data.unitCost !== undefined ? data.unitCost.toString() : '0'),
      itemCode: data.item_code || data.itemCode || '',
      itemName: data.item_name || data.itemName || '',
    };
    return await firstValueFrom(this.inventoryValuationsService.CreateInventoryValuation(requestData, this.createMetadata(token)));
  }

  async updateInventoryValuation(id: string, data: any, token?: string) {
    const requestData: any = { id };
    if (data.valuation_date !== undefined) requestData.valuationDate = String(data.valuation_date);
    if (data.valuationDate !== undefined) requestData.valuationDate = String(data.valuationDate);
    if (data.valuation_method !== undefined) requestData.valuationMethod = String(data.valuation_method);
    if (data.valuationMethod !== undefined) requestData.valuationMethod = String(data.valuationMethod);
    if (data.quantity !== undefined) requestData.quantity = data.quantity.toString();
    if (data.unit_cost !== undefined) requestData.unitCost = data.unit_cost.toString();
    if (data.unitCost !== undefined) requestData.unitCost = data.unitCost.toString();
    return await firstValueFrom(this.inventoryValuationsService.UpdateInventoryValuation(requestData, this.createMetadata(token)));
  }

  async deleteInventoryValuation(id: string, token?: string) {
    return await firstValueFrom(this.inventoryValuationsService.DeleteInventoryValuation({ id }, this.createMetadata(token)));
  }

  async calculateInventoryValuation(asOfDate: string, valuationMethod: string, token?: string) {
    if (!asOfDate) {
      throw new Error('as_of_date is required');
    }
    if (!valuationMethod) {
      throw new Error('valuation_method is required');
    }
    return await firstValueFrom(
      this.inventoryValuationsService.CalculateInventoryValuation(
        { as_of_date: asOfDate, valuation_method: valuationMethod },
        this.createMetadata(token)
      )
    );
  }

  async syncInventoryValuationsFromBatches(valuationMethod: string = 'fifo', token?: string) {
    try {
      if (!this.inventoryBatchesService) {
        throw new Error('InventoryBatchesService is not initialized. Check SUPPLYCHAIN_PACKAGE connection.');
      }

      console.log('Starting inventory valuation sync from batches...');
      let page = 1;
      const limit = 100;
      const allBatches: any[] = [];

      // Fetch all inventory batches
      while (true) {
        const batchesResult = await firstValueFrom(
          this.inventoryBatchesService.GetInventoryBatches(
            { page, limit, status: 'available' },
            this.createMetadata(token)
          )
        );

        const batches = batchesResult?.batches || [];
        if (batches.length === 0) {
          break;
        }

        console.log(`Fetched page ${page}, ${batches.length} batches...`);
        allBatches.push(...batches);

        // Check if there are more pages
        if (batches.length < limit) {
          break;
        }
        page++;
      }

      console.log(`Total batches to sync: ${allBatches.length}`);

      // Now sync the batches to inventory valuations
      const syncResult = await firstValueFrom(
        this.inventoryValuationsService.SyncInventoryValuations(
          {
            valuation_method: valuationMethod,
            batches: allBatches.map(batch => ({
              id: batch.id,
              productId: batch.productId,
              productName: batch.productName || '',
              productSku: batch.productSku || '',
              quantityAvailable: batch.quantityAvailable || '0',
              unitCost: batch.unitCost || '0',
              receivedDate: batch.receivedDate || new Date().toISOString().split('T')[0],
            })),
          },
          this.createMetadata(token)
        )
      );

      return {
        success: syncResult.success || true,
        message: syncResult.message || `Sync completed. Created: ${syncResult.total_created}, Updated: ${syncResult.total_updated}`,
        total_synced: allBatches.length,
        total_created: syncResult.total_created || 0,
        total_updated: syncResult.total_updated || 0,
        errors: syncResult.errors || [],
      };
    } catch (error) {
      console.error('Error syncing inventory valuations from batches:', error);
      throw error;
    }
  }

  // COGS methods
  async getCogs(query: { period_start?: string; period_end?: string }): Promise<any> {
    try {
      const result = await firstValueFrom(
        this.cogsService.GetCogs({
          period_start: query.period_start,
          period_end: query.period_end,
        }),
      );
      return result;
    } catch (error) {
      console.error('Error fetching COGS:', error);
      throw error;
    }
  }

  async getCogsRecord(id: string): Promise<any> {
    try {
      const result = await firstValueFrom(
        this.cogsService.GetCogsRecord({ id }),
      );
      return result;
    } catch (error) {
      console.error('Error fetching COGS record:', error);
      throw error;
    }
  }

  async createCogs(createDto: any): Promise<any> {
    try {
      const result = await firstValueFrom(
        this.cogsService.CreateCogs(createDto),
      );
      return result;
    } catch (error) {
      console.error('Error creating COGS:', error);
      throw error;
    }
  }

  async updateCogs(id: string, updateDto: any): Promise<any> {
    try {
      const result = await firstValueFrom(
        this.cogsService.UpdateCogs({ id, ...updateDto }),
      );
      return result;
    } catch (error) {
      console.error('Error updating COGS:', error);
      throw error;
    }
  }

  async deleteCogs(id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.cogsService.DeleteCogs({ id }),
      );
    } catch (error) {
      console.error('Error deleting COGS:', error);
      throw error;
    }
  }

  async calculateCogs(periodStart: string, periodEnd: string, itemIds?: string[]): Promise<any> {
    try {
      const result = await firstValueFrom(
        this.cogsService.CalculateCogs({
          period_start: periodStart,
          period_end: periodEnd,
          item_ids: itemIds,
        }),
      );
      return result;
    } catch (error) {
      console.error('Error calculating COGS:', error);
      throw error;
    }
  }

  async getCogsReport(periodStart: string, periodEnd: string, format?: string): Promise<any> {
    try {
      // gRPC proto expects camelCase field names: periodstart, periodend (not period_start, period_end)
      const requestData = {
        periodstart: String(periodStart || ''),
        periodend: String(periodEnd || ''),
        format: format ? String(format) : '',
      };
      
      console.log('FinanceService.getCogsReport - sending to gRPC:', JSON.stringify(requestData, null, 2));
      
      const result = await firstValueFrom(
        this.cogsService.GetCogsReport(requestData),
      );
      return result;
    } catch (error) {
      console.error('Error getting COGS report:', error);
      throw error;
    }
  }

  // Inventory Adjustments methods
  async getInventoryAdjustments(query: any, token?: string) {
    const requestData: any = {};
    if (query.sort !== undefined) requestData.sort = String(query.sort);
    if (query.adjustment_type !== undefined) requestData.adjustment_type = String(query.adjustment_type);
    return await firstValueFrom(this.inventoryAdjustmentsService.GetInventoryAdjustments(requestData, this.createMetadata(token)));
  }

  async getInventoryAdjustment(id: string, token?: string) {
    return await firstValueFrom(this.inventoryAdjustmentsService.GetInventoryAdjustment({ id }, this.createMetadata(token)));
  }

  async createInventoryAdjustment(data: any, token?: string) {
    const grpcData: any = {
      organizationId: data.organization_id,
      adjustmentNumber: data.adjustment_number,
      adjustmentDate: data.adjustment_date,
      adjustmentType: data.adjustment_type,
      itemId: data.item_id,
      quantityAdjusted: data.quantity_adjusted?.toString(),
      unitCost: data.unit_cost?.toString(),
      adjustmentAmount: data.adjustment_amount?.toString(),
      accountId: data.account_id,
      reason: data.reason,
    };
    return await firstValueFrom(this.inventoryAdjustmentsService.CreateInventoryAdjustment(grpcData, this.createMetadata(token)));
  }

  async updateInventoryAdjustment(id: string, data: any, token?: string) {
    const grpcData: any = {
      id,
      adjustmentDate: data.adjustment_date,
      adjustmentType: data.adjustment_type,
      itemId: data.item_id,
      quantityAdjusted: data.quantity_adjusted?.toString(),
      unitCost: data.unit_cost?.toString(),
      adjustmentAmount: data.adjustment_amount?.toString(),
      accountId: data.account_id,
      reason: data.reason,
    };
    return await firstValueFrom(this.inventoryAdjustmentsService.UpdateInventoryAdjustment(grpcData, this.createMetadata(token)));
  }

  async deleteInventoryAdjustment(id: string, token?: string) {
    return await firstValueFrom(this.inventoryAdjustmentsService.DeleteInventoryAdjustment({ id }, this.createMetadata(token)));
  }

  async postInventoryAdjustment(id: string, token?: string) {
    return await firstValueFrom(this.inventoryAdjustmentsService.PostInventoryAdjustment({ id }, this.createMetadata(token)));
  }

  // Stock Impacts methods
  async getStockImpacts(query: any, token?: string) {
    const requestData: any = {};
    if (query.period_start !== undefined) requestData.periodstart = String(query.period_start);
    if (query.period_end !== undefined) requestData.periodend = String(query.period_end);
    return await firstValueFrom(this.stockImpactsService.GetStockImpacts(requestData, this.createMetadata(token)));
  }

  async getStockImpact(id: string, token?: string) {
    return await firstValueFrom(this.stockImpactsService.GetStockImpact({ id }, this.createMetadata(token)));
  }

  async createStockImpact(data: any, token?: string) {
    const grpcData: any = {
      organizationId: data.organization_id,
      transactionDate: data.transaction_date,
      transactionType: data.transaction_type,
      itemId: data.item_id,
      quantity: data.quantity?.toString(),
      unitCost: data.unit_cost?.toString(),
      totalCost: data.total_cost?.toString(),
      inventoryAccountId: data.inventory_account_id,
      cogsAccountId: data.cogs_account_id,
      expenseAccountId: data.expense_account_id,
      referenceId: data.reference_id,
      referenceType: data.reference_type,
    };
    return await firstValueFrom(this.stockImpactsService.CreateStockImpact(grpcData, this.createMetadata(token)));
  }

  async updateStockImpact(id: string, data: any, token?: string) {
    const grpcData: any = {
      id,
      transactionDate: data.transaction_date,
      transactionType: data.transaction_type,
      itemId: data.item_id,
      quantity: data.quantity?.toString(),
      unitCost: data.unit_cost?.toString(),
      totalCost: data.total_cost?.toString(),
      inventoryAccountId: data.inventory_account_id,
      cogsAccountId: data.cogs_account_id,
      expenseAccountId: data.expense_account_id,
      referenceId: data.reference_id,
      referenceType: data.reference_type,
    };
    return await firstValueFrom(this.stockImpactsService.UpdateStockImpact(grpcData, this.createMetadata(token)));
  }

  async deleteStockImpact(id: string, token?: string) {
    return await firstValueFrom(this.stockImpactsService.DeleteStockImpact({ id }, this.createMetadata(token)));
  }

  async calculateStockImpacts(data: { period_start: string; period_end: string; item_ids?: string[] }, token?: string) {
    const grpcData: any = {
      periodstart: String(data.period_start),
      periodend: String(data.period_end),
      itemids: data.item_ids || [],
    };
    return await firstValueFrom(this.stockImpactsService.CalculateStockImpacts(grpcData, this.createMetadata(token)));
  }

  // Assets methods
  async getAssets(query: any, token?: string) {
    const requestData: any = {};
    if (query.sort !== undefined) requestData.sort = String(query.sort);
    if (query.status !== undefined) requestData.status = String(query.status);
    if (query.asset_type !== undefined) requestData.asset_type = String(query.asset_type);
    return await firstValueFrom(this.assetsService.GetAssets(requestData, this.createMetadata(token)));
  }

  async getAsset(id: string, token?: string) {
    return await firstValueFrom(this.assetsService.GetAsset({ id }, this.createMetadata(token)));
  }

  async createAsset(data: any, token?: string) {
    const grpcData: any = {
      organizationId: data.organization_id,
      assetCode: data.asset_code,
      assetName: data.asset_name,
      assetType: data.asset_type,
      purchaseDate: data.purchase_date,
      purchasePrice: data.purchase_price?.toString(),
      depreciationMethod: data.depreciation_method,
      usefulLifeYears: data.useful_life_years?.toString(),
      salvageValue: data.salvage_value?.toString(),
      location: data.location,
      accountId: data.account_id,
    };
    return await firstValueFrom(this.assetsService.CreateAsset(grpcData, this.createMetadata(token)));
  }

  async updateAsset(id: string, data: any, token?: string) {
    const grpcData: any = {
      id,
      assetCode: data.asset_code,
      assetName: data.asset_name,
      assetType: data.asset_type,
      purchaseDate: data.purchase_date,
      purchasePrice: data.purchase_price?.toString(),
      currentValue: data.current_value?.toString(),
      accumulatedDepreciation: data.accumulated_depreciation?.toString(),
      netBookValue: data.net_book_value?.toString(),
      depreciationMethod: data.depreciation_method,
      usefulLifeYears: data.useful_life_years?.toString(),
      salvageValue: data.salvage_value?.toString(),
      status: data.status,
      location: data.location,
      accountId: data.account_id,
    };
    return await firstValueFrom(this.assetsService.UpdateAsset(grpcData, this.createMetadata(token)));
  }

  async deleteAsset(id: string, token?: string) {
    return await firstValueFrom(this.assetsService.DeleteAsset({ id }, this.createMetadata(token)));
  }

  // Depreciations methods
  async getDepreciations(query: any, token?: string) {
    const requestData: any = {};
    if (query.asset_id !== undefined) requestData.assetId = String(query.asset_id);
    if (query.period_start !== undefined) requestData.periodStart = String(query.period_start);
    if (query.period_end !== undefined) requestData.periodEnd = String(query.period_end);
    return await firstValueFrom(this.depreciationsService.GetDepreciations(requestData, this.createMetadata(token)));
  }

  async getDepreciation(id: string, token?: string) {
    return await firstValueFrom(this.depreciationsService.GetDepreciation({ id }, this.createMetadata(token)));
  }

  async createDepreciation(data: any, token?: string) {
    const grpcData: any = {
      organizationId: data.organization_id,
      assetId: data.asset_id,
      depreciationDate: data.depreciation_date,
      period: data.period,
      depreciationAmount: data.depreciation_amount?.toString(),
      accumulatedDepreciation: data.accumulated_depreciation?.toString(),
      netBookValue: data.net_book_value?.toString(),
      status: data.status,
    };
    return await firstValueFrom(this.depreciationsService.CreateDepreciation(grpcData, this.createMetadata(token)));
  }

  async updateDepreciation(id: string, data: any, token?: string) {
    const grpcData: any = {
      id,
      depreciationDate: data.depreciation_date,
      period: data.period,
      depreciationAmount: data.depreciation_amount?.toString(),
      accumulatedDepreciation: data.accumulated_depreciation?.toString(),
      netBookValue: data.net_book_value?.toString(),
      status: data.status,
    };
    return await firstValueFrom(this.depreciationsService.UpdateDepreciation(grpcData, this.createMetadata(token)));
  }

  async deleteDepreciation(id: string, token?: string) {
    return await firstValueFrom(this.depreciationsService.DeleteDepreciation({ id }, this.createMetadata(token)));
  }

  async calculateDepreciation(data: { asset_id: string; period_start: string; period_end: string }, token?: string) {
    const grpcData: any = {
      assetId: data.asset_id,
      periodStart: data.period_start,
      periodEnd: data.period_end,
    };
    return await firstValueFrom(this.depreciationsService.CalculateDepreciation(grpcData, this.createMetadata(token)));
  }

  async getDepreciationSchedule(assetId: string, token?: string) {
    return await firstValueFrom(this.depreciationsService.GetDepreciationSchedule({ assetId }, this.createMetadata(token)));
  }

  async postDepreciation(id: string, token?: string) {
    return await firstValueFrom(this.depreciationsService.PostDepreciation({ id }, this.createMetadata(token)));
  }

  // Asset Revaluations methods
  async getAssetRevaluations(query: any, token?: string) {
    const requestData: any = {};
    if (query.asset_id !== undefined) requestData.assetId = String(query.asset_id);
    if (query.sort !== undefined) requestData.sort = String(query.sort);
    return await firstValueFrom(this.assetRevaluationsService.GetAssetRevaluations(requestData, this.createMetadata(token)));
  }

  async getAssetRevaluation(id: string, token?: string) {
    return await firstValueFrom(this.assetRevaluationsService.GetAssetRevaluation({ id }, this.createMetadata(token)));
  }

  async createAssetRevaluation(data: any, token?: string) {
    const grpcData: any = {
      organizationId: data.organization_id,
      assetId: data.asset_id,
      revaluationDate: data.revaluation_date,
      newValue: data.new_value?.toString(),
      reason: data.reason,
      accountId: data.account_id,
    };
    return await firstValueFrom(this.assetRevaluationsService.CreateAssetRevaluation(grpcData, this.createMetadata(token)));
  }

  async updateAssetRevaluation(id: string, data: any, token?: string) {
    const grpcData: any = {
      id,
      revaluationDate: data.revaluation_date,
      newValue: data.new_value?.toString(),
      reason: data.reason,
      status: data.status,
      accountId: data.account_id,
    };
    return await firstValueFrom(this.assetRevaluationsService.UpdateAssetRevaluation(grpcData, this.createMetadata(token)));
  }

  async deleteAssetRevaluation(id: string, token?: string) {
    return await firstValueFrom(this.assetRevaluationsService.DeleteAssetRevaluation({ id }, this.createMetadata(token)));
  }

  async postAssetRevaluation(id: string, token?: string) {
    return await firstValueFrom(this.assetRevaluationsService.PostAssetRevaluation({ id }, this.createMetadata(token)));
  }

  // Asset Disposals methods
  async getAssetDisposals(query: any, token?: string) {
    const requestData: any = {};
    if (query.asset_id !== undefined) requestData.assetId = String(query.asset_id);
    if (query.sort !== undefined) requestData.sort = String(query.sort);
    return await firstValueFrom(this.assetDisposalsService.GetAssetDisposals(requestData, this.createMetadata(token)));
  }

  async getAssetDisposal(id: string, token?: string) {
    return await firstValueFrom(this.assetDisposalsService.GetAssetDisposal({ id }, this.createMetadata(token)));
  }

  async createAssetDisposal(data: any, token?: string) {
    const grpcData: any = {
      organizationId: data.organization_id,
      assetId: data.asset_id,
      disposalDate: data.disposal_date,
      disposalMethod: data.disposal_method,
      disposalAmount: data.disposal_amount?.toString(),
      reason: data.reason,
      accountId: data.account_id,
    };
    return await firstValueFrom(this.assetDisposalsService.CreateAssetDisposal(grpcData, this.createMetadata(token)));
  }

  async disposeAsset(assetId: string, data: any, token?: string) {
    const grpcData: any = {
      assetId: assetId,
      disposalDate: data.disposal_date,
      disposalMethod: data.disposal_method,
      disposalAmount: data.disposal_amount?.toString(),
      reason: data.reason,
      accountId: data.account_id,
    };
    return await firstValueFrom(this.assetDisposalsService.DisposeAsset(grpcData, this.createMetadata(token)));
  }

  async updateAssetDisposal(id: string, data: any, token?: string) {
    const grpcData: any = {
      id,
      disposalDate: data.disposal_date,
      disposalMethod: data.disposal_method,
      disposalAmount: data.disposal_amount?.toString(),
      gainLoss: data.gain_loss?.toString(),
      reason: data.reason,
      status: data.status,
      accountId: data.account_id,
    };
    return await firstValueFrom(this.assetDisposalsService.UpdateAssetDisposal(grpcData, this.createMetadata(token)));
  }

  async deleteAssetDisposal(id: string, token?: string) {
    return await firstValueFrom(this.assetDisposalsService.DeleteAssetDisposal({ id }, this.createMetadata(token)));
  }

  async postAssetDisposal(id: string, token?: string) {
    return await firstValueFrom(this.assetDisposalsService.PostAssetDisposal({ id }, this.createMetadata(token)));
  }

  // Loans methods
  async getLoans(data: { sort?: string; status?: string; loan_type?: string }, token?: string) {
    const grpcData: any = {
      sort: data.sort,
      status: data.status,
      loanType: data.loan_type,
    };
    return await firstValueFrom(this.loansService.GetLoans(grpcData, this.createMetadata(token)));
  }

  async getLoan(id: string, token?: string) {
    return await firstValueFrom(this.loansService.GetLoan({ id }, this.createMetadata(token)));
  }

  async createLoan(data: any, token?: string) {
    const grpcData: any = {
      organizationId: data.organization_id,
      loanNumber: data.loan_number,
      loanName: data.loan_name,
      lender: data.lender,
      loanType: data.loan_type,
      loanAmount: data.loan_amount?.toString(),
      interestRate: data.interest_rate?.toString(),
      loanDate: data.loan_date,
      maturityDate: data.maturity_date,
      paymentFrequency: data.payment_frequency,
      accountId: data.account_id,
    };
    return await firstValueFrom(this.loansService.CreateLoan(grpcData, this.createMetadata(token)));
  }

  async updateLoan(id: string, data: any, token?: string) {
    const grpcData: any = {
      id,
      loanNumber: data.loan_number,
      loanName: data.loan_name,
      lender: data.lender,
      loanType: data.loan_type,
      loanAmount: data.loan_amount?.toString(),
      interestRate: data.interest_rate?.toString(),
      loanDate: data.loan_date,
      maturityDate: data.maturity_date,
      paymentFrequency: data.payment_frequency,
      paymentAmount: data.payment_amount?.toString(),
      outstandingBalance: data.outstanding_balance?.toString(),
      status: data.status,
      accountId: data.account_id,
    };
    return await firstValueFrom(this.loansService.UpdateLoan(grpcData, this.createMetadata(token)));
  }

  async deleteLoan(id: string, token?: string) {
    return await firstValueFrom(this.loansService.DeleteLoan({ id }, this.createMetadata(token)));
  }

  async makeLoanPayment(loanId: string, data: any, token?: string) {
    const grpcData: any = {
      loanId,
      paymentDate: data.payment_date,
      paymentAmount: data.payment_amount?.toString(),
      principalAmount: data.principal_amount?.toString(),
      interestAmount: data.interest_amount?.toString(),
      bankAccountId: data.bank_account_id,
    };
    return await firstValueFrom(this.loansService.MakePayment(grpcData, this.createMetadata(token)));
  }

  async getLoanSchedule(id: string, token?: string) {
    return await firstValueFrom(this.loansService.GetSchedule({ id }, this.createMetadata(token)));
  }

  // Accrued Expenses methods
  async getAccruedExpenses(data: { sort?: string; status?: string }, token?: string) {
    const grpcData: any = {
      sort: data.sort,
      status: data.status,
    };
    return await firstValueFrom(this.accruedExpensesService.GetAccruedExpenses(grpcData, this.createMetadata(token)));
  }

  async getAccruedExpense(id: string, token?: string) {
    return await firstValueFrom(this.accruedExpensesService.GetAccruedExpense({ id }, this.createMetadata(token)));
  }

  async createAccruedExpense(data: any, token?: string) {
    const grpcData: any = {
      organizationId: data.organization_id,
      accrualNumber: data.accrual_number,
      expenseDescription: data.expense_description,
      accrualDate: data.accrual_date,
      amount: data.amount?.toString(),
      currency: data.currency,
      accountId: data.account_id,
      vendorId: data.vendor_id,
    };
    return await firstValueFrom(this.accruedExpensesService.CreateAccruedExpense(grpcData, this.createMetadata(token)));
  }

  async updateAccruedExpense(id: string, data: any, token?: string) {
    const grpcData: any = {
      id,
      accrualNumber: data.accrual_number,
      expenseDescription: data.expense_description,
      accrualDate: data.accrual_date,
      amount: data.amount?.toString(),
      currency: data.currency,
      accountId: data.account_id,
      vendorId: data.vendor_id,
      status: data.status,
      reversalDate: data.reversal_date,
      reversalReason: data.reversal_reason,
    };
    return await firstValueFrom(this.accruedExpensesService.UpdateAccruedExpense(grpcData, this.createMetadata(token)));
  }

  async deleteAccruedExpense(id: string, token?: string) {
    return await firstValueFrom(this.accruedExpensesService.DeleteAccruedExpense({ id }, this.createMetadata(token)));
  }

  async reverseAccruedExpense(id: string, data: any, token?: string) {
    const grpcData: any = {
      id,
      reversalDate: data.reversal_date,
      reason: data.reason,
    };
    return await firstValueFrom(this.accruedExpensesService.ReverseAccruedExpense(grpcData, this.createMetadata(token)));
  }

  // Tax Payables methods
  async getTaxPayables(data: { sort?: string; status?: string; tax_type?: string }, token?: string) {
    const grpcData: any = {
      sort: data.sort,
      status: data.status,
      taxType: data.tax_type,
    };
    return await firstValueFrom(this.taxPayablesService.GetTaxPayables(grpcData, this.createMetadata(token)));
  }

  async getTaxPayable(id: string, token?: string) {
    return await firstValueFrom(this.taxPayablesService.GetTaxPayable({ id }, this.createMetadata(token)));
  }

  async createTaxPayable(data: any, token?: string) {
    const grpcData: any = {
      organizationId: data.organization_id,
      taxType: data.tax_type,
      taxPeriod: data.tax_period,
      dueDate: data.due_date,
      amount: data.amount?.toString(),
      currency: data.currency,
      accountId: data.account_id,
    };
    return await firstValueFrom(this.taxPayablesService.CreateTaxPayable(grpcData, this.createMetadata(token)));
  }

  async updateTaxPayable(id: string, data: any, token?: string) {
    const grpcData: any = {
      id,
      taxType: data.tax_type,
      taxPeriod: data.tax_period,
      dueDate: data.due_date,
      amount: data.amount?.toString(),
      currency: data.currency,
      accountId: data.account_id,
      status: data.status,
      paidDate: data.paid_date,
      paidAmount: data.paid_amount?.toString(),
    };
    return await firstValueFrom(this.taxPayablesService.UpdateTaxPayable(grpcData, this.createMetadata(token)));
  }

  async deleteTaxPayable(id: string, token?: string) {
    return await firstValueFrom(this.taxPayablesService.DeleteTaxPayable({ id }, this.createMetadata(token)));
  }

  async payTaxPayable(id: string, data: any, token?: string) {
    const grpcData: any = {
      id,
      paymentDate: data.payment_date,
      paymentAmount: data.payment_amount?.toString(),
      bankAccountId: data.bank_account_id,
    };
    return await firstValueFrom(this.taxPayablesService.PayTaxPayable(grpcData, this.createMetadata(token)));
  }

  async calculateTaxPayable(data: { tax_type: string; period: string }, token?: string) {
    const grpcData: any = {
      taxType: data.tax_type,
      period: data.period,
    };
    return await firstValueFrom(this.taxPayablesService.CalculateTaxPayable(grpcData, this.createMetadata(token)));
  }

  // Liabilities methods
  async getLiabilities(data: { sort?: string; liability_type?: string }, token?: string) {
    const grpcData: any = {
      sort: data.sort,
      liabilityType: data.liability_type,
    };
    return await firstValueFrom(this.liabilitiesService.GetLiabilities(grpcData, this.createMetadata(token)));
  }

  async getLiability(id: string, token?: string) {
    return await firstValueFrom(this.liabilitiesService.GetLiability({ id }, this.createMetadata(token)));
  }

  async createLiability(data: any, token?: string) {
    const grpcData: any = {
      organizationId: data.organization_id,
      liabilityCode: data.liability_code,
      liabilityName: data.liability_name,
      liabilityType: data.liability_type,
      amount: data.amount?.toString(),
      currency: data.currency,
      dueDate: data.due_date,
      interestRate: data.interest_rate?.toString(),
      accountId: data.account_id,
    };
    return await firstValueFrom(this.liabilitiesService.CreateLiability(grpcData, this.createMetadata(token)));
  }

  async updateLiability(id: string, data: any, token?: string) {
    const grpcData: any = {
      id,
      liabilityCode: data.liability_code,
      liabilityName: data.liability_name,
      liabilityType: data.liability_type,
      amount: data.amount?.toString(),
      currency: data.currency,
      dueDate: data.due_date,
      interestRate: data.interest_rate?.toString(),
      status: data.status,
      accountId: data.account_id,
    };
    return await firstValueFrom(this.liabilitiesService.UpdateLiability(grpcData, this.createMetadata(token)));
  }

  async deleteLiability(id: string, token?: string) {
    return await firstValueFrom(this.liabilitiesService.DeleteLiability({ id }, this.createMetadata(token)));
  }

  async getLongTermLiabilities(token?: string) {
    return await firstValueFrom(this.liabilitiesService.GetLongTermLiabilities({}, this.createMetadata(token)));
  }

  async getShortTermLiabilities(token?: string) {
    return await firstValueFrom(this.liabilitiesService.GetShortTermLiabilities({}, this.createMetadata(token)));
  }

  // Projects methods
  async getProjects(data: { sort?: string; status?: string; department?: string; start_date?: string; end_date?: string }, token?: string) {
    const grpcData: any = {
      sort: data.sort,
      status: data.status,
      department: data.department,
      startDate: data.start_date,
      endDate: data.end_date,
    };
    return await firstValueFrom(this.projectsService.GetProjects(grpcData, this.createMetadata(token)));
  }

  async getProject(id: string, token?: string) {
    return await firstValueFrom(this.projectsService.GetProject({ id }, this.createMetadata(token)));
  }

  async createProject(data: any, token?: string) {
    const grpcData: any = {
      organizationId: data.organization_id,
      projectCode: data.project_code,
      projectName: data.project_name,
      description: data.description,
      projectType: data.project_type,
      status: data.status,
      startDate: data.start_date,
      endDate: data.end_date,
      budgetedAmount: data.budgeted_amount?.toString(),
      currency: data.currency,
      department: data.department,
      projectManagerId: data.project_manager_id,
      costCenterId: data.cost_center_id,
    };
    return await firstValueFrom(this.projectsService.CreateProject(grpcData, this.createMetadata(token)));
  }

  async updateProject(id: string, data: any, token?: string) {
    const grpcData: any = {
      id,
      projectCode: data.project_code,
      projectName: data.project_name,
      description: data.description,
      projectType: data.project_type,
      status: data.status,
      startDate: data.start_date,
      endDate: data.end_date,
      budgetedAmount: data.budgeted_amount?.toString(),
      currency: data.currency,
      department: data.department,
      projectManagerId: data.project_manager_id,
      costCenterId: data.cost_center_id,
      isActive: data.is_active,
    };
    return await firstValueFrom(this.projectsService.UpdateProject(grpcData, this.createMetadata(token)));
  }

  async deleteProject(id: string, token?: string) {
    return await firstValueFrom(this.projectsService.DeleteProject({ id }, this.createMetadata(token)));
  }

  async getProjectBudget(id: string, token?: string) {
    return await firstValueFrom(this.projectsService.GetProjectBudget({ id }, this.createMetadata(token)));
  }

  // Cost Centers methods
  async getCostCenters(data: { sort?: string; is_active?: boolean; department?: string; parent_id?: string }, token?: string) {
    const grpcData: any = {
      sort: data.sort,
      isActive: data.is_active,
      department: data.department,
      parentId: data.parent_id,
    };
    return await firstValueFrom(this.costCentersService.GetCostCenters(grpcData, this.createMetadata(token)));
  }

  async getCostCenter(id: string, token?: string) {
    return await firstValueFrom(this.costCentersService.GetCostCenter({ id }, this.createMetadata(token)));
  }

  async createCostCenter(data: any, token?: string) {
    const grpcData: any = {
      organizationId: data.organization_id,
      costCenterCode: data.cost_center_code,
      costCenterName: data.cost_center_name,
      description: data.description,
      department: data.department,
      parentId: data.parent_id,
      managerId: data.manager_id,
      budgetedAmount: data.budgeted_amount?.toString(),
      currency: data.currency,
      isActive: data.is_active,
    };
    return await firstValueFrom(this.costCentersService.CreateCostCenter(grpcData, this.createMetadata(token)));
  }

  async updateCostCenter(id: string, data: any, token?: string) {
    const grpcData: any = {
      id,
      costCenterCode: data.cost_center_code,
      costCenterName: data.cost_center_name,
      description: data.description,
      department: data.department,
      parentId: data.parent_id,
      managerId: data.manager_id,
      budgetedAmount: data.budgeted_amount?.toString(),
      currency: data.currency,
      isActive: data.is_active,
    };
    return await firstValueFrom(this.costCentersService.UpdateCostCenter(grpcData, this.createMetadata(token)));
  }

  async deleteCostCenter(id: string, token?: string) {
    return await firstValueFrom(this.costCentersService.DeleteCostCenter({ id }, this.createMetadata(token)));
  }

  async getCostCenterBudget(id: string, data: { period_start?: string; period_end?: string }, token?: string) {
    const grpcData: any = {
      id,
      periodStart: data.period_start,
      periodEnd: data.period_end,
    };
    return await firstValueFrom(this.costCentersService.GetCostCenterBudget(grpcData, this.createMetadata(token)));
  }

  // Pricing methods
  async getPricings(data: { sort?: string; product_id?: string; customer_id?: string; is_active?: boolean; effective_date?: string }, token?: string) {
    const grpcData: any = {
      sort: data.sort,
      productId: data.product_id,
      customerId: data.customer_id,
      isActive: data.is_active,
      effectiveDate: data.effective_date,
    };
    return await firstValueFrom(this.pricingService.GetPricings(grpcData, this.createMetadata(token)));
  }

  async getPricing(id: string, token?: string) {
    return await firstValueFrom(this.pricingService.GetPricing({ id }, this.createMetadata(token)));
  }

  async createPricing(data: any, token?: string) {
    const grpcData: any = {
      organizationId: data.organization_id,
      pricingCode: data.pricing_code,
      productId: data.product_id,
      customerId: data.customer_id,
      pricingType: data.pricing_type,
      basePrice: data.base_price?.toString(),
      discountPercent: data.discount_percent?.toString(),
      discountAmount: data.discount_amount?.toString(),
      currency: data.currency,
      minimumQuantity: data.minimum_quantity?.toString(),
      effectiveDate: data.effective_date,
      expiryDate: data.expiry_date,
      isActive: data.is_active,
      notes: data.notes,
    };
    return await firstValueFrom(this.pricingService.CreatePricing(grpcData, this.createMetadata(token)));
  }

  async updatePricing(id: string, data: any, token?: string) {
    const grpcData: any = {
      id,
      pricingCode: data.pricing_code,
      productId: data.product_id,
      customerId: data.customer_id,
      pricingType: data.pricing_type,
      basePrice: data.base_price?.toString(),
      discountPercent: data.discount_percent?.toString(),
      discountAmount: data.discount_amount?.toString(),
      currency: data.currency,
      minimumQuantity: data.minimum_quantity?.toString(),
      effectiveDate: data.effective_date,
      expiryDate: data.expiry_date,
      isActive: data.is_active,
      notes: data.notes,
    };
    return await firstValueFrom(this.pricingService.UpdatePricing(grpcData, this.createMetadata(token)));
  }

  async deletePricing(id: string, token?: string) {
    return await firstValueFrom(this.pricingService.DeletePricing({ id }, this.createMetadata(token)));
  }

  async calculatePricing(data: { product_id: string; customer_id?: string; quantity: number; date?: string }, token?: string) {
    const grpcData: any = {
      productId: data.product_id,
      customerId: data.customer_id,
      quantity: data.quantity.toString(),
      date: data.date,
    };
    return await firstValueFrom(this.pricingService.CalculatePricing(grpcData, this.createMetadata(token)));
  }

  // Contracts methods
  async getContracts(data: { sort?: string; status?: string; contract_type?: string; customer_id?: string; vendor_id?: string; start_date?: string; end_date?: string }, token?: string) {
    const grpcData: any = {
      sort: data.sort,
      status: data.status,
      contractType: data.contract_type,
      customerId: data.customer_id,
      vendorId: data.vendor_id,
      startDate: data.start_date,
      endDate: data.end_date,
    };
    return await firstValueFrom(this.contractsService.GetContracts(grpcData, this.createMetadata(token)));
  }

  async getContract(id: string, token?: string) {
    return await firstValueFrom(this.contractsService.GetContract({ id }, this.createMetadata(token)));
  }

  async createContract(data: any, token?: string) {
    const grpcData: any = {
      organizationId: data.organization_id,
      contractNumber: data.contract_number,
      contractName: data.contract_name,
      contractType: data.contract_type,
      partyType: data.party_type,
      partyId: data.party_id,
      startDate: data.start_date,
      endDate: data.end_date,
      totalValue: data.total_value?.toString(),
      currency: data.currency,
      paymentTerms: data.payment_terms,
      billingFrequency: data.billing_frequency,
      autoRenew: data.auto_renew,
      renewalDate: data.renewal_date,
      projectId: data.project_id,
      costCenterId: data.cost_center_id,
      notes: data.notes,
      documentUrl: data.document_url,
    };
    return await firstValueFrom(this.contractsService.CreateContract(grpcData, this.createMetadata(token)));
  }

  async updateContract(id: string, data: any, token?: string) {
    const grpcData: any = {
      id,
      contractNumber: data.contract_number,
      contractName: data.contract_name,
      contractType: data.contract_type,
      status: data.status,
      partyType: data.party_type,
      partyId: data.party_id,
      startDate: data.start_date,
      endDate: data.end_date,
      totalValue: data.total_value?.toString(),
      currency: data.currency,
      paymentTerms: data.payment_terms,
      billingFrequency: data.billing_frequency,
      autoRenew: data.auto_renew,
      renewalDate: data.renewal_date,
      projectId: data.project_id,
      costCenterId: data.cost_center_id,
      notes: data.notes,
      documentUrl: data.document_url,
    };
    return await firstValueFrom(this.contractsService.UpdateContract(grpcData, this.createMetadata(token)));
  }

  async deleteContract(id: string, token?: string) {
    return await firstValueFrom(this.contractsService.DeleteContract({ id }, this.createMetadata(token)));
  }

  async activateContract(id: string, data: { activation_date?: string }, token?: string) {
    const grpcData: any = {
      id,
      activationDate: data.activation_date,
    };
    return await firstValueFrom(this.contractsService.ActivateContract(grpcData, this.createMetadata(token)));
  }

  async renewContract(id: string, data: { new_end_date: string; renewal_terms?: string; updated_value?: number }, token?: string) {
    const grpcData: any = {
      id,
      newEndDate: data.new_end_date,
      renewalTerms: data.renewal_terms,
      updatedValue: data.updated_value?.toString(),
    };
    return await firstValueFrom(this.contractsService.RenewContract(grpcData, this.createMetadata(token)));
  }

  async terminateContract(id: string, data: { termination_date: string; termination_reason: string; notes?: string }, token?: string) {
    const grpcData: any = {
      id,
      terminationDate: data.termination_date,
      terminationReason: data.termination_reason,
      notes: data.notes,
    };
    return await firstValueFrom(this.contractsService.TerminateContract(grpcData, this.createMetadata(token)));
  }

  async getContractPayments(id: string, token?: string) {
    return await firstValueFrom(this.contractsService.GetContractPayments({ id }, this.createMetadata(token)));
  }
}

