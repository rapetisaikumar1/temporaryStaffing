'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import Header from '@/components/shared/Header';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';

// ── Schema ────────────────────────────────────────────────────────────────────

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

// ── Field helper ──────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const onSubmit = async (data: PasswordForm) => {
    setServerError(null);
    setSuccess(false);
    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      setSuccess(true);
      reset();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setServerError(msg ?? 'Failed to change password. Please try again.');
    }
  };

  const inputClass = (hasError: boolean) =>
    cn(
      'w-full rounded-xl border px-4 py-3 pr-11 text-sm outline-none transition-all',
      hasError
        ? 'border-red-400 bg-red-50'
        : 'border-ink-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100',
    );

  return (
    <div className="flex flex-col flex-1">
      <Header title="Settings" subtitle="Manage your account preferences" />

      <main className="flex-1 px-8 py-10 max-w-3xl space-y-6">
        {/* Profile card */}
        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5 pb-5 border-b border-ink-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
              <User className="w-4.5 h-4.5 w-[18px] h-[18px] text-indigo-600" />
            </div>
            <h2 className="text-sm font-semibold text-ink-900">Profile</h2>
          </div>

          {user ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <p className="text-xs font-medium text-ink-400 uppercase tracking-wide mb-1">Name</p>
                <p className="text-sm font-semibold text-ink-900">{user.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-ink-400 uppercase tracking-wide mb-1">Email</p>
                <p className="text-sm font-semibold text-ink-900">{user.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-ink-400 uppercase tracking-wide mb-1">Role</p>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1',
                    ROLE_COLORS[user.role] ?? 'bg-ink-50 text-ink-600 ring-ink-200',
                  )}
                >
                  {ROLE_LABELS[user.role] ?? user.role}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-ink-400 uppercase tracking-wide mb-1">Account Status</p>
                <span className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1',
                  user.isActive
                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                    : 'bg-red-50 text-red-600 ring-red-200',
                )}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-ink-400 uppercase tracking-wide mb-1">Member Since</p>
                <p className="text-sm text-ink-700">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink-400">Loading profile…</p>
          )}
        </div>

        {/* Change password card */}
        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5 pb-5 border-b border-ink-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
              <Lock className="w-4.5 h-4.5 w-[18px] h-[18px] text-indigo-600" />
            </div>
            <h2 className="text-sm font-semibold text-ink-900">Change Password</h2>
          </div>

          {success && (
            <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 mb-5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-sm font-medium text-emerald-700">Password changed successfully.</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Current password */}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  {...register('currentPassword')}
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Enter current password"
                  className={inputClass(!!errors.currentPassword)}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.currentPassword.message}</p>
              )}
            </div>

            {/* New password */}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  {...register('newPassword')}
                  type={showNew ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  className={inputClass(!!errors.newPassword)}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  className={inputClass(!!errors.confirmPassword)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            {serverError && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200">
                {serverError}
              </p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                {isSubmitting ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

