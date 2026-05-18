'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, ShieldCheck, Users, Star, TrendingUp, Heart, Award } from 'lucide-react';
import PageHero from '@/components/website/PageHero';

const STATS = [
  { value: '500+',  label: 'Events delivered' },
  { value: '2,000+', label: 'Verified professionals' },
  { value: '5+',    label: 'Years of operation' },
  { value: '98%',   label: 'Client retention' },
];

const VALUES = [
  { icon: ShieldCheck, title: 'Integrity',      desc: 'Full transparency in pricing, processes, and people.' },
  { icon: Star,        title: 'Excellence',     desc: 'A high bar for every staff member we deploy, every time.' },
  { icon: Heart,       title: 'Client first',   desc: 'Your event outcome is the primary brief from inquiry to execution.' },
  { icon: Users,       title: 'People powered', desc: 'We invest in training, welfare, and growth of our staff community.' },
  { icon: TrendingUp,  title: 'Reliability',    desc: 'We show up — on time, fully prepared, ready to perform.' },
  { icon: Award,       title: 'Accountability', desc: 'Every event has a dedicated account lead ensuring flawless delivery.' },
];

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Niyukti"
        title={<>Built to power India&apos;s most demanding events.</>}
        description="Niyukti was founded with a single purpose: bring reliability, professionalism, and speed to temporary event staffing across India."
      />

      {/* Stats */}
      <section className="border-b border-black/[0.07]">
        <div className="container-page grid grid-cols-2 md:grid-cols-4 border-t border-black/[0.07]">
          {STATS.map((s, i) => (
            <div key={s.label} className={['py-10 px-6', i > 0 ? 'border-l border-black/[0.07]' : ''].join(' ')}>
              <p className="text-[clamp(1.75rem,3vw,2.5rem)] tracking-[-0.02em] text-[#0d1b2a] tabular-nums font-black">{s.value}</p>
              <div className="mt-3 h-px w-8 bg-[#b86b0a]/30" />
              <p className="mt-3 text-[11px] text-[#9aa3af] uppercase tracking-[0.15em] font-semibold">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="section bg-cream-50">
        <div className="container-page grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <motion.div {...fadeIn} className="lg:col-span-5">
            <p className="eyebrow-gold">Our story</p>
            <h2 className="mt-4 heading-2-classic">From a problem to a platform.</h2>
          </motion.div>
          <motion.div {...fadeIn} className="lg:col-span-7 space-y-5 text-[15.5px] text-forest-900/70 leading-[1.75]">
            <p>
              We started Niyukti after experiencing firsthand how event organisers struggled to find
              reliable, trained, and professional temporary staff at short notice. Last-minute cancellations,
              unprepared staff, and unreliable agencies were the norm.
            </p>
            <p>
              We built Niyukti to solve that problem — a platform combining operational excellence with a
              curated network of pre-trained, background-verified professionals ready to deploy at any scale.
            </p>
            <p>
              Today, we partner with corporations, hospitality groups, event management firms, and independent
              organisers across India to make every event exceptional.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-[#f5f4f1] border-y border-black/[0.07]">
        <div className="container-page">
          <motion.div {...fadeIn} className="max-w-2xl">
            <p className="eyebrow-gold">Our values</p>
            <h2 className="mt-4 heading-2-classic">What drives us.</h2>
          </motion.div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {VALUES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                {...fadeIn}
                transition={{ ...fadeIn.transition, delay: 0.06 * i }}
                className="group flex flex-col p-6 rounded-2xl bg-white border border-black/[0.06] hover:border-[#b86b0a]/25 hover:shadow-md transition-all duration-200"
              >
                <div className="icon-tile-classic h-10 w-10 shrink-0">
                  <Icon className="w-[17px] h-[17px]" />
                </div>
                <div className="mt-4 h-px w-10 bg-[#b86b0a]/25" />
                <h3 className="mt-4 text-[16px] font-semibold text-[#0d1b2a] leading-snug">{title}</h3>
                <p className="mt-2 text-[13.5px] text-[#5a6478] leading-[1.65]">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-white relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 gold-rule opacity-50" />
        <div className="container-page flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-[clamp(2rem,3.5vw,2.75rem)] leading-[1.1] tracking-[-0.02em] text-[#0d1b2a] font-bold">
              Let&apos;s work <span>together.</span>
            </h2>
            <p className="mt-4 text-[#5a6478] max-w-md">Tell us about your event and we&apos;ll respond with a tailored plan in 24 hours.</p>
          </div>
          <Link href="/contact" className="inline-flex items-center gap-2 h-12 px-6 rounded bg-[#b86b0a] text-white text-[14px] font-semibold hover:bg-[#975808] transition-colors">
            Request staff <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="absolute inset-x-0 bottom-0 gold-rule opacity-50" />
      </section>
    </>
  );
}
