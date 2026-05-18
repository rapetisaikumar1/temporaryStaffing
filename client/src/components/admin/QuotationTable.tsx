'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
  Minus,
  FileText,
  CalendarDays,
  Building2,
  AlertTriangle,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { Quotation, QuotationStatus } from '@/types/quotation.types';
import { quotationService } from '@/services/quotation.service';
import { clientService } from '@/services/client.service';
import { Client } from '@/types/client.types';
import { useQuotationStore } from '@/store/quotationStore';
import { cn, formatDate, formatCurrency } from '@/lib/utils';

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<QuotationStatus, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-ink-100 text-ink-600 ring-ink-200' },
  SENT: { label: 'Sent', className: 'bg-blue-50 text-blue-700 ring-blue-200' },
  ACCEPTED: { label: 'Accepted', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  REJECTED: { label: 'Rejected', className: 'bg-red-50 text-red-600 ring-red-200' },
};

const ALL_STATUSES: QuotationStatus[] = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'];

function StatusBadge({ status }: { status: QuotationStatus }) {
  const { label, className } = STATUS_MAP[status];
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1', className)}>
      {label}
    </span>
  );
}

// ── Inline status selector ────────────────────────────────────────────────────

function StatusSelect({ quotationId, current }: { quotationId: string; current: QuotationStatus }) {
  const { updateQuotationStatus } = useQuotationStore();
  const [updating, setUpdating] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as QuotationStatus;
    if (next === current) return;
    setUpdating(true);
    try {
      await quotationService.updateStatus(quotationId, next);
      updateQuotationStatus(quotationId, next);
    } catch {
      // revert silently
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      {updating && (
        <Loader2 className="absolute -left-5 w-3.5 h-3.5 animate-spin text-ink-400" />
      )}
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
          <option key={s} value={s}>{STATUS_MAP[s].label}</option>
        ))}
      </select>
    </div>
  );
}

// ── Detail drawer ─────────────────────────────────────────────────────────────

