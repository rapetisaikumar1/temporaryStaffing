import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientQueryDto } from './dto/client-query.dto';

const CLIENT_SELECT = {
  id: true,
  name: true,
  companyName: true,
  phone: true,
  email: true,
  address: true,
  notes: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  createdBy: { select: { id: true, name: true, email: true } },
  _count: { select: { inquiries: true, events: true, quotations: true } },
} satisfies Prisma.ClientSelect;

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClientDto, createdById: string) {
    const email = dto.email.toLowerCase().trim();

    const existing = await this.prisma.client.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('A client with this email already exists');
    }

    const client = await this.prisma.client.create({
      data: {
        name: dto.name.trim(),
        companyName: dto.companyName?.trim() ?? null,
        phone: dto.phone.trim(),
        email,
        address: dto.address?.trim() ?? null,
        notes: dto.notes?.trim() ?? null,
        createdById,
      },
      select: CLIENT_SELECT,
    });

    this.logger.log(`Client created: ${client.email} (ID: ${client.id})`);
    return client;
  }

  async findAll(query: ClientQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ClientWhereInput = {};

    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { companyName: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
        { phone: { contains: s } },
      ];
    }

    if (typeof query.isActive === 'boolean') {
      where.isActive = query.isActive;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.client.findMany({
        where,
        select: CLIENT_SELECT,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.client.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      select: CLIENT_SELECT,
    });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async update(id: string, dto: UpdateClientDto) {
    await this.findOne(id);

    if (dto.email) {
      const conflict = await this.prisma.client.findFirst({
        where: { email: dto.email.toLowerCase().trim(), NOT: { id } },
      });
      if (conflict) {
        throw new ConflictException('A client with this email already exists');
      }
    }

    const data: Prisma.ClientUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.companyName !== undefined) data.companyName = dto.companyName?.trim() ?? null;
    if (dto.phone !== undefined) data.phone = dto.phone.trim();
    if (dto.email !== undefined) data.email = dto.email.toLowerCase().trim();
    if (dto.address !== undefined) data.address = dto.address?.trim() ?? null;
    if (dto.notes !== undefined) data.notes = dto.notes?.trim() ?? null;

    const client = await this.prisma.client.update({
      where: { id },
      data,
      select: CLIENT_SELECT,
    });

    this.logger.log(`Client updated: ${client.email} (ID: ${client.id})`);
    return client;
  }

  async setActive(id: string, isActive: boolean) {
    await this.findOne(id);

    const client = await this.prisma.client.update({
      where: { id },
      data: { isActive },
      select: CLIENT_SELECT,
    });

    this.logger.log(
      `Client ${isActive ? 'activated' : 'deactivated'}: ${client.email} (ID: ${client.id})`,
    );
    return client;
  }
}
