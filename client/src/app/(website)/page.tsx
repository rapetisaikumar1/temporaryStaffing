'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Building2,
  Presentation,
  UtensilsCrossed,
  LayoutGrid,
  Heart,
  Megaphone,
  Shield,
  Monitor,
  Star,
  Check,
} from 'lucide-react';
import { SERVICES } from '@/lib/constants';
import InquiryForm from '@/components/website/InquiryForm';

const SERVICE_ICONS: Record<string, React.ElementType> = {
  'corporate-events': Building2,
  conferences: Presentation,
  hospitality: UtensilsCrossed,
  exhibitions: LayoutGrid,
  weddings: Heart,
  promotional: Megaphone,
  security: Shield,
  technical: Monitor,
};

const up = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] as const, delay },
});

export default function HomePage() {
  return (
    <>
      {/* ───────── HERO ───────── */}
      <section className="relative min-h-[92vh] flex flex-col justify-center pt-[72px] bg-[#f5f4f1] overflow-hidden">
        {/* Subtle top gradient */}
        <div className="absolute inset-x-0 top-0 h-px bg-black/[0.05] pointer-events-none" />

        <div className="container-page relative py-20">
          <motion.div {...up()} className="max-w-5xl">
            <p className="web-eyebrow">Verified temporary staffing</p>

            <h1
              className="mt-8 font-black leading-[0.95] tracking-[-0.04em] text-[#0d1b2a]"
              style={{ fontSize: 'clamp(3rem,8vw,6.5rem)' }}
            >
              Staff your event.<br />
              <span className="text-[#b86b0a]">Flawlessly.</span>
            </h1>

            <p className="mt-8 text-[17px] md:text-[18px] leading-[1.7] text-[#5a6478] max-w-2xl">
              Niyukti delivers verified, trained, and event-ready temporary staff for corporate
              gatherings, exhibitions, hospitality, and high-profile occasions. Deployed within 24 hours,
              priced transparently, managed end-to-end.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 h-12 px-7 rounded bg-[#1b2e45] text-white text-[15px] font-bold hover:bg-[#253f5e] transition-colors group"
              >
                Request staff
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 h-12 px-7 rounded border border-black/[0.10] text-[#5a6478] text-[15px] font-medium hover:text-[#0d1b2a] hover:border-black/[0.20] transition-colors"
              >
                Explore services
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            {...up(0.15)}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 border-t border-black/[0.07]"
          >
            {[
              { v: '500+',   l: 'Events delivered' },
              { v: '2,000+', l: 'Verified staff' },
              { v: '24 hrs', l: 'Average deployment' },
              { v: '98%',    l: 'Client retention' },
            ].map((s, i) => (
              <div
                key={s.l}
                className={[
                  'py-8 pr-8',
                  i === 1 || i === 3 ? 'pl-8 border-l border-black/[0.07]' : '',
                  i >= 2 ? 'border-t md:border-t-0 border-black/[0.07]' : '',
                  i > 0 ? 'md:pl-8 md:border-l md:border-black/[0.07]' : '',
                ].join(' ')}
              >
                <p className="text-[clamp(2rem,4vw,3rem)] font-black tracking-[-0.03em] text-[#0d1b2a] tabular-nums leading-none">
                  {s.v}
                </p>
                <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[#9aa3af] font-semibold">{s.l}</p>
              </div>
            ))}
          </motion.div>

          {/* Client names */}
          <motion.div {...up(0.2)} className="mt-12 border-t border-black/[0.05] pt-8">
            <p className="text-[10.5px] uppercase tracking-[0.22em] text-[#9aa3af] font-semibold">
              Powering events for India&apos;s most demanding teams
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-2">
              {['Marriott', 'Tata', 'Reliance', 'Microsoft', 'NASSCOM', 'CII', 'FICCI', 'Infosys'].map((n) => (
                <span key={n} className="text-[16px] font-semibold tracking-tight text-[#c8cdd4]">
                  {n}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───────── WHY CHOOSE US ───────── */}
      <section className="bg-white py-24 md:py-32">
        <div className="container-page">
          <motion.div {...up()}>
            <p className="web-eyebrow">Why teams choose us</p>
            <h2
              className="mt-6 font-black leading-[1] tracking-[-0.03em] text-[#0d1b2a]"
              style={{ fontSize: 'clamp(2rem,5vw,3.8rem)' }}
            >
              Built for operations<br />that can&apos;t afford to fail.
            </h2>
          </motion.div>

          <div className="mt-16">
            {[
              {
                n: '01',
                icon: ShieldCheck,
                title: 'Verified, every time',
                body: 'Every staff member is background-checked, document-verified, and rated by previous clients before deployment. No surprises on event day.',
              },
              {
                n: '02',
                icon: Sparkles,
                title: 'Trained for the room',
                body: 'Onboarding modules cover etiquette, brand standards, dress codes, and contingency protocols — your brand standards, not ours.',
              },
              {
                n: '03',
                icon: Star,
                title: 'Operations, owned end-to-end',
                body: 'Dedicated account leads orchestrate scheduling, briefing, live attendance tracking, and post-event reporting so you stay focused on the experience.',
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.n}
                  {...up(0.07 * i)}
                  className="grid grid-cols-12 gap-6 py-10 border-t border-black/[0.07] items-start"
                >
                  <div className="col-span-1 hidden md:block">
                    <span className="text-[13px] font-bold text-[#9aa3af] tabular-nums">{f.n}</span>
                  </div>
                  <div className="col-span-12 md:col-span-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#b86b0a]/10">
                        <Icon className="w-4 h-4 text-[#b86b0a]" />
                      </div>
                      <h3 className="text-[19px] md:text-[21px] font-bold text-[#0d1b2a] tracking-tight">{f.title}</h3>
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-6 md:col-start-7">
                    <p className="text-[15px] leading-[1.75] text-[#5a6478]">{f.body}</p>
                  </div>
                </motion.div>
              );
            })}
            <div className="border-t border-black/[0.07]" />
          </div>
        </div>
      </section>

      {/* ───────── SERVICES ───────── */}
      <section className="bg-[#f5f4f1] py-24 md:py-32">
        <div className="container-page">
          <motion.div {...up()} className="flex items-end justify-between flex-wrap gap-6">
            <div>
              <p className="web-eyebrow">Services</p>
              <h2
                className="mt-6 font-black leading-[1] tracking-[-0.03em] text-[#0d1b2a]"
                style={{ fontSize: 'clamp(2rem,5vw,3.8rem)' }}
              >
                Staffing for every occasion.
              </h2>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#b86b0a] hover:text-[#975808] transition-colors"
            >
              View all services <ArrowUpRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-black/[0.07]">
            {SERVICES.map((s, i) => {
              const Icon = SERVICE_ICONS[s.slug] ?? Building2;
              return (
                <motion.div
                  key={s.slug}
                  {...up(0.04 * i)}
                  className="border-b border-r border-black/[0.07] p-7 group hover:bg-[#f5f4f1] transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-[#b86b0a]/10 group-hover:bg-[#b86b0a]/15 transition-colors">
                    <Icon className="w-[18px] h-[18px] text-[#b86b0a]" />
                  </div>
                  <h3 className="mt-5 text-[16px] font-semibold text-[#0d1b2a] leading-snug tracking-tight">{s.title}</h3>
                  <p className="mt-4 text-[12px] font-semibold text-[#b86b0a] inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
                    Learn more <ArrowUpRight className="w-3 h-3" />
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── HOW IT WORKS ───────── */}
      <section className="bg-white py-24 md:py-32">
        <div className="container-page">
          <motion.div {...up()}>
            <p className="web-eyebrow">How it works</p>
            <h2
              className="mt-6 font-black leading-[1] tracking-[-0.03em] text-[#0d1b2a]"
              style={{ fontSize: 'clamp(2rem,5vw,3.8rem)' }}
            >
              Inquiry to event day.<br />Four simple steps.
            </h2>
          </motion.div>

          <div className="mt-16 relative pl-6 border-l border-black/[0.07]">
            {[
              { n: '01', t: 'Share requirements',      b: 'Tell us about your event, dates, roles, and headcount. We respond within 24 hours.' },
              { n: '02', t: 'Get a tailored plan',     b: 'Receive a transparent quotation, staff profiles, and a deployment timeline.' },
              { n: '03', t: 'Briefing & confirmation', b: 'We brief staff on dress, conduct, and KPIs. You confirm with a single sign-off.' },
              { n: '04', t: 'Event day & reporting',   b: 'Account lead on site. Daily reports, photos, and attendance — all in one dashboard.' },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                {...up(0.1 * i)}
                className="relative pb-12 last:pb-0"
              >
                <span className="absolute -left-[25px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white border border-black/[0.09]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b86b0a]" />
                </span>
                <span className="text-[11px] font-black text-[#9aa3af] tracking-[0.15em] uppercase">{s.n}</span>
                <h3 className="mt-2 text-[20px] md:text-[24px] font-bold text-[#0d1b2a] tracking-tight">{s.t}</h3>
                <p className="mt-3 text-[15px] leading-[1.7] text-[#5a6478] max-w-xl">{s.b}</p>
              </motion.div>
            ))}
          </div>

          <motion.div {...up(0.2)} className="mt-14">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 h-11 px-6 rounded border border-black/[0.10] text-[#5a6478] text-[14px] font-medium hover:text-[#0d1b2a] hover:border-black/[0.20] transition-colors"
            >
              Full process walkthrough <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ───────── TESTIMONIAL ───────── */}
      <section className="bg-[#f5f4f1] py-24 md:py-32">
        <div className="container-page max-w-4xl">
          <motion.figure {...up()}>
            <p className="web-eyebrow" style={{ color: '#b86b0a' }}>Client stories</p>
            <blockquote
              className="mt-8 font-bold text-[#0d1b2a] leading-[1.2] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(1.5rem,3vw,2.4rem)' }}
            >
              &ldquo;Niyukti deployed 80 trained staff for our flagship conference with 36 hours notice.
              The execution was indistinguishable from our in-house team.&rdquo;
            </blockquote>
            <div className="mt-8 h-px w-14 bg-[#b86b0a]/50" />
            <figcaption className="mt-7 flex items-center gap-4">
              <div className="h-11 w-11 rounded-full bg-white border border-black/[0.08] text-[#0d1b2a] flex items-center justify-center text-[13px] font-bold">PR</div>
              <div>
                <p className="text-[14px] font-semibold text-[#0d1b2a]">Priya Ramesh</p>
                <p className="text-[12.5px] text-[#5a6478]">Head of Events, Fortune 500 Tech</p>
              </div>
            </figcaption>
          </motion.figure>
        </div>
      </section>

      {/* ───────── INQUIRY ───────── */}
      <section id="inquiry" className="bg-white py-24 md:py-32">
        <div className="container-page grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <motion.div {...up()} className="lg:col-span-5 lg:sticky lg:top-24">
            <p className="web-eyebrow">Get in touch</p>
            <h2
              className="mt-6 font-black leading-[1.05] tracking-[-0.03em] text-[#0d1b2a]"
              style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}
            >
              Tell us about your event.
            </h2>
            <p className="mt-5 text-[15px] text-[#5a6478] leading-[1.7] max-w-md">
              Share a few details and our team will respond with a tailored plan within 24 hours — including
              transparent pricing, staff profiles, and a deployment timeline.
            </p>

            <ul className="mt-8 space-y-3.5">
              {[
                'Verified, background-checked staff',
                'Transparent, itemised pricing',
                'Dedicated account lead on every event',
                'Real-time attendance & reporting',
              ].map((p) => (
                <li key={p} className="flex items-center gap-3 text-[14px] text-[#5a6478]">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#b86b0a]/10">
                    <Check className="w-3 h-3 text-[#b86b0a]" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div {...up(0.1)} className="lg:col-span-7">
            <InquiryForm />
          </motion.div>
        </div>
      </section>
    </>
  );
}
