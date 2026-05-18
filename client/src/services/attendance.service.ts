import api from '@/lib/axios';
import {
  Attendance,
  AttendanceStats,
  CreateAttendanceDto,
  UpdateAttendanceDto,
} from '@/types/attendance.types';

export const attendanceService = {
  async create(dto: CreateAttendanceDto): Promise<Attendance> {
    const res = await api.post('/attendance', dto);
    return res.data.data;
  },

  async findAll(params?: {
    eventId?: string;
    staffId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Attendance[]; total: number; page: number; limit: number }> {
    const res = await api.get('/attendance', { params });
    return res.data.data;
  },

  async getStatsForEvent(eventId: string): Promise<AttendanceStats> {
    const res = await api.get(`/attendance/event/${eventId}/stats`);
    return res.data.data;
  },

  async findOne(id: string): Promise<Attendance> {
    const res = await api.get(`/attendance/${id}`);
    return res.data.data;
  },

  async update(id: string, dto: UpdateAttendanceDto): Promise<Attendance> {
    const res = await api.patch(`/attendance/${id}`, dto);
    return res.data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/attendance/${id}`);
  },
};
