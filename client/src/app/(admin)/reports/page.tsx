'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/shared/Header';
import { reportService } from '@/services/report.service';
import {
  OverviewReport,
  FinancialsReport,
  EventsReport,
  StaffReport,
} from '@/types/report.types';
import { cn, formatDate, formatCurrency } from '@/lib/utils';
import {
  Users,
  Calendar,
  FileText,
  IndianRupee,
  ClipboardCheck,
  MessageSquare,
  Loader2,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Building2,
  MapPin,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';

// ── Shared UI helpers ─────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-semibold text-ink-900 mb-4">{children}</h2>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', accent)}>
          <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
        </div>
      </div>
      <p className="text-2xl font-bold text-ink-900 tabular-nums">{value}</p>
      <p className="text-sm font-medium text-ink-600 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-ink-400 mt-1">{sub}</p>}
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <div className="flex items-center gap-2">
        <span className={cn('w-2 h-2 rounded-full', color)} />
        <span className="text-ink-600">{label}</span>
      </div>
      <span className="font-semibold text-ink-900 tabular-nums">{value}</span>
    </div>
  );
}

function ModuleCard({
  title,
  icon: Icon,
  accent,
  total,
  breakdown,
}: {
  title: string;
  icon: React.ElementType;
  accent: string;
  total: number;
  breakdown: { label: string; value: number; color: string }[];
}) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl', accent)}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink-900">{title}</p>
          <p className="text-xs text-ink-400">{total} total</p>
        </div>
      </div>
      <div className="divide-y divide-ink-50">
        {breakdown.map((b) => (
          <MiniStat key={b.label} label={b.label} value={b.value} color={b.color} />
        ))}
      </div>
    </div>
  );
}

// ── Tab definitions ───────────────────────────────────────────────────────────

type Tab = 'overview' | 'financials' | 'events' | 'staff';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'financials', label: 'Financials' },
  { id: 'events', label: 'Events' },
  { id: 'staff', label: 'Staff' },
];

// ── Overview tab ──────────────────────────────────────────────────────────────

