'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { EVENT_TYPES } from '@/lib/constants';
import { inquiryService } from '@/services/inquiry.service';
import { cn } from '@/lib/utils';

const schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  companyName: z.string().optional(),
  phone: z.string().min(10, 'Valid phone number required'),
  email: z.string().email('Valid email required'),
  eventType: z.string().min(1, 'Select an event type'),
  eventDate: z.string().min(1, 'Event date is required'),
  location: z.string().min(2, 'Location is required'),
  staffCount: z.number().min(1, 'At least 1 staff member required'),
  staffRoles: z.string().min(1, 'Specify required staff roles'),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  variant?: 'card' | 'plain';
}

const fieldClass =
  'w-full h-11 rounded border border-[#dde0e4] bg-white px-3.5 text-[13.5px] text-[#0d1b2a] placeholder:text-[#adb5bd] transition-all duration-150 focus:outline-none focus:border-[#1b2e45] focus:shadow-[0_0_0_2px_rgba(27,46,69,0.09)]';

const textareaClass =
  'w-full rounded border border-[#dde0e4] bg-white px-3.5 py-3 text-[13.5px] text-[#0d1b2a] placeholder:text-[#adb5bd] transition-all duration-150 focus:outline-none focus:border-[#1b2e45] focus:shadow-[0_0_0_2px_rgba(27,46,69,0.09)]';

export default function InquiryForm({ variant = 'card' }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    setServerError(null);
    try {
      await inquiryService.create(data);
      setSubmitted(true);
      reset();
    } catch {
      setServerError('Something went wrong. Please try again or call us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const wrapClass =
    variant === 'card'
      ? 'card-classic p-8 md:p-10 relative overflow-hidden'
      : '';

  if (submitted) {
    return (
      <div className={cn(wrapClass, 'flex flex-col items-center justify-center py-16 text-center')}>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-forest-50 ring-1 ring-forest-200 mb-5">
          <CheckCircle2 className="w-7 h-7 text-forest-700" />
        </div>
        <h3 className="text-[26px] font-bold text-forest-900">Inquiry received</h3>
        <div className="gold-rule w-20 mt-4 mb-4" />
        <p className="text-[14px] text-forest-900/60 max-w-sm leading-relaxed">
          Thank you for reaching out. Our team will get back to you within 24 hours.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 text-sm font-medium text-forest-800 hover:text-gold-600 transition-colors underline decoration-gold-400/60 underline-offset-4"
        >
          Submit another inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className={cn(wrapClass, variant === 'card' && 'space-y-5')}>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full name" required error={errors.fullName?.message}>
          <input className={cn(fieldClass, errors.fullName && 'border-red-300')} placeholder="Your full name" {...register('fullName')} />
        </Field>
        <Field label="Company">
          <input className={fieldClass} placeholder="Optional" {...register('companyName')} />
        </Field>
        <Field label="Phone" required error={errors.phone?.message}>
          <input className={cn(fieldClass, errors.phone && 'border-red-300')} placeholder="+91 98765 43210" {...register('phone')} />
        </Field>
        <Field label="Email" required error={errors.email?.message}>
          <input type="email" className={cn(fieldClass, errors.email && 'border-red-300')} placeholder="you@company.com" {...register('email')} />
        </Field>
        <Field label="Event type" required error={errors.eventType?.message}>
          <select className={cn(fieldClass, errors.eventType && 'border-red-300')} {...register('eventType')}>
            <option value="">Select event type</option>
            {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Event date" required error={errors.eventDate?.message}>
          <input type="date" className={cn(fieldClass, errors.eventDate && 'border-red-300')} {...register('eventDate')} />
        </Field>
        <Field label="Location" required error={errors.location?.message}>
          <input className={cn(fieldClass, errors.location && 'border-red-300')} placeholder="City or venue" {...register('location')} />
        </Field>
        <Field label="Staff count" required error={errors.staffCount?.message}>
          <input type="number" min={1} className={cn(fieldClass, errors.staffCount && 'border-red-300')} placeholder="e.g. 10" {...register('staffCount', { valueAsNumber: true })} />
        </Field>
      </div>

      <Field label="Required staff roles" required error={errors.staffRoles?.message}>
        <input className={cn(fieldClass, errors.staffRoles && 'border-red-300')} placeholder="e.g. Ushers, Hosts, Security Guards" {...register('staffRoles')} />
      </Field>

      <Field label="Additional details">
        <textarea className={textareaClass} rows={4} placeholder="Tell us about your event…" {...register('message')} />
      </Field>

      {serverError && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 h-11 w-full rounded bg-[#1b2e45] text-white text-[14px] font-semibold hover:bg-[#253f5e] transition-colors disabled:opacity-60 mt-2">
        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <>Submit staffing inquiry <ArrowRight className="w-4 h-4" /></>}
      </button>

      <p className="text-[12px] text-forest-900/45 text-center">
        By submitting you agree to our{' '}
        <a href="/terms" className="text-forest-800 underline decoration-gold-400/60 underline-offset-4 hover:text-gold-700">Terms</a>{' '}
        and{' '}
        <a href="/privacy" className="text-forest-800 underline decoration-gold-400/60 underline-offset-4 hover:text-gold-700">Privacy Policy</a>.
      </p>
    </form>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11.5px] font-semibold text-[#5a6478] uppercase tracking-[0.06em]">
        {label}
        {required && <span className="text-[#b86b0a] ml-0.5">*</span>}
      </span>
      {children}
      {error && <span className="text-[12px] text-red-600">{error}</span>}
    </div>
  );
}
