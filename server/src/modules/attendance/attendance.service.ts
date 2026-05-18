import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AttendanceStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AttendanceQueryDto } from './dto/attendance-query.dto';

const ATTENDANCE_SELECT = {
  id: true,
  checkIn: true,
  checkOut: true,
  status: true,
  remarks: true,
  createdAt: true,
  updatedAt: true,
  event: {
    select: {
      id: true,
      name: true,
      type: true,
      date: true,
      startTime: true,
      endTime: true,
      location: true,
    },
  },
  staff: {
    select: {
      id: true,
      fullName: true,
      phone: true,
      email: true,
      city: true,
      role: true,
    },
  },
  assignment: {
    select: {
      id: true,
      role: true,
      status: true,
    },
  },
  markedBy: { select: { id: true, name: true, email: true } },
} satisfies Prisma.AttendanceSelect;

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAttendanceDto, markedById: string) {
    // Validate event exists
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
      select: { id: true, status: true },
    });
    if (!event) throw new NotFoundException('Event not found');

    // Validate staff exists and is active
    const staff = await this.prisma.staff.findFirst({
      where: { id: dto.staffId, isDeleted: false },
      select: { id: true },
    });
    if (!staff) throw new NotFoundException('Staff member not found');

    // Validate assignment exists
    const assignment = await this.prisma.eventStaffAssignment.findUnique({
      where: { id: dto.assignmentId },
      select: { id: true, eventId: true, staffId: true },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    if (assignment.eventId !== dto.eventId || assignment.staffId !== dto.staffId) {
      throw new BadRequestException('Assignment does not match the given event and staff');
    }

    // Enforce unique constraint: one attendance per event+staff
    const existing = await this.prisma.attendance.findUnique({
      where: { eventId_staffId: { eventId: dto.eventId, staffId: dto.staffId } },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('Attendance record already exists for this staff member at this event');
    }

    const attendance = await this.prisma.attendance.create({
      data: {
        eventId: dto.eventId,
        staffId: dto.staffId,
        assignmentId: dto.assignmentId,
        checkIn: dto.checkIn ? new Date(dto.checkIn) : undefined,
        checkOut: dto.checkOut ? new Date(dto.checkOut) : undefined,
        status: dto.status ?? AttendanceStatus.PRESENT,
        remarks: dto.remarks,
        markedById,
      },
      select: ATTENDANCE_SELECT,
    });

    this.logger.log(`Attendance created for staff ${dto.staffId} at event ${dto.eventId}`);
    return attendance;
  }

  async findAll(query: AttendanceQueryDto) {
    const { eventId, staffId, status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AttendanceWhereInput = {
      ...(eventId && { eventId }),
      ...(staffId && { staffId }),
      ...(status && { status }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.attendance.findMany({
        where,
        select: ATTENDANCE_SELECT,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.attendance.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getStatsForEvent(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, staffCount: true },
    });
    if (!event) throw new NotFoundException('Event not found');

    const [total, present, late, noShow, completed] = await Promise.all([
      this.prisma.attendance.count({ where: { eventId } }),
      this.prisma.attendance.count({ where: { eventId, status: 'PRESENT' } }),
      this.prisma.attendance.count({ where: { eventId, status: 'LATE' } }),
      this.prisma.attendance.count({ where: { eventId, status: 'NO_SHOW' } }),
      this.prisma.attendance.count({ where: { eventId, status: 'COMPLETED' } }),
    ]);

    return {
      staffCount: event.staffCount,
      total,
      present,
      late,
      noShow,
      completed,
    };
  }

  async findOne(id: string) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      select: ATTENDANCE_SELECT,
    });
    if (!attendance) throw new NotFoundException('Attendance record not found');
    return attendance;
  }

  async update(id: string, dto: UpdateAttendanceDto) {
    await this.findOne(id);

    if (dto.checkIn && dto.checkOut) {
      const checkIn = new Date(dto.checkIn);
      const checkOut = new Date(dto.checkOut);
      if (checkOut <= checkIn) {
        throw new BadRequestException('Check-out time must be after check-in time');
      }
    }

    const attendance = await this.prisma.attendance.update({
      where: { id },
      data: {
        ...(dto.checkIn !== undefined && { checkIn: new Date(dto.checkIn) }),
        ...(dto.checkOut !== undefined && { checkOut: new Date(dto.checkOut) }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.remarks !== undefined && { remarks: dto.remarks }),
      },
      select: ATTENDANCE_SELECT,
    });

    this.logger.log(`Attendance ${id} updated`);
    return attendance;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.attendance.delete({ where: { id } });
    this.logger.log(`Attendance ${id} deleted`);
  }
}
