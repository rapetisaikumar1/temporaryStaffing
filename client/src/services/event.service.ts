import api from '@/lib/axios';
import { Event, CreateEventDto, UpdateEventDto, BookingStatus } from '@/types/event.types';

export const eventService = {
  async create(data: CreateEventDto): Promise<Event> {
    const response = await api.post('/events', data);
    return response.data.data;
  },

  async findAll(params?: {
    page?: number;
    limit?: number;
    status?: BookingStatus;
    clientId?: string;
    search?: string;
    from?: string;
    to?: string;
  }): Promise<{ data: Event[]; total: number }> {
    const response = await api.get('/events', { params });
    return response.data.data;
  },

  async getStats(): Promise<{
    total: number;
    draft: number;
    confirmed: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  }> {
    const response = await api.get('/events/stats');
    return response.data.data;
  },

  async findOne(id: string): Promise<Event> {
    const response = await api.get(`/events/${id}`);
    return response.data.data;
  },

  async update(id: string, data: UpdateEventDto): Promise<Event> {
    const response = await api.patch(`/events/${id}`, data);
    return response.data.data;
  },

  async updateStatus(id: string, status: BookingStatus): Promise<Event> {
    const response = await api.patch(`/events/${id}/status`, { status });
    return response.data.data;
  },
};

