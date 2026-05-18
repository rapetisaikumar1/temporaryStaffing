import api from '@/lib/axios';
import { AdminUser, CreateAdminUserDto, UpdateAdminUserDto } from '@/types/user.types';

export const userService = {
  async findAll(): Promise<AdminUser[]> {
    const res = await api.get('/users');
    return res.data.data;
  },

  async findOne(id: string): Promise<AdminUser> {
    const res = await api.get(`/users/${id}`);
    return res.data.data;
  },

  async create(data: CreateAdminUserDto): Promise<AdminUser> {
    const res = await api.post('/users', data);
    return res.data.data;
  },

  async update(id: string, data: UpdateAdminUserDto): Promise<AdminUser> {
    const res = await api.patch(`/users/${id}`, data);
    return res.data.data;
  },
};
