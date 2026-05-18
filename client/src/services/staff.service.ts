import api from '@/lib/axios';
import { Staff, StaffDocument, CreateStaffDto, UpdateStaffDto, StaffStatus, DocumentType } from '@/types/staff.types';

export const staffService = {
  async create(data: CreateStaffDto): Promise<Staff> {
    const response = await api.post('/staff', data);
    return response.data.data;
  },

  async findAll(params?: {
    page?: number;
    limit?: number;
    status?: StaffStatus;
    city?: string;
    role?: string;
    search?: string;
  }): Promise<{ data: Staff[]; total: number }> {
    const response = await api.get('/staff', { params });
    return response.data.data;
  },

  async getStats(): Promise<{
    total: number;
    active: number;
    available: number;
    assigned: number;
    inactive: number;
    blacklisted: number;
    verified: number;
  }> {
    const response = await api.get('/staff/stats');
    return response.data.data;
  },

  async findOne(id: string): Promise<Staff> {
    const response = await api.get(`/staff/${id}`);
    return response.data.data;
  },

  async update(id: string, data: UpdateStaffDto): Promise<Staff> {
    const response = await api.patch(`/staff/${id}`, data);
    return response.data.data;
  },

  async updateStatus(id: string, status: StaffStatus): Promise<Staff> {
    const response = await api.patch(`/staff/${id}/status`, { status });
    return response.data.data;
  },

  async softDelete(id: string): Promise<{ id: string; deleted: boolean }> {
    const response = await api.delete(`/staff/${id}`);
    return response.data.data;
  },

  async getDocuments(staffId: string): Promise<StaffDocument[]> {
    const response = await api.get(`/staff/${staffId}/documents`);
    return response.data.data;
  },

  async uploadDocument(
    staffId: string,
    file: File,
    type: DocumentType,
  ): Promise<StaffDocument> {
    const form = new FormData();
    form.append('file', file);
    form.append('type', type);
    const response = await api.post(`/staff/${staffId}/documents`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async deleteDocument(staffId: string, docId: string): Promise<void> {
    await api.delete(`/staff/${staffId}/documents/${docId}`);
  },
};