function OverviewTab({ data }: { data: OverviewReport }) {
  return (
    <div className="space-y-8">
      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Total Inquiries"
          value={data.inquiries.total}
          sub={`${data.inquiries.new} new`}
          icon={MessageSquare}
          accent="bg-violet-50 text-violet-600"
        />
        <StatCard
          label="Total Events"
          value={data.events.total}
          sub={`${data.events.inProgress} in progress`}
          icon={Calendar}
          accent="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Staff Members"
          value={data.staff.total}
          sub={`${data.staff.active} active`}
          icon={Users}
          accent="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Quotations"
          value={data.quotations.total}
          sub={`${data.quotations.accepted} accepted`}
          icon={FileText}
          accent="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Payments"
          value={data.payments.total}
          sub={`${data.payments.paid} paid`}
          icon={IndianRupee}
          accent="bg-rose-50 text-rose-600"
        />
        <StatCard
          label="Attendance"
          value={data.attendance.total}
          sub={`${data.attendance.noShow} no-shows`}
          icon={ClipboardCheck}
          accent="bg-teal-50 text-teal-600"
        />
      </div>

      {/* Module breakdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ModuleCard
          title="Inquiries"
          icon={MessageSquare}
          accent="bg-violet-50 text-violet-600"
          total={data.inquiries.total}
          breakdown={[
            { label: 'New', value: data.inquiries.new, color: 'bg-violet-400' },
            { label: 'Confirmed', value: data.inquiries.confirmed, color: 'bg-emerald-400' },
            { label: 'Lost', value: data.inquiries.lost, color: 'bg-red-400' },
          ]}
        />
        <ModuleCard
          title="Events"
          icon={Calendar}
          accent="bg-blue-50 text-blue-600"
          total={data.events.total}
          breakdown={[
            { label: 'Confirmed', value: data.events.confirmed, color: 'bg-blue-400' },
            { label: 'In Progress', value: data.events.inProgress, color: 'bg-amber-400' },
            { label: 'Completed', value: data.events.completed, color: 'bg-emerald-400' },
            { label: 'Cancelled', value: data.events.cancelled, color: 'bg-ink-300' },
          ]}
        />
        <ModuleCard
          title="Staff"
          icon={Users}
          accent="bg-emerald-50 text-emerald-600"
          total={data.staff.total}
          breakdown={[
            { label: 'Active', value: data.staff.active, color: 'bg-emerald-400' },
            { label: 'Assigned', value: data.staff.assigned, color: 'bg-blue-400' },
          ]}
        />
        <ModuleCard
          title="Quotations"
          icon={FileText}
          accent="bg-amber-50 text-amber-600"
          total={data.quotations.total}
          breakdown={[
            { label: 'Draft', value: data.quotations.draft, color: 'bg-ink-300' },
            { label: 'Sent', value: data.quotations.sent, color: 'bg-blue-400' },
            { label: 'Accepted', value: data.quotations.accepted, color: 'bg-emerald-400' },
            { label: 'Rejected', value: data.quotations.rejected, color: 'bg-red-400' },
          ]}
        />
        <ModuleCard
          title="Payments"
          icon={IndianRupee}
          accent="bg-rose-50 text-rose-600"
          total={data.payments.total}
          breakdown={[
            { label: 'Pending', value: data.payments.pending, color: 'bg-ink-300' },
            { label: 'Partial', value: data.payments.partiallyPaid, color: 'bg-amber-400' },
            { label: 'Paid', value: data.payments.paid, color: 'bg-emerald-400' },
            { label: 'Overdue', value: data.payments.overdue, color: 'bg-red-400' },
          ]}
        />
        <ModuleCard
          title="Attendance"
          icon={ClipboardCheck}
          accent="bg-teal-50 text-teal-600"
          total={data.attendance.total}
          breakdown={[
            { label: 'Present', value: data.attendance.present, color: 'bg-emerald-400' },
            { label: 'Late', value: data.attendance.late, color: 'bg-amber-400' },
            { label: 'No Show', value: data.attendance.noShow, color: 'bg-red-400' },
            { label: 'Completed', value: data.attendance.completed, color: 'bg-purple-400' },
          ]}
        />
      </div>
    </div>
  );
}

// ── Financials tab ────────────────────────────────────────────────────────────

function FinancialsTab({ data }: { data: FinancialsReport }) {
  const collectionRate = data.totalRevenue > 0
    ? Math.round((data.totalCollected / data.totalRevenue) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(data.totalRevenue)}
          sub="From all payment records"
          icon={TrendingUp}
          accent="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Total Collected"
          value={formatCurrency(data.totalCollected)}
          sub={`${collectionRate}% collection rate`}
          icon={CheckCircle2}
          accent="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(data.totalOutstanding)}
          sub="Balance due"
          icon={Clock}
          accent="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Accepted Quotations"
          value={formatCurrency(data.acceptedQuotationsValue)}
          sub="Total value of accepted quotes"
          icon={FileText}
          accent="bg-violet-50 text-violet-600"
        />
      </div>

      {/* Progress bar */}
      {data.totalRevenue > 0 && (
        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-ink-700">Collection Progress</p>
            <p className="text-sm font-bold text-emerald-600">{collectionRate}%</p>
          </div>
          <div className="h-2.5 rounded-full bg-ink-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${collectionRate}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-ink-400">
            <span>Collected: {formatCurrency(data.totalCollected)}</span>
            <span>Target: {formatCurrency(data.totalRevenue)}</span>
          </div>
        </div>
      )}

      {/* By status */}
      <div className="rounded-2xl border border-ink-100 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-100">
          <p className="text-sm font-semibold text-ink-900">Breakdown by Payment Status</p>
        </div>
        <table className="min-w-full divide-y divide-ink-100">
          <thead className="bg-ink-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">Status</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-500">Records</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-500">Total</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-500">Collected</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-500">Outstanding</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {Object.entries(data.byStatus).map(([status, s]) => (
              <tr key={status} className="hover:bg-ink-50/50">
                <td className="px-5 py-3">
                  <span className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1',
                    status === 'PAID' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' :
                    status === 'PARTIALLY_PAID' ? 'bg-amber-50 text-amber-700 ring-amber-200' :
                    status === 'OVERDUE' ? 'bg-red-50 text-red-600 ring-red-200' :
                    'bg-ink-50 text-ink-600 ring-ink-200'
                  )}>
                    {status === 'PARTIALLY_PAID' ? 'Partial' : status.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-sm text-ink-700 tabular-nums">{s.count}</td>
                <td className="px-5 py-3 text-right text-sm font-medium text-ink-900 tabular-nums">{formatCurrency(s.totalAmount)}</td>
                <td className="px-5 py-3 text-right text-sm text-emerald-600 tabular-nums">{formatCurrency(s.collected)}</td>
                <td className="px-5 py-3 text-right text-sm text-red-600 tabular-nums">{formatCurrency(s.outstanding)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Events tab ────────────────────────────────────────────────────────────────

const EVENT_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-ink-50 text-ink-500 ring-ink-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 ring-blue-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 ring-amber-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  CANCELLED: 'bg-red-50 text-red-600 ring-red-200',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-ink-50 text-ink-500 ring-ink-200',
  PARTIALLY_PAID: 'bg-amber-50 text-amber-700 ring-amber-200',
  PAID: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  OVERDUE: 'bg-red-50 text-red-600 ring-red-200',
};

function EventsTab({ data }: { data: EventsReport }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white overflow-hidden">
      {data.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-ink-400">
          <Calendar className="w-10 h-10 mb-3" />
          <p className="text-sm font-medium">No events found</p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-ink-100">
          <thead className="bg-ink-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">Event</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">Status</th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-ink-500">Staff</th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-ink-500">Assigned</th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-ink-500">Attended</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-500">Revenue</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">Payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {data.data.map((e) => (
              <tr key={e.id} className="hover:bg-ink-50/60 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-ink-900">{e.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-ink-400" />
                    <p className="text-xs text-ink-500">{e.location}</p>
                  </div>
                  <p className="text-xs text-ink-400">{formatDate(e.date, 'dd MMM yyyy')}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1', EVENT_STATUS_COLORS[e.status] ?? '')}>
                    {e.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-sm font-medium text-ink-700">{e.staffCount}</td>
                <td className="px-6 py-4 text-center">
                  <span className={cn('text-sm font-semibold tabular-nums', e._count.assignments >= e.staffCount && e.staffCount > 0 ? 'text-emerald-600' : 'text-ink-700')}>
                    {e._count.assignments}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm font-semibold text-ink-700 tabular-nums">{e._count.attendance}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  {e.payment ? (
                    <>
                      <p className="text-sm font-semibold text-ink-900">{formatCurrency(e.payment.totalAmount)}</p>
                      {e.payment.balanceAmount > 0 && (
                        <p className="text-xs text-red-500">Due: {formatCurrency(e.payment.balanceAmount)}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-ink-400">—</p>
                  )}
                </td>
                <td className="px-6 py-4">
                  {e.payment ? (
                    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1', PAYMENT_STATUS_COLORS[e.payment.status] ?? '')}>
                      {e.payment.status === 'PARTIALLY_PAID' ? 'Partial' : e.payment.status}
                    </span>
                  ) : (
                    <span className="text-xs text-ink-400">No record</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Staff tab ─────────────────────────────────────────────────────────────────

const STAFF_STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  INACTIVE: 'bg-ink-50 text-ink-500 ring-ink-200',
  AVAILABLE: 'bg-blue-50 text-blue-700 ring-blue-200',
  ASSIGNED: 'bg-amber-50 text-amber-700 ring-amber-200',
  BLACKLISTED: 'bg-red-50 text-red-600 ring-red-200',
};

function StaffTab({ data }: { data: StaffReport }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white overflow-hidden">
      {data.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-ink-400">
          <Users className="w-10 h-10 mb-3" />
          <p className="text-sm font-medium">No staff found</p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-ink-100">
          <thead className="bg-ink-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">Staff</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">Status</th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-ink-500">Assignments</th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-ink-500">Attendance</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {data.data.map((s) => (
              <tr key={s.id} className="hover:bg-ink-50/60 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-ink-900">{s.fullName}</p>
                  <p className="text-xs text-ink-500">{s.role} · {s.city}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1', STAFF_STATUS_COLORS[s.status] ?? '')}>
                    {s.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm font-semibold text-ink-700 tabular-nums">{s._count.assignments}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm font-semibold text-ink-700 tabular-nums">{s._count.attendance}</span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs text-ink-600">{s.phone}</p>
                  <p className="text-xs text-ink-400">{s.email}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [overview, setOverview] = useState<OverviewReport | null>(null);
  const [financials, setFinancials] = useState<FinancialsReport | null>(null);
  const [eventsReport, setEventsReport] = useState<EventsReport | null>(null);
  const [staffReport, setStaffReport] = useState<StaffReport | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [ov, fin, ev, st] = await Promise.all([
        reportService.getOverview(),
        reportService.getFinancials(),
        reportService.getEventsReport({ limit: 50 }),
        reportService.getStaffReport({ limit: 50 }),
      ]);
      setOverview(ov);
      setFinancials(fin);
      setEventsReport(ev);
      setStaffReport(st);
    } catch {
      setError('Failed to load report data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Reports"
        subtitle="Platform-wide analytics and performance insights"
      />
      <main className="flex-1 px-8 py-10 space-y-6">
        {/* Tab bar + refresh */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-xl bg-ink-100 p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  'rounded-lg px-4 py-1.5 text-sm font-medium transition-all',
                  activeTab === t.id
                    ? 'bg-white text-ink-900 shadow-sm'
                    : 'text-ink-500 hover:text-ink-700',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={fetchAll}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-600 hover:bg-ink-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
            Refresh
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-7 h-7 animate-spin text-ink-400" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32 text-ink-400">
            <AlertCircle className="w-8 h-8 mb-3 text-red-400" />
            <p className="text-sm font-medium text-red-600">{error}</p>
            <button
              onClick={fetchAll}
              className="mt-4 rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && overview && <OverviewTab data={overview} />}
            {activeTab === 'financials' && financials && <FinancialsTab data={financials} />}
            {activeTab === 'events' && eventsReport && <EventsTab data={eventsReport} />}
            {activeTab === 'staff' && staffReport && <StaffTab data={staffReport} />}
          </>
        )}
      </main>
    </div>
  );
}

