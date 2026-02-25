export interface SalesOrderProductResponseDto {
  id: string;
  productId: string;
  listPrice: number;
  quantity: number;
  amount: number;
  discount?: number | null;
  tax?: number | null;
  total: number;
}

export interface SalesOrderResponseDto {
  id: string;
  subject: string;
  customerNo?: string | null;
  pending?: string | null;
  carrier?: string | null;
  salesCommission?: number | null;

  accountId: string;
  accountName: string;
  contactId?: string | null;
  contactName?: string | null;
  dealId?: string | null;
  dealName?: string | null;
  rfqId?: string | null;
  rfqName?: string | null;

  currency: string;
  exchangeRate?: number | null;
  dueDate?: Date | null;
  exciseDuty?: number | null;
  status: string;

  billingStreet?: string | null;
  billingCity?: string | null;
  billingState?: string | null;
  billingCode?: string | null;
  billingCountry?: string | null;

  shippingStreet?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingCode?: string | null;
  shippingCountry?: string | null;

  total?: number | null;
  subtotal?: number | null;
  discount?: number | null;
  adjustment?: number | null;
  grandtotal?: number | null;

  termsandcondition?: string | null;
  description?: string | null;

  products: SalesOrderProductResponseDto[];

  createdAt: Date;
  updatedAt: Date;
}

