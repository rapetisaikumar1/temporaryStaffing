'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/shared/Header';
import QuotationTable from '@/components/admin/QuotationTable';
import { quotationService } from '@/services/quotation.service';
import { useQuotationStore } from '@/store/quotationStore';
import { QuotationStatus } from '@/types/quotation.types';
import { useDebounce } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';

const PAGE_SIZE = 20;

export default function QuotationsPage() {
  const { quotations, setQuotations, isLoading, setLoading, setError } = useQuotationStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | ''>('');
  const [total, setTotal] = useState(0);

  const debouncedSearch = useDebounce(search, 400);
  const { page, totalPages, canPrev, canNext, goToPage, reset } = usePagination(total, PAGE_SIZE);

  const fetchQuotations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await quotationService.findAll({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
      });
      setQuotations(result.data);
      setTotal(result.total);
    } catch {
      setError('Failed to load quotations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, setQuotations, setLoading, setError]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const handleSearchChange = (v: string) => {
    setSearch(v);
    reset();
  };

  const handleStatusChange = (v: QuotationStatus | '') => {
    setStatusFilter(v);
    reset();
  };

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Quotations"
        subtitle="Create and manage client quotations"
      />
      <main className="flex-1 px-8 py-10">
        <QuotationTable
          quotations={quotations}
          total={total}
          page={page}
          totalPages={totalPages}
          isLoading={isLoading}
          search={search}
          statusFilter={statusFilter}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onPageChange={goToPage}
          canPrev={canPrev}
          canNext={canNext}
        />
      </main>
    </div>
  );
}
