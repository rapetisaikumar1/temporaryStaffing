'use client';

import { useState } from 'react';
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
  Users,
  CalendarDays,
  MapPin,
  Clock,
  UserCheck,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { Assignment, AssignmentStatus } from '@/types/assignment.types';
import { assignmentService } from '@/services/assignment.service';
import { staffService } from '@/services/staff.service';
import { eventService } from '@/services/event.service';
import { Staff } from '@/types/staff.types';
import { Event } from '@/types/event.types';
import { useAssignmentStore } from '@/store/assignmentStore';
import { cn, formatDate, getInitials } from '@/lib/utils';
import { useEffect } from 'react';

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<AssignmentStatus, { label: string; className: string }> = {
  ASSIGNED: { label: 'Assigned', className: 'bg-blue-50 text-blue-700 ring-blue-200' },
  ACCEPTED: { label: 'Accepted', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  REJECTED: { label: 'Rejected', className: 'bg-red-50 text-red-600 ring-red-200' },
  COMPLETED: { label: 'Completed', className: 'bg-purple-50 text-purple-700 ring-purple-200' },
  NO_SHOW: { label: 'No Show', className: 'bg-orange-50 text-orange-700 ring-orange-200' },
};

const ALL_STATUSES: AssignmentStatus[] = [
  'ASSIGNED', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'NO_SHOW',
];

function StatusBadge({ status }: { status: AssignmentStatus }) {
  const { label, className } = STATUS_MAP[status];
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1', className)}>
      {label}
    </span>
  );
}

// ── Inline status selector ────────────────────────────────────────────────────

