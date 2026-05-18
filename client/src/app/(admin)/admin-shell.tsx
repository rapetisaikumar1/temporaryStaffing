'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/shared/Sidebar';
import { useAuthStore } from '@/store/authStore';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated: storeAuthenticated } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password';

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthPage && !storeAuthenticated) router.replace('/login');
  }, [pathname, isAuthPage, router, storeAuthenticated, hydrated]);

  if (isAuthPage) return <>{children}</>;
  if (!hydrated) return null;

  return (
    <div className="relative flex min-h-screen bg-ink-50/40">
      <Sidebar />
      <div className="relative flex flex-col flex-1 ml-[248px] min-h-screen overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
