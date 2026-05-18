export type InquiryStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUOTATION_SENT'
  | 'CONFIRMED'
  | 'LOST';

export interface Inquiry {
  id: string;
  fullName: string;
  companyName?: string | null;
  phone: string;
  email: string;
  eventType: string;
  eventDate: string;
  location: string;
  staffCount: number;
  staffRoles: string[];
  message?: string | null;
  status: InquiryStatus;
  handledBy?: { id: string; name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInquiryDto {
  fullName: string;
  companyName?: string;
  phone: string;
  email: string;
  eventType: string;
  eventDate: string;
  location: string;
  staffCount: number;
  staffRoles: string;
  message?: string;
}