function StatusSelect({ assignmentId, current }: { assignmentId: string; current: AssignmentStatus }) {
  const { updateAssignmentStatus } = useAssignmentStore();
  const [updating, setUpdating] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as AssignmentStatus;
    if (next === current) return;
    setUpdating(true);
    try {
      await assignmentService.update(assignmentId, { status: next });
      updateAssignmentStatus(assignmentId, next);
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

function AssignmentDrawer({
  assignment,
  onClose,
  onEdit,
}: {
  assignment: Assignment;
  onClose: () => void;
  onEdit: () => void;
}) {
  const { event, staff } = assignment;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
          <h2 className="text-lg font-semibold text-ink-900">Assignment Details</h2>
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
          {/* Status + role */}
          <div>
            <p className="text-sm font-medium text-ink-900">{assignment.role}</p>
            <div className="mt-2">
              <StatusBadge status={assignment.status} />
            </div>
          </div>

          {/* Staff info */}
          <DrawerSection title="Staff Member">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-ink-900 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                {getInitials(staff.fullName)}
              </div>
              <div>
                <p className="text-sm font-medium text-ink-900">{staff.fullName}</p>
                <p className="text-xs text-ink-500">{staff.email}</p>
              </div>
            </div>
            <DrawerRow icon={<FileText className="w-4 h-4" />} label="Phone" value={staff.phone} />
            <DrawerRow icon={<MapPin className="w-4 h-4" />} label="City" value={staff.city} />
            <DrawerRow icon={<UserCheck className="w-4 h-4" />} label="Role" value={staff.role} />
          </DrawerSection>

          {/* Event info */}
          <DrawerSection title="Event">
            <DrawerRow icon={<CalendarDays className="w-4 h-4" />} label="Event" value={event.name} />
            <DrawerRow icon={<FileText className="w-4 h-4" />} label="Type" value={event.type} />
            <DrawerRow icon={<CalendarDays className="w-4 h-4" />} label="Date" value={formatDate(event.date, 'dd MMM yyyy')} />
            <DrawerRow icon={<Clock className="w-4 h-4" />} label="Time" value={`${event.startTime} – ${event.endTime}`} />
            <DrawerRow icon={<MapPin className="w-4 h-4" />} label="Location" value={event.location} />
          </DrawerSection>

          {assignment.notes && (
            <DrawerSection title="Notes">
              <p className="text-sm text-ink-600 whitespace-pre-wrap">{assignment.notes}</p>
            </DrawerSection>
          )}

          <DrawerSection title="Record Info">
            <DrawerRow
              icon={<CalendarDays className="w-4 h-4" />}
              label="Assigned On"
              value={formatDate(assignment.assignedAt, 'dd MMM yyyy, HH:mm')}
            />
            {assignment.createdBy && (
              <DrawerRow
                icon={<FileText className="w-4 h-4" />}
                label="Assigned By"
                value={assignment.createdBy.name}
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

// ── Zod schema ────────────────────────────────────────────────────────────────

const createSchema = z.object({
  eventId: z.string().min(1, 'Event is required'),
  staffId: z.string().min(1, 'Staff member is required'),
  role: z.string().min(1, 'Role is required').max(100),
  notes: z.string().max(500).optional().or(z.literal('')),
});

const editSchema = z.object({
  role: z.string().min(1, 'Role is required').max(100),
  notes: z.string().max(500).optional().or(z.literal('')),
});

type CreateFormValues = z.infer<typeof createSchema>;
type EditFormValues = z.infer<typeof editSchema>;

// ── Create form drawer ────────────────────────────────────────────────────────

function CreateAssignmentDrawer({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (a: Assignment) => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    Promise.all([
      eventService.findAll({ limit: 200, status: 'CONFIRMED' }),
      staffService.findAll({ limit: 200, status: 'ACTIVE' }),
    ])
      .then(([evRes, stRes]) => {
        setEvents(evRes.data);
        setStaffList(stRes.data);
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
      const saved = await assignmentService.create({
        eventId: values.eventId,
        staffId: values.staffId,
        role: values.role,
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
          <h2 className="text-lg font-semibold text-ink-900">New Assignment</h2>
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
                <option value="">{loadingData ? 'Loading events…' : 'Select an event'}</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} — {formatDate(e.date, 'dd MMM yyyy')}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Staff Member *" error={errors.staffId?.message}>
              <select {...register('staffId')} disabled={loadingData} className={inputCls(!!errors.staffId)}>
                <option value="">{loadingData ? 'Loading staff…' : 'Select a staff member'}</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.city}) — {s.role}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Role at Event *" error={errors.role?.message}>
              <input
                {...register('role')}
                placeholder="Host, Usher, Security Guard…"
                className={inputCls(!!errors.role)}
              />
            </FormField>

            <FormField label="Notes" error={errors.notes?.message}>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder="Any special instructions…"
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
              className="inline-flex items-center gap-2 rounded-lg bg-ink-900 px-5 py-2 text-sm font-medium text-white hover:bg-ink-700 disabled:opacity-60 transition-colors"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Assign Staff
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ── Edit form drawer ──────────────────────────────────────────────────────────

function EditAssignmentDrawer({
  assignment,
  onClose,
  onSaved,
}: {
  assignment: Assignment;
  onClose: () => void;
  onSaved: (a: Assignment) => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      role: assignment.role,
      notes: assignment.notes ?? '',
    },
  });

  const onSubmit = async (values: EditFormValues) => {
    setServerError(null);
    try {
      const saved = await assignmentService.update(assignment.id, {
        role: values.role,
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
          <h2 className="text-lg font-semibold text-ink-900">Edit Assignment</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="rounded-xl bg-ink-50 border border-ink-100 px-4 py-3 text-sm">
            <p className="font-medium text-ink-900">{assignment.staff.fullName}</p>
            <p className="text-ink-500 text-xs mt-0.5">→ {assignment.event.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {serverError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {serverError}
              </div>
            )}

            <FormField label="Role at Event *" error={errors.role?.message}>
              <input {...register('role')} className={inputCls(!!errors.role)} />
            </FormField>

            <FormField label="Notes" error={errors.notes?.message}>
              <textarea
                {...register('notes')}
                rows={3}
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
              className="inline-flex items-center gap-2 rounded-lg bg-ink-900 px-5 py-2 text-sm font-medium text-white hover:bg-ink-700 disabled:opacity-60 transition-colors"
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
  assignment,
  onClose,
  onConfirm,
}: {
  assignment: Assignment;
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
    <>
      <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink-900">Remove Assignment</h3>
              <p className="text-xs text-ink-500 mt-0.5">This action cannot be undone</p>
            </div>
          </div>
          <p className="text-sm text-ink-600 mb-5">
            Remove <span className="font-medium">{assignment.staff.fullName}</span> from{' '}
            <span className="font-medium">{assignment.event.name}</span>?
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
              Remove
            </button>
          </div>
        </div>
      </div>
    </>
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

interface AssignmentTableProps {
  assignments: Assignment[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  search: string;
  statusFilter: AssignmentStatus | '';
  onSearchChange: (v: string) => void;
  onStatusChange: (v: AssignmentStatus | '') => void;
  onPageChange: (n: number) => void;
  canPrev: boolean;
  canNext: boolean;
}

export default function AssignmentTable({
  assignments,
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
}: AssignmentTableProps) {
  const { addAssignment, updateAssignment, removeAssignment } = useAssignmentStore();

  const [viewAssignment, setViewAssignment] = useState<Assignment | null>(null);
  const [editAssignment, setEditAssignment] = useState<Assignment | null>(null);
  const [deleteAssignment, setDeleteAssignment] = useState<Assignment | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const handleSaved = (saved: Assignment) => {
    if (editAssignment) {
      updateAssignment(saved);
      setEditAssignment(null);
    } else {
      addAssignment(saved);
      setShowCreate(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteAssignment) return;
    await assignmentService.remove(deleteAssignment.id);
    removeAssignment(deleteAssignment.id);
    setDeleteAssignment(null);
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
            placeholder="Search staff, event, role…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-ink-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ink-900"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as AssignmentStatus | '')}
          className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 focus:outline-none focus:ring-2 focus:ring-ink-900"
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_MAP[s].label}</option>
          ))}
        </select>

        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Assign Staff
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm border border-ink-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-ink-400" />
          </div>
        ) : assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-ink-400">
            <Users className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No assignments found</p>
            <p className="text-xs mt-1">Assign staff to events to see them here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/60">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Staff</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider hidden md:table-cell">Event</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-ink-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-ink-50/60 transition-colors">
                    {/* Staff */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-ink-900 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                          {getInitials(a.staff.fullName)}
                        </div>
                        <div>
                          <p className="font-medium text-ink-900">{a.staff.fullName}</p>
                          <p className="text-xs text-ink-400">{a.staff.city}</p>
                        </div>
                      </div>
                    </td>

                    {/* Event */}
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-sm text-ink-700 truncate max-w-[180px]">{a.event.name}</p>
                      <p className="text-xs text-ink-400 mt-0.5">{a.event.type}</p>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <p className="text-sm text-ink-700">{formatDate(a.event.date, 'dd MMM yyyy')}</p>
                      <p className="text-xs text-ink-400 mt-0.5">{a.event.startTime} – {a.event.endTime}</p>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-medium text-ink-700">
                        {a.role}
                      </span>
                    </td>

                    {/* Status — inline */}
                    <td className="px-5 py-3.5">
                      <StatusSelect assignmentId={a.id} current={a.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewAssignment(a)}
                          title="View details"
                          className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditAssignment(a)}
                          title="Edit assignment"
                          className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteAssignment(a)}
                          title="Remove assignment"
                          className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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
              {total} assignment{total !== 1 ? 's' : ''}
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
      {viewAssignment && (
        <AssignmentDrawer
          assignment={viewAssignment}
          onClose={() => setViewAssignment(null)}
          onEdit={() => {
            setEditAssignment(viewAssignment);
            setViewAssignment(null);
          }}
        />
      )}

      {editAssignment && (
        <EditAssignmentDrawer
          assignment={editAssignment}
          onClose={() => setEditAssignment(null)}
          onSaved={handleSaved}
        />
      )}

      {showCreate && (
        <CreateAssignmentDrawer
          onClose={() => setShowCreate(false)}
          onSaved={handleSaved}
        />
      )}

      {deleteAssignment && (
        <DeleteConfirmModal
          assignment={deleteAssignment}
          onClose={() => setDeleteAssignment(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
