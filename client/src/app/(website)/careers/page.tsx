'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CheckCircle2, Users, TrendingUp, Clock, Award, ShieldCheck, Zap, Loader2, ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { inquiryService } from '@/services/inquiry.service';
import PageHero from '@/components/website/PageHero';

const STAFF_ROLES = [
  'Host / Hostess', 'Usher', 'Registration Staff', 'Brand Ambassador', 'Bartender',
  'F&B Server', 'Security / Crowd Management', 'AV & Technical Support', 'Driver / Chauffeur',
  'Floor Manager', 'Other',
];

const EXPERIENCE_OPTIONS = [
  'No experience (fresher)', 'Less than 1 year', '1–2 years', '3–5 years', '5+ years',
];

const schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Valid phone number required'),
  email: z.string().email('Valid email required'),
  city: z.string().min(2, 'City is required'),
  role: z.string().min(1, 'Select a preferred role'),
  experience: z.string().min(1, 'Select your experience level'),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const PERKS = [
  { icon: TrendingUp,  title: 'Grow your career',     desc: 'Build a track record across premium events and unlock full-time opportunities.' },
  { icon: Clock,       title: 'Flexible hours',       desc: 'Choose assignments that fit your schedule — weekends or weekdays.' },
  { icon: Award,       title: 'Professional training', desc: 'Role-specific training before every first deployment.' },
  { icon: ShieldCheck, title: 'Reputable clients',    desc: 'Work with top corporations, luxury brands, and 5-star properties.' },
  { icon: Users,       title: 'Strong community',     desc: 'Join a network of 2,000+ event professionals across India.' },
  { icon: Zap,         title: 'Quick payments',       desc: 'Timely, transparent payouts after every completed assignment.' },
];

const fadeIn = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
};

const fieldClass =
  'w-full h-11 rounded border border-[#dde0e4] bg-white px-3.5 text-[13.5px] text-[#0d1b2a] placeholder:text-[#adb5bd] transition-all duration-150 focus:outline-none focus:border-[#1b2e45] focus:shadow-[0_0_0_2px_rgba(27,46,69,0.09)]';

const textareaClass =
  'w-full rounded border border-[#dde0e4] bg-white px-3.5 py-3 text-[13.5px] text-[#0d1b2a] placeholder:text-[#adb5bd] transition-all duration-150 focus:outline-none focus:border-[#1b2e45] focus:shadow-[0_0_0_2px_rgba(27,46,69,0.09)]';

export default function CareersPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    setServerError(null);
    try {
      await inquiryService.create({
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        eventType: 'Staff Application',
        eventDate: new Date().toISOString().split('T')[0],
        location: data.city,
        staffCount: 1,
        staffRoles: data.role,
        message: `Experience: ${data.experience}. ${data.message ?? ''}`.trim(),
      });
      setSubmitted(true);
      reset();
    } catch {
      setServerError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Careers"
        title={<>Build your event career with Niyukti.</>}
        description="Join a growing network of professionals working with the country&apos;s most demanding event teams."
      />

      {/* Perks */}
      <section className="section bg-cream-50">
        <div className="container-page">
          <motion.div {...fadeIn} className="max-w-2xl">
            <p className="eyebrow-gold">Why work with us</p>
            <h2 className="mt-4 heading-2-classic">A career built on great events.</h2>
            <div className="mt-6 gold-rule w-20" />
          </motion.div>
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 divide-y divide-black/[0.07] border-t border-black/[0.07]">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="py-8 flex items-start gap-4">
                <div className="icon-tile-classic h-10 w-10 shrink-0">
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-[#0d1b2a]">{title}</h3>
                  <p className="mt-2 text-[13.5px] text-[#5a6478] leading-[1.65]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Apply */}
      <section className="section bg-white">
        <div className="container-narrow">
          <motion.div {...fadeIn} className="text-center mb-12">
            <p className="eyebrow-gold justify-center">Apply now</p>
            <h2 className="mt-4 heading-2-classic">Join the team.</h2>
            <div className="mt-5 gold-rule w-20 mx-auto" />
            <p className="mt-5 text-[15.5px] text-forest-900/65 max-w-md mx-auto">Our recruitment team will be in touch within 48 hours.</p>
          </motion.div>

          <motion.div {...fadeIn}>
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-forest-50 ring-1 ring-forest-200 mb-5">
                  <CheckCircle2 className="w-7 h-7 text-forest-700" />
                </div>
                <h3 className="text-[26px] font-bold text-forest-900">Application received</h3>
                <div className="gold-rule w-20 mt-4 mb-4" />
                <p className="text-[14px] text-forest-900/60 max-w-sm leading-relaxed">
                  Our recruitment team will review your profile and reach out within 48 hours.
                </p>
                <button onClick={() => setSubmitted(false)} className="mt-6 text-sm font-medium text-forest-800 hover:text-gold-700 transition-colors underline decoration-gold-400/60 underline-offset-4">
                  Submit another application
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                <Field label="Full name" required error={errors.fullName?.message}>
                  <input className={cn(fieldClass, errors.fullName && 'border-red-300')} placeholder="Your full name" {...register('fullName')} />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Phone" required error={errors.phone?.message}>
                    <input className={cn(fieldClass, errors.phone && 'border-red-300')} placeholder="+91 98765 43210" {...register('phone')} />
                  </Field>
                  <Field label="Email" required error={errors.email?.message}>
                    <input type="email" className={cn(fieldClass, errors.email && 'border-red-300')} placeholder="you@example.com" {...register('email')} />
                  </Field>
                  <Field label="City" required error={errors.city?.message}>
                    <input className={cn(fieldClass, errors.city && 'border-red-300')} placeholder="Your city" {...register('city')} />
                  </Field>
                  <Field label="Preferred role" required error={errors.role?.message}>
                    <select className={cn(fieldClass, errors.role && 'border-red-300')} {...register('role')}>
                      <option value="">Select a role</option>
                      {STAFF_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Experience" required error={errors.experience?.message}>
                  <select className={cn(fieldClass, errors.experience && 'border-red-300')} {...register('experience')}>
                    <option value="">Select your experience</option>
                    {EXPERIENCE_OPTIONS.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </Field>
                <Field label="Anything else?">
                  <textarea className={textareaClass} rows={4} placeholder="Tell us briefly about your background…" {...register('message')} />
                </Field>

                {serverError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{serverError}</div>
                )}

                <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 h-11 w-full rounded bg-[#1b2e45] text-white text-[14px] font-semibold hover:bg-[#253f5e] transition-colors disabled:opacity-60 mt-2">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <>Submit application <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </>
  );
}

function Field({
  label, required, error, children,
}: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11.5px] font-semibold text-[#5a6478] uppercase tracking-[0.06em]">
        {label}{required && <span className="text-[#b86b0a] ml-0.5">*</span>}
      </span>
      {children}
      {error && <span className="text-[12px] text-red-600">{error}</span>}
    </div>
  );
}
