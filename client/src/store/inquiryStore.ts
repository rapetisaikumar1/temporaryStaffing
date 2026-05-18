import { create } from 'zustand';
import { Inquiry, InquiryStatus } from '@/types/inquiry.types';

interface InquiryState {
  inquiries: Inquiry[];
  selectedInquiry: Inquiry | null;
  isLoading: boolean;
  error: string | null;
  setInquiries: (inquiries: Inquiry[]) => void;
  setSelectedInquiry: (inquiry: Inquiry | null) => void;
  updateInquiryStatus: (id: string, status: InquiryStatus) => void;
  addInquiry: (inquiry: Inquiry) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useInquiryStore = create<InquiryState>((set) => ({
  inquiries: [],
  selectedInquiry: null,
  isLoading: false,
  error: null,

  setInquiries: (inquiries) => set({ inquiries }),

  setSelectedInquiry: (selectedInquiry) => set({ selectedInquiry }),

  updateInquiryStatus: (id, status) =>
    set((state) => ({
      inquiries: state.inquiries.map((inq) =>
        inq.id === id ? { ...inq, status } : inq,
      ),
    })),

  addInquiry: (inquiry) =>
    set((state) => ({ inquiries: [inquiry, ...state.inquiries] })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),
}));
