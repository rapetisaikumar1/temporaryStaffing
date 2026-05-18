'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2, Presentation, UtensilsCrossed, LayoutGrid,
  Heart, Megaphone, Shield, Monitor, ArrowUpRight, Check,
} from 'lucide-react';
import PageHero from '@/components/website/PageHero';

const SERVICES_DETAIL = [
  { icon: Building2, title: 'Corporate Event Staffing', desc: 'Professional hosts, ushers, registration staff, and floor managers for corporate gatherings, galas, and annual functions.', roles: ['Hosts & Hostesses', 'Registration Staff', 'Floor Managers', 'Ushers', 'Meet & Greet Staff'] },
  { icon: Presentation, title: 'Conference Staffing', desc: 'Trained staff for conferences, summits, and seminars — from badge registration to session management.', roles: ['Badge Registration', 'Session Coordinators', 'AV Support', 'Speaker Escorts', 'Information Desk'] },
  { icon: UtensilsCrossed, title: 'Hospitality Staffing', desc: 'Skilled hospitality professionals for hotels, banquets, and VIP events with impeccable service standards.', roles: ['Banquet Staff', 'Bartenders', 'F&B Servers', 'VIP Concierge', 'Lounge Staff'] },
  { icon: LayoutGrid, title: 'Exhibition Staffing', desc: 'Booth assistants, lead generators, and brand ambassadors trained to engage visitors and drive conversions.', roles: ['Booth Assistants', 'Brand Ambassadors', 'Lead Capture Staff', 'Interpreters', 'Tour Guides'] },
  { icon: Heart, title: 'Wedding Staffing', desc: 'Elegant, trained staff to ensure your special day runs flawlessly — from coordination to guest management.', roles: ['Guest Coordinators', 'Ceremony Ushers', 'F&B Staff', 'Decorating Assistants', 'Valet Supervisors'] },
  { icon: Megaphone, title: 'Promotional Staffing', desc: 'High-energy promotional staff for product launches, activations, and sampling campaigns.', roles: ['Brand Ambassadors', 'Product Demonstrators', 'Sampling Staff', 'Promoters', 'Street Teams'] },
  { icon: Shield, title: 'Security & Operations', desc: 'Trained crowd management and operations staff to maintain order and ensure safety at every event.', roles: ['Crowd Managers', 'Entry Supervisors', 'Parking Coordinators', 'Emergency Liaisons'] },
  { icon: Monitor, title: 'Technical Event Support', desc: 'On-ground technical support staff for AV setup, staging, and equipment management during live events.', roles: ['AV Setup Crew', 'Stage Managers', 'Equipment Handlers', 'Tech Support', 'Live Stream Operators'] },
];

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title={<>Staffing for every event type.</>}
        description="From intimate private dinners to international trade shows — trained, verified professionals for every role."
      />

      <section className="section bg-white">
        <div className="container-page divide-y divide-black/[0.07] border-t border-black/[0.07]">
          {SERVICES_DETAIL.map(({ icon: Icon, title, desc, roles }, i) => (
            <motion.div
              key={title}
              {...fadeIn}
              transition={{ ...fadeIn.transition, delay: 0.04 * i }}
              className="py-9 grid grid-cols-1 md:grid-cols-12 gap-5 items-start"
            >
              <div className="md:col-span-4 flex items-start gap-3.5">
                <div className="icon-tile-classic h-9 w-9 shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-[16px] font-semibold text-[#0d1b2a] leading-tight tracking-tight pt-1">{title}</h3>
              </div>
              <div className="md:col-span-5">
                <p className="text-[14px] text-[#5a6478] leading-[1.7]">{desc}</p>
              </div>
              <div className="md:col-span-3">
                <p className="text-[12.5px] text-[#8491a3] leading-[1.8]">
                  {roles.join(' · ')}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section bg-forest-deep text-cream-50 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 gold-rule opacity-50" />
        <div className="container-page flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-[clamp(2rem,3.5vw,2.75rem)] leading-[1.1] tracking-[-0.02em] text-cream-50 font-bold">
              Need staff for a <span>specific role?</span>
            </h2>
            <p className="mt-4 text-cream-50/65 max-w-md">Tell us what you need — we&apos;ll match the right people, fast.</p>
          </div>
          <Link href="/contact" className="inline-flex items-center gap-2 h-12 px-6 rounded bg-[#b86b0a] text-white text-[14px] font-semibold hover:bg-[#975808] transition-colors">
            Get a quotation <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
