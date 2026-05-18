import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, QuotationStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuotationDto, QuotationItemDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { QuotationQueryDto } from './dto/quotation-query.dto';
import { UpdateQuotationStatusDto } from './dto/update-quotation-status.dto';

const QUOTATION_SELECT = {
  id: true,
  title: true,
  subtotal: true,
  serviceCharge: true,
  tax: true,
  discount: true,
  total: true,
  status: true,
  sentAt: true,
  notes: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
  client: { select: { id: true, name: true, companyName: true, email: true } },
  event: { select: { id: true, name: true, date: true, type: true } },
  inquiry: { select: { id: true, fullName: true, email: true } },
  createdBy: { select: { id: true, name: true, email: true } },
  items: {
    select: {
      id: true,
      role: true,
      quantity: true,
      ratePerPerson: true,
      days: true,
      total: true,
    },
    orderBy: { role: 'asc' as const },
  },
} satisfies Prisma.QuotationSelect;

@Injectable()
export class QuotationsService {
  private readonly logger = new Logger(QuotationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private calcTotals(
    items: QuotationItemDto[],
    serviceCharge = 0,
    taxRate = 0,
    discount = 0,
  ) {
    const itemsWithTotals = items.map((item) => ({
      ...item,
      total: item.quantity * item.ratePerPerson * item.days,
    }));
    const subtotal = itemsWithTotals.reduce((sum, i) => sum + i.total, 0);
    const tax = ((subtotal + serviceCharge) * taxRate) / 100;
    const total = subtotal + serviceCharge + tax - discount;
    return { itemsWithTotals, subtotal, tax, total };
  }

  async create(dto: CreateQuotationDto, createdById: string) {
    // Validate relations
    if (dto.clientId) {
      const client = await this.prisma.client.findUnique({ where: { id: dto.clientId }, select: { id: true } });
      if (!client) throw new BadRequestException('Client not found');
    }
    if (dto.eventId) {
      const event = await this.prisma.event.findUnique({ where: { id: dto.eventId }, select: { id: true } });
      if (!event) throw new BadRequestException('Event not found');
    }
    if (dto.inquiryId) {
      const inquiry = await this.prisma.inquiry.findUnique({ where: { id: dto.inquiryId }, select: { id: true } });
      if (!inquiry) throw new BadRequestException('Inquiry not found');
    }
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('At least one line item is required');
    }

    const { itemsWithTotals, subtotal, tax, total } = this.calcTotals(
      dto.items,
      dto.serviceCharge ?? 0,
      dto.taxRate ?? 0,
      dto.discount ?? 0,
    );

    const quotation = await this.prisma.quotation.create({
      data: {
        title: dto.title.trim(),
        subtotal,
        serviceCharge: dto.serviceCharge ?? 0,
        tax,
        discount: dto.discount ?? 0,
        total,
        notes: dto.notes?.trim() ?? null,
        ...(dto.clientId ? { client: { connect: { id: dto.clientId } } } : {}),
        ...(dto.eventId ? { event: { connect: { id: dto.eventId } } } : {}),
        ...(dto.inquiryId ? { inquiry: { connect: { id: dto.inquiryId } } } : {}),
        createdBy: { connect: { id: createdById } },
        items: {
          create: itemsWithTotals.map((item) => ({
            role: item.role.trim(),
            quantity: item.quantity,
            ratePerPerson: item.ratePerPerson,
            days: item.days,
            total: item.total,
          })),
        },
      },
      select: QUOTATION_SELECT,
    });

    this.logger.log(`Quotation created: ${quotation.id} — "${quotation.title}"`);
    return quotation;
  }

