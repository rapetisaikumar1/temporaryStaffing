import api from '@/lib/axios';
import {
  OverviewReport,
  FinancialsReport,
  EventsReport,
  StaffReport,
} from '@/types/report.types';

export const reportService = {
  async getOverview(): Promise<OverviewReport> {
    const res = await api.get('/reports/overview');
    return res.data.data;
  },

  async getFinancials(): Promise<FinancialsReport> {
    const res = await api.get('/reports/financials');
    return res.data.data;
  },

  async getEventsReport(params?: { page?: number; limit?: number }): Promise<EventsReport> {
    const res = await api.get('/reports/events', { params });
    return res.data.data;
  },

  async getStaffReport(params?: { page?: number; limit?: number }): Promise<StaffReport> {
    const res = await api.get('/reports/staff', { params });
    return res.data.data;
  },
};
