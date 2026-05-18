import api from '@/lib/axios';
import {
  Assignment,
  AssignmentStats,
  AssignmentStatus,
  CreateAssignmentDto,
  UpdateAssignmentDto,
} from '@/types/assignment.types';

export const assignmentService = {
  async create(data: CreateAssignmentDto): Promise<Assignment> {
    const response = await api.post('/assignments', data);
    return response.data.data;
  },

  async findAll(params?: {
    page?: number;
    limit?: number;
    eventId?: string;
    staffId?: string;
    status?: AssignmentStatus;
  }): Promise<{ data: Assignment[]; total: number }> {
    const response = await api.get('/assignments', { params });
    return response.data.data;
  },

  async findAllForEvent(eventId: string): Promise<Assignment[]> {
    const response = await api.get(`/assignments/event/${eventId}`);
    return response.data.data;
  },

  async getStatsForEvent(eventId: string): Promise<AssignmentStats> {
    const response = await api.get(`/assignments/event/${eventId}/stats`);
    return response.data.data;
  },

  async findOne(id: string): Promise<Assignment> {
    const response = await api.get(`/assignments/${id}`);
    return response.data.data;
  },

  async update(id: string, data: UpdateAssignmentDto): Promise<Assignment> {
    const response = await api.patch(`/assignments/${id}`, data);
    return response.data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/assignments/${id}`);
  },
};
