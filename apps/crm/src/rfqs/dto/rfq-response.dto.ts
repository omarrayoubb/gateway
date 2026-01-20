export interface RFQProductResponseDto {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  discount?: string | null;
}

export interface RFQResponseDto {
  id: string;
  rfqName: string;
  rfqNumber: string;
  accountId: string;
  accountName: string;
  contactId?: string | null;
  contactName?: string | null;
  leadId?: string | null;
  leadName?: string | null;
  vendorId?: string | null;
  vendorName?: string | null;
  currency: string;
  status: string;
  paymentTerms?: string | null;
  additionalNotes?: string | null;
  rfqProducts: RFQProductResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

