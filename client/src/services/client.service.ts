import api from '@/lib/axios';
import { Client, CreateClientDto, UpdateClientDto } from '@/types/client.types';

export const clientService = {
  async create(data: CreateClientDto): Promise<Client> {
    const response = await api.post('/clients', data);
    return response.data.data;
  },

  async findAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<{ data: Client[]; total: number }> {
    const response = await api.get('/clients', { params });
    return response.data.data;
  },

  async findOne(id: string): Promise<Client> {
    const response = await api.get(`/clients/${id}`);
    return response.data.data;
  },

  async update(id: string, data: UpdateClientDto): Promise<Client> {
    const response = await api.patch(`/clients/${id}`, data);
    return response.data.data;
  },

  async deactivate(id: string): Promise<Client> {
    const response = await api.patch(`/clients/${id}/deactivate`);
    return response.data.data;
  },

  async activate(id: string): Promise<Client> {
    const response = await api.patch(`/clients/${id}/activate`);
    return response.data.data;
  },
};
