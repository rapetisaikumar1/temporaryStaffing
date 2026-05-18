'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Loader2,
  X,
  Plus,
  Trash2,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  Star,
  Calendar,
  Briefcase,
  Tag,
  Upload,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { Staff, StaffDocument, StaffStatus, DocumentType } from '@/types/staff.types';
import { staffService } from '@/services/staff.service';
import { useStaffStore } from '@/store/staffStore';
import { cn, formatDate, getInitials } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<StaffStatus, { label: string; className: string }> = {
  ACTIVE: { label: 'Active', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  AVAILABLE: { label: 'Available', className: 'bg-blue-50 text-blue-700 ring-blue-200' },
  ASSIGNED: { label: 'Assigned', className: 'bg-purple-50 text-purple-700 ring-purple-200' },
  INACTIVE: { label: 'Inactive', className: 'bg-ink-100 text-ink-500 ring-ink-200' },
  BLACKLISTED: { label: 'Blacklisted', className: 'bg-red-50 text-red-700 ring-red-200' },
};

const ALL_STATUSES: StaffStatus[] = ['ACTIVE', 'AVAILABLE', 'ASSIGNED', 'INACTIVE', 'BLACKLISTED'];

function StatusBadge({ status }: { status: StaffStatus }) {
  const { label, className } = STATUS_MAP[status];
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1', className)}>
      {label}
    </span>
  );
}

// ── Zod schema ────────────────────────────────────────────────────────────────

const staffSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().email('Enter a valid email address'),
  city: z.string().min(2, 'City is required').max(100),
  role: z.string().min(2, 'Role is required').max(100),
  skills: z.string().optional(), // comma-separated input → split on save
  experienceYears: z.number().int().min(0).max(50).optional(),
  availability: z.boolean().optional(),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

type StaffFormValues = z.infer<typeof staffSchema>;

// ── Detail drawer ─────────────────────────────────────────────────────────────

function StaffDrawer({
  staff,
  onClose,
  onEdit,
}: {
  staff: Staff;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
          <h2 className="text-lg font-semibold text-ink-900">Staff Details</h2>
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
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-900 text-white font-semibold text-lg shrink-0">
              {getInitials(staff.fullName)}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-ink-900 truncate">{staff.fullName}</h3>
              <p className="text-sm text-ink-500">{staff.role}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <StatusBadge status={staff.status} />
                {staff.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 ring-blue-200 ring-1 px-2.5 py-0.5 text-xs font-medium">
                    <UserCheck className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contact */}
          <DrawerSection title="Contact">
            <DrawerRow icon={<Mail className="w-4 h-4" />} label="Email" value={staff.email} />
            <DrawerRow icon={<Phone className="w-4 h-4" />} label="Phone" value={staff.phone} />
            <DrawerRow icon={<MapPin className="w-4 h-4" />} label="City" value={staff.city} />
          </DrawerSection>

          {/* Professional */}
          <DrawerSection title="Professional">
            <DrawerRow icon={<Briefcase className="w-4 h-4" />} label="Role" value={staff.role} />
            <DrawerRow
              icon={<Star className="w-4 h-4" />}
              label="Experience"
              value={`${staff.experienceYears} year${staff.experienceYears !== 1 ? 's' : ''}`}
            />
            {staff.rating != null && (
              <DrawerRow
                icon={<Star className="w-4 h-4" />}
                label="Rating"
                value={`${staff.rating.toFixed(1)} / 5.0`}
              />
            )}
            <DrawerRow
              icon={<Tag className="w-4 h-4" />}
              label="Availability"
              value={staff.availability ? 'Available for booking' : 'Not available'}
            />
          </DrawerSection>

          {/* Skills */}
          {staff.skills.length > 0 && (
            <DrawerSection title="Skills">
              <div className="flex flex-wrap gap-2">
                {staff.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-ink-100 px-3 py-1 text-xs text-ink-700 font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </DrawerSection>
          )}

          {/* Activity */}
          {staff._count && (
            <DrawerSection title="Activity">
              <div className="grid grid-cols-1 gap-3">
                <CountCard label="Total Assignments" value={staff._count.assignments} />
              </div>
            </DrawerSection>
          )}

          {/* Notes */}
          {staff.notes && (
            <DrawerSection title="Notes">
              <p className="text-sm text-ink-600 whitespace-pre-wrap">{staff.notes}</p>
            </DrawerSection>
          )}

          {/* Documents */}
          <StaffDocumentsSection staffId={staff.id} />

          {/* Meta */}
          <DrawerSection title="Record Info">
            <DrawerRow
              icon={<Calendar className="w-4 h-4" />}
              label="Registered"
              value={formatDate(staff.createdAt, 'dd MMM yyyy, HH:mm')}
            />
            {staff.createdBy && (
              <DrawerRow
                icon={<Calendar className="w-4 h-4" />}
                label="Added by"
                value={staff.createdBy.name}
              />
            )}
          </DrawerSection>
        </div>
      </div>
    </>
  );
}

// ── Staff Documents Section ──────────────────────────────────────────────────

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  ID_PROOF: 'ID Proof',
  PHOTO: 'Photo',
  CERTIFICATE: 'Certificate',
  CONTRACT: 'Contract',
  OTHER: 'Other',
};

