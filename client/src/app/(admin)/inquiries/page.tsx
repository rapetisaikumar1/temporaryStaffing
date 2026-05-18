'use client';

import { useEffect, useState, useCallback } from 'react';
import { Metadata } from 'next';
import Header from '@/components/shared/Header';
import InquiryTable from '@/components/admin/InquiryTable';
import { inquiryService } from '@/services/inquiry.service';
import { useInquiryStore } from '@/store/inquiryStore';
import { InquiryStatus } from '@/types/inquiry.types';
import { useDebounce } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';

const PAGE_SIZE = 20;

export default function InquiriesPage() {
  const { inquiries, setInquiries, isLoading, setLoading, setError } = useInquiryStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | ''>('');
  const [total, setTotal] = useState(0);

  const debouncedSearch = useDebounce(search, 400);
  const { page, totalPages, goToPage, reset } = usePagination(total, PAGE_SIZE);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await inquiryService.findAll({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
      });
      setInquiries(result.data);
      setTotal(result.total);
    } catch {
      setError('Failed to load inquiries. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, setInquiries, setLoading, setError]);

  // Re-fetch whenever filters or page change
  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Reset to page 1 when filters change
  const handleSearchChange = (v: string) => {
    setSearch(v);
    reset();
  };

  const handleStatusChange = (v: InquiryStatus | '') => {
    setStatusFilter(v);
    reset();
  };

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Inquiries"
        subtitle="All staffing requests from the website"
      />
      <main className="flex-1 px-8 py-10">
        <InquiryTable
          inquiries={inquiries}
          total={total}
          page={page}
          totalPages={totalPages}
          isLoading={isLoading}
          search={search}
          statusFilter={statusFilter}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onPageChange={goToPage}
        />
      </main>
    </div>
  );
}