function QuotationDrawer({
  quotation,
  onClose,
  onEdit,
}: {
  quotation: Quotation;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-lg bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
          <h2 className="text-lg font-semibold text-ink-900">Quotation Details</h2>
          <div className="flex items-center gap-2">
            {quotation.status === 'DRAFT' || quotation.status === 'SENT' ? (
              <button
                onClick={onEdit}
                className="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-ink-700 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
            ) : null}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Title + status */}
          <div>
            <h3 className="text-base font-semibold text-ink-900">{quotation.title}</h3>
            <div className="mt-2">
              <StatusBadge status={quotation.status} />
            </div>
          </div>

          {/* References */}
          <DrawerSection title="References">
            {quotation.client && (
              <DrawerRow
                icon={<Building2 className="w-4 h-4" />}
                label="Client"
                value={
                  quotation.client.companyName
                    ? `${quotation.client.name} (${quotation.client.companyName})`
                    : quotation.client.name
                }
              />
            )}
            {quotation.event && (
              <DrawerRow
                icon={<CalendarDays className="w-4 h-4" />}
                label="Event"
                value={`${quotation.event.name} — ${formatDate(quotation.event.date, 'dd MMM yyyy')}`}
              />
            )}
            {quotation.inquiry && (
              <DrawerRow
                icon={<FileText className="w-4 h-4" />}
                label="Inquiry"
                value={`${quotation.inquiry.fullName} (${quotation.inquiry.email})`}
              />
            )}
          </DrawerSection>

          {/* Line items */}
          <DrawerSection title="Line Items">
            <div className="rounded-xl border border-ink-100 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-ink-50 border-b border-ink-100">
                    <th className="px-3 py-2 text-left font-semibold text-ink-500">Role</th>
                    <th className="px-3 py-2 text-right font-semibold text-ink-500">Qty</th>
                    <th className="px-3 py-2 text-right font-semibold text-ink-500">Rate</th>
                    <th className="px-3 py-2 text-right font-semibold text-ink-500">Days</th>
                    <th className="px-3 py-2 text-right font-semibold text-ink-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {quotation.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2 text-ink-700 font-medium">{item.role}</td>
                      <td className="px-3 py-2 text-right text-ink-600">{item.quantity}</td>
                      <td className="px-3 py-2 text-right text-ink-600">{formatCurrency(item.ratePerPerson)}</td>
                      <td className="px-3 py-2 text-right text-ink-600">{item.days}</td>
                      <td className="px-3 py-2 text-right font-semibold text-ink-900">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DrawerSection>

          {/* Totals */}
          <DrawerSection title="Pricing Summary">
            <div className="space-y-2">
              <SummaryRow label="Subtotal" value={formatCurrency(quotation.subtotal)} />
              {quotation.serviceCharge > 0 && (
                <SummaryRow label="Service Charge" value={formatCurrency(quotation.serviceCharge)} />
              )}
              {quotation.tax > 0 && (
                <SummaryRow label="Tax" value={formatCurrency(quotation.tax)} />
              )}
              {quotation.discount > 0 && (
                <SummaryRow label="Discount" value={`-${formatCurrency(quotation.discount)}`} isNegative />
              )}
              <div className="border-t border-ink-100 pt-2">
                <SummaryRow label="Total" value={formatCurrency(quotation.total)} isBold />
              </div>
            </div>
          </DrawerSection>

          {quotation.notes && (
            <DrawerSection title="Notes">
              <p className="text-sm text-ink-600 whitespace-pre-wrap">{quotation.notes}</p>
            </DrawerSection>
          )}

          <DrawerSection title="Record Info">
            <DrawerRow
              icon={<CalendarDays className="w-4 h-4" />}
              label="Created"
              value={formatDate(quotation.createdAt, 'dd MMM yyyy, HH:mm')}
            />
            {quotation.sentAt && (
              <DrawerRow
                icon={<CheckCircle2 className="w-4 h-4" />}
                label="Sent On"
                value={formatDate(quotation.sentAt, 'dd MMM yyyy, HH:mm')}
              />
            )}
            {quotation.createdBy && (
              <DrawerRow
                icon={<FileText className="w-4 h-4" />}
                label="Created By"
                value={quotation.createdBy.name}
              />
            )}
          </DrawerSection>
        </div>
      </div>
    </>
  );
}

function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DrawerRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-ink-400 shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-ink-400">{label}</p>
        <p className="text-sm text-ink-700 font-medium">{value}</p>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  isBold = false,
  isNegative = false,
}: {
  label: string;
  value: string;
  isBold?: boolean;
  isNegative?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className={cn('text-sm', isBold ? 'font-semibold text-ink-900' : 'text-ink-500')}>{label}</span>
      <span className={cn('text-sm', isBold ? 'font-bold text-ink-900' : isNegative ? 'text-emerald-600' : 'text-ink-700')}>{value}</span>
    </div>
  );
}

// ── Zod schema ────────────────────────────────────────────────────────────────

const itemSchema = z.object({
  role: z.string().min(1, 'Role is required').max(100),
  quantity: z.number().int().min(1, 'Min 1'),
  ratePerPerson: z.number().min(1, 'Min ₹1'),
  days: z.number().int().min(1, 'Min 1 day').max(365),
});

