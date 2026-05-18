'use client';

import { useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  MessageSquare, Calendar, Users, FileText,
  CreditCard, ClipboardCheck, TrendingUp, UserCheck,
  ArrowUpRight, RefreshCw, Loader2,
} from 'lucide-react';
import Header from '@/components/shared/Header';
import { reportService } from '@/services/report.service';
import { useDashboardStore } from '@/store/dashboardStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

function KpiCard({
  label, value, sub, icon: Icon, href,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ElementType;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative rounded-xl border border-ink-200/70 bg-white p-5 hover:border-ink-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="icon-tile h-9 w-9"><Icon className="w-[16px] h-[16px]" /></div>
        <ArrowUpRight className="w-3.5 h-3.5 text-ink-300 group-hover:text-ink-900 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
      </div>
      <p className="text-[28px] font-medium text-ink-950 tabular-nums leading-none tracking-[-0.02em]">{value}</p>
      <p className="text-[13px] text-ink-700 mt-2.5 font-medium">{label}</p>
      {sub && <p className="text-[11.5px] text-ink-500 mt-0.5">{sub}</p>}
    </Link>
  );
}

const QUICK_LINKS = [
  { label: 'New Inquiry',     href: '/inquiries',  icon: MessageSquare },
  { label: 'Add Staff',       href: '/staff',      icon: Users },
  { label: 'Create Event',    href: '/events',     icon: Calendar },
  { label: 'Send Quotation',  href: '/quotations', icon: FileText },
  { label: 'Mark Attendance', href: '/attendance', icon: ClipboardCheck },
  { label: 'Record Payment',  href: '/payments',   icon: CreditCard },
];

const MODULES = [
  { label: 'Inquiry Management', sub: 'Track and convert client leads', href: '/inquiries', icon: MessageSquare },
  { label: 'Client Management', sub: 'Profiles, history, and engagement', href: '/clients', icon: Users },
  { label: 'Event Booking', sub: 'Create and manage event bookings', href: '/events', icon: Calendar },
  { label: 'Staff Assignments', sub: 'Assign verified staff to events', href: '/assignments', icon: UserCheck },
  { label: 'Attendance Tracking', sub: 'Monitor check-in and check-out', href: '/attendance', icon: ClipboardCheck },
  { label: 'Reports & Analytics', sub: 'Platform-wide insights', href: '/reports', icon: TrendingUp },
];

export default function DashboardPage() {
  const { stats, isLoading, setStats, setLoading } = useDashboardStore();
  const { user } = useAuthStore();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const overview = await reportService.getOverview();
      setStats({
        totalInquiries: overview.inquiries.total,
        newInquiries: overview.inquiries.new,
        confirmedBookings: overview.events.confirmed,
        upcomingEvents: overview.events.inProgress,
        totalStaff: overview.staff.total,
        assignedStaff: overview.staff.assigned,
        pendingQuotations: overview.quotations.sent,
        pendingPayments: overview.payments.pending + overview.payments.overdue,
      });
    } catch {
      // handled by UI
    } finally {
      setLoading(false);
    }
  }, [setStats, setLoading]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Dashboard"
        subtitle={`${greeting()}, ${user?.name ?? 'Admin'}`}
        actions={
          <button
            onClick={fetchStats}
            disabled={isLoading}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 h-9 text-[12.5px] font-medium text-ink-700 hover:bg-ink-50 hover:border-ink-300 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
            Refresh
          </button>
        }
      />

      <main className="flex-1 px-8 py-10 space-y-12">
        {isLoading && !stats ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-6 h-6 animate-spin text-ink-400" />
          </div>
        ) : stats ? (
          <>
            {/* KPI grid */}
            <section>
              <div className="flex items-end justify-between mb-5">
                <div>
                  <p className="heading-eyebrow">Overview</p>
                  <h2 className="mt-1.5 text-[19px] font-medium text-ink-950 tracking-[-0.01em]">
                    Today at a glance
                  </h2>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KpiCard label="Total Inquiries"    value={stats.totalInquiries}    sub={`${stats.newInquiries} new`}             icon={MessageSquare}   href="/inquiries" />
                <KpiCard label="Confirmed Bookings" value={stats.confirmedBookings} sub={`${stats.upcomingEvents} in progress`}   icon={Calendar}        href="/events" />
                <KpiCard label="Total Staff"        value={stats.totalStaff}        sub={`${stats.assignedStaff} assigned`}       icon={UserCheck}       href="/staff" />
                <KpiCard label="Pending Payments"   value={stats.pendingPayments}   sub="Requires action"                          icon={CreditCard}      href="/payments" />
                <KpiCard label="Pending Quotations" value={stats.pendingQuotations} sub="Awaiting response"                        icon={FileText}        href="/quotations" />
                <KpiCard label="Active Staff"       value={stats.assignedStaff}     sub="Currently deployed"                       icon={Users}           href="/assignments" />
                <KpiCard label="New Inquiries"      value={stats.newInquiries}      sub="Awaiting review"                          icon={TrendingUp}      href="/inquiries" />
                <KpiCard label="Attendance"         value="—"                       sub="View in reports"                          icon={ClipboardCheck}  href="/reports" />
              </div>
            </section>

            {/* Quick actions */}
            <section>
              <div className="mb-5">
                <p className="heading-eyebrow">Quick actions</p>
                <h2 className="mt-1.5 text-[19px] font-medium text-ink-950 tracking-[-0.01em]">Jump to a task</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href + label}
                    href={href}
                    className="group flex flex-col items-start gap-3 rounded-xl border border-ink-200/70 bg-white p-4 hover:border-ink-300 hover:shadow-sm transition-all"
                  >
                    <div className="icon-tile h-9 w-9"><Icon className="w-[16px] h-[16px]" /></div>
                    <span className="text-[13px] font-medium text-ink-900 group-hover:text-ink-950">{label}</span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Modules */}
            <section>
              <div className="mb-5">
                <p className="heading-eyebrow">Platform modules</p>
                <h2 className="mt-1.5 text-[19px] font-medium text-ink-950 tracking-[-0.01em]">Manage your operations</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {MODULES.map(({ label, sub, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex items-center gap-4 rounded-xl border border-ink-200/70 bg-white p-5 hover:border-ink-300 hover:shadow-sm transition-all"
                  >
                    <div className="icon-tile h-10 w-10 shrink-0 group-hover:bg-ink-950 group-hover:text-white group-hover:ring-ink-950 transition-colors">
                      <Icon className="w-[16px] h-[16px]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-ink-950">{label}</p>
                      <p className="text-[12.5px] text-ink-500 mt-0.5 truncate">{sub}</p>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-ink-300 group-hover:text-ink-900 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-ink-500">
            <p className="text-sm">Failed to load dashboard stats.</p>
            <button onClick={fetchStats} className="mt-3 text-sm text-ink-900 link-underline">Try again</button>
          </div>
        )}
      </main>
    </div>
  );
}
