import { create } from 'zustand';
import { Client } from '@/types/client.types';

interface ClientState {
  clients: Client[];
  selectedClient: Client | null;
  isLoading: boolean;
  error: string | null;
  setClients: (clients: Client[]) => void;
  setSelectedClient: (client: Client | null) => void;
  addClient: (client: Client) => void;
  updateClient: (updated: Client) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useClientStore = create<ClientState>((set) => ({
  clients: [],
  selectedClient: null,
  isLoading: false,
  error: null,

  setClients: (clients) => set({ clients }),
  setSelectedClient: (selectedClient) => set({ selectedClient }),

  addClient: (client) =>
    set((state) => ({ clients: [client, ...state.clients] })),

  updateClient: (updated) =>
    set((state) => ({
      clients: state.clients.map((c) => (c.id === updated.id ? updated : c)),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
