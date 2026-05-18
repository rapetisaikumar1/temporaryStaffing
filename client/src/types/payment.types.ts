export type PaymentStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';
export type InvoiceStatus = 'NOT_GENERATED' | 'GENERATED' | 'SENT';
export type StaffPayoutStatus = 'PENDING' | 'PAID';

export interface PaymentEvent {
  id: string;
  name: string;
  type: string;
  date: string;
  location: string;
  status: string;
}

export interface PaymentClient {
  id: string;
  name: string;
  companyName: string | null;
  email: string;
  phone: string;
}

export interface Payment {
  id: string;
  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;
  status: PaymentStatus;
  invoiceStatus: InvoiceStatus;
  staffPayoutStatus: StaffPayoutStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  event: PaymentEvent | null;
  client: PaymentClient | null;
  createdBy: { id: string; name: string; email: string } | null;
}

export interface CreatePaymentDto {
  eventId: string;
  clientId: string;
  totalAmount: number;
  advancePaid?: number;
  notes?: string;
}

export interface UpdatePaymentDto {
  totalAmount?: number;
  advancePaid?: number;
  notes?: string;
}

export interface UpdatePaymentStatusesDto {
  status?: PaymentStatus;
  invoiceStatus?: InvoiceStatus;
  staffPayoutStatus?: StaffPayoutStatus;
}

export interface PaymentStats {
  total: number;
  pending: number;
  partiallyPaid: number;
  paid: number;
  overdue: number;
}