const DOC_TYPE_COLORS: Record<DocumentType, string> = {
  ID_PROOF: 'bg-blue-50 text-blue-700 ring-blue-200',
  PHOTO: 'bg-purple-50 text-purple-700 ring-purple-200',
  CERTIFICATE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  CONTRACT: 'bg-amber-50 text-amber-700 ring-amber-200',
  OTHER: 'bg-ink-100 text-ink-600 ring-ink-200',
};

const ALL_DOC_TYPES: DocumentType[] = ['ID_PROOF', 'PHOTO', 'CERTIFICATE', 'CONTRACT', 'OTHER'];

function StaffDocumentsSection({ staffId }: { staffId: string }) {
  const [docs, setDocs] = useState<StaffDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<DocumentType>('ID_PROOF');
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchDocs = useCallback(async () => {
    try {
      const data = await staffService.getDocuments(staffId);
      setDocs(data);
    } catch {
      // supplementary — silently ignore
    } finally {
      setLoading(false);
    }
  }, [staffId]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const doc = await staffService.uploadDocument(staffId, file, selectedType);
      setDocs((prev) => [doc, ...prev]);
    } catch {
      setError('Upload failed. Check file size (max 5 MB) and format.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async (docId: string) => {
    setDeletingId(docId);
    try {
      await staffService.deleteDocument(staffId, docId);
      setDocs((prev) => prev.filter((d) => d.id !== docId));
    } catch {
      // silently ignore
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-ink-400 uppercase tracking-wider">
          Documents
        </h4>
        <span className="text-xs text-ink-400">{docs.length} file{docs.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Upload strip */}
      <div className="flex gap-2 mb-3">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as DocumentType)}
          className="flex-1 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs text-ink-700 outline-none focus:border-indigo-400"
        >
          {ALL_DOC_TYPES.map((t) => (
            <option key={t} value={t}>{DOC_TYPE_LABELS[t]}</option>
          ))}
        </select>
        <label
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
            uploading
              ? 'bg-ink-100 text-ink-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700',
          )}
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          {uploading ? 'Uploading\u2026' : 'Upload'}
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            disabled={uploading}
            onChange={handleUpload}
          />
        </label>
      </div>

      {error && (
        <p className="mb-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      )}

      {/* Document list */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-ink-300" />
        </div>
      ) : docs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-200 py-6 text-center">
          <FileText className="w-6 h-6 text-ink-300 mx-auto mb-1" />
          <p className="text-xs text-ink-400">No documents uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50 px-3 py-2.5"
            >
              <FileText className="w-4 h-4 text-ink-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium ring-1', DOC_TYPE_COLORS[doc.type as DocumentType] ?? DOC_TYPE_COLORS.OTHER)}>
                  {DOC_TYPE_LABELS[doc.type as DocumentType] ?? doc.type}
                </span>
                <p className="text-xs text-ink-400 mt-0.5">
                  {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg p-1.5 text-ink-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  title="View document"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => handleDelete(doc.id)}
                  disabled={deletingId === doc.id}
                  className="rounded-lg p-1.5 text-ink-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  title="Delete document"
                >
                  {deletingId === doc.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
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

function CountCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-ink-50 px-3 py-2.5 text-center">
      <p className="text-2xl font-bold text-ink-900">{value}</p>
      <p className="text-xs text-ink-500 mt-0.5">{label}</p>
    </div>
  );
}

// ── Form drawer ───────────────────────────────────────────────────────────────

function StaffFormDrawer({
  staff,
  onClose,
  onSaved,
}: {
  staff: Staff | null;
  onClose: () => void;
  onSaved: (saved: Staff) => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = !!staff;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      fullName: staff?.fullName ?? '',
      phone: staff?.phone ?? '',
      email: staff?.email ?? '',
      city: staff?.city ?? '',
      role: staff?.role ?? '',
      skills: staff?.skills?.join(', ') ?? '',
      experienceYears: staff?.experienceYears ?? 0,
      availability: staff?.availability ?? true,
      notes: staff?.notes ?? '',
    },
  });

  const onSubmit = async (values: StaffFormValues) => {
    setServerError(null);
    try {
      const payload = {
        fullName: values.fullName,
        phone: values.phone,
        email: values.email,
        city: values.city,
        role: values.role,
        skills: values.skills
          ? values.skills.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        experienceYears: values.experienceYears ?? 0,
        availability: values.availability ?? true,
        notes: values.notes || undefined,
      };

      const saved = isEdit
        ? await staffService.update(staff.id, payload)
        : await staffService.create(payload);

      onSaved(saved);
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
            {isEdit ? 'Edit Staff Member' : 'Register Staff Member'}
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

            <FormField label="Full Name *" error={errors.fullName?.message}>
              <input
                {...register('fullName')}
                placeholder="Priya Mehta"
                className={inputCls(!!errors.fullName)}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Phone *" error={errors.phone?.message}>
                <input
                  {...register('phone')}
                  placeholder="9876543210"
                  maxLength={10}
                  className={inputCls(!!errors.phone)}
                />
              </FormField>

              <FormField label="Email *" error={errors.email?.message}>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="priya@example.com"
                  className={inputCls(!!errors.email)}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="City *" error={errors.city?.message}>
                <input
                  {...register('city')}
                  placeholder="Bengaluru"
                  className={inputCls(!!errors.city)}
                />
              </FormField>

              <FormField label="Role *" error={errors.role?.message}>
                <input
                  {...register('role')}
                  placeholder="Host, Promoter…"
                  className={inputCls(!!errors.role)}
                />
              </FormField>
            </div>

            <FormField
              label="Skills"
              error={errors.skills?.message}
              hint="Comma-separated: Communication, Grooming, Bilingual"
            >
              <input
                {...register('skills')}
                placeholder="Communication, Grooming, Bilingual"
                className={inputCls(!!errors.skills)}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Experience (years)" error={errors.experienceYears?.message}>
                <input
                  {...register('experienceYears', { valueAsNumber: true })}
                  type="number"
                  min={0}
                  max={50}
                  placeholder="2"
                  className={inputCls(!!errors.experienceYears)}
                />
              </FormField>

              <FormField label="Availability" error={undefined}>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    {...register('availability')}
                    type="checkbox"
                    id="availability"
                    className="h-4 w-4 rounded border-ink-300 text-ink-900 focus:ring-ink-900"
                  />
                  <label htmlFor="availability" className="text-sm text-ink-700">
                    Available for booking
                  </label>
                </div>
              </FormField>
            </div>

            <FormField label="Internal Notes" error={errors.notes?.message}>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder="Any internal notes about this staff member…"
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
              {isEdit ? 'Save Changes' : 'Register Staff'}
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

// ── Status inline selector ────────────────────────────────────────────────────

function StatusSelect({ staffId, current }: { staffId: string; current: StaffStatus }) {
  const { updateStaffStatus } = useStaffStore();
  const [updating, setUpdating] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as StaffStatus;
    if (next === current) return;
    setUpdating(true);
    try {
      await staffService.updateStatus(staffId, next);
      updateStaffStatus(staffId, next);
    } catch {
      // revert silently — store keeps original
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

// ── Main table ────────────────────────────────────────────────────────────────

interface StaffTableProps {
  staffList: Staff[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  search: string;
  statusFilter: StaffStatus | '';
  onSearchChange: (v: string) => void;
  onStatusChange: (v: StaffStatus | '') => void;
  onPageChange: (n: number) => void;
  canPrev: boolean;
  canNext: boolean;
}

export default function StaffTable({
  staffList,
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
}: StaffTableProps) {
  const { addStaff, updateStaff, removeStaff } = useStaffStore();

  const [viewStaff, setViewStaff] = useState<Staff | null>(null);
  const [editStaff, setEditStaff] = useState<Staff | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleView = (s: Staff) => setViewStaff(s);

  const handleEdit = (s: Staff) => {
    setEditStaff(s);
    setShowForm(true);
    setViewStaff(null);
  };

  const handleNew = () => {
    setEditStaff(null);
    setShowForm(true);
  };

  const handleSaved = (saved: Staff) => {
    if (editStaff) {
      updateStaff(saved);
    } else {
      addStaff(saved);
    }
    setShowForm(false);
  };

  const handleDelete = async (s: Staff) => {
    if (!confirm(`Permanently remove ${s.fullName} from staff list? This cannot be undone.`)) return;
    setDeletingId(s.id);
    try {
      await staffService.softDelete(s.id);
      removeStaff(s.id);
    } catch {
      // leave as-is
    } finally {
      setDeletingId(null);
    }
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
            placeholder="Search name, email, phone, city, role…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-ink-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ink-900"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as StaffStatus | '')}
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
          Register Staff
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm border border-ink-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-ink-400" />
          </div>
        ) : staffList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-ink-400">
            <Briefcase className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No staff members found</p>
            <p className="text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/60">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider hidden md:table-cell">
                    Contact
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider hidden lg:table-cell">
                    Experience
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider hidden sm:table-cell">
                    Added
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-ink-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {staffList.map((s) => (
                  <tr key={s.id} className="hover:bg-ink-50/60 transition-colors">
                    {/* Name + role */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-900 text-white text-xs font-semibold">
                          {getInitials(s.fullName)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-ink-900">{s.fullName}</p>
                            {s.isVerified && (
                              <span title="Verified">
                                <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-ink-500">{s.role} · {s.city}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-ink-700">{s.email}</p>
                      <p className="text-xs text-ink-500 mt-0.5">{s.phone}</p>
                    </td>

                    {/* Experience */}
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <p className="text-ink-700 text-xs">
                        {s.experienceYears} yr{s.experienceYears !== 1 ? 's' : ''}
                        {s._count ? ` · ${s._count.assignments} assignments` : ''}
                      </p>
                      {s.skills.length > 0 && (
                        <p className="text-xs text-ink-400 mt-0.5 truncate max-w-[160px]">
                          {s.skills.slice(0, 3).join(', ')}
                          {s.skills.length > 3 ? ` +${s.skills.length - 3}` : ''}
                        </p>
                      )}
                    </td>

                    {/* Status — inline change */}
                    <td className="px-5 py-3.5">
                      <StatusSelect staffId={s.id} current={s.status} />
                    </td>

                    {/* Added */}
                    <td className="px-5 py-3.5 hidden sm:table-cell text-xs text-ink-500">
                      {formatDate(s.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleView(s)}
                          title="View details"
                          className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(s)}
                          title="Edit"
                          className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s)}
                          disabled={deletingId === s.id}
                          title="Remove"
                          className={cn(
                            'rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors',
                            deletingId === s.id && 'opacity-50 cursor-not-allowed',
                          )}
                        >
                          {deletingId === s.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
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
              {total} staff member{total !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={!canPrev}
                className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-ink-500">
                {page} / {totalPages}
              </span>
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
      {viewStaff && (
        <StaffDrawer
          staff={viewStaff}
          onClose={() => setViewStaff(null)}
          onEdit={() => handleEdit(viewStaff)}
        />
      )}

      {showForm && (
        <StaffFormDrawer
          staff={editStaff}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
