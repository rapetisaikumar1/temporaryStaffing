'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Phone, CheckCircle2, Shield, ArrowUpRight } from 'lucide-react';
import PageHero from '@/components/website/PageHero';

const STEPS = [
  { n: '01', title: 'Submit your requirement', desc: 'Share your event details — date, location, event type, headcount, and the roles you need. Takes under five minutes.', points: ['No commitment at this stage', 'Available 24/7 via the website', 'Optional phone consultation'] },
  { n: '02', title: 'We review and plan',      desc: 'Our team curates a shortlist of pre-vetted professionals and prepares a transparent, itemised staffing plan.',         points: ['Response within 24 hours', 'Dedicated coordinator assigned', 'Custom plan with pricing'] },
  { n: '03', title: 'Staff confirmed & briefed', desc: 'Selected staff are confirmed and briefed on event specifics, dress code, conduct standards, and reporting timelines.', points: ['Background-verified profiles', 'Role-specific briefing', 'Full roster shared with you'] },
  { n: '04', title: 'Flawless execution',      desc: 'Staff arrive on time, perform to brand standards, and our on-ground lead ensures the event runs smoothly.',           points: ['On-site account lead', 'Real-time attendance tracking', 'Post-event report'] },
];

const GUARANTEES = [
  { icon: Clock,         title: '24-hour response',        desc: 'Every inquiry acknowledged within one business day.' },
  { icon: Phone,         title: 'Dedicated lead',          desc: 'A single point of contact from inquiry to execution.' },
  { icon: CheckCircle2,  title: 'Quality assured',         desc: 'Pre-screened, trained, and assessed before deployment.' },
  { icon: Shield,        title: 'Replacement guarantee',   desc: 'No-shows replaced immediately from our reserve pool.' },
];

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
};

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="The process"
        title={<>From inquiry to event day in four steps.</>}
        description="Designed to be effortless for you — and fully accountable for us."
      />

      {/* Steps — modern numbered steps */}
      <section className="section bg-white">
        <div className="container-page">
          <div>
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                {...fadeIn}
                transition={{ ...fadeIn.transition, delay: 0.1 * i }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 py-10 border-t border-black/[0.07] items-start"
              >
                <div className="md:col-span-1 flex items-start pt-0.5">
                  <div className="flex h-9 w-9 rounded-full items-center justify-center bg-[#0d1b2a] text-white text-[13px] font-black shrink-0">
                    {i + 1}
                  </div>
                </div>
                <div className="md:col-span-4">
                  <h3 className="text-[21px] font-bold text-[#0d1b2a] tracking-tight leading-tight">{s.title}</h3>
                  <div className="mt-3 h-px w-10 bg-[#b86b0a]/30" />
                </div>
                <div className="md:col-span-7">
                  <p className="text-[15px] leading-[1.7] text-[#5a6478]">{s.desc}</p>
                  <ul className="mt-4 space-y-2">
                    {s.points.map((p) => (
                      <li key={p} className="flex items-center gap-2.5 text-[13.5px] text-[#5a6478]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#b86b0a]/60 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
            <div className="border-t border-black/[0.07]" />
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="section bg-[#f5f4f1]">
        <div className="container-page">
          <motion.div {...fadeIn} className="max-w-2xl">
            <p className="eyebrow-gold">Our promise</p>
            <h2 className="mt-4 heading-2-classic">What we guarantee.</h2>
          </motion.div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-3">
            {GUARANTEES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-5 rounded-xl bg-white border border-black/[0.06]">
                <div className="icon-tile-classic h-10 w-10 shrink-0">
                  <Icon className="w-[17px] h-[17px]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-[#0d1b2a]">{title}</h3>
                  <p className="mt-1.5 text-[13px] text-[#5a6478] leading-[1.65]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-white relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 gold-rule opacity-50" />
        <div className="container-page flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-[clamp(2rem,3.5vw,2.75rem)] leading-[1.1] tracking-[-0.02em] text-[#0d1b2a] font-bold">
              Start your <span>first inquiry.</span>
            </h2>
          </div>
          <Link href="/contact" className="inline-flex items-center gap-2 h-12 px-6 rounded bg-[#b86b0a] text-white text-[14px] font-semibold hover:bg-[#975808] transition-colors">
            Request staff <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
