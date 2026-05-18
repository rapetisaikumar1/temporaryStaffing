export type StaffStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'AVAILABLE'
  | 'ASSIGNED'
  | 'BLACKLISTED';

export type DocumentType = 'ID_PROOF' | 'PHOTO' | 'CERTIFICATE' | 'CONTRACT' | 'OTHER';

export interface StaffDocument {
  id: string;
  staffId: string;
  type: DocumentType;
  url: string;
  cloudinaryId: string;
  uploadedAt: string;
}

export interface Staff {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  role: string;
  skills: string[];
  experienceYears: number;
  availability: boolean;
  isVerified: boolean;
  rating?: number | null;
  notes?: string | null;
  status: StaffStatus;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: string; name: string; email: string } | null;
  _count?: { assignments: number };
}

export interface CreateStaffDto {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  role: string;
  skills?: string[];
  experienceYears?: number;
  availability?: boolean;
  notes?: string;
}

export type UpdateStaffDto = Partial<CreateStaffDto>;
