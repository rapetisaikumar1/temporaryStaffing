'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/shared/Header';
import PaymentTable from '@/components/admin/PaymentTable';
import { paymentService } from '@/services/payment.service';
import { usePaymentStore } from '@/store/paymentStore';
import { PaymentStatus } from '@/types/payment.types';
import { usePagination } from '@/hooks/usePagination';

const PAGE_SIZE = 20;

export default function PaymentsPage() {
  const { payments, setPayments, isLoading, setLoading, setError } = usePaymentStore();

  const [statusFilter, setStatusFilter] = useState<PaymentStatus | ''>('');
  const [total, setTotal] = useState(0);

  const { page, totalPages, canPrev, canNext, goToPage, reset } = usePagination(total, PAGE_SIZE);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentService.findAll({
        page,
        limit: PAGE_SIZE,
        status: statusFilter || undefined,
      });
      setPayments(result.data);
      setTotal(result.total);
    } catch {
      setError('Failed to load payment records. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, setPayments, setLoading, setError]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleStatusChange = (v: PaymentStatus | '') => {
    setStatusFilter(v);
    reset();
  };

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Payments"
        subtitle="Track event payments, invoices, and staff payouts"
      />
      <main className="flex-1 px-8 py-10">
        <PaymentTable
          payments={payments}
          total={total}
          page={page}
          totalPages={totalPages}
          isLoading={isLoading}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          onPageChange={goToPage}
          canPrev={canPrev}
          canNext={canNext}
        />
      </main>
    </div>
  );
}
