import { useState } from 'react';
import { PAGINATION_PAGE_SIZE } from '@/lib/constants';

export function usePagination(total = 0, pageSize = PAGINATION_PAGE_SIZE) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(total / pageSize);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const nextPage = () => setPage((p) => Math.min(totalPages, p + 1));
  const goToPage = (n: number) => setPage(Math.min(Math.max(1, n), totalPages));
  const reset = () => setPage(1);

  return { page, totalPages, canPrev, canNext, prevPage, nextPage, goToPage, reset };
}
