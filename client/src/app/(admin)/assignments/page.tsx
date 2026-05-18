'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/shared/Header';
import AssignmentTable from '@/components/admin/AssignmentTable';
import { assignmentService } from '@/services/assignment.service';
import { useAssignmentStore } from '@/store/assignmentStore';
import { AssignmentStatus } from '@/types/assignment.types';
import { useDebounce } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';

const PAGE_SIZE = 20;

export default function AssignmentsPage() {
  const { assignments, setAssignments, isLoading, setLoading, setError } = useAssignmentStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AssignmentStatus | ''>('');
  const [total, setTotal] = useState(0);

  const debouncedSearch = useDebounce(search, 400);
  const { page, totalPages, canPrev, canNext, goToPage, reset } = usePagination(total, PAGE_SIZE);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await assignmentService.findAll({
        page,
        limit: PAGE_SIZE,
        status: statusFilter || undefined,
      });
      setAssignments(result.data);
      setTotal(result.total);
    } catch {
      setError('Failed to load assignments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, setAssignments, setLoading, setError]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleSearchChange = (v: string) => {
    setSearch(v);
    reset();
  };

  const handleStatusChange = (v: AssignmentStatus | '') => {
    setStatusFilter(v);
    reset();
  };

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Assignments"
        subtitle="Manage staff assignments across all events"
      />
      <main className="flex-1 px-8 py-10">
        <AssignmentTable
          assignments={assignments}
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
