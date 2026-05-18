'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  X,
  Plus,
  Calendar,
  MapPin,
  Building2,
  IndianRupee,
  AlertTriangle,
  Receipt,
  BadgeCheck,
} from 'lucide-react';
import { Payment, PaymentStatus, InvoiceStatus, StaffPayoutStatus } from '@/types/payment.types';
import { paymentService } from '@/services/payment.service';
import { eventService } from '@/services/event.service';
import { clientService } from '@/services/client.service';
import { Event } from '@/types/event.types';
import { Client } from '@/types/client.types';
import { usePaymentStore } from '@/store/paymentStore';
import { cn, formatDate, formatCurrency } from '@/lib/utils';

// ── Status configs ────────────────────────────────────────────────────────────

const PAYMENT_STATUS_MAP: Record<PaymentStatus, { label: string; className: string }> = {
  PENDING:        { label: 'Pending',        className: 'bg-ink-50 text-ink-600 ring-ink-200' },
  PARTIALLY_PAID: { label: 'Partial',        className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  PAID:           { label: 'Paid',           className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  OVERDUE:        { label: 'Overdue',        className: 'bg-red-50 text-red-600 ring-red-200' },
};

const INVOICE_STATUS_MAP: Record<InvoiceStatus, { label: string; className: string }> = {
  NOT_GENERATED: { label: 'Not Generated', className: 'bg-ink-50 text-ink-500 ring-ink-200' },
  GENERATED:     { label: 'Generated',     className: 'bg-blue-50 text-blue-700 ring-blue-200' },
  SENT:          { label: 'Sent',          className: 'bg-purple-50 text-purple-700 ring-purple-200' },
};

const PAYOUT_STATUS_MAP: Record<StaffPayoutStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  PAID:    { label: 'Paid',    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
};

const ALL_PAYMENT_STATUSES: PaymentStatus[] = ['PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'];
const ALL_INVOICE_STATUSES: InvoiceStatus[] = ['NOT_GENERATED', 'GENERATED', 'SENT'];
const ALL_PAYOUT_STATUSES: StaffPayoutStatus[] = ['PENDING', 'PAID'];

function StatusBadge({ label, className }: { label: string; className: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1', className)}>
      {label}
    </span>
  );
}

// ── Inline payment status select ──────────────────────────────────────────────

function PaymentStatusSelect({ payment }: { payment: Payment }) {
  const { updatePaymentStatuses } = usePaymentStore();
  const [updating, setUpdating] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as PaymentStatus;
    if (next === payment.status) return;
    setUpdating(true);
    try {
      await paymentService.updateStatuses(payment.id, { status: next });
      updatePaymentStatuses(payment.id, { status: next });
    } catch {
      // revert silently
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      {updating && <Loader2 className="absolute -left-5 w-3.5 h-3.5 animate-spin text-ink-400" />}
      <select
        value={payment.status}
        onChange={handleChange}
        disabled={updating}
        className={cn(
          'appearance-none text-xs rounded-full px-2.5 py-1 ring-1 font-medium cursor-pointer transition-opacity',
          PAYMENT_STATUS_MAP[payment.status].className,
          updating && 'opacity-50',
        )}
      >
        {ALL_PAYMENT_STATUSES.map((s) => (
          <option key={s} value={s}>{PAYMENT_STATUS_MAP[s].label}</option>
        ))}
      </select>
    </div>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────

const inputCls = (err?: boolean) =>
  cn(
    'w-full rounded-lg border px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 transition-shadow',
    err
      ? 'border-red-300 focus:ring-red-200'
      : 'border-ink-200 focus:ring-ink-200 focus:border-ink-300',
  );

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-ink-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function AmountRow({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between py-1.5', bold && 'font-semibold')}>
      <span className={cn('text-sm', bold ? 'text-ink-900' : 'text-ink-500')}>{label}</span>
      <span className={cn('text-sm', bold ? 'text-ink-900' : 'text-ink-700')}>{formatCurrency(value)}</span>
    </div>
  );
}

// ── Detail drawer ─────────────────────────────────────────────────────────────

function PaymentDrawer({
  payment,
  onClose,
  onEdit,
}: {
  payment: Payment;
  onClose: () => void;
  onEdit: () => void;
}) {
  const { event, client, createdBy } = payment;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
          <h2 className="text-lg font-semibold text-ink-900">Payment Details</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-ink-700 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Status badges */}
          <div className="flex flex-wrap gap-2">
            <StatusBadge {...PAYMENT_STATUS_MAP[payment.status]} />
            <StatusBadge {...INVOICE_STATUS_MAP[payment.invoiceStatus]} />
            <StatusBadge {...PAYOUT_STATUS_MAP[payment.staffPayoutStatus]} />
          </div>

          {/* Amounts */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">Financials</h3>
            <div className="rounded-xl border border-ink-100 bg-ink-50 px-4 divide-y divide-ink-100">
              <AmountRow label="Total Amount" value={payment.totalAmount} />
              <AmountRow label="Advance Paid" value={payment.advancePaid} />
              <AmountRow label="Balance Due" value={payment.balanceAmount} bold />
            </div>
          </section>

          {/* Event */}
          {event && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">Event</h3>
              <div className="rounded-xl border border-ink-100 bg-ink-50 p-4 space-y-2 text-sm text-ink-700">
                <p className="font-semibold text-ink-900">{event.name}</p>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-ink-400" />
                  <span>{formatDate(event.date, 'dd MMM yyyy')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-ink-400" />
                  <span>{event.location}</span>
                </div>
                <span className="inline-flex items-center rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-600">
                  {event.type}
                </span>
              </div>
            </section>
          )}

          {/* Client */}
          {client && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">Client</h3>
              <div className="rounded-xl border border-ink-100 bg-ink-50 p-4 text-sm text-ink-700 space-y-1">
                <p className="font-semibold text-ink-900">{client.name}</p>
                {client.companyName && <p className="text-ink-500">{client.companyName}</p>}
                <p>{client.email}</p>
                <p>{client.phone}</p>
              </div>
            </section>
          )}

          {/* Notes */}
          {payment.notes && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">Notes</h3>
              <p className="text-sm text-ink-700 whitespace-pre-wrap">{payment.notes}</p>
            </section>
          )}

          {/* Meta */}
          <section className="text-xs text-ink-400 space-y-1 border-t border-ink-100 pt-4">
            {createdBy && <p>Created by {createdBy.name}</p>}
            <p>Created {formatDate(payment.createdAt, 'dd MMM yyyy HH:mm')}</p>
            <p>Updated {formatDate(payment.updatedAt, 'dd MMM yyyy HH:mm')}</p>
          </section>
        </div>
      </div>
    </>
  );
}

// ── Create drawer ─────────────────────────────────────────────────────────────

const createSchema = z.object({
  eventId: z.string().min(1, 'Event is required'),
  clientId: z.string().min(1, 'Client is required'),
  totalAmount: z.number().positive('Must be greater than 0'),
  advancePaid: z.number().min(0, 'Cannot be negative').optional(),
  notes: z.string().optional(),
});

type CreateFormValues = z.infer<typeof createSchema>;

function CreatePaymentDrawer({ onClose, onSaved }: { onClose: () => void; onSaved: (p: Payment) => void }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      eventService.findAll({ limit: 200 }),
      clientService.findAll({ limit: 200 }),
    ])
      .then(([evRes, clRes]) => {
        setEvents(evRes.data);
        setClients(clRes.data);
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateFormValues>({ resolver: zodResolver(createSchema) });

  const onSubmit = async (values: CreateFormValues) => {
    setServerError(null);
    try {
      const saved = await paymentService.create({
        eventId: values.eventId,
        clientId: values.clientId,
        totalAmount: values.totalAmount,
        advancePaid: values.advancePaid ?? 0,
        notes: values.notes || undefined,
      });
      onSaved(saved);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Something went wrong.';
      setServerError(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
          <h2 className="text-lg font-semibold text-ink-900">New Payment</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {serverError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {serverError}
              </div>
            )}

            <FormField label="Event *" error={errors.eventId?.message}>
              <select {...register('eventId')} disabled={loadingData} className={inputCls(!!errors.eventId)}>
                <option value="">{loadingData ? 'Loading…' : 'Select an event'}</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} — {formatDate(e.date, 'dd MMM yyyy')}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Client *" error={errors.clientId?.message}>
              <select {...register('clientId')} disabled={loadingData} className={inputCls(!!errors.clientId)}>
                <option value="">{loadingData ? 'Loading…' : 'Select a client'}</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.companyName ? ` (${c.companyName})` : ''}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Total Amount (₹) *" error={errors.totalAmount?.message}>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('totalAmount', { valueAsNumber: true })}
                placeholder="0.00"
                className={inputCls(!!errors.totalAmount)}
              />
            </FormField>

            <FormField label="Advance Paid (₹)" error={errors.advancePaid?.message}>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('advancePaid', { valueAsNumber: true })}
                placeholder="0.00"
                className={inputCls(!!errors.advancePaid)}
              />
            </FormField>

            <FormField label="Notes" error={errors.notes?.message}>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder="Payment terms or notes…"
                className={inputCls(!!errors.notes) + ' resize-none'}
              />
            </FormField>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-ink-100">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loadingData}
              className="inline-flex items-center gap-2 rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create Payment
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ── Edit drawer ───────────────────────────────────────────────────────────────

const editSchema = z.object({
  totalAmount: z.number().positive('Must be greater than 0'),
  advancePaid: z.number().min(0, 'Cannot be negative'),
  status: z.enum(['PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE']),
  invoiceStatus: z.enum(['NOT_GENERATED', 'GENERATED', 'SENT']),
  staffPayoutStatus: z.enum(['PENDING', 'PAID']),
  notes: z.string().optional(),
});

type EditFormValues = z.infer<typeof editSchema>;

function EditPaymentDrawer({
  payment,
  onClose,
  onSaved,
}: {
  payment: Payment;
  onClose: () => void;
  onSaved: (p: Payment) => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      totalAmount: payment.totalAmount,
      advancePaid: payment.advancePaid,
      status: payment.status,
      invoiceStatus: payment.invoiceStatus,
      staffPayoutStatus: payment.staffPayoutStatus,
      notes: payment.notes ?? '',
    },
  });

  const onSubmit = async (values: EditFormValues) => {
    setServerError(null);
    try {
      // Update amounts + notes
      const updated = await paymentService.update(payment.id, {
        totalAmount: values.totalAmount,
        advancePaid: values.advancePaid,
        notes: values.notes || undefined,
      });
      // Update statuses if changed
      const statusChanged =
        values.status !== updated.status ||
        values.invoiceStatus !== updated.invoiceStatus ||
        values.staffPayoutStatus !== updated.staffPayoutStatus;

      const final = statusChanged
        ? await paymentService.updateStatuses(payment.id, {
            status: values.status,
            invoiceStatus: values.invoiceStatus,
            staffPayoutStatus: values.staffPayoutStatus,
          })
        : updated;

      onSaved(final);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Something went wrong.';
      setServerError(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
          <h2 className="text-lg font-semibold text-ink-900">Edit Payment</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-ink-100 bg-ink-50">
          <p className="text-sm font-medium text-ink-800">{payment.event?.name}</p>
          <p className="text-xs text-ink-500">{payment.client?.name}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {serverError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {serverError}
              </div>
            )}

            <FormField label="Total Amount (₹) *" error={errors.totalAmount?.message}>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('totalAmount', { valueAsNumber: true })}
                className={inputCls(!!errors.totalAmount)}
              />
            </FormField>

            <FormField label="Advance Paid (₹) *" error={errors.advancePaid?.message}>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('advancePaid', { valueAsNumber: true })}
                className={inputCls(!!errors.advancePaid)}
              />
            </FormField>

            <div className="border-t border-ink-100 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">Statuses</p>
              <div className="space-y-3">
                <FormField label="Payment Status" error={errors.status?.message}>
                  <select {...register('status')} className={inputCls(!!errors.status)}>
                    {ALL_PAYMENT_STATUSES.map((s) => (
                      <option key={s} value={s}>{PAYMENT_STATUS_MAP[s].label}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Invoice Status" error={errors.invoiceStatus?.message}>
                  <select {...register('invoiceStatus')} className={inputCls(!!errors.invoiceStatus)}>
                    {ALL_INVOICE_STATUSES.map((s) => (
                      <option key={s} value={s}>{INVOICE_STATUS_MAP[s].label}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Staff Payout" error={errors.staffPayoutStatus?.message}>
                  <select {...register('staffPayoutStatus')} className={inputCls(!!errors.staffPayoutStatus)}>
                    {ALL_PAYOUT_STATUSES.map((s) => (
                      <option key={s} value={s}>{PAYOUT_STATUS_MAP[s].label}</option>
                    ))}
                  </select>
                </FormField>
              </div>
            </div>

            <FormField label="Notes" error={errors.notes?.message}>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder="Payment terms or notes…"
                className={inputCls(!!errors.notes) + ' resize-none'}
              />
            </FormField>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-ink-100">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ── Delete modal ──────────────────────────────────────────────────────────────

function DeleteConfirmModal({
  payment,
  onClose,
  onConfirm,
}: {
  payment: Payment;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setDeleting(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Delete failed.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink-900">Delete Payment</h3>
              <p className="text-xs text-ink-500">This action cannot be undone</p>
            </div>
          </div>
          <p className="text-sm text-ink-700 mb-1">
            Delete payment for <strong>{payment.event?.name}</strong>?
          </p>
          <p className="text-xs text-ink-500 mb-5">
            Client: {payment.client?.name}
          </p>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}
          <div className="flex items-center justify-end gap-3">
            <button onClick={onClose} disabled={deleting} className="rounded-lg px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={deleting}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main table ────────────────────────────────────────────────────────────────

export interface PaymentTableProps {
  payments: Payment[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  statusFilter: PaymentStatus | '';
  onStatusChange: (v: PaymentStatus | '') => void;
  onPageChange: (p: number) => void;
  canPrev: boolean;
  canNext: boolean;
}

export default function PaymentTable({
  payments,
  total,
  page,
  totalPages,
  isLoading,
  statusFilter,
  onStatusChange,
  onPageChange,
  canPrev,
  canNext,
}: PaymentTableProps) {
  const { addPayment, updatePayment, removePayment } = usePaymentStore();

  const [viewItem, setViewItem] = useState<Payment | null>(null);
  const [editItem, setEditItem] = useState<Payment | null>(null);
  const [deleteItem, setDeleteItem] = useState<Payment | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as PaymentStatus | '')}
            className="rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-700 focus:outline-none focus:ring-2 focus:ring-ink-200"
          >
            <option value="">All Payment Statuses</option>
            {ALL_PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{PAYMENT_STATUS_MAP[s].label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Payment
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-ink-200 bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-ink-400" />
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-ink-400">
            <IndianRupee className="w-10 h-10 mb-3" />
            <p className="text-sm font-medium">No payment records found</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-ink-100">
            <thead className="bg-ink-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">Event / Client</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-500">Total</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-500">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">Payout</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-ink-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-ink-900">{p.event?.name ?? '—'}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-ink-400" />
                      <p className="text-xs text-ink-500">{p.client?.name ?? '—'}</p>
                    </div>
                    <p className="text-xs text-ink-400 mt-0.5">
                      {p.event ? formatDate(p.event.date, 'dd MMM yyyy') : ''}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-sm font-semibold text-ink-900">{formatCurrency(p.totalAmount)}</p>
                    <p className="text-xs text-ink-500">Adv: {formatCurrency(p.advancePaid)}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className={cn('text-sm font-semibold', p.balanceAmount > 0 ? 'text-red-600' : 'text-emerald-600')}>
                      {formatCurrency(p.balanceAmount)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <PaymentStatusSelect payment={p} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge {...INVOICE_STATUS_MAP[p.invoiceStatus]} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge {...PAYOUT_STATUS_MAP[p.staffPayoutStatus]} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <span title="View Details">
                        <button
                          onClick={() => setViewItem(p)}
                          className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </span>
                      <span title="Edit">
                        <button
                          onClick={() => setEditItem(p)}
                          className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </span>
                      {p.status !== 'PAID' && (
                        <span title="Delete">
                          <button
                            onClick={() => setDeleteItem(p)}
                            className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-ink-500">
            Showing {payments.length} of {total} records
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={!canPrev}
              className="rounded-lg p-1.5 text-ink-600 hover:bg-ink-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-ink-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={!canNext}
              className="rounded-lg p-1.5 text-ink-600 hover:bg-ink-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Drawers / Modals */}
      {showCreate && (
        <CreatePaymentDrawer
          onClose={() => setShowCreate(false)}
          onSaved={(saved) => {
            addPayment(saved);
            setShowCreate(false);
          }}
        />
      )}

      {viewItem && (
        <PaymentDrawer
          payment={viewItem}
          onClose={() => setViewItem(null)}
          onEdit={() => {
            setEditItem(viewItem);
            setViewItem(null);
          }}
        />
      )}

      {editItem && (
        <EditPaymentDrawer
          payment={editItem}
          onClose={() => setEditItem(null)}
          onSaved={(saved) => {
            updatePayment(saved);
            setEditItem(null);
          }}
        />
      )}

      {deleteItem && (
        <DeleteConfirmModal
          payment={deleteItem}
          onClose={() => setDeleteItem(null)}
          onConfirm={async () => {
            await paymentService.remove(deleteItem.id);
            removePayment(deleteItem.id);
            setDeleteItem(null);
          }}
        />
      )}
    </div>
  );
}
