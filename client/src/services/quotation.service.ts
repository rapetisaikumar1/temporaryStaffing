import api from '@/lib/axios';
import {
  Quotation,
  QuotationStats,
  QuotationStatus,
  CreateQuotationDto,
  UpdateQuotationDto,
} from '@/types/quotation.types';

export const quotationService = {
  async create(data: CreateQuotationDto): Promise<Quotation> {
    const response = await api.post('/quotations', data);
    return response.data.data;
  },

  async findAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: QuotationStatus;
    clientId?: string;
    eventId?: string;
  }): Promise<{ data: Quotation[]; total: number }> {
    const response = await api.get('/quotations', { params });
    return response.data.data;
  },

  async getStats(): Promise<QuotationStats> {
    const response = await api.get('/quotations/stats');
    return response.data.data;
  },

  async findOne(id: string): Promise<Quotation> {
    const response = await api.get(`/quotations/${id}`);
    return response.data.data;
  },

  async update(id: string, data: UpdateQuotationDto): Promise<Quotation> {
    const response = await api.patch(`/quotations/${id}`, data);
    return response.data.data;
  },

  async updateStatus(id: string, status: QuotationStatus): Promise<Quotation> {
    const response = await api.patch(`/quotations/${id}/status`, { status });
    return response.data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/quotations/${id}`);
  },
};
