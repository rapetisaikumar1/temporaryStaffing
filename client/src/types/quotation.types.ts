export type QuotationStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';

export interface QuotationItem {
  id: string;
  role: string;
  quantity: number;
  ratePerPerson: number;
  days: number;
  total: number;
}

export interface Quotation {
  id: string;
  title: string;
  subtotal: number;
  serviceCharge: number;
  tax: number;
  discount: number;
  total: number;
  status: QuotationStatus;
  sentAt?: string | null;
  notes?: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
    companyName?: string | null;
    email: string;
  } | null;
  event?: {
    id: string;
    name: string;
    date: string;
    type: string;
  } | null;
  inquiry?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
  items: QuotationItem[];
}

export interface CreateQuotationItemDto {
  role: string;
  quantity: number;
  ratePerPerson: number;
  days: number;
}

export interface CreateQuotationDto {
  title: string;
  clientId?: string;
  eventId?: string;
  inquiryId?: string;
  items: CreateQuotationItemDto[];
  serviceCharge?: number;
  taxRate?: number;
  discount?: number;
  notes?: string;
}

export type UpdateQuotationDto = Partial<CreateQuotationDto>;

export interface QuotationStats {
  total: number;
  draft: number;
  sent: number;
  accepted: number;
  rejected: number;
}
