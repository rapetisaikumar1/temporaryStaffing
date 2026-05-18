import { create } from 'zustand';
import { Assignment, AssignmentStatus } from '@/types/assignment.types';

interface AssignmentState {
  assignments: Assignment[];
  isLoading: boolean;
  error: string | null;

  setAssignments: (list: Assignment[]) => void;
  addAssignment: (a: Assignment) => void;
  updateAssignment: (a: Assignment) => void;
  updateAssignmentStatus: (id: string, status: AssignmentStatus) => void;
  removeAssignment: (id: string) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
}

export const useAssignmentStore = create<AssignmentState>((set) => ({
  assignments: [],
  isLoading: false,
  error: null,

  setAssignments: (list) => set({ assignments: list }),
  addAssignment: (a) => set((s) => ({ assignments: [a, ...s.assignments] })),
  updateAssignment: (a) =>
    set((s) => ({ assignments: s.assignments.map((x) => (x.id === a.id ? a : x)) })),
  updateAssignmentStatus: (id, status) =>
    set((s) => ({
      assignments: s.assignments.map((x) => (x.id === id ? { ...x, status } : x)),
    })),
  removeAssignment: (id) =>
    set((s) => ({ assignments: s.assignments.filter((x) => x.id !== id) })),
  setLoading: (v) => set({ isLoading: v }),
  setError: (e) => set({ error: e }),
}));
