import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Prisma, InquiryStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryStatusDto } from './dto/update-inquiry-status.dto';
import { InquiryQueryDto } from './dto/inquiry-query.dto';

@Injectable()
export class InquiriesService {
  private readonly logger = new Logger(InquiriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInquiryDto) {
    const inquiry = await this.prisma.inquiry.create({
      data: {
        fullName: dto.fullName.trim(),
        companyName: dto.companyName?.trim(),
        phone: dto.phone.trim(),
        email: dto.email.toLowerCase().trim(),
        eventType: dto.eventType,
        eventDate: new Date(dto.eventDate),
        location: dto.location.trim(),
        staffCount: dto.staffCount,
        staffRoles: [dto.staffRoles.trim()],
        message: dto.message?.trim(),
        status: InquiryStatus.NEW,
      },
      include: { handledBy: { select: { id: true, name: true, email: true } } },
    });

    this.logger.log(`New inquiry from ${inquiry.email} — ID: ${inquiry.id}`);
    return inquiry;
  }

  async findAll(query: InquiryQueryDto) {
    const { search, status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.InquiryWhereInput = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { companyName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.inquiry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { handledBy: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.inquiry.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const inquiry = await this.prisma.inquiry.findUnique({
      where: { id },
      include: {
        handledBy: { select: { id: true, name: true, email: true } },
        client: { select: { id: true, name: true, companyName: true } },
      },
    });

    if (!inquiry) throw new NotFoundException('Inquiry not found');
    return inquiry;
  }

  async updateStatus(id: string, dto: UpdateInquiryStatusDto, userId: string) {
    await this.findOne(id); // throws 404 if not found

    const updated = await this.prisma.inquiry.update({
      where: { id },
      data: {
        status: dto.status,
        handledById: userId,
      },
      include: { handledBy: { select: { id: true, name: true, email: true } } },
    });

    this.logger.log(`Inquiry ${id} status → ${dto.status} by user ${userId}`);
    return updated;
  }

  async getStats() {
    const [total, newCount, contactedCount, quotationSentCount, confirmedCount, lostCount] =
      await this.prisma.$transaction([
        this.prisma.inquiry.count(),
        this.prisma.inquiry.count({ where: { status: InquiryStatus.NEW } }),
        this.prisma.inquiry.count({ where: { status: InquiryStatus.CONTACTED } }),
        this.prisma.inquiry.count({ where: { status: InquiryStatus.QUOTATION_SENT } }),
        this.prisma.inquiry.count({ where: { status: InquiryStatus.CONFIRMED } }),
        this.prisma.inquiry.count({ where: { status: InquiryStatus.LOST } }),
      ]);

    return {
      total,
      new: newCount,
      contacted: contactedCount,
      quotationSent: quotationSentCount,
      confirmed: confirmedCount,
      lost: lostCount,
    };
  }
}
