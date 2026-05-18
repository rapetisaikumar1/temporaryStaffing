import { create } from 'zustand';
import { Staff, StaffStatus } from '@/types/staff.types';

interface StaffState {
  staffList: Staff[];
  selectedStaff: Staff | null;
  isLoading: boolean;
  error: string | null;
  setStaffList: (list: Staff[]) => void;
  setSelectedStaff: (staff: Staff | null) => void;
  addStaff: (staff: Staff) => void;
  updateStaff: (updated: Staff) => void;
  updateStaffStatus: (id: string, status: StaffStatus) => void;
  removeStaff: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useStaffStore = create<StaffState>((set) => ({
  staffList: [],
  selectedStaff: null,
  isLoading: false,
  error: null,

  setStaffList: (staffList) => set({ staffList }),
  setSelectedStaff: (selectedStaff) => set({ selectedStaff }),

  addStaff: (staff) =>
    set((state) => ({ staffList: [staff, ...state.staffList] })),

  updateStaff: (updated) =>
    set((state) => ({
      staffList: state.staffList.map((s) => (s.id === updated.id ? updated : s)),
    })),

  updateStaffStatus: (id, status) =>
    set((state) => ({
      staffList: state.staffList.map((s) =>
        s.id === id ? { ...s, status } : s,
      ),
    })),

  removeStaff: (id) =>
    set((state) => ({
      staffList: state.staffList.filter((s) => s.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
