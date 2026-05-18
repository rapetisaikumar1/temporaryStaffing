import { create } from 'zustand';
import { Payment, PaymentStatus, InvoiceStatus, StaffPayoutStatus } from '@/types/payment.types';

interface PaymentState {
  payments: Payment[];
  selectedPayment: Payment | null;
  isLoading: boolean;
  error: string | null;

  setPayments: (payments: Payment[]) => void;
  setSelectedPayment: (payment: Payment | null) => void;
  addPayment: (payment: Payment) => void;
  updatePayment: (updated: Payment) => void;
  updatePaymentStatus: (id: string, status: PaymentStatus) => void;
  updatePaymentStatuses: (id: string, statuses: { status?: PaymentStatus; invoiceStatus?: InvoiceStatus; staffPayoutStatus?: StaffPayoutStatus }) => void;
  removePayment: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  payments: [],
  selectedPayment: null,
  isLoading: false,
  error: null,

  setPayments: (payments) => set({ payments }),
  setSelectedPayment: (selectedPayment) => set({ selectedPayment }),

  addPayment: (payment) =>
    set((state) => ({ payments: [payment, ...state.payments] })),

  updatePayment: (updated) =>
    set((state) => ({
      payments: state.payments.map((p) => (p.id === updated.id ? updated : p)),
    })),

  updatePaymentStatus: (id, status) =>
    set((state) => ({
      payments: state.payments.map((p) => (p.id === id ? { ...p, status } : p)),
    })),

  updatePaymentStatuses: (id, statuses) =>
    set((state) => ({
      payments: state.payments.map((p) => (p.id === id ? { ...p, ...statuses } : p)),
    })),

  removePayment: (id) =>
    set((state) => ({ payments: state.payments.filter((p) => p.id !== id) })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
