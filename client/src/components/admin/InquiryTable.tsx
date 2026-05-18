'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  X,
} from 'lucide-react';
import { Inquiry, InquiryStatus } from '@/types/inquiry.types';
import { cn, formatDate } from '@/lib/utils';
import { inquiryService } from '@/services/inquiry.service';
import { useInquiryStore } from '@/store/inquiryStore';

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_MAP: Record<
  InquiryStatus,
  { label: string; className: string }
> = {
  NEW: { label: 'New', className: 'bg-blue-50 text-blue-700 ring-blue-200' },
  CONTACTED: { label: 'Contacted', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  QUOTATION_SENT: { label: 'Quote Sent', className: 'bg-purple-50 text-purple-700 ring-purple-200' },
  CONFIRMED: { label: 'Confirmed', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  LOST: { label: 'Lost', className: 'bg-ink-100 text-ink-500 ring-ink-200' },
};

function StatusBadge({ status }: { status: InquiryStatus }) {
  const { label, className } = STATUS_MAP[status];
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1', className)}>
      {label}
    </span>
  );
}

// ── Status selector ───────────────────────────────────────────────────────────

const ALL_STATUSES: InquiryStatus[] = ['NEW', 'CONTACTED', 'QUOTATION_SENT', 'CONFIRMED', 'LOST'];

function StatusSelect({
  inquiryId,
  current,
}: {
  inquiryId: string;
  current: InquiryStatus;
}) {
  const { updateInquiryStatus } = useInquiryStore();
  const [updating, setUpdating] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as InquiryStatus;
    if (next === current) return;
    setUpdating(true);
    try {
      await inquiryService.updateStatus(inquiryId, next);
      updateInquiryStatus(inquiryId, next); // instant UI update
    } catch {
      // revert on failure — UI stays unchanged
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      {updating && <Loader2 className="absolute -left-5 w-3.5 h-3.5 animate-spin text-ink-400" />}
      <select
        value={current}
        onChange={handleChange}
        disabled={updating}
        className={cn(
          'appearance-none text-xs rounded-full px-2.5 py-1 ring-1 font-medium cursor-pointer transition-opacity',
          STATUS_MAP[current].className,
          updating && 'opacity-50',
        )}
      >
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s} className="bg-white text-ink-700">
            {STATUS_MAP[s].label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Detail drawer ─────────────────────────────────────────────────────────────

function InquiryDrawer({
  inquiry,
  onClose,
}: {
  inquiry: Inquiry;
  onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      {/* Panel */}
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
          <h2 className="text-base font-semibold text-ink-900">Inquiry Details</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ink-100 text-ink-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <Section label="Contact">
            <Row label="Name" value={inquiry.fullName} />
            <Row label="Company" value={inquiry.companyName ?? '—'} />
            <Row label="Email" value={inquiry.email} />
            <Row label="Phone" value={inquiry.phone} />
          </Section>

          <Section label="Event">
            <Row label="Type" value={inquiry.eventType} />
            <Row label="Date" value={formatDate(inquiry.eventDate)} />
            <Row label="Location" value={inquiry.location} />
            <Row label="Staff Count" value={String(inquiry.staffCount)} />
            <Row label="Roles" value={inquiry.staffRoles.join(', ')} />
          </Section>

          {inquiry.message && (
            <Section label="Message">
              <p className="text-sm text-ink-600 leading-relaxed">{inquiry.message}</p>
            </Section>
          )}

          <Section label="Status">
            <div className="flex items-center gap-3">
              <StatusBadge status={inquiry.status} />
              {inquiry.handledBy && (
                <span className="text-xs text-ink-400">
                  by {inquiry.handledBy.name}
                </span>
              )}
            </div>
          </Section>

          <Section label="Timestamps">
            <Row label="Received" value={format(new Date(inquiry.createdAt), 'dd MMM yyyy, hh:mm a')} />
            <Row label="Updated" value={format(new Date(inquiry.updatedAt), 'dd MMM yyyy, hh:mm a')} />
          </Section>
        </div>
      </aside>
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-2">{label}</h3>
      <div className="bg-ink-50 rounded-xl px-4 py-3 space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-xs text-ink-400 shrink-0">{label}</span>
      <span className="text-xs text-ink-700 text-right">{value}</span>
    </div>
  );
}

// ── Main table component ──────────────────────────────────────────────────────

export interface InquiryTableProps {
  inquiries: Inquiry[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  search: string;
  statusFilter: InquiryStatus | '';
  onSearchChange: (v: string) => void;
  onStatusChange: (v: InquiryStatus | '') => void;
  onPageChange: (p: number) => void;
}

export default function InquiryTable({
  inquiries,
  total,
  page,
  totalPages,
  isLoading,
  search,
  statusFilter,
  onSearchChange,
  onStatusChange,
  onPageChange,
}: InquiryTableProps) {
  const [selected, setSelected] = useState<Inquiry | null>(null);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            placeholder="Search by name, email or company…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-ink-200 rounded-xl outline-none focus:ring-2 focus:ring-ink-900/10 focus:border-ink-300 transition"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as InquiryStatus | '')}
          className="px-4 py-2.5 text-sm bg-white border border-ink-200 rounded-xl outline-none focus:ring-2 focus:ring-ink-900/10 transition cursor-pointer text-ink-600"
        >
          <option value="">All Status</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_MAP[s].label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-ink-400" />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm font-medium text-ink-500">No inquiries found</p>
            <p className="text-xs text-ink-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100">
                  {['Name', 'Contact', 'Event', 'Date', 'Staff', 'Status', ''].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-ink-400 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-ink-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-ink-800 truncate max-w-[140px]">{inq.fullName}</p>
                      {inq.companyName && (
                        <p className="text-xs text-ink-400 truncate max-w-[140px]">{inq.companyName}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-ink-600 truncate max-w-[160px]">{inq.email}</p>
                      <p className="text-xs text-ink-400">{inq.phone}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-ink-600 truncate max-w-[120px]">{inq.eventType}</p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-ink-500 text-xs">
                      {formatDate(inq.eventDate)}
                    </td>
                    <td className="px-4 py-3.5 text-center text-ink-600">{inq.staffCount}</td>
                    <td className="px-4 py-3.5">
                      <StatusSelect inquiryId={inq.id} current={inq.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setSelected(inq)}
                        className="inline-flex items-center gap-1.5 text-xs text-ink-400 hover:text-ink-700 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && inquiries.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-ink-100">
            <p className="text-xs text-ink-400">
              {total} {total === 1 ? 'inquiry' : 'inquiries'} total
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-ink-500 px-2">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <InquiryDrawer inquiry={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
