'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col flex-1 items-center justify-center py-32 text-center px-4">
      <AlertTriangle className="w-10 h-10 text-red-300 mb-4" />
      <h2 className="text-base font-semibold text-ink-800 mb-1">Something went wrong</h2>
      <p className="text-sm text-ink-400 mb-6 max-w-xs">
        An unexpected error occurred. Please try refreshing the page.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-700 transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Try again
      </button>
    </div>
  );
}
