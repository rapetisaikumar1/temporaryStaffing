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
  Loader2,
  X,
  Plus,
  Power,
  PowerOff,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Calendar,
} from 'lucide-react';
import { Client } from '@/types/client.types';
import { clientService } from '@/services/client.service';
import { useClientStore } from '@/store/clientStore';
import { cn, formatDate, getInitials } from '@/lib/utils';

// ── Zod schema ────────────────────────────────────────────────────────────────

const clientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  companyName: z.string().max(150).optional().or(z.literal('')),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().email('Enter a valid email address'),
  address: z.string().max(300).optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

type ClientFormValues = z.infer<typeof clientSchema>;

// ── Active badge ──────────────────────────────────────────────────────────────

function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1',
        isActive
          ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
          : 'bg-ink-100 text-ink-500 ring-ink-200',
      )}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

// ── Detail drawer ─────────────────────────────────────────────────────────────

function ClientDrawer({
  client,
  onClose,
  onEdit,
}: {
  client: Client;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
          <h2 className="text-lg font-semibold text-ink-900">Client Details</h2>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-900 text-white font-semibold text-lg">
              {getInitials(client.name)}
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink-900">{client.name}</h3>
              {client.companyName && (
                <p className="text-sm text-ink-500 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {client.companyName}
                </p>
              )}
              <div className="mt-1">
                <ActiveBadge isActive={client.isActive} />
              </div>
            </div>
          </div>

          {/* Contact */}
          <Section title="Contact Information">
            <DetailRow icon={<Mail className="w-4 h-4" />} label="Email" value={client.email} />
            <DetailRow icon={<Phone className="w-4 h-4" />} label="Phone" value={client.phone} />
            {client.address && (
              <DetailRow icon={<MapPin className="w-4 h-4" />} label="Address" value={client.address} />
            )}
          </Section>

          {/* Activity counts */}
          {client._count && (
            <Section title="Activity">
              <div className="grid grid-cols-3 gap-3">
                <CountCard label="Inquiries" value={client._count.inquiries} />
                <CountCard label="Events" value={client._count.events} />
                <CountCard label="Quotations" value={client._count.quotations} />
              </div>
            </Section>
          )}

          {/* Notes */}
          {client.notes && (
            <Section title="Notes">
              <p className="text-sm text-ink-600 whitespace-pre-wrap">{client.notes}</p>
            </Section>
          )}

          {/* Meta */}
          <Section title="Record Info">
            <DetailRow
              icon={<Calendar className="w-4 h-4" />}
              label="Created"
              value={formatDate(client.createdAt, 'dd MMM yyyy, HH:mm')}
            />
            {client.createdBy && (
              <DetailRow
                icon={<FileText className="w-4 h-4" />}
                label="Created by"
                value={client.createdBy.name}
              />
            )}
            <DetailRow
              icon={<Calendar className="w-4 h-4" />}
              label="Last updated"
              value={formatDate(client.updatedAt, 'dd MMM yyyy, HH:mm')}
            />
          </Section>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
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
      <p className="text-xl font-bold text-ink-900">{value}</p>
      <p className="text-xs text-ink-500 mt-0.5">{label}</p>
    </div>
  );
}

// ── Create / Edit form drawer ─────────────────────────────────────────────────

