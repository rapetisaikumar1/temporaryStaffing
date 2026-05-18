'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus, Search, Pencil, ShieldCheck, ShieldOff,
  X, Eye, EyeOff, Loader2, RefreshCw, UserCog,
} from 'lucide-react';
import Header from '@/components/shared/Header';
import { userService } from '@/services/user.service';
import { useUserStore } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';
import { AdminUser } from '@/types/user.types';
import { Role } from '@/types/auth.types';
import { formatDate, cn } from '@/lib/utils';

// ── Constants ──────────────────────────────────────────────────────────────────

const ROLES: Role[] = ['ADMIN'];

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Admin',
};

const ROLE_COLOR: Record<Role, string> = {
  ADMIN: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
};

// ── Schemas ───────────────────────────────────────────────────────────────────

const createSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['ADMIN']),
});

const editSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['ADMIN']),
});

type CreateForm = z.infer<typeof createSchema>;
type EditForm = z.infer<typeof editSchema>;

// ── Field helpers ─────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

const inputCls = (hasErr: boolean) =>
  cn(
    'w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all',
    hasErr
      ? 'border-red-400 bg-red-50'
      : 'border-ink-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100',
  );

// ── Create User Modal ─────────────────────────────────────────────────────────

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (u: AdminUser) => void }) {
  const [showPwd, setShowPwd] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { role: 'ADMIN' },
  });

  const onSubmit = async (data: CreateForm) => {
    setServerError(null);
    try {
      const created = await userService.create(data);
      onCreated(created);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setServerError(msg ?? 'Failed to create user. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-ink-900">Create Admin User</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-ink-400 hover:text-ink-600 hover:bg-ink-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-600 mb-1.5">Full Name</label>
            <input {...register('name')} placeholder="Jane Smith" className={inputCls(!!errors.name)} />
            <FieldError message={errors.name?.message} />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-600 mb-1.5">Email Address</label>
            <input {...register('email')} type="email" placeholder="jane@niyukti.com" className={inputCls(!!errors.email)} />
            <FieldError message={errors.email?.message} />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-600 mb-1.5">Password</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPwd ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                className={cn(inputCls(!!errors.password), 'pr-10')}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <FieldError message={errors.password?.message} />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-600 mb-1.5">Role</label>
            <select {...register('role')} className={inputCls(!!errors.role)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABEL[r]}</option>
              ))}
            </select>
            <FieldError message={errors.role?.message} />
          </div>

          {serverError && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">
              {serverError}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit User Modal ───────────────────────────────────────────────────────────

function EditModal({
  user,
  onClose,
  onUpdated,
}: {
  user: AdminUser;
  onClose: () => void;
  onUpdated: (u: AdminUser) => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: { name: user.name, role: user.role },
  });

  const onSubmit = async (data: EditForm) => {
    setServerError(null);
    try {
      const updated = await userService.update(user.id, data);
      onUpdated(updated);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setServerError(msg ?? 'Failed to update user. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-ink-900">Edit User</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-ink-400 hover:text-ink-600 hover:bg-ink-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-600 mb-1.5">Full Name</label>
            <input {...register('name')} className={inputCls(!!errors.name)} />
            <FieldError message={errors.name?.message} />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-600 mb-1.5">Role</label>
            <select {...register('role')} className={inputCls(!!errors.role)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABEL[r]}</option>
              ))}
            </select>
            <FieldError message={errors.role?.message} />
          </div>

          {serverError && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">
              {serverError}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const { users, isLoading, setUsers, addUser, updateUser, setLoading } = useUserStore();
  const { user: currentUser } = useAuthStore();

  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.findAll();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }, [setUsers, setLoading]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleActive = async (u: AdminUser) => {
    setTogglingId(u.id);
    try {
      const updated = await userService.update(u.id, { isActive: !u.isActive });
      updateUser(updated);
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      ROLE_LABEL[u.role].toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Admin Users"
        subtitle="Manage portal access and team roles"
      />

      <main className="flex-1 px-8 py-10 space-y-5">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or role…"
              className="w-full rounded-xl border border-ink-200 bg-white pl-9 pr-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={fetchUsers}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 px-3 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
              Refresh
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>

        {/* Summary strip */}
        <div className="flex gap-4 flex-wrap">
          {(['ADMIN'] as Role[]).map((r) => {
            const count = users.filter((u) => u.role === r).length;
            return (
              <div key={r} className="flex items-center gap-2 rounded-xl border border-ink-100 bg-white px-4 py-2.5 shadow-sm">
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', ROLE_COLOR[r])}>
                  {ROLE_LABEL[r]}
                </span>
                <span className="text-sm font-semibold text-ink-700 tabular-nums">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Table */}
        {isLoading && users.length === 0 ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-7 h-7 animate-spin text-ink-300" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-ink-400">
            <UserCog className="w-10 h-10 mb-3 text-ink-200" />
            <p className="text-sm font-medium">
              {search ? 'No users match your search' : 'No admin users found'}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-ink-100 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/60">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-ink-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-ink-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-ink-500 uppercase tracking-wider hidden md:table-cell">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-ink-500 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-ink-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-ink-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-ink-900 flex items-center gap-1.5">
                          {u.name}
                          {u.id === currentUser?.id && (
                            <span className="text-xs font-medium text-indigo-500 bg-indigo-50 rounded-full px-2 py-0.5">You</span>
                          )}
                        </p>
                        <p className="text-xs text-ink-400 mt-0.5">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', ROLE_COLOR[u.role])}>
                        {ROLE_LABEL[u.role]}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1',
                        u.isActive
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                          : 'bg-red-50 text-red-600 ring-red-200',
                      )}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-ink-500 hidden lg:table-cell text-xs">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditTarget(u)}
                            className="rounded-lg p-1.5 text-ink-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit user"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {u.id !== currentUser?.id && (
                            <button
                              onClick={() => handleToggleActive(u)}
                              disabled={togglingId === u.id}
                              className={cn(
                                'rounded-lg p-1.5 transition-colors',
                                u.isActive
                                  ? 'text-ink-400 hover:text-red-500 hover:bg-red-50'
                                  : 'text-ink-400 hover:text-emerald-600 hover:bg-emerald-50',
                                togglingId === u.id && 'opacity-50 cursor-not-allowed',
                              )}
                              title={u.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {togglingId === u.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : u.isActive ? (
                                <ShieldOff className="w-3.5 h-3.5" />
                              ) : (
                                <ShieldCheck className="w-3.5 h-3.5" />
                              )}
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
      </main>

      {/* Modals */}
      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={(u) => addUser(u)}
        />
      )}

      {editTarget && (
        <EditModal
          user={editTarget}
          onClose={() => setEditTarget(null)}
          onUpdated={(u) => updateUser(u)}
        />
      )}
    </div>
  );
}
