export type AttendanceStatus = 'PRESENT' | 'LATE' | 'NO_SHOW' | 'COMPLETED';

export interface AttendanceEvent {
  id: string;
  name: string;
  type: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  location: string;
}

export interface AttendanceStaff {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  role: string;
}

export interface AttendanceAssignment {
  id: string;
  role: string;
  status: string;
}

export interface Attendance {
  id: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
  event: AttendanceEvent | null;
  staff: AttendanceStaff | null;
  assignment: AttendanceAssignment | null;
  markedBy: { id: string; name: string; email: string } | null;
}

export interface CreateAttendanceDto {
  eventId: string;
  staffId: string;
  assignmentId: string;
  checkIn?: string;
  checkOut?: string;
  status?: AttendanceStatus;
  remarks?: string;
}

export interface UpdateAttendanceDto {
  checkIn?: string;
  checkOut?: string;
  status?: AttendanceStatus;
  remarks?: string;
}

export interface AttendanceStats {
  staffCount: number;
  total: number;
  present: number;
  late: number;
  noShow: number;
  completed: number;
}
