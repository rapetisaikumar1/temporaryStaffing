'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/shared/Header';
import StaffTable from '@/components/admin/StaffTable';
import { staffService } from '@/services/staff.service';
import { useStaffStore } from '@/store/staffStore';
import { StaffStatus } from '@/types/staff.types';
import { useDebounce } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';

const PAGE_SIZE = 20;

export default function StaffPage() {
  const { staffList, setStaffList, isLoading, setLoading, setError } = useStaffStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StaffStatus | ''>('');
  const [total, setTotal] = useState(0);

  const debouncedSearch = useDebounce(search, 400);
  const { page, totalPages, canPrev, canNext, goToPage, reset } = usePagination(total, PAGE_SIZE);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await staffService.findAll({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
      });
      setStaffList(result.data);
      setTotal(result.total);
    } catch {
      setError('Failed to load staff. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, setStaffList, setLoading, setError]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleSearchChange = (v: string) => {
    setSearch(v);
    reset();
  };

  const handleStatusChange = (v: StaffStatus | '') => {
    setStatusFilter(v);
    reset();
  };

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Staff"
        subtitle="Manage all registered staff members"
      />
      <main className="flex-1 px-8 py-10">
        <StaffTable
          staffList={staffList}
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
