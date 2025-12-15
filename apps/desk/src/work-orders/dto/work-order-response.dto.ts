export interface WorkOrderServiceResponse {
  workOrderId: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  discount: number;
  taxId?: string | null;
  taxPercentage?: number | null;
  amount: number;
}

export interface WorkOrderPartResponse {
  workOrderId: string;
  partId: string;
  partName: string;
  quantity: number;
  discount: number;
  taxId?: string | null;
  taxPercentage?: number | null;
  amount: number;
}

export interface TicketReference {
  id: string;
  subject: string;
}

export interface PartReference {
  id: string;
  name: string;
}

export interface WorkOrderResponseDto {
  id: string;
  title: string;
  summary?: string | null;
  agent?: string | null;
  priority: string;
  dueDate?: Date | null;
  currency?: string | null;
  exchangeRate?: number | null;
  company?: string | null;
  contact?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  serviceAddress?: Record<string, any> | null;
  billingAddress?: Record<string, any> | null;
  termsAndConditions?: string | null;
  billingStatus: string;
  ticketId: string;
  installationBaseId?: string | null;
  parentWorkOrderId?: string | null;
  requestId?: string | null;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Calculated fields
  servicesSubtotal?: number;
  partsSubtotal?: number;
  totalTax?: number;
  totalDiscount?: number;
  grandTotal?: number;
  // Related entities
  workOrderServices?: WorkOrderServiceResponse[];
  workOrderParts?: WorkOrderPartResponse[];
  ticket?: TicketReference;
  installationBase?: PartReference;
}

