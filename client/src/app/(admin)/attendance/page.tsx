'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/shared/Header';
import AttendanceTable from '@/components/admin/AttendanceTable';
import { attendanceService } from '@/services/attendance.service';
import { useAttendanceStore } from '@/store/attendanceStore';
import { AttendanceStatus } from '@/types/attendance.types';
import { useDebounce } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';

const PAGE_SIZE = 20;

export default function AttendancePage() {
  const { attendances, setAttendances, isLoading, setLoading, setError } = useAttendanceStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | ''>('');
  const [total, setTotal] = useState(0);

  const debouncedSearch = useDebounce(search, 400);
  const { page, totalPages, canPrev, canNext, goToPage, reset } = usePagination(total, PAGE_SIZE);

  const fetchAttendances = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await attendanceService.findAll({
        page,
        limit: PAGE_SIZE,
        status: statusFilter || undefined,
      });
      setAttendances(result.data);
      setTotal(result.total);
    } catch {
      setError('Failed to load attendance records. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, setAttendances, setLoading, setError]);

  useEffect(() => {
    fetchAttendances();
  }, [fetchAttendances]);

  const handleSearchChange = (v: string) => {
    setSearch(v);
    reset();
  };

  const handleStatusChange = (v: AttendanceStatus | '') => {
    setStatusFilter(v);
    reset();
  };

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Attendance"
        subtitle="Track staff check-ins and attendance for events"
      />
      <main className="flex-1 px-8 py-10">
        <AttendanceTable
          attendances={attendances}
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
