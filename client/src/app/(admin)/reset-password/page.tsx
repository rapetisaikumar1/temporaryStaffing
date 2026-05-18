'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { SITE_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => { if (!token) router.replace('/forgot-password'); }, [token, router]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      await authService.resetPassword(token, data.password);
      setDone(true);
      setTimeout(() => router.replace('/login'), 2500);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'This reset link is invalid or has expired.';
      setServerError(message);
    }
  };

  if (!token) return null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-[400px]">
        <Link href="/" className="flex items-center gap-2 mb-10 justify-center">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink-950">
            <span className="block h-1.5 w-1.5 rounded-[2px] bg-white" />
          </span>
          <span className="text-[15.5px] font-semibold tracking-[-0.01em] text-ink-950">{SITE_NAME.toLowerCase()}</span>
        </Link>

        {done ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 ring-1 ring-emerald-200 mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <h1 className="text-[24px] font-medium text-ink-950 tracking-[-0.015em]">Password updated</h1>
            <p className="mt-3 text-[14px] text-ink-500">Redirecting you to sign in…</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-[28px] font-medium text-ink-950 tracking-[-0.02em]">Set a new password</h1>
              <p className="mt-2 text-[14px] text-ink-500">Choose a strong password for your admin account.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              {serverError && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  {serverError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="label" htmlFor="password">New password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    {...register('password')}
                    className={cn('field pr-11', errors.password && 'border-red-300')}
                  />
                  <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-400 hover:text-ink-700 transition">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="error-text">{errors.password.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="label" htmlFor="confirmPassword">Confirm password</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    className={cn('field pr-11', errors.confirmPassword && 'border-red-300')}
                  />
                  <button type="button" onClick={() => setShowConfirm((p) => !p)} className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-400 hover:text-ink-700 transition">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="error-text">{errors.confirmPassword.message}</p>}
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary btn-lg w-full">
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : 'Reset password'}
              </button>
            </form>
          </>
        )}

        <Link href="/login" className="mt-8 block text-center text-[12px] text-ink-500 hover:text-ink-900 transition-colors">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
