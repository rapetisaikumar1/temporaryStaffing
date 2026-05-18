export type AssignmentStatus =
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'NO_SHOW';

export interface Assignment {
  id: string;
  role: string;
  status: AssignmentStatus;
  notes?: string | null;
  assignedAt: string;
  updatedAt: string;
  event: {
    id: string;
    name: string;
    type: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    status: string;
  };
  staff: {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    city: string;
    role: string;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface CreateAssignmentDto {
  eventId: string;
  staffId: string;
  role: string;
  notes?: string;
}

export interface UpdateAssignmentDto {
  status?: AssignmentStatus;
  role?: string;
  notes?: string;
}

export interface AssignmentStats {
  staffCount: number;
  total: number;
  assigned: number;
  accepted: number;
  rejected: number;
  completed: number;
  noShow: number;
}
