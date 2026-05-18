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
  Loader2,
  X,
  Plus,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Building2,
  FileText,
  Tag,
  UserCog,
} from 'lucide-react';
import { Event, BookingStatus } from '@/types/event.types';
import { eventService } from '@/services/event.service';
import { clientService } from '@/services/client.service';
import { Client } from '@/types/client.types';
import { useEventStore } from '@/store/eventStore';
import { cn, formatDate } from '@/lib/utils';

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<BookingStatus, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-ink-100 text-ink-600 ring-ink-200' },
  CONFIRMED: { label: 'Confirmed', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-50 text-blue-700 ring-blue-200' },
  COMPLETED: { label: 'Completed', className: 'bg-purple-50 text-purple-700 ring-purple-200' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-50 text-red-600 ring-red-200' },
};

const ALL_STATUSES: BookingStatus[] = [
  'DRAFT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED',
];

function StatusBadge({ status }: { status: BookingStatus }) {
  const { label, className } = STATUS_MAP[status];
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1', className)}>
      {label}
    </span>
  );
}

// ── Inline status selector ────────────────────────────────────────────────────

function StatusSelect({ eventId, current }: { eventId: string; current: BookingStatus }) {
  const { updateEventStatus } = useEventStore();
  const [updating, setUpdating] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as BookingStatus;
    if (next === current) return;
    setUpdating(true);
    try {
      await eventService.updateStatus(eventId, next);
      updateEventStatus(eventId, next);
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
          <option key={s} value={s}>
            {STATUS_MAP[s].label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Detail drawer ─────────────────────────────────────────────────────────────

function EventDrawer({
  event,
  onClose,
  onEdit,
}: {
  event: Event;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
          <h2 className="text-lg font-semibold text-ink-900">Event Details</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-ink-700 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Title + status */}
          <div>
            <h3 className="text-base font-semibold text-ink-900">{event.name}</h3>
            <p className="text-sm text-ink-500 mt-0.5">{event.type}</p>
            <div className="mt-2">
              <StatusBadge status={event.status} />
            </div>
          </div>

          <DrawerSection title="Event Details">
            <DrawerRow
              icon={<CalendarDays className="w-4 h-4" />}
              label="Date"
              value={formatDate(event.date, 'EEEE, dd MMMM yyyy')}
            />
            <DrawerRow
              icon={<Clock className="w-4 h-4" />}
              label="Time"
              value={`${event.startTime} – ${event.endTime}`}
            />
            <DrawerRow
              icon={<MapPin className="w-4 h-4" />}
              label="Location"
              value={event.location}
            />
          </DrawerSection>

          <DrawerSection title="Staffing Requirements">
            <DrawerRow
              icon={<Users className="w-4 h-4" />}
              label="Staff Count"
              value={`${event.staffCount} members`}
            />
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-ink-400 shrink-0">
                <Tag className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs text-ink-400">Staff Roles</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {event.staffRoles.map((r) => (
                    <span
                      key={r}
                      className="rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-medium text-ink-700"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {event._count && (
              <DrawerRow
                icon={<Users className="w-4 h-4" />}
                label="Assigned So Far"
                value={`${event._count.assignments} staff assigned`}
              />
            )}
          </DrawerSection>

          <DrawerSection title="Client & Team">
            <DrawerRow
              icon={<Building2 className="w-4 h-4" />}
              label="Client"
              value={
                event.client.companyName
                  ? `${event.client.name} (${event.client.companyName})`
                  : event.client.name
              }
            />
            {event.supervisor && (
              <DrawerRow
                icon={<UserCog className="w-4 h-4" />}
                label="Supervisor"
                value={event.supervisor.name}
              />
            )}
            {event.createdBy && (
              <DrawerRow
                icon={<FileText className="w-4 h-4" />}
                label="Created By"
                value={event.createdBy.name}
              />
            )}
          </DrawerSection>

          {event.notes && (
            <DrawerSection title="Notes">
              <p className="text-sm text-ink-600 whitespace-pre-wrap">{event.notes}</p>
            </DrawerSection>
          )}

          <DrawerSection title="Record Info">
            <DrawerRow
              icon={<CalendarDays className="w-4 h-4" />}
              label="Created"
              value={formatDate(event.createdAt, 'dd MMM yyyy, HH:mm')}
            />
            <DrawerRow
              icon={<CalendarDays className="w-4 h-4" />}
              label="Last Updated"
              value={formatDate(event.updatedAt, 'dd MMM yyyy, HH:mm')}
            />
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

// ── Zod schema ────────────────────────────────────────────────────────────────

const timeRegex = /^\d{2}:\d{2}$/;

const eventSchema = z.object({
  name: z.string().min(2, 'Event name is required').max(200),
  type: z.string().min(2, 'Event type is required').max(100),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().regex(timeRegex, 'Use HH:MM format'),
  endTime: z.string().regex(timeRegex, 'Use HH:MM format'),
  location: z.string().min(2, 'Location is required').max(300),
  staffCount: z.number().int().min(1, 'At least 1 staff required').max(5000),
  staffRoles: z.string().min(1, 'At least one role is required'),
  clientId: z.string().min(1, 'Client is required'),
  supervisorId: z.string().optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

type EventFormValues = z.infer<typeof eventSchema>;

// ── Create / Edit form drawer ─────────────────────────────────────────────────

function EventFormDrawer({
  event,
  onClose,
  onSaved,
}: {
  event: Event | null;
  onClose: () => void;
  onSaved: (saved: Event) => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const isEdit = !!event;

  useEffect(() => {
    clientService
      .findAll({ isActive: true, limit: 200 })
      .then((r) => setClients(r.data))
      .catch(() => setClients([]))
      .finally(() => setLoadingClients(false));
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: event?.name ?? '',
      type: event?.type ?? '',
      date: event ? event.date.slice(0, 10) : '',
      startTime: event?.startTime ?? '',
      endTime: event?.endTime ?? '',
      location: event?.location ?? '',
      staffCount: event?.staffCount ?? 1,
      staffRoles: event?.staffRoles?.join(', ') ?? '',
      clientId: event?.client?.id ?? '',
      supervisorId: event?.supervisor?.id ?? '',
      notes: event?.notes ?? '',
    },
  });

  const onSubmit = async (values: EventFormValues) => {
    setServerError(null);
    try {
      const staffRolesArr = values.staffRoles
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);

      if (isEdit) {
        const payload: import('@/types/event.types').UpdateEventDto = {
          name: values.name,
          type: values.type,
          date: values.date,
          startTime: values.startTime,
          endTime: values.endTime,
          location: values.location,
          staffCount: values.staffCount,
          staffRoles: staffRolesArr,
          supervisorId: values.supervisorId || undefined,
          notes: values.notes || undefined,
        };
        const saved = await eventService.update(event.id, payload);
        onSaved(saved);
      } else {
        const payload: import('@/types/event.types').CreateEventDto = {
          name: values.name,
          type: values.type,
          date: values.date,
          startTime: values.startTime,
          endTime: values.endTime,
          location: values.location,
          staffCount: values.staffCount,
          staffRoles: staffRolesArr,
          clientId: values.clientId,
          supervisorId: values.supervisorId || undefined,
          notes: values.notes || undefined,
        };
        const saved = await eventService.create(payload);
        onSaved(saved);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Something went wrong. Please try again.';
      setServerError(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
          <h2 className="text-lg font-semibold text-ink-900">
            {isEdit ? 'Edit Event' : 'New Event Booking'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-600 transition-colors"
          >
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

            {/* Client (only on create) */}
            {!isEdit && (
              <FormField label="Client *" error={errors.clientId?.message}>
                <select
                  {...register('clientId')}
                  disabled={loadingClients}
                  className={inputCls(!!errors.clientId)}
                >
                  <option value="">
                    {loadingClients ? 'Loading clients…' : 'Select a client'}
                  </option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}{c.companyName ? ` — ${c.companyName}` : ''}
                    </option>
                  ))}
                </select>
              </FormField>
            )}

            <FormField label="Event Name *" error={errors.name?.message}>
              <input
                {...register('name')}
                placeholder="Sharma Wedding Reception"
                className={inputCls(!!errors.name)}
              />
            </FormField>

            <FormField label="Event Type *" error={errors.type?.message}>
              <input
                {...register('type')}
                placeholder="Wedding, Corporate, Concert…"
                className={inputCls(!!errors.type)}
              />
            </FormField>

            <FormField label="Date *" error={errors.date?.message}>
              <input
                {...register('date')}
                type="date"
                className={inputCls(!!errors.date)}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Start Time *" error={errors.startTime?.message}>
                <input
                  {...register('startTime')}
                  type="time"
                  className={inputCls(!!errors.startTime)}
                />
              </FormField>
              <FormField label="End Time *" error={errors.endTime?.message}>
                <input
                  {...register('endTime')}
                  type="time"
                  className={inputCls(!!errors.endTime)}
                />
              </FormField>
            </div>

            <FormField label="Location *" error={errors.location?.message}>
              <input
                {...register('location')}
                placeholder="Taj Palace, New Delhi"
                className={inputCls(!!errors.location)}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Staff Count *" error={errors.staffCount?.message}>
                <input
                  {...register('staffCount', { valueAsNumber: true })}
                  type="number"
                  min={1}
                  placeholder="20"
                  className={inputCls(!!errors.staffCount)}
                />
              </FormField>
              <FormField
                label="Staff Roles *"
                error={errors.staffRoles?.message}
                hint="Comma-separated"
              >
                <input
                  {...register('staffRoles')}
                  placeholder="Host, Usher, Security"
                  className={inputCls(!!errors.staffRoles)}
                />
              </FormField>
            </div>

            <FormField label="Notes" error={errors.notes?.message}>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder="Any special instructions or notes…"
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
              {isEdit ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function FormField({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink-700 mb-1">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return cn(
    'block w-full rounded-lg border px-3 py-2 text-sm text-ink-900 placeholder-slate-400 transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-ink-900 focus:border-transparent',
    hasError
      ? 'border-red-400 bg-red-50'
      : 'border-ink-200 bg-white hover:border-ink-300',
  );
}

// ── Main table ────────────────────────────────────────────────────────────────

interface EventTableProps {
  events: Event[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  search: string;
  statusFilter: BookingStatus | '';
  onSearchChange: (v: string) => void;
  onStatusChange: (v: BookingStatus | '') => void;
  onPageChange: (n: number) => void;
  canPrev: boolean;
  canNext: boolean;
}

export default function EventTable({
  events,
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
}: EventTableProps) {
  const { addEvent, updateEvent } = useEventStore();

  const [viewEvent, setViewEvent] = useState<Event | null>(null);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleView = (e: Event) => setViewEvent(e);

  const handleEdit = (e: Event) => {
    setEditEvent(e);
    setShowForm(true);
    setViewEvent(null);
  };

  const handleNew = () => {
    setEditEvent(null);
    setShowForm(true);
  };

  const handleSaved = (saved: Event) => {
    if (editEvent) {
      updateEvent(saved);
    } else {
      addEvent(saved);
    }
    setShowForm(false);
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
            placeholder="Search name, type, location…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-ink-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ink-900"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as BookingStatus | '')}
          className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 focus:outline-none focus:ring-2 focus:ring-ink-900"
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_MAP[s].label}
            </option>
          ))}
        </select>

        <button
          onClick={handleNew}
          className="inline-flex items-center gap-2 rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Event
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm border border-ink-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-ink-400" />
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-ink-400">
            <CalendarDays className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No events found</p>
            <p className="text-xs mt-1">Try adjusting your search or create a new event</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/60">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider hidden md:table-cell">
                    Client
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider hidden lg:table-cell">
                    Location
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider hidden sm:table-cell">
                    Staff
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-ink-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {events.map((e) => (
                  <tr key={e.id} className="hover:bg-ink-50/60 transition-colors">
                    {/* Name + type */}
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-ink-900 truncate max-w-[180px]">{e.name}</p>
                      <p className="text-xs text-ink-500 mt-0.5">{e.type}</p>
                    </td>

                    {/* Client */}
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-ink-700 text-sm">{e.client.name}</p>
                      {e.client.companyName && (
                        <p className="text-xs text-ink-400">{e.client.companyName}</p>
                      )}
                    </td>

                    {/* Date & time */}
                    <td className="px-5 py-3.5">
                      <p className="text-ink-700 text-sm">{formatDate(e.date, 'dd MMM yyyy')}</p>
                      <p className="text-xs text-ink-500 mt-0.5">
                        {e.startTime} – {e.endTime}
                      </p>
                    </td>

                    {/* Location */}
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <p className="text-sm text-ink-700 truncate max-w-[160px]">{e.location}</p>
                    </td>

                    {/* Staff count */}
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <p className="text-sm text-ink-700">
                        {e._count?.assignments ?? 0} / {e.staffCount}
                      </p>
                      <p className="text-xs text-ink-400 mt-0.5">assigned</p>
                    </td>

                    {/* Status — inline */}
                    <td className="px-5 py-3.5">
                      <StatusSelect eventId={e.id} current={e.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleView(e)}
                          title="View details"
                          className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(e)}
                          title="Edit event"
                          className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
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
              {total} event{total !== 1 ? 's' : ''}
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

      {/* Drawers */}
      {viewEvent && (
        <EventDrawer
          event={viewEvent}
          onClose={() => setViewEvent(null)}
          onEdit={() => handleEdit(viewEvent)}
        />
      )}

      {showForm && (
        <EventFormDrawer
          event={editEvent}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
