import { create } from 'zustand';
import { AdminUser } from '@/types/user.types';

interface UserState {
  users: AdminUser[];
  isLoading: boolean;
  error: string | null;
  setUsers: (users: AdminUser[]) => void;
  addUser: (user: AdminUser) => void;
  updateUser: (updated: AdminUser) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  isLoading: false,
  error: null,

  setUsers: (users) => set({ users }),

  addUser: (user) => set((state) => ({ users: [user, ...state.users] })),

  updateUser: (updated) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === updated.id ? updated : u)),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
