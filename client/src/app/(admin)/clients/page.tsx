'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/shared/Header';
import ClientTable from '@/components/admin/ClientTable';
import { clientService } from '@/services/client.service';
import { useClientStore } from '@/store/clientStore';
import { useDebounce } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';

type ActiveFilter = 'all' | 'active' | 'inactive';

const PAGE_SIZE = 20;

export default function ClientsPage() {
  const { clients, setClients, isLoading, setLoading, setError } = useClientStore();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');
  const [total, setTotal] = useState(0);

  const debouncedSearch = useDebounce(search, 400);
  const { page, totalPages, canPrev, canNext, goToPage, reset } = usePagination(total, PAGE_SIZE);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const isActive =
        activeFilter === 'active' ? true : activeFilter === 'inactive' ? false : undefined;

      const result = await clientService.findAll({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        isActive,
      });

      setClients(result.data);
      setTotal(result.total);
    } catch {
      setError('Failed to load clients. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, activeFilter, setClients, setLoading, setError]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSearchChange = (v: string) => {
    setSearch(v);
    reset();
  };

  const handleActiveFilterChange = (v: ActiveFilter) => {
    setActiveFilter(v);
    reset();
  };

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Clients"
        subtitle="Manage all client accounts and their activity"
      />
      <main className="flex-1 px-8 py-10">
        <ClientTable
          clients={clients}
          total={total}
          page={page}
          totalPages={totalPages}
          isLoading={isLoading}
          search={search}
          activeFilter={activeFilter}
          onSearchChange={handleSearchChange}
          onActiveFilterChange={handleActiveFilterChange}
          onPageChange={goToPage}
          canPrev={canPrev}
          canNext={canNext}
        />
      </main>
    </div>
  );
}
