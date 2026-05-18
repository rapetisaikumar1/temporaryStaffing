export interface Client {
  id: string;
  name: string;
  companyName?: string | null;
  phone: string;
  email: string;
  address?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: string; name: string; email: string } | null;
  _count?: {
    inquiries: number;
    events: number;
    quotations: number;
  };
}

export interface CreateClientDto {
  name: string;
  companyName?: string;
  phone: string;
  email: string;
  address?: string;
  notes?: string;
}

export type UpdateClientDto = Partial<CreateClientDto>;
