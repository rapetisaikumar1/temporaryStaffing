import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventQueryDto } from './dto/event-query.dto';

const EVENT_SELECT = {
  id: true,
  name: true,
  type: true,
  date: true,
  startTime: true,
  endTime: true,
  location: true,
  staffCount: true,
  staffRoles: true,
  notes: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  client: { select: { id: true, name: true, companyName: true } },
  supervisor: { select: { id: true, name: true, email: true } },
  createdBy: { select: { id: true, name: true, email: true } },
  _count: { select: { assignments: true, quotations: true } },
} satisfies Prisma.EventSelect;

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEventDto, createdById: string) {
    // Validate client exists
    const client = await this.prisma.client.findUnique({
      where: { id: dto.clientId },
      select: { id: true, isActive: true },
    });
    if (!client) throw new BadRequestException('Client not found');
    if (!client.isActive) throw new BadRequestException('Client is inactive');

    // Validate supervisor exists if provided
    if (dto.supervisorId) {
      const supervisor = await this.prisma.user.findUnique({
        where: { id: dto.supervisorId },
        select: { id: true },
      });
      if (!supervisor) throw new BadRequestException('Supervisor not found');
    }

    const event = await this.prisma.event.create({
      data: {
        name: dto.name.trim(),
        type: dto.type.trim(),
        date: new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime,
        location: dto.location.trim(),
        staffCount: dto.staffCount,
        staffRoles: dto.staffRoles.map((r) => r.trim()).filter(Boolean),
        notes: dto.notes?.trim() ?? null,
        clientId: dto.clientId,
        supervisorId: dto.supervisorId ?? null,
        createdById,
      },
      select: EVENT_SELECT,
    });

    this.logger.log(`Event created: "${event.name}" (ID: ${event.id})`);
    return event;
  }

  async findAll(query: EventQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.EventWhereInput = {};

    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { type: { contains: s, mode: 'insensitive' } },
        { location: { contains: s, mode: 'insensitive' } },
      ];
    }

    if (query.status) where.status = query.status;
    if (query.clientId) where.clientId = query.clientId;

    if (query.from || query.to) {
      where.date = {};
      if (query.from) where.date.gte = new Date(query.from);
      if (query.to) where.date.lte = new Date(query.to);
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        where,
        select: EVENT_SELECT,
        orderBy: { date: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.event.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getStats() {
    const [total, draft, confirmed, inProgress, completed, cancelled] =
      await this.prisma.$transaction([
        this.prisma.event.count(),
        this.prisma.event.count({ where: { status: BookingStatus.DRAFT } }),
        this.prisma.event.count({ where: { status: BookingStatus.CONFIRMED } }),
        this.prisma.event.count({ where: { status: BookingStatus.IN_PROGRESS } }),
        this.prisma.event.count({ where: { status: BookingStatus.COMPLETED } }),
        this.prisma.event.count({ where: { status: BookingStatus.CANCELLED } }),
      ]);

    return { total, draft, confirmed, inProgress, completed, cancelled };
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: EVENT_SELECT,
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(id: string, dto: UpdateEventDto) {
    await this.findOne(id);

    if (dto.supervisorId) {
      const supervisor = await this.prisma.user.findUnique({
        where: { id: dto.supervisorId },
        select: { id: true },
      });
      if (!supervisor) throw new BadRequestException('Supervisor not found');
    }

    const data: Prisma.EventUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.type !== undefined) data.type = dto.type.trim();
    if (dto.date !== undefined) data.date = new Date(dto.date);
    if (dto.startTime !== undefined) data.startTime = dto.startTime;
    if (dto.endTime !== undefined) data.endTime = dto.endTime;
    if (dto.location !== undefined) data.location = dto.location.trim();
    if (dto.staffCount !== undefined) data.staffCount = dto.staffCount;
    if (dto.staffRoles !== undefined)
      data.staffRoles = dto.staffRoles.map((r) => r.trim()).filter(Boolean);
    if (dto.notes !== undefined) data.notes = dto.notes?.trim() ?? null;
    if (dto.supervisorId !== undefined)
      data.supervisor = dto.supervisorId
        ? { connect: { id: dto.supervisorId } }
        : { disconnect: true };

    const event = await this.prisma.event.update({
      where: { id },
      data,
      select: EVENT_SELECT,
    });

    this.logger.log(`Event updated: "${event.name}" (ID: ${event.id})`);
    return event;
  }

  async updateStatus(id: string, status: BookingStatus) {
    await this.findOne(id);

    const event = await this.prisma.event.update({
      where: { id },
      data: { status },
      select: EVENT_SELECT,
    });

    this.logger.log(`Event "${event.name}" status → ${status} (ID: ${event.id})`);
    return event;
  }
}
