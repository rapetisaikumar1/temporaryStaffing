import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AssignmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AssignmentQueryDto } from './dto/assignment-query.dto';

const ASSIGNMENT_SELECT = {
  id: true,
  role: true,
  status: true,
  notes: true,
  assignedAt: true,
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
      status: true,
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
  createdBy: { select: { id: true, name: true, email: true } },
} satisfies Prisma.EventStaffAssignmentSelect;

@Injectable()
export class AssignmentsService {
  private readonly logger = new Logger(AssignmentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAssignmentDto, createdById: string) {
    // Validate event exists and is bookable
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
      select: { id: true, status: true, name: true, staffCount: true, _count: { select: { assignments: true } } },
    });
    if (!event) throw new NotFoundException('Event not found');
    if (event.status === 'CANCELLED' || event.status === 'COMPLETED') {
      throw new BadRequestException(`Cannot assign staff to a ${event.status.toLowerCase()} event`);
    }
    if (event._count.assignments >= event.staffCount) {
      throw new BadRequestException(
        `Event already has the maximum number of staff (${event.staffCount}) assigned`,
      );
    }

    // Validate staff exists and is not deleted
    const staff = await this.prisma.staff.findUnique({
      where: { id: dto.staffId },
      select: { id: true, fullName: true, isDeleted: true, status: true },
    });
    if (!staff || staff.isDeleted) throw new NotFoundException('Staff member not found');
    if (staff.status === 'BLACKLISTED' || staff.status === 'INACTIVE') {
      throw new BadRequestException(`Staff member is ${staff.status.toLowerCase()} and cannot be assigned`);
    }

    // Double-booking prevention — unique constraint [eventId, staffId]
    const existing = await this.prisma.eventStaffAssignment.findUnique({
      where: { eventId_staffId: { eventId: dto.eventId, staffId: dto.staffId } },
    });
    if (existing) {
      throw new ConflictException('This staff member is already assigned to the event');
    }

    const assignment = await this.prisma.eventStaffAssignment.create({
      data: {
        role: dto.role.trim(),
        notes: dto.notes?.trim() ?? null,
        event: { connect: { id: dto.eventId } },
        staff: { connect: { id: dto.staffId } },
        createdBy: { connect: { id: createdById } },
      },
      select: ASSIGNMENT_SELECT,
    });

    this.logger.log(`Assignment created: ${assignment.id} — staff "${staff.fullName}" → event "${event.name}"`);
    return assignment;
  }

  async findAll(query: AssignmentQueryDto) {
    const { eventId, staffId, status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.EventStaffAssignmentWhereInput = {
      ...(eventId ? { eventId } : {}),
      ...(staffId ? { staffId } : {}),
      ...(status ? { status } : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.eventStaffAssignment.findMany({
        where,
        select: ASSIGNMENT_SELECT,
        orderBy: { assignedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.eventStaffAssignment.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findAllForEvent(eventId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId }, select: { id: true } });
    if (!event) throw new NotFoundException('Event not found');

    return this.prisma.eventStaffAssignment.findMany({
      where: { eventId },
      select: ASSIGNMENT_SELECT,
      orderBy: { assignedAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const assignment = await this.prisma.eventStaffAssignment.findUnique({
      where: { id },
      select: ASSIGNMENT_SELECT,
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    return assignment;
  }

  async update(id: string, dto: UpdateAssignmentDto) {
    await this.findOne(id);

    const assignment = await this.prisma.eventStaffAssignment.update({
      where: { id },
      data: {
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.role !== undefined ? { role: dto.role.trim() } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes.trim() || null } : {}),
      },
      select: ASSIGNMENT_SELECT,
    });

    this.logger.log(`Assignment updated: ${id} → status: ${dto.status ?? 'unchanged'}`);
    return assignment;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.eventStaffAssignment.delete({ where: { id } });
    this.logger.log(`Assignment removed: ${id}`);
  }

  async getStatsForEvent(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, staffCount: true },
    });
    if (!event) throw new NotFoundException('Event not found');

    const [total, assigned, accepted, rejected, completed, noShow] =
      await this.prisma.$transaction([
        this.prisma.eventStaffAssignment.count({ where: { eventId } }),
        this.prisma.eventStaffAssignment.count({ where: { eventId, status: 'ASSIGNED' } }),
        this.prisma.eventStaffAssignment.count({ where: { eventId, status: 'ACCEPTED' } }),
        this.prisma.eventStaffAssignment.count({ where: { eventId, status: 'REJECTED' } }),
        this.prisma.eventStaffAssignment.count({ where: { eventId, status: 'COMPLETED' } }),
        this.prisma.eventStaffAssignment.count({ where: { eventId, status: 'NO_SHOW' } }),
      ]);

    return {
      staffCount: event.staffCount,
      total,
      assigned,
      accepted,
      rejected,
      completed,
      noShow,
    };
  }
}
