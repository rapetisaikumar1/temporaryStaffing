import { create } from 'zustand';
import { Quotation, QuotationStatus } from '@/types/quotation.types';

interface QuotationState {
  quotations: Quotation[];
  selectedQuotation: Quotation | null;
  isLoading: boolean;
  error: string | null;

  setQuotations: (list: Quotation[]) => void;
  setSelectedQuotation: (q: Quotation | null) => void;
  addQuotation: (q: Quotation) => void;
  updateQuotation: (q: Quotation) => void;
  updateQuotationStatus: (id: string, status: QuotationStatus) => void;
  removeQuotation: (id: string) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
}

export const useQuotationStore = create<QuotationState>((set) => ({
  quotations: [],
  selectedQuotation: null,
  isLoading: false,
  error: null,

  setQuotations: (list) => set({ quotations: list }),
  setSelectedQuotation: (q) => set({ selectedQuotation: q }),
  addQuotation: (q) => set((s) => ({ quotations: [q, ...s.quotations] })),
  updateQuotation: (q) =>
    set((s) => ({ quotations: s.quotations.map((x) => (x.id === q.id ? q : x)) })),
  updateQuotationStatus: (id, status) =>
    set((s) => ({
      quotations: s.quotations.map((x) => (x.id === id ? { ...x, status } : x)),
    })),
  removeQuotation: (id) =>
    set((s) => ({ quotations: s.quotations.filter((x) => x.id !== id) })),
  setLoading: (v) => set({ isLoading: v }),
  setError: (e) => set({ error: e }),
}));
