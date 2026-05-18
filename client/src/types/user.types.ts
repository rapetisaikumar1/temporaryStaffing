import { Role } from './auth.types';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminUserDto {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface UpdateAdminUserDto {
  name?: string;
  role?: Role;
  isActive?: boolean;
}
