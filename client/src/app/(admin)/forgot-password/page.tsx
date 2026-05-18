'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { SITE_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

const schema = z.object({ email: z.string().email('Enter a valid email address') });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    await authService.forgotPassword(data.email).catch(() => undefined);
    setSubmittedEmail(data.email);
    setSent(true);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-[400px]">
        <Link href="/" className="flex items-center gap-2 mb-10 justify-center">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink-950">
            <span className="block h-1.5 w-1.5 rounded-[2px] bg-white" />
          </span>
          <span className="text-[15.5px] font-semibold tracking-[-0.01em] text-ink-950">{SITE_NAME.toLowerCase()}</span>
        </Link>

        {sent ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 ring-1 ring-emerald-200 mb-4">
              <Mail className="w-5 h-5 text-emerald-600" />
            </div>
            <h1 className="text-[24px] font-medium text-ink-950 tracking-[-0.015em]">Check your inbox</h1>
            <p className="mt-3 text-[14px] text-ink-500 leading-relaxed">
              If <span className="text-ink-800">{submittedEmail}</span> is registered, you&apos;ll receive a password reset link within a few minutes.
            </p>
            <button onClick={() => setSent(false)} className="mt-6 text-[13px] text-ink-700 link-underline">
              Try a different email
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-[28px] font-medium text-ink-950 tracking-[-0.02em]">Forgot password?</h1>
              <p className="mt-2 text-[14px] text-ink-500">
                Enter your admin email and we&apos;ll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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

              <button type="submit" disabled={isSubmitting} className="btn-primary btn-lg w-full">
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : 'Send reset link'}
              </button>
            </form>
          </>
        )}

        <Link href="/login" className="mt-8 flex items-center justify-center gap-1.5 text-[12px] text-ink-500 hover:text-ink-900 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
