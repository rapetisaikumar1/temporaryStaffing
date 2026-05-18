import api from '@/lib/axios';
import {
  Payment,
  PaymentStats,
  CreatePaymentDto,
  UpdatePaymentDto,
  UpdatePaymentStatusesDto,
} from '@/types/payment.types';

export const paymentService = {
  async create(dto: CreatePaymentDto): Promise<Payment> {
    const res = await api.post('/payments', dto);
    return res.data.data;
  },

  async findAll(params?: {
    status?: string;
    invoiceStatus?: string;
    staffPayoutStatus?: string;
    clientId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Payment[]; total: number; page: number; limit: number }> {
    const res = await api.get('/payments', { params });
    return res.data.data;
  },

  async getStats(): Promise<PaymentStats> {
    const res = await api.get('/payments/stats');
    return res.data.data;
  },

  async findOne(id: string): Promise<Payment> {
    const res = await api.get(`/payments/${id}`);
    return res.data.data;
  },

  async update(id: string, dto: UpdatePaymentDto): Promise<Payment> {
    const res = await api.patch(`/payments/${id}`, dto);
    return res.data.data;
  },

  async updateStatuses(id: string, dto: UpdatePaymentStatusesDto): Promise<Payment> {
    const res = await api.patch(`/payments/${id}/statuses`, dto);
    return res.data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/payments/${id}`);
  },
};
