import { create } from 'zustand';

interface DashboardStats {
  totalInquiries: number;
  newInquiries: number;
  confirmedBookings: number;
  upcomingEvents: number;
  totalStaff: number;
  assignedStaff: number;
  pendingQuotations: number;
  pendingPayments: number;
}

interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  lastFetched: Date | null;
  setStats: (stats: DashboardStats) => void;
  setLoading: (loading: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  isLoading: false,
  lastFetched: null,

  setStats: (stats) => set({ stats, lastFetched: new Date() }),

  setLoading: (isLoading) => set({ isLoading }),
}));
