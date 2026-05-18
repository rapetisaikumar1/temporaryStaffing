'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2, Coffee, LayoutGrid, Presentation, Heart, Rocket, Trophy,
  Music, Plane, GraduationCap, ShoppingBag, Stethoscope, ArrowUpRight,
} from 'lucide-react';
import PageHero from '@/components/website/PageHero';

const INDUSTRIES = [
  { icon: Building2,     title: 'Corporate & Business',      desc: 'Annual functions, board meetings, product launches, and internal events.' },
  { icon: Coffee,        title: 'Hospitality & Hotels',      desc: 'Banquet staff, F&B servers, and guest relations for 5-star properties.' },
  { icon: LayoutGrid,    title: 'Exhibitions & Trade Shows', desc: 'Booth staff, brand ambassadors, and lead capture for national exhibitions.' },
  { icon: Presentation,  title: 'Conferences & Summits',     desc: 'Registration, session management, and speaker coordination teams.' },
  { icon: Heart,         title: 'Weddings & Social',         desc: 'Elegant, trained staff for weddings, receptions, and celebrations.' },
  { icon: Rocket,        title: 'Product Launches',          desc: 'High-energy promotional and demonstration staff for launch events.' },
  { icon: Trophy,        title: 'Sports & Entertainment',    desc: 'Crowd, VIP hospitality, and operations for large-scale events.' },
  { icon: Music,         title: 'Concerts & Live Events',    desc: 'Front-of-house, backstage, and guest experience staff.' },
  { icon: Plane,         title: 'Travel & Tourism',          desc: 'Tour guides, airport greeters, and group coordination staff.' },
  { icon: GraduationCap, title: 'Education & Academia',      desc: 'Convocation management and campus event support.' },
  { icon: ShoppingBag,   title: 'Retail & Fashion',          desc: 'In-store promoters and fashion show staff for retail brands.' },
  { icon: Stethoscope,   title: 'Healthcare & Pharma',       desc: 'Medical conference staff and pharmaceutical event support.' },
];

const fadeIn = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
};

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title={<>Trusted across every sector.</>}
        description="From Fortune 500 boardrooms to luxury hospitality, brand activations to academic events — we staff the moments that matter."
      />

      <section className="section bg-white">
        <div className="container-page">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {INDUSTRIES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.04 * i }} className="group flex items-start gap-4 p-5 rounded-xl hover:bg-[#f5f4f1] transition-colors cursor-default">
                <div className="icon-tile-classic h-10 w-10 shrink-0 group-hover:bg-[#b86b0a]/12 transition-colors">
                  <Icon className="w-[17px] h-[17px]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-[#0d1b2a] tracking-tight">{title}</h3>
                  <p className="mt-1.5 text-[13px] text-[#5a6478] leading-[1.6]">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-[#f5f4f1] border-t border-black/[0.07]">
        <div className="container-page flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="heading-2-classic">
              Don&apos;t see your industry?
            </h2>
            <p className="mt-5 text-[#5a6478] max-w-md">We adapt to any event format. Reach out and we&apos;ll build a custom staffing plan for you.</p>
          </div>
          <Link href="/contact" className="inline-flex items-center gap-2 h-12 px-6 rounded bg-[#1b2e45] text-white text-[14px] font-semibold hover:bg-[#253f5e] transition-colors">
            Talk to our team <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
