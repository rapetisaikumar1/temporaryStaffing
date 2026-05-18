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
  Clock,
  User,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react';
import { Attendance, AttendanceStatus } from '@/types/attendance.types';
import { attendanceService } from '@/services/attendance.service';
import { eventService } from '@/services/event.service';
import { assignmentService } from '@/services/assignment.service';
import { Event } from '@/types/event.types';
import { Assignment } from '@/types/assignment.types';
import { useAttendanceStore } from '@/store/attendanceStore';
import { cn, formatDate, getInitials } from '@/lib/utils';

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<AttendanceStatus, { label: string; className: string }> = {
  PRESENT:   { label: 'Present',   className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  LATE:      { label: 'Late',      className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  NO_SHOW:   { label: 'No Show',   className: 'bg-red-50 text-red-600 ring-red-200' },
  COMPLETED: { label: 'Completed', className: 'bg-purple-50 text-purple-700 ring-purple-200' },
};

const ALL_STATUSES: AttendanceStatus[] = ['PRESENT', 'LATE', 'NO_SHOW', 'COMPLETED'];

function StatusBadge({ status }: { status: AttendanceStatus }) {
  const { label, className } = STATUS_MAP[status];
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1', className)}>
      {label}
    </span>
  );
}

// ── Inline status selector ────────────────────────────────────────────────────

function StatusSelect({ attendanceId, current }: { attendanceId: string; current: AttendanceStatus }) {
  const { updateAttendanceStatus } = useAttendanceStore();
  const [updating, setUpdating] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as AttendanceStatus;
    if (next === current) return;
    setUpdating(true);
    try {
      await attendanceService.update(attendanceId, { status: next });
      updateAttendanceStatus(attendanceId, next);
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

// ── Shared helpers ────────────────────────────────────────────────────────────

const inputCls = (err?: boolean) =>
  cn(
    'w-full rounded-lg border px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 transition-shadow',
    err
      ? 'border-red-300 focus:ring-red-200'
      : 'border-ink-200 focus:ring-ink-200 focus:border-ink-300',
  );

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
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-ink-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function formatDateTime(dt: string | null): string {
  if (!dt) return '—';
  const d = new Date(dt);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

// Convert datetime-local string to ISO string
function toISO(dtLocal: string | undefined): string | undefined {
  if (!dtLocal) return undefined;
  return new Date(dtLocal).toISOString();
}

// Convert ISO to datetime-local format (YYYY-MM-DDTHH:mm)
function toDatetimeLocal(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ── Detail drawer ─────────────────────────────────────────────────────────────

function AttendanceDrawer({
  attendance,
  onClose,
  onEdit,
}: {
  attendance: Attendance;
  onClose: () => void;
  onEdit: () => void;
}) {
  const { event, staff, assignment, markedBy } = attendance;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
          <h2 className="text-lg font-semibold text-ink-900">Attendance Record</h2>
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
              className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <StatusBadge status={attendance.status} />
          </div>

          {/* Staff */}
          {staff && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">Staff Member</h3>
              <div className="rounded-xl border border-ink-100 bg-ink-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-200 text-sm font-semibold text-ink-700">
                    {getInitials(staff.fullName)}
                  </div>
                  <div>
                    <p className="font-semibold text-ink-900">{staff.fullName}</p>
                    <p className="text-xs text-ink-500">{staff.role}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm text-ink-600">
                  <p>{staff.phone}</p>
                  <p>{staff.email}</p>
                  <p>{staff.city}</p>
                </div>
              </div>
            </section>
          )}

          {/* Event */}
          {event && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">Event</h3>
              <div className="rounded-xl border border-ink-100 bg-ink-50 p-4 space-y-2 text-sm text-ink-700">
                <p className="font-semibold text-ink-900">{event.name}</p>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-ink-400" />
                  <span>{formatDate(event.date, 'dd MMM yyyy')}</span>
                  {event.startTime && (
                    <>
                      <Clock className="w-3.5 h-3.5 text-ink-400 ml-2" />
                      <span>{event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}</span>
                    </>
                  )}
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

          {/* Assignment */}
          {assignment && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">Assignment</h3>
              <div className="rounded-xl border border-ink-100 bg-ink-50 p-4 text-sm text-ink-700">
                <p><span className="text-ink-500">Role:</span> {assignment.role}</p>
                <p className="mt-1"><span className="text-ink-500">Status:</span> {assignment.status}</p>
              </div>
            </section>
          )}

          {/* Check-in / Check-out */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">Timing</h3>
            <div className="rounded-xl border border-ink-100 bg-ink-50 p-4 space-y-2 text-sm text-ink-700">
              <div className="flex items-center justify-between">
                <span className="text-ink-500">Check-in</span>
                <span className="font-medium">{formatDateTime(attendance.checkIn)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-500">Check-out</span>
                <span className="font-medium">{formatDateTime(attendance.checkOut)}</span>
              </div>
            </div>
          </section>

          {/* Remarks */}
          {attendance.remarks && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">Remarks</h3>
              <p className="text-sm text-ink-700 whitespace-pre-wrap">{attendance.remarks}</p>
            </section>
          )}

          {/* Meta */}
          <section className="text-xs text-ink-400 space-y-1 border-t border-ink-100 pt-4">
            {markedBy && <p>Marked by {markedBy.name}</p>}
            <p>Created {formatDate(attendance.createdAt, 'dd MMM yyyy HH:mm')}</p>
            <p>Updated {formatDate(attendance.updatedAt, 'dd MMM yyyy HH:mm')}</p>
          </section>
        </div>
      </div>
    </>
  );
}

// ── Create drawer ─────────────────────────────────────────────────────────────

const createSchema = z.object({
  eventId: z.string().min(1, 'Event is required'),
  assignmentId: z.string().min(1, 'Assignment is required'),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  status: z.enum(['PRESENT', 'LATE', 'NO_SHOW', 'COMPLETED']).optional(),
  remarks: z.string().optional(),
});

type CreateFormValues = z.infer<typeof createSchema>;

function CreateAttendanceDrawer({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (a: Attendance) => void;
}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      eventService.findAll({ limit: 200, status: 'CONFIRMED' }),
      eventService.findAll({ limit: 200, status: 'IN_PROGRESS' }),
    ])
      .then(([c, i]) => setEvents([...c.data, ...i.data]))
      .catch(() => {})
      .finally(() => setLoadingEvents(false));
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateFormValues>({ resolver: zodResolver(createSchema) });

  const selectedEventId = watch('eventId');

  useEffect(() => {
    if (!selectedEventId) {
      setAssignments([]);
      setValue('assignmentId', '');
      return;
    }
    setLoadingAssignments(true);
    assignmentService.findAllForEvent(selectedEventId)
      .then((data) => setAssignments(data))
      .catch(() => setAssignments([]))
      .finally(() => setLoadingAssignments(false));
  }, [selectedEventId, setValue]);

  const onSubmit = async (values: CreateFormValues) => {
    setServerError(null);
    const assignment = assignments.find((a) => a.id === values.assignmentId);
    if (!assignment) {
      setServerError('Selected assignment not found');
      return;
    }
    try {
      const saved = await attendanceService.create({
        eventId: values.eventId,
        staffId: assignment.staff!.id,
        assignmentId: values.assignmentId,
        checkIn: toISO(values.checkIn),
        checkOut: toISO(values.checkOut),
        status: values.status ?? 'PRESENT',
        remarks: values.remarks || undefined,
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
          <h2 className="text-lg font-semibold text-ink-900">Mark Attendance</h2>
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
              <select {...register('eventId')} disabled={loadingEvents} className={inputCls(!!errors.eventId)}>
                <option value="">{loadingEvents ? 'Loading events…' : 'Select an event'}</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} — {formatDate(e.date, 'dd MMM yyyy')}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Staff Assignment *" error={errors.assignmentId?.message}>
              <select
                {...register('assignmentId')}
                disabled={!selectedEventId || loadingAssignments}
                className={inputCls(!!errors.assignmentId)}
              >
                <option value="">
                  {!selectedEventId
                    ? 'Select an event first'
                    : loadingAssignments
                    ? 'Loading assignments…'
                    : assignments.length === 0
                    ? 'No assignments found'
                    : 'Select a staff member'}
                </option>
                {assignments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.staff?.fullName ?? a.id} — {a.role}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Status *">
              <select {...register('status')} className={inputCls()}>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_MAP[s].label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Check-in Time" error={errors.checkIn?.message}>
              <input
                type="datetime-local"
                {...register('checkIn')}
                className={inputCls(!!errors.checkIn)}
              />
            </FormField>

            <FormField label="Check-out Time" error={errors.checkOut?.message}>
              <input
                type="datetime-local"
                {...register('checkOut')}
                className={inputCls(!!errors.checkOut)}
              />
            </FormField>

            <FormField label="Remarks" error={errors.remarks?.message}>
              <textarea
                {...register('remarks')}
                rows={3}
                placeholder="Any observations or notes…"
                className={inputCls(!!errors.remarks) + ' resize-none'}
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
              disabled={isSubmitting || loadingEvents}
              className="inline-flex items-center gap-2 rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Mark Attendance
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ── Edit drawer ───────────────────────────────────────────────────────────────

const editSchema = z.object({
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  status: z.enum(['PRESENT', 'LATE', 'NO_SHOW', 'COMPLETED']),
  remarks: z.string().optional(),
});

type EditFormValues = z.infer<typeof editSchema>;

function EditAttendanceDrawer({
  attendance,
  onClose,
  onSaved,
}: {
  attendance: Attendance;
  onClose: () => void;
  onSaved: (a: Attendance) => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      checkIn: toDatetimeLocal(attendance.checkIn),
      checkOut: toDatetimeLocal(attendance.checkOut),
      status: attendance.status,
      remarks: attendance.remarks ?? '',
    },
  });

  const onSubmit = async (values: EditFormValues) => {
    setServerError(null);
    try {
      const saved = await attendanceService.update(attendance.id, {
        checkIn: toISO(values.checkIn),
        checkOut: toISO(values.checkOut),
        status: values.status,
        remarks: values.remarks || undefined,
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
          <h2 className="text-lg font-semibold text-ink-900">Edit Attendance</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-ink-100 bg-ink-50">
          <p className="text-sm font-medium text-ink-800">{attendance.staff?.fullName}</p>
          <p className="text-xs text-ink-500">{attendance.event?.name}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {serverError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {serverError}
              </div>
            )}

            <FormField label="Status *" error={errors.status?.message}>
              <select {...register('status')} className={inputCls(!!errors.status)}>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_MAP[s].label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Check-in Time" error={errors.checkIn?.message}>
              <input
                type="datetime-local"
                {...register('checkIn')}
                className={inputCls(!!errors.checkIn)}
              />
            </FormField>

            <FormField label="Check-out Time" error={errors.checkOut?.message}>
              <input
                type="datetime-local"
                {...register('checkOut')}
                className={inputCls(!!errors.checkOut)}
              />
            </FormField>

            <FormField label="Remarks" error={errors.remarks?.message}>
              <textarea
                {...register('remarks')}
                rows={3}
                placeholder="Any observations or notes…"
                className={inputCls(!!errors.remarks) + ' resize-none'}
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

// ── Delete confirm modal ──────────────────────────────────────────────────────

function DeleteConfirmModal({
  attendance,
  onClose,
  onConfirm,
}: {
  attendance: Attendance;
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
              <h3 className="text-base font-semibold text-ink-900">Delete Record</h3>
              <p className="text-xs text-ink-500">This action cannot be undone</p>
            </div>
          </div>
          <p className="text-sm text-ink-700 mb-1">
            Delete attendance for <strong>{attendance.staff?.fullName}</strong>?
          </p>
          <p className="text-xs text-ink-500 mb-5">
            Event: {attendance.event?.name}
          </p>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={deleting}
              className="rounded-lg px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100 transition-colors"
            >
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

export interface AttendanceTableProps {
  attendances: Attendance[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  search: string;
  statusFilter: AttendanceStatus | '';
  onSearchChange: (v: string) => void;
  onStatusChange: (v: AttendanceStatus | '') => void;
  onPageChange: (p: number) => void;
  canPrev: boolean;
  canNext: boolean;
}

export default function AttendanceTable({
  attendances,
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
}: AttendanceTableProps) {
  const { addAttendance, updateAttendance, removeAttendance } = useAttendanceStore();

  const [viewItem, setViewItem] = useState<Attendance | null>(null);
  const [editItem, setEditItem] = useState<Attendance | null>(null);
  const [deleteItem, setDeleteItem] = useState<Attendance | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search staff or event…"
              className="w-full rounded-lg border border-ink-200 pl-9 pr-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-ink-200"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as AttendanceStatus | '')}
            className="rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-700 focus:outline-none focus:ring-2 focus:ring-ink-200"
          >
            <option value="">All Statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_MAP[s].label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Mark Attendance
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-ink-200 bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-ink-400" />
          </div>
        ) : attendances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-ink-400">
            <ClipboardList className="w-10 h-10 mb-3" />
            <p className="text-sm font-medium">No attendance records found</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-ink-100">
            <thead className="bg-ink-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">
                  Staff
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">
                  Check-in
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">
                  Check-out
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {attendances.map((a) => (
                <tr key={a.id} className="hover:bg-ink-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100 text-xs font-semibold text-ink-600">
                        {getInitials(a.staff?.fullName ?? '?')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink-900">{a.staff?.fullName ?? '—'}</p>
                        <p className="text-xs text-ink-500">{a.assignment?.role ?? a.staff?.role ?? ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-ink-900">{a.event?.name ?? '—'}</p>
                    <p className="text-xs text-ink-500">
                      {a.event ? formatDate(a.event.date, 'dd MMM yyyy') : ''}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-700">
                    {a.checkIn ? (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs">{formatDateTime(a.checkIn)}</span>
                      </div>
                    ) : (
                      <span className="text-ink-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-700">
                    {a.checkOut ? (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-xs">{formatDateTime(a.checkOut)}</span>
                      </div>
                    ) : (
                      <span className="text-ink-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <StatusSelect attendanceId={a.id} current={a.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <span title="View Details">
                        <button
                          onClick={() => setViewItem(a)}
                          className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </span>
                      <span title="Edit">
                        <button
                          onClick={() => setEditItem(a)}
                          className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </span>
                      <span title="Delete">
                        <button
                          onClick={() => setDeleteItem(a)}
                          className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </span>
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
            Showing {attendances.length} of {total} records
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
        <CreateAttendanceDrawer
          onClose={() => setShowCreate(false)}
          onSaved={(saved) => {
            addAttendance(saved);
            setShowCreate(false);
          }}
        />
      )}

      {viewItem && (
        <AttendanceDrawer
          attendance={viewItem}
          onClose={() => setViewItem(null)}
          onEdit={() => {
            setEditItem(viewItem);
            setViewItem(null);
          }}
        />
      )}

      {editItem && (
        <EditAttendanceDrawer
          attendance={editItem}
          onClose={() => setEditItem(null)}
          onSaved={(saved) => {
            updateAttendance(saved);
            setEditItem(null);
          }}
        />
      )}

      {deleteItem && (
        <DeleteConfirmModal
          attendance={deleteItem}
          onClose={() => setDeleteItem(null)}
          onConfirm={async () => {
            await attendanceService.remove(deleteItem.id);
            removeAttendance(deleteItem.id);
            setDeleteItem(null);
          }}
        />
      )}
    </div>
  );
}
