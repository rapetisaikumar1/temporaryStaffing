export type BookingStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Event {
  id: string;
  name: string;
  type: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  staffCount: number;
  staffRoles: string[];
  notes?: string | null;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  client: { id: string; name: string; companyName?: string | null };
  supervisor?: { id: string; name: string; email: string } | null;
  createdBy?: { id: string; name: string; email: string } | null;
  _count?: { assignments: number; quotations: number };
}

export interface CreateEventDto {
  name: string;
  type: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  staffCount: number;
  staffRoles: string[];
  clientId: string;
  supervisorId?: string;
  notes?: string;
}

export type UpdateEventDto = Omit<Partial<CreateEventDto>, 'clientId'>;