  async findAll(query: QuotationQueryDto) {
    const { search, status, clientId, eventId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.QuotationWhereInput = {
      isDeleted: false,
      ...(status ? { status } : {}),
      ...(clientId ? { clientId } : {}),
      ...(eventId ? { eventId } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { client: { name: { contains: search, mode: 'insensitive' } } },
              { event: { name: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.quotation.findMany({
        where,
        select: QUOTATION_SELECT,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.quotation.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getStats() {
    const [total, draft, sent, accepted, rejected] = await this.prisma.$transaction([
      this.prisma.quotation.count({ where: { isDeleted: false } }),
      this.prisma.quotation.count({ where: { isDeleted: false, status: 'DRAFT' } }),
      this.prisma.quotation.count({ where: { isDeleted: false, status: 'SENT' } }),
      this.prisma.quotation.count({ where: { isDeleted: false, status: 'ACCEPTED' } }),
      this.prisma.quotation.count({ where: { isDeleted: false, status: 'REJECTED' } }),
    ]);
    return { total, draft, sent, accepted, rejected };
  }

  async findOne(id: string) {
    const quotation = await this.prisma.quotation.findFirst({
      where: { id, isDeleted: false },
      select: QUOTATION_SELECT,
    });
    if (!quotation) throw new NotFoundException('Quotation not found');
    return quotation;
  }

  async update(id: string, dto: UpdateQuotationDto) {
    const existing = await this.findOne(id);
    if (existing.status === 'ACCEPTED' || existing.status === 'REJECTED') {
      throw new BadRequestException(`Cannot edit a quotation with status ${existing.status}`);
    }

    // Recalculate if items or pricing fields change
    const itemsToUse = dto.items ?? existing.items;
    const serviceCharge = dto.serviceCharge ?? existing.serviceCharge;
    const taxRate = dto.taxRate !== undefined ? dto.taxRate : undefined;
    // taxRate is not stored separately — derive from existing tax/subtotal if not provided
    const effectiveTaxRate =
      taxRate !== undefined
        ? taxRate
        : existing.subtotal > 0
        ? (existing.tax / (existing.subtotal + existing.serviceCharge)) * 100
        : 0;
    const discount = dto.discount ?? existing.discount;

    const { itemsWithTotals, subtotal, tax, total } = this.calcTotals(
      itemsToUse as QuotationItemDto[],
      serviceCharge,
      effectiveTaxRate,
      discount,
    );

    const quotation = await this.prisma.$transaction(async (tx) => {
      if (dto.items) {
        await tx.quotationItem.deleteMany({ where: { quotationId: id } });
        await tx.quotationItem.createMany({
          data: itemsWithTotals.map((item) => ({
            role: item.role.trim(),
            quantity: item.quantity,
            ratePerPerson: item.ratePerPerson,
            days: item.days,
            total: item.total,
            quotationId: id,
          })),
        });
      }

      return tx.quotation.update({
        where: { id },
        data: {
          ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
          subtotal,
          serviceCharge,
          tax,
          discount,
          total,
          ...(dto.notes !== undefined ? { notes: dto.notes.trim() || null } : {}),
          ...(dto.clientId !== undefined
            ? dto.clientId
              ? { client: { connect: { id: dto.clientId } } }
              : { client: { disconnect: true } }
            : {}),
          ...(dto.eventId !== undefined
            ? dto.eventId
              ? { event: { connect: { id: dto.eventId } } }
              : { event: { disconnect: true } }
            : {}),
        },
        select: QUOTATION_SELECT,
      });
    });

    this.logger.log(`Quotation updated: ${id}`);
    return quotation;
  }

  async updateStatus(id: string, dto: UpdateQuotationStatusDto) {
    const existing = await this.findOne(id);

    if (dto.status === 'SENT' && existing.status !== 'DRAFT' && existing.status !== 'SENT') {
      throw new BadRequestException('Only DRAFT quotations can be sent');
    }

    const quotation = await this.prisma.quotation.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.status === 'SENT' ? { sentAt: new Date() } : {}),
      },
      select: QUOTATION_SELECT,
    });

    this.logger.log(`Quotation ${id} status → ${dto.status}`);
    return quotation;
  }

  async softDelete(id: string) {
    const existing = await this.findOne(id);
    if (existing.status === 'ACCEPTED') {
      throw new BadRequestException('Cannot delete an accepted quotation');
    }
    await this.prisma.quotation.update({ where: { id }, data: { isDeleted: true } });
    this.logger.log(`Quotation soft-deleted: ${id}`);
  }
}
