export interface TicketCommentResponse {
  id: string;
  comment: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkOrderReference {
  id: string;
  name: string;
}

export interface ActivityReference {
  id: string;
  action: string;
  performedBy: string;
  createdAt: Date;
}

export interface TicketResponseDto {
  id: string;
  contactName?: string | null;
  accountName?: string | null;
  email: string;
  phone?: string | null;
  subject: string;
  description: string;
  status: string;
  priority: string;
  classification?: string | null;
  ticketOwner?: string | null;
  productName?: string | null;
  vendor: string;
  serialNumber: string;
  dateTime1?: Date | null;
  channel?: string | null;
  language?: string | null;
  category?: string | null;
  subcategory?: string | null;
  dueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comments?: TicketCommentResponse[];
  workOrders?: WorkOrderReference[];
  activities?: ActivityReference[];
}