const formSchema = z.object({
  title: z.string().min(2, 'Title is required').max(200),
  clientId: z.string().optional().or(z.literal('')),
  items: z.array(itemSchema).min(1, 'Add at least one line item'),
  serviceCharge: z.number().min(0).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  discount: z.number().min(0).optional(),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

function calcPreview(values: Partial<FormValues>) {
  const items = values.items ?? [];
  const subtotal = items.reduce(
    (sum, i) => sum + (i.quantity ?? 0) * (i.ratePerPerson ?? 0) * (i.days ?? 1),
    0,
  );
  const serviceCharge = values.serviceCharge ?? 0;
  const tax = ((subtotal + serviceCharge) * (values.taxRate ?? 0)) / 100;
  const discount = values.discount ?? 0;
  const total = subtotal + serviceCharge + tax - discount;
  return { subtotal, serviceCharge, tax, discount, total };
}

// ── Form drawer (create + edit) ───────────────────────────────────────────────

function QuotationFormDrawer({
  quotation,
  onClose,
  onSaved,
}: {
  quotation: Quotation | null;
  onClose: () => void;
  onSaved: (q: Quotation) => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const isEdit = !!quotation;

  useEffect(() => {
    clientService
      .findAll({ isActive: true, limit: 200 })
      .then((r) => setClients(r.data))
      .catch(() => setClients([]));
  }, []);

  const defaultItems = quotation?.items.map((i) => ({
    role: i.role,
    quantity: i.quantity,
    ratePerPerson: i.ratePerPerson,
    days: i.days,
  })) ?? [{ role: '', quantity: 1, ratePerPerson: 0, days: 1 }];

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: quotation?.title ?? '',
      clientId: quotation?.client?.id ?? '',
      items: defaultItems,
      serviceCharge: quotation?.serviceCharge ?? 0,
      taxRate: 0,
      discount: quotation?.discount ?? 0,
      notes: quotation?.notes ?? '',
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedValues = watch();
  const preview = calcPreview(watchedValues);

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const payload = {
        title: values.title,
        clientId: values.clientId || undefined,
        items: values.items,
        serviceCharge: values.serviceCharge,
        taxRate: values.taxRate,
        discount: values.discount,
        notes: values.notes || undefined,
      };

      const saved = isEdit
        ? await quotationService.update(quotation.id, payload)
        : await quotationService.create(payload);
      onSaved(saved);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Something went wrong.';
      setServerError(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-xl bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
          <h2 className="text-lg font-semibold text-ink-900">
            {isEdit ? 'Edit Quotation' : 'New Quotation'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {serverError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {serverError}
              </div>
            )}

            <FormField label="Title *" error={errors.title?.message}>
              <input
                {...register('title')}
                placeholder="Sharma Wedding — Staff Quotation"
                className={inputCls(!!errors.title)}
              />
            </FormField>

            <FormField label="Client" error={errors.clientId?.message}>
              <select {...register('clientId')} className={inputCls(!!errors.clientId)}>
                <option value="">No client (standalone)</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.companyName ? ` — ${c.companyName}` : ''}
                  </option>
                ))}
              </select>
            </FormField>

            {/* Line items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-ink-700">Line Items *</label>
                <button
                  type="button"
                  onClick={() => append({ role: '', quantity: 1, ratePerPerson: 0, days: 1 })}
                  className="inline-flex items-center gap-1 text-xs font-medium text-ink-700 hover:text-ink-900 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Row
                </button>
              </div>

              {errors.items?.root && (
                <p className="text-xs text-red-600 mb-2">{errors.items.root.message}</p>
              )}

              <div className="space-y-2">
                {fields.map((field, idx) => {
                  const rowErrors = errors.items?.[idx];
                  return (
                    <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-4">
                        {idx === 0 && <p className="text-xs text-ink-400 mb-1">Role</p>}
                        <input
                          {...register(`items.${idx}.role`)}
                          placeholder="Host"
                          className={inputCls(!!rowErrors?.role) + ' text-xs py-1.5'}
                        />
                      </div>
                      <div className="col-span-2">
                        {idx === 0 && <p className="text-xs text-ink-400 mb-1">Qty</p>}
                        <input
                          {...register(`items.${idx}.quantity`, { valueAsNumber: true })}
                          type="number"
                          min={1}
                          className={inputCls(!!rowErrors?.quantity) + ' text-xs py-1.5'}
                        />
                      </div>
                      <div className="col-span-3">
                        {idx === 0 && <p className="text-xs text-ink-400 mb-1">Rate/Person</p>}
                        <input
                          {...register(`items.${idx}.ratePerPerson`, { valueAsNumber: true })}
                          type="number"
                          min={1}
                          placeholder="2500"
                          className={inputCls(!!rowErrors?.ratePerPerson) + ' text-xs py-1.5'}
                        />
                      </div>
                      <div className="col-span-2">
                        {idx === 0 && <p className="text-xs text-ink-400 mb-1">Days</p>}
                        <input
                          {...register(`items.${idx}.days`, { valueAsNumber: true })}
                          type="number"
                          min={1}
                          className={inputCls(!!rowErrors?.days) + ' text-xs py-1.5'}
                        />
                      </div>
                      <div className="col-span-1 flex items-end pb-0.5">
                        {idx === 0 && <div className="h-5 mb-1" />}
                        <button
                          type="button"
                          onClick={() => fields.length > 1 && remove(idx)}
                          disabled={fields.length === 1}
                          className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pricing controls */}
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Service Charge (₹)" error={errors.serviceCharge?.message}>
                <input
                  {...register('serviceCharge', { valueAsNumber: true })}
                  type="number"
                  min={0}
                  placeholder="0"
                  className={inputCls(!!errors.serviceCharge)}
                />
              </FormField>
              <FormField label="Tax Rate (%)" error={errors.taxRate?.message}>
                <input
                  {...register('taxRate', { valueAsNumber: true })}
                  type="number"
                  min={0}
                  max={100}
                  placeholder="18"
                  className={inputCls(!!errors.taxRate)}
                />
              </FormField>
              <FormField label="Discount (₹)" error={errors.discount?.message}>
                <input
                  {...register('discount', { valueAsNumber: true })}
                  type="number"
                  min={0}
                  placeholder="0"
                  className={inputCls(!!errors.discount)}
                />
              </FormField>
            </div>

            {/* Live preview */}
            <div className="rounded-xl bg-ink-50 border border-ink-100 px-4 py-3 space-y-1.5">
              <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">Preview</p>
              <SummaryRow label="Subtotal" value={formatCurrency(preview.subtotal)} />
              {preview.serviceCharge > 0 && (
                <SummaryRow label="Service Charge" value={formatCurrency(preview.serviceCharge)} />
              )}
              {preview.tax > 0 && (
                <SummaryRow label="Tax" value={formatCurrency(preview.tax)} />
              )}
              {preview.discount > 0 && (
                <SummaryRow label="Discount" value={`-${formatCurrency(preview.discount)}`} isNegative />
              )}
              <div className="border-t border-ink-200 pt-1.5">
                <SummaryRow label="Total" value={formatCurrency(preview.total)} isBold />
              </div>
            </div>

            <FormField label="Notes" error={errors.notes?.message}>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder="Payment terms, validity period, special instructions…"
                className={inputCls(!!errors.notes) + ' resize-none'}
              />
            </FormField>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-ink-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-ink-900 px-5 py-2 text-sm font-medium text-white hover:bg-ink-700 disabled:opacity-60 transition-colors"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Create Quotation'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ── Delete confirm modal ──────────────────────────────────────────────────────

function DeleteConfirmModal({
  quotation,
  onClose,
  onConfirm,
}: {
  quotation: Quotation;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink-900">Delete Quotation</h3>
            <p className="text-xs text-ink-500 mt-0.5">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-ink-600 mb-5">
          Delete "<span className="font-medium">{quotation.title}</span>"?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Form helpers ──────────────────────────────────────────────────────────────

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return cn(
    'block w-full rounded-lg border px-3 py-2 text-sm text-ink-900 placeholder-slate-400 transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-ink-900 focus:border-transparent',
    hasError ? 'border-red-400 bg-red-50' : 'border-ink-200 bg-white hover:border-ink-300',
  );
}

// ── Main table ────────────────────────────────────────────────────────────────

interface QuotationTableProps {
  quotations: Quotation[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  search: string;
  statusFilter: QuotationStatus | '';
  onSearchChange: (v: string) => void;
  onStatusChange: (v: QuotationStatus | '') => void;
  onPageChange: (n: number) => void;
  canPrev: boolean;
  canNext: boolean;
}

export default function QuotationTable({
  quotations,
  total,
  page,
  totalPages,
  isLoading,
  search,
  statusFilter,
  onSearchChange,
  onStatusChange,
  onPageChange,
  canPrev,
  canNext,
}: QuotationTableProps) {
  const { addQuotation, updateQuotation, removeQuotation } = useQuotationStore();

  const [viewQuotation, setViewQuotation] = useState<Quotation | null>(null);
  const [editQuotation, setEditQuotation] = useState<Quotation | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteQuotation, setDeleteQuotation] = useState<Quotation | null>(null);

  const handleEdit = (q: Quotation) => {
    setEditQuotation(q);
    setShowForm(true);
    setViewQuotation(null);
  };

  const handleSaved = (saved: Quotation) => {
    if (editQuotation) {
      updateQuotation(saved);
    } else {
      addQuotation(saved);
    }
    setShowForm(false);
    setEditQuotation(null);
  };

  const handleDelete = async () => {
    if (!deleteQuotation) return;
    await quotationService.remove(deleteQuotation.id);
    removeQuotation(deleteQuotation.id);
    setDeleteQuotation(null);
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search title, client, event…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-ink-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ink-900"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as QuotationStatus | '')}
          className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 focus:outline-none focus:ring-2 focus:ring-ink-900"
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_MAP[s].label}</option>
          ))}
        </select>

        <button
          onClick={() => { setEditQuotation(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Quotation
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm border border-ink-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-ink-400" />
          </div>
        ) : quotations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-ink-400">
            <FileText className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No quotations found</p>
            <p className="text-xs mt-1">Create a new quotation to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/60">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Title</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider hidden md:table-cell">Client</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider hidden lg:table-cell">Event</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">
                    <span className="hidden sm:inline">Items</span>
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-ink-500 uppercase tracking-wider">Total</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-ink-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-ink-50/60 transition-colors">
                    {/* Title */}
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-ink-900 truncate max-w-[180px]">{q.title}</p>
                      <p className="text-xs text-ink-400 mt-0.5">{formatDate(q.createdAt, 'dd MMM yyyy')}</p>
                    </td>

                    {/* Client */}
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      {q.client ? (
                        <>
                          <p className="text-sm text-ink-700">{q.client.name}</p>
                          {q.client.companyName && (
                            <p className="text-xs text-ink-400">{q.client.companyName}</p>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-ink-400">—</span>
                      )}
                    </td>

                    {/* Event */}
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      {q.event ? (
                        <>
                          <p className="text-sm text-ink-700 truncate max-w-[140px]">{q.event.name}</p>
                          <p className="text-xs text-ink-400">{formatDate(q.event.date, 'dd MMM yyyy')}</p>
                        </>
                      ) : (
                        <span className="text-xs text-ink-400">—</span>
                      )}
                    </td>

                    {/* Item count */}
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-medium text-ink-700">
                        <Tag className="w-3 h-3" />
                        {q.items.length}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="px-5 py-3.5 text-right">
                      <p className="font-semibold text-ink-900">{formatCurrency(q.total)}</p>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <StatusSelect quotationId={q.id} current={q.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewQuotation(q)}
                          title="View details"
                          className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {(q.status === 'DRAFT' || q.status === 'SENT') && (
                          <button
                            onClick={() => handleEdit(q)}
                            title="Edit quotation"
                            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {q.status !== 'ACCEPTED' && (
                          <button
                            onClick={() => setDeleteQuotation(q)}
                            title="Delete quotation"
                            className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && total > 0 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-ink-100">
            <p className="text-xs text-ink-500">
              {total} quotation{total !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={!canPrev}
                className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-ink-500">{page} / {totalPages}</span>
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={!canNext}
                className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawers / Modals */}
      {viewQuotation && (
        <QuotationDrawer
          quotation={viewQuotation}
          onClose={() => setViewQuotation(null)}
          onEdit={() => handleEdit(viewQuotation)}
        />
      )}

      {showForm && (
        <QuotationFormDrawer
          quotation={editQuotation}
          onClose={() => { setShowForm(false); setEditQuotation(null); }}
          onSaved={handleSaved}
        />
      )}

      {deleteQuotation && (
        <DeleteConfirmModal
          quotation={deleteQuotation}
          onClose={() => setDeleteQuotation(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
