import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { UpdatePaymentStatusesDto } from './dto/update-payment-statuses.dto';
import { PaymentQueryDto } from './dto/payment-query.dto';

const PAYMENT_SELECT = {
  id: true,
  totalAmount: true,
  advancePaid: true,
  balanceAmount: true,
  status: true,
  invoiceStatus: true,
  staffPayoutStatus: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  event: {
    select: {
      id: true,
      name: true,
      type: true,
      date: true,
      location: true,
      status: true,
    },
  },
  client: {
    select: {
      id: true,
      name: true,
      companyName: true,
      email: true,
      phone: true,
    },
  },
  createdBy: { select: { id: true, name: true, email: true } },
} satisfies Prisma.PaymentSelect;

function deriveStatus(totalAmount: number, advancePaid: number): PaymentStatus {
  const balance = totalAmount - advancePaid;
  if (balance <= 0) return 'PAID';
  if (advancePaid > 0) return 'PARTIALLY_PAID';
  return 'PENDING';
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePaymentDto, createdById: string) {
    // Validate event exists
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
      select: { id: true, name: true },
    });
    if (!event) throw new NotFoundException('Event not found');

    // Validate client exists
    const client = await this.prisma.client.findFirst({
      where: { id: dto.clientId, isActive: true },
      select: { id: true },
    });
    if (!client) throw new NotFoundException('Client not found');

    // Enforce unique: one payment per event
    const existing = await this.prisma.payment.findUnique({
      where: { eventId: dto.eventId },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('A payment record already exists for this event');
    }

    const advancePaid = dto.advancePaid ?? 0;
    const totalAmount = dto.totalAmount;
    if (advancePaid > totalAmount) {
      throw new BadRequestException('Advance paid cannot exceed total amount');
    }
    const balanceAmount = totalAmount - advancePaid;
    const status = deriveStatus(totalAmount, advancePaid);

    const payment = await this.prisma.payment.create({
      data: {
        eventId: dto.eventId,
        clientId: dto.clientId,
        totalAmount,
        advancePaid,
        balanceAmount,
        status,
        notes: dto.notes,
        createdById,
      },
      select: PAYMENT_SELECT,
    });

    this.logger.log(`Payment created for event ${dto.eventId}`);
    return payment;
  }

  async findAll(query: PaymentQueryDto) {
    const { status, invoiceStatus, staffPayoutStatus, clientId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {
      ...(status && { status }),
      ...(invoiceStatus && { invoiceStatus }),
      ...(staffPayoutStatus && { staffPayoutStatus }),
      ...(clientId && { clientId }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where,
        select: PAYMENT_SELECT,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getStats() {
    const [total, pending, partiallyPaid, paid, overdue] = await Promise.all([
      this.prisma.payment.count(),
      this.prisma.payment.count({ where: { status: 'PENDING' } }),
      this.prisma.payment.count({ where: { status: 'PARTIALLY_PAID' } }),
      this.prisma.payment.count({ where: { status: 'PAID' } }),
      this.prisma.payment.count({ where: { status: 'OVERDUE' } }),
    ]);

    return { total, pending, partiallyPaid, paid, overdue };
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      select: PAYMENT_SELECT,
    });
    if (!payment) throw new NotFoundException('Payment record not found');
    return payment;
  }

  async update(id: string, dto: UpdatePaymentDto) {
    const existing = await this.findOne(id);

    const totalAmount = dto.totalAmount ?? existing.totalAmount;
    const advancePaid = dto.advancePaid ?? existing.advancePaid;

    if (advancePaid > totalAmount) {
      throw new BadRequestException('Advance paid cannot exceed total amount');
    }

    const balanceAmount = totalAmount - advancePaid;
    // Only auto-derive status if not already OVERDUE
    const status =
      existing.status === 'OVERDUE'
        ? 'OVERDUE'
        : deriveStatus(totalAmount, advancePaid);

    const payment = await this.prisma.payment.update({
      where: { id },
      data: {
        totalAmount,
        advancePaid,
        balanceAmount,
        status,
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      select: PAYMENT_SELECT,
    });

    this.logger.log(`Payment ${id} updated`);
    return payment;
  }

  async updateStatuses(id: string, dto: UpdatePaymentStatusesDto) {
    await this.findOne(id);

    const payment = await this.prisma.payment.update({
      where: { id },
      data: {
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.invoiceStatus !== undefined && { invoiceStatus: dto.invoiceStatus }),
        ...(dto.staffPayoutStatus !== undefined && { staffPayoutStatus: dto.staffPayoutStatus }),
      },
      select: PAYMENT_SELECT,
    });

    this.logger.log(`Payment ${id} statuses updated`);
    return payment;
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    if (existing.status === 'PAID') {
      throw new BadRequestException('Cannot delete a fully paid payment record');
    }
    await this.prisma.payment.delete({ where: { id } });
    this.logger.log(`Payment ${id} deleted`);
  }
}
