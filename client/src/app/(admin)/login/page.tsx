'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { loginSchema, LoginFormData } from '@/lib/validations';
import { SITE_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

// Dev-mode mock auth
const DEV_EMAIL = 'rapetisaikumar1999@gmail.com';
const DEV_PASSWORD = 'Admin@2026';
const DEV_TOKEN = 'dev-mock-token';
const DEV_USER = {
  id: 'dev-admin', name: 'Admin', email: DEV_EMAIL, role: 'ADMIN' as const,
  isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
};

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const result = await authService.login(data);
      setAuth(result.user, result.accessToken);
      router.replace('/dashboard');
    } catch (err: unknown) {
      const isNetworkError = !(err as { response?: unknown })?.response;
      if (isNetworkError && data.email === DEV_EMAIL && data.password === DEV_PASSWORD) {
        setAuth(DEV_USER, DEV_TOKEN);
        router.replace('/dashboard');
        return;
      }
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Login failed. Please try again.';
      setServerError(message);
    }
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left — editorial brand panel */}
      <aside className="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 bg-ink-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark opacity-50 mask-radial-fade" />
        <div className="absolute -top-32 -left-24 w-[480px] h-[480px] rounded-full bg-indigo-600/15 blur-[120px]" />

        <Link href="/" className="relative flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
            <span className="block h-1.5 w-1.5 rounded-[2px] bg-ink-950" />
          </span>
          <span className="text-[15.5px] font-semibold tracking-[-0.01em]">{SITE_NAME.toLowerCase()}</span>
        </Link>

        <div className="relative max-w-md">
          <p className="heading-eyebrow text-white/40">Admin console</p>
          <h2 className="mt-4 text-[40px] xl:text-[48px] leading-[1.08] tracking-[-0.02em] text-white font-medium">
            Run your operations with <span className="font-display italic font-normal text-white/65">total clarity.</span>
          </h2>
          <p className="mt-6 text-[15px] text-white/55 leading-relaxed">
            A unified command center for inquiries, bookings, staff deployments and payouts — built for the way modern event teams operate.
          </p>

          <ul className="mt-10 space-y-3.5">
            {[
              'Real-time inquiry and booking pipeline',
              'Verified staff database with smart assignments',
              'Quotations, attendance, and payouts in one flow',
            ].map((t) => (
              <li key={t} className="flex items-center gap-3 text-[13.5px] text-white/65">
                <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[11.5px] text-white/40">
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </p>
      </aside>

      {/* Right — form */}
      <section className="flex items-center justify-center px-6 py-12 lg:py-16">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink-950">
                <span className="block h-1.5 w-1.5 rounded-[2px] bg-white" />
              </span>
              <span className="text-[15.5px] font-semibold tracking-[-0.01em] text-ink-950">{SITE_NAME.toLowerCase()}</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-[28px] font-medium text-ink-950 tracking-[-0.02em]">Sign in</h1>
            <p className="mt-2 text-[14px] text-ink-500">
              Welcome back. Enter your credentials to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {serverError && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-700">
                {serverError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@niyukti.com"
                {...register('email')}
                className={cn('field', errors.email && 'border-red-300')}
              />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="label" htmlFor="password">Password</label>
                <Link href="/forgot-password" className="text-[12px] font-medium text-ink-700 link-underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={cn('field pr-11', errors.password && 'border-red-300')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-400 hover:text-ink-700 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary btn-lg w-full mt-2">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-[12px] text-ink-400">
            Protected by enterprise-grade security · TLS 1.3
          </p>
        </div>
      </section>
    </main>
  );
}