function ClientFormDrawer({
  client,
  onClose,
  onSaved,
}: {
  client: Client | null; // null = create mode
  onClose: () => void;
  onSaved: (saved: Client) => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client?.name ?? '',
      companyName: client?.companyName ?? '',
      phone: client?.phone ?? '',
      email: client?.email ?? '',
      address: client?.address ?? '',
      notes: client?.notes ?? '',
    },
  });

  const onSubmit = async (values: ClientFormValues) => {
    setServerError(null);
    try {
      const payload = {
        name: values.name,
        companyName: values.companyName || undefined,
        phone: values.phone,
        email: values.email,
        address: values.address || undefined,
        notes: values.notes || undefined,
      };

      const saved = client
        ? await clientService.update(client.id, payload)
        : await clientService.create(payload);

      onSaved(saved);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? 'Something went wrong. Please try again.';
      setServerError(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const isEdit = !!client;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
          <h2 className="text-lg font-semibold text-ink-900">
            {isEdit ? 'Edit Client' : 'New Client'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {serverError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {serverError}
              </div>
            )}

            <Field label="Full Name *" error={errors.name?.message}>
              <input
                {...register('name')}
                placeholder="Rahul Sharma"
                className={inputCls(!!errors.name)}
              />
            </Field>

            <Field label="Company Name" error={errors.companyName?.message}>
              <input
                {...register('companyName')}
                placeholder="Sharma Events Pvt Ltd"
                className={inputCls(!!errors.companyName)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone *" error={errors.phone?.message}>
                <input
                  {...register('phone')}
                  placeholder="9876543210"
                  maxLength={10}
                  className={inputCls(!!errors.phone)}
                />
              </Field>

              <Field label="Email *" error={errors.email?.message}>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="rahul@example.com"
                  className={inputCls(!!errors.email)}
                />
              </Field>
            </div>

            <Field label="Address" error={errors.address?.message}>
              <input
                {...register('address')}
                placeholder="12 MG Road, Bengaluru"
                className={inputCls(!!errors.address)}
              />
            </Field>

            <Field label="Notes" error={errors.notes?.message}>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder="Internal notes about this client…"
                className={inputCls(!!errors.notes) + ' resize-none'}
              />
            </Field>
          </div>

          {/* Footer */}
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
              {isEdit ? 'Save Changes' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function Field({
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

// ── Main Table ────────────────────────────────────────────────────────────────

type ActiveFilter = 'all' | 'active' | 'inactive';

interface ClientTableProps {
  clients: Client[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  search: string;
  activeFilter: ActiveFilter;
  onSearchChange: (v: string) => void;
  onActiveFilterChange: (v: ActiveFilter) => void;
  onPageChange: (n: number) => void;
  canPrev: boolean;
  canNext: boolean;
}

export default function ClientTable({
  clients,
  total,
  page,
  totalPages,
  isLoading,
  search,
  activeFilter,
  onSearchChange,
  onActiveFilterChange,
  onPageChange,
  canPrev,
  canNext,
}: ClientTableProps) {
  const { addClient, updateClient } = useClientStore();

  const [viewClient, setViewClient] = useState<Client | null>(null);
  const [editClient, setEditClient] = useState<Client | null | 'new'>('new' as any);
  const [showForm, setShowForm] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // viewing a client's details
  const handleView = (client: Client) => {
    setViewClient(client);
  };

  // open edit form for existing client
  const handleEdit = (client: Client) => {
    setEditClient(client);
    setShowForm(true);
    setViewClient(null);
  };

  // open create form
  const handleNew = () => {
    setEditClient(null);
    setShowForm(true);
  };

  // after save — add or update in store (instant UI)
  const handleSaved = (saved: Client) => {
    if (editClient) {
      updateClient(saved);
    } else {
      addClient(saved);
    }
    setShowForm(false);
  };

  // toggle active/inactive
  const handleToggleActive = async (client: Client) => {
    setTogglingId(client.id);
    try {
      const updated = client.isActive
        ? await clientService.deactivate(client.id)
        : await clientService.activate(client.id);
      updateClient(updated);
    } catch {
      // silently leave as-is — could add a toast here
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search name, company, email, phone…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-ink-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ink-900"
          />
        </div>

        {/* Filter */}
        <select
          value={activeFilter}
          onChange={(e) => onActiveFilterChange(e.target.value as ActiveFilter)}
          className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 focus:outline-none focus:ring-2 focus:ring-ink-900"
        >
          <option value="all">All Clients</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* New client */}
        <button
          onClick={handleNew}
          className="inline-flex items-center gap-2 rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Client
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm border border-ink-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-ink-400" />
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-ink-400">
            <Building2 className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No clients found</p>
            <p className="text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/60">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider hidden md:table-cell">
                    Contact
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider hidden lg:table-cell">
                    Activity
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
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-ink-50/60 transition-colors"
                  >
                    {/* Name + company */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-900 text-white text-xs font-semibold">
                          {getInitials(client.name)}
                        </div>
                        <div>
                          <p className="font-medium text-ink-900">{client.name}</p>
                          {client.companyName && (
                            <p className="text-xs text-ink-500">{client.companyName}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email + phone */}
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-ink-700">{client.email}</p>
                      <p className="text-xs text-ink-500 mt-0.5">{client.phone}</p>
                    </td>

                    {/* Activity counts */}
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      {client._count ? (
                        <div className="flex gap-3 text-xs text-ink-500">
                          <span>{client._count.inquiries} inquiries</span>
                          <span>{client._count.events} events</span>
                          <span>{client._count.quotations} quotes</span>
                        </div>
                      ) : (
                        <span className="text-ink-400 text-xs">—</span>
                      )}
                    </td>

                    {/* Active badge */}
                    <td className="px-5 py-3.5">
                      <ActiveBadge isActive={client.isActive} />
                    </td>

                    {/* Created date */}
                    <td className="px-5 py-3.5 hidden sm:table-cell text-xs text-ink-500">
                      {formatDate(client.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View */}
                        <button
                          onClick={() => handleView(client)}
                          title="View details"
                          className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleEdit(client)}
                          title="Edit client"
                          className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* Toggle active */}
                        <button
                          onClick={() => handleToggleActive(client)}
                          disabled={togglingId === client.id}
                          title={client.isActive ? 'Deactivate' : 'Activate'}
                          className={cn(
                            'rounded-lg p-1.5 transition-colors',
                            client.isActive
                              ? 'text-red-400 hover:bg-red-50 hover:text-red-600'
                              : 'text-emerald-400 hover:bg-emerald-50 hover:text-emerald-600',
                            togglingId === client.id && 'opacity-50 cursor-not-allowed',
                          )}
                        >
                          {togglingId === client.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : client.isActive ? (
                            <PowerOff className="w-4 h-4" />
                          ) : (
                            <Power className="w-4 h-4" />
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
              {total} client{total !== 1 ? 's' : ''}
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
      {viewClient && (
        <ClientDrawer
          client={viewClient}
          onClose={() => setViewClient(null)}
          onEdit={() => handleEdit(viewClient)}
        />
      )}

      {showForm && (
        <ClientFormDrawer
          client={editClient as Client | null}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
