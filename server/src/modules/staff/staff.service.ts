import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, StaffStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffQueryDto } from './dto/staff-query.dto';

const STAFF_SELECT = {
  id: true,
  fullName: true,
  phone: true,
  email: true,
  city: true,
  role: true,
  skills: true,
  experienceYears: true,
  availability: true,
  isVerified: true,
  rating: true,
  notes: true,
  status: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
  createdBy: { select: { id: true, name: true, email: true } },
  _count: { select: { assignments: true } },
} satisfies Prisma.StaffSelect;

@Injectable()
export class StaffService {
  private readonly logger = new Logger(StaffService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStaffDto, createdById: string) {
    const email = dto.email.toLowerCase().trim();

    const existing = await this.prisma.staff.findUnique({ where: { email } });
    if (existing && !existing.isDeleted) {
      throw new ConflictException('A staff member with this email already exists');
    }

    const staff = await this.prisma.staff.create({
      data: {
        fullName: dto.fullName.trim(),
        phone: dto.phone.trim(),
        email,
        city: dto.city.trim(),
        role: dto.role.trim(),
        skills: dto.skills ?? [],
        experienceYears: dto.experienceYears ?? 0,
        availability: dto.availability ?? true,
        notes: dto.notes?.trim() ?? null,
        createdById,
      },
      select: STAFF_SELECT,
    });

    this.logger.log(`Staff created: ${staff.email} (ID: ${staff.id})`);
    return staff;
  }

  async findAll(query: StaffQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.StaffWhereInput = { isDeleted: false };

    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { fullName: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
        { phone: { contains: s } },
        { city: { contains: s, mode: 'insensitive' } },
        { role: { contains: s, mode: 'insensitive' } },
      ];
    }

    if (query.status) where.status = query.status;
    if (query.city) where.city = { contains: query.city.trim(), mode: 'insensitive' };
    if (query.role) where.role = { contains: query.role.trim(), mode: 'insensitive' };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.staff.findMany({
        where,
        select: STAFF_SELECT,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.staff.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getStats() {
    const baseWhere = { isDeleted: false };

    const [total, active, available, assigned, inactive, blacklisted, verified] =
      await this.prisma.$transaction([
        this.prisma.staff.count({ where: baseWhere }),
        this.prisma.staff.count({ where: { ...baseWhere, status: StaffStatus.ACTIVE } }),
        this.prisma.staff.count({ where: { ...baseWhere, status: StaffStatus.AVAILABLE } }),
        this.prisma.staff.count({ where: { ...baseWhere, status: StaffStatus.ASSIGNED } }),
        this.prisma.staff.count({ where: { ...baseWhere, status: StaffStatus.INACTIVE } }),
        this.prisma.staff.count({ where: { ...baseWhere, status: StaffStatus.BLACKLISTED } }),
        this.prisma.staff.count({ where: { ...baseWhere, isVerified: true } }),
      ]);

    return { total, active, available, assigned, inactive, blacklisted, verified };
  }

  async findOne(id: string) {
    const staff = await this.prisma.staff.findFirst({
      where: { id, isDeleted: false },
      select: STAFF_SELECT,
    });
    if (!staff) throw new NotFoundException('Staff member not found');
    return staff;
  }

  async update(id: string, dto: UpdateStaffDto) {
    await this.findOne(id);

    if (dto.email) {
      const conflict = await this.prisma.staff.findFirst({
        where: { email: dto.email.toLowerCase().trim(), NOT: { id }, isDeleted: false },
      });
      if (conflict) {
        throw new ConflictException('A staff member with this email already exists');
      }
    }

    const data: Prisma.StaffUpdateInput = {};
    if (dto.fullName !== undefined) data.fullName = dto.fullName.trim();
    if (dto.phone !== undefined) data.phone = dto.phone.trim();
    if (dto.email !== undefined) data.email = dto.email.toLowerCase().trim();
    if (dto.city !== undefined) data.city = dto.city.trim();
    if (dto.role !== undefined) data.role = dto.role.trim();
    if (dto.skills !== undefined) data.skills = dto.skills;
    if (dto.experienceYears !== undefined) data.experienceYears = dto.experienceYears;
    if (dto.availability !== undefined) data.availability = dto.availability;
    if (dto.notes !== undefined) data.notes = dto.notes?.trim() ?? null;

    const staff = await this.prisma.staff.update({
      where: { id },
      data,
      select: STAFF_SELECT,
    });

    this.logger.log(`Staff updated: ${staff.email} (ID: ${staff.id})`);
    return staff;
  }

  async updateStatus(id: string, status: StaffStatus) {
    await this.findOne(id);

    const staff = await this.prisma.staff.update({
      where: { id },
      data: { status },
      select: STAFF_SELECT,
    });

    this.logger.log(`Staff status → ${status}: ${staff.email} (ID: ${staff.id})`);
    return staff;
  }

  async softDelete(id: string) {
    await this.findOne(id);

    await this.prisma.staff.update({
      where: { id },
      data: { isDeleted: true, status: StaffStatus.INACTIVE },
    });

    this.logger.log(`Staff soft-deleted: ID ${id}`);
    return { id, deleted: true };
  }
}
