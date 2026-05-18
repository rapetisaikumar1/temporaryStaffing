import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [
      inquiryTotal,
      inquiryNew,
      inquiryConfirmed,
      inquiryLost,
      eventTotal,
      eventConfirmed,
      eventInProgress,
      eventCompleted,
      eventCancelled,
      staffTotal,
      staffActive,
      staffAssigned,
      quotationTotal,
      quotationDraft,
      quotationSent,
      quotationAccepted,
      quotationRejected,
      paymentTotal,
      paymentPending,
      paymentPartial,
      paymentPaid,
      paymentOverdue,
      attendanceTotal,
      attendancePresent,
      attendanceLate,
      attendanceNoShow,
      attendanceCompleted,
    ] = await Promise.all([
      this.prisma.inquiry.count(),
      this.prisma.inquiry.count({ where: { status: 'NEW' } }),
      this.prisma.inquiry.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.inquiry.count({ where: { status: 'LOST' } }),

      this.prisma.event.count(),
      this.prisma.event.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.event.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.event.count({ where: { status: 'COMPLETED' } }),
      this.prisma.event.count({ where: { status: 'CANCELLED' } }),

      this.prisma.staff.count({ where: { isDeleted: false } }),
      this.prisma.staff.count({ where: { isDeleted: false, status: 'ACTIVE' } }),
      this.prisma.staff.count({ where: { isDeleted: false, status: 'ASSIGNED' } }),

      this.prisma.quotation.count({ where: { isDeleted: false } }),
      this.prisma.quotation.count({ where: { isDeleted: false, status: 'DRAFT' } }),
      this.prisma.quotation.count({ where: { isDeleted: false, status: 'SENT' } }),
      this.prisma.quotation.count({ where: { isDeleted: false, status: 'ACCEPTED' } }),
      this.prisma.quotation.count({ where: { isDeleted: false, status: 'REJECTED' } }),

      this.prisma.payment.count(),
      this.prisma.payment.count({ where: { status: 'PENDING' } }),
      this.prisma.payment.count({ where: { status: 'PARTIALLY_PAID' } }),
      this.prisma.payment.count({ where: { status: 'PAID' } }),
      this.prisma.payment.count({ where: { status: 'OVERDUE' } }),

      this.prisma.attendance.count(),
      this.prisma.attendance.count({ where: { status: 'PRESENT' } }),
      this.prisma.attendance.count({ where: { status: 'LATE' } }),
      this.prisma.attendance.count({ where: { status: 'NO_SHOW' } }),
      this.prisma.attendance.count({ where: { status: 'COMPLETED' } }),
    ]);

    return {
      inquiries: { total: inquiryTotal, new: inquiryNew, confirmed: inquiryConfirmed, lost: inquiryLost },
      events: {
        total: eventTotal,
        confirmed: eventConfirmed,
        inProgress: eventInProgress,
        completed: eventCompleted,
        cancelled: eventCancelled,
      },
      staff: { total: staffTotal, active: staffActive, assigned: staffAssigned },
      quotations: {
        total: quotationTotal,
        draft: quotationDraft,
        sent: quotationSent,
        accepted: quotationAccepted,
        rejected: quotationRejected,
      },
      payments: {
        total: paymentTotal,
        pending: paymentPending,
        partiallyPaid: paymentPartial,
        paid: paymentPaid,
        overdue: paymentOverdue,
      },
      attendance: {
        total: attendanceTotal,
        present: attendancePresent,
        late: attendanceLate,
        noShow: attendanceNoShow,
        completed: attendanceCompleted,
      },
    };
  }

  async getFinancials() {
    const payments = await this.prisma.payment.findMany({
      select: {
        totalAmount: true,
        advancePaid: true,
        balanceAmount: true,
        status: true,
      },
    });

    let totalRevenue = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;
    const byStatus: Record<string, { count: number; totalAmount: number; collected: number; outstanding: number }> = {
      PENDING: { count: 0, totalAmount: 0, collected: 0, outstanding: 0 },
      PARTIALLY_PAID: { count: 0, totalAmount: 0, collected: 0, outstanding: 0 },
      PAID: { count: 0, totalAmount: 0, collected: 0, outstanding: 0 },
      OVERDUE: { count: 0, totalAmount: 0, collected: 0, outstanding: 0 },
    };

    for (const p of payments) {
      totalRevenue += p.totalAmount;
      totalCollected += p.advancePaid;
      totalOutstanding += p.balanceAmount;

      if (byStatus[p.status]) {
        byStatus[p.status].count += 1;
        byStatus[p.status].totalAmount += p.totalAmount;
        byStatus[p.status].collected += p.advancePaid;
        byStatus[p.status].outstanding += p.balanceAmount;
      }
    }

    const quotationStats = await this.prisma.quotation.aggregate({
      where: { isDeleted: false, status: 'ACCEPTED' },
      _sum: { total: true },
    });

    return {
      totalRevenue,
      totalCollected,
      totalOutstanding,
      acceptedQuotationsValue: quotationStats._sum.total ?? 0,
      byStatus,
    };
  }

  async getEventsReport(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [events, total] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        select: {
          id: true,
          name: true,
          type: true,
          date: true,
          location: true,
          status: true,
          staffCount: true,
          client: { select: { id: true, name: true, companyName: true } },
          payments: {
            take: 1,
            select: {
              totalAmount: true,
              advancePaid: true,
              balanceAmount: true,
              status: true,
            },
          },
          _count: {
            select: {
              assignments: true,
              attendance: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.event.count(),
    ]);

    const data = events.map(({ payments, ...e }) => ({
      ...e,
      payment: payments[0] ?? null,
    }));

    return { data, total, page, limit };
  }

  async getStaffReport(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [staffList, total] = await this.prisma.$transaction([
      this.prisma.staff.findMany({
        where: { isDeleted: false },
        select: {
          id: true,
          fullName: true,
          role: true,
          city: true,
          status: true,
          phone: true,
          email: true,
          _count: {
            select: {
              assignments: true,
              attendance: true,
            },
          },
        },
        orderBy: { fullName: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.staff.count({ where: { isDeleted: false } }),
    ]);

    return { data: staffList, total, page, limit };
  }
}
