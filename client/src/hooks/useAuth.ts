'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Role } from '@/types/auth.types';

export function useAuth() {
  const { user, isAuthenticated, isLoading, setAuth, clearAuth, setLoading } =
    useAuthStore();
  return { user, isAuthenticated, isLoading, setAuth, clearAuth, setLoading };
}

export function useRequireAuth(allowedRoles?: Role[]) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, user, allowedRoles, router]);

  return { user, isAuthenticated };
}
