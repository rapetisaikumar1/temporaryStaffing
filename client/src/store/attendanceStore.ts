import { create } from 'zustand';
import { Attendance, AttendanceStatus } from '@/types/attendance.types';

interface AttendanceState {
  attendances: Attendance[];
  selectedAttendance: Attendance | null;
  isLoading: boolean;
  error: string | null;

  setAttendances: (attendances: Attendance[]) => void;
  setSelectedAttendance: (attendance: Attendance | null) => void;
  addAttendance: (attendance: Attendance) => void;
  updateAttendance: (updated: Attendance) => void;
  updateAttendanceStatus: (id: string, status: AttendanceStatus) => void;
  removeAttendance: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
  attendances: [],
  selectedAttendance: null,
  isLoading: false,
  error: null,

  setAttendances: (attendances) => set({ attendances }),
  setSelectedAttendance: (selectedAttendance) => set({ selectedAttendance }),

  addAttendance: (attendance) =>
    set((state) => ({ attendances: [attendance, ...state.attendances] })),

  updateAttendance: (updated) =>
    set((state) => ({
      attendances: state.attendances.map((a) => (a.id === updated.id ? updated : a)),
    })),

  updateAttendanceStatus: (id, status) =>
    set((state) => ({
      attendances: state.attendances.map((a) => (a.id === id ? { ...a, status } : a)),
    })),

  removeAttendance: (id) =>
    set((state) => ({ attendances: state.attendances.filter((a) => a.id !== id) })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
