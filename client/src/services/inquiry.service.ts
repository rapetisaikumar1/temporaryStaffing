import api from '@/lib/axios';
import { Inquiry, CreateInquiryDto, InquiryStatus } from '@/types/inquiry.types';

export const inquiryService = {
  async create(data: CreateInquiryDto): Promise<Inquiry> {
    const response = await api.post('/inquiries', data);
    return response.data.data;
  },

  async findAll(params?: {
    page?: number;
    limit?: number;
    status?: InquiryStatus;
    search?: string;
  }): Promise<{ data: Inquiry[]; total: number }> {
    const response = await api.get('/inquiries', { params });
    return response.data.data;
  },

  async findOne(id: string): Promise<Inquiry> {
    const response = await api.get(`/inquiries/${id}`);
    return response.data.data;
  },

  async updateStatus(id: string, status: InquiryStatus): Promise<Inquiry> {
    const response = await api.patch(`/inquiries/${id}/status`, { status });
    return response.data.data;
  },
};
