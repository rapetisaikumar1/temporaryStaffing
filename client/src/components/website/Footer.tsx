'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';
import { SITE_NAME, CONTACT_EMAIL, CONTACT_PHONE } from '@/lib/constants';

const linkCols: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'Services',
    links: [
      { label: 'Corporate events', href: '/services' },
      { label: 'Conferences', href: '/services' },
      { label: 'Hospitality', href: '/services' },
      { label: 'Exhibitions', href: '/services' },
      { label: 'Weddings', href: '/services' },
    ],
  },
  {
    heading: 'Industries',
    links: [
      { label: 'Corporate', href: '/industries' },
      { label: 'Hospitality', href: '/industries' },
      { label: 'Retail & Brand', href: '/industries' },
      { label: 'Government', href: '/industries' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* CTA strip */}
      <div className="relative bg-[#f5f4f1] border-b border-black/[0.08]">
        <div className="container-page py-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
          <div className="max-w-2xl">
            <p className="eyebrow-gold">Ready when you are</p>
            <h3 className="mt-4 text-[clamp(2rem,3.6vw,3.25rem)] leading-[1.12] tracking-[-0.015em] font-bold" style={{ color: '#0d1b2a' }}>
              Premium staff for your next signature event.
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="inline-flex items-center gap-2 h-12 px-6 rounded bg-[#b86b0a] text-white text-[14px] font-semibold hover:bg-[#975808] transition-colors">
              Request staff
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link href="/services" className="inline-flex items-center h-12 px-6 rounded border border-[#1b2e45]/30 text-[#1b2e45] text-[14px] font-semibold hover:bg-[#1b2e45]/[0.06] transition-colors">
              Browse services
            </Link>
          </div>
        </div>
      </div>

      {/* Columns */}
      <div className="bg-forest-deep text-cream-50">
        <div className="container-page py-20 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-4">
          <Link href="/" className="flex items-center">
            <span className="text-[17px] font-black leading-none text-cream-50 tracking-tight">{SITE_NAME}</span>
          </Link>
          <p className="mt-5 text-[14.5px] text-cream-50/65 leading-relaxed max-w-xs">
            Verified, trained, event-ready temporary staff for India&apos;s most demanding events.
          </p>
          <ul className="mt-7 space-y-3.5 text-[13.5px] text-cream-50/75">
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#b86b0a]" />
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-cream-50 transition-colors">{CONTACT_EMAIL}</a>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#b86b0a]" />
              <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className="hover:text-cream-50 transition-colors">{CONTACT_PHONE}</a>
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-[#b86b0a]" />
              <span>Mumbai · Delhi · Bengaluru · Hyderabad</span>
            </li>
          </ul>
        </div>

        {linkCols.map((col) => (
          <div key={col.heading} className="md:col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b86b0a]/80">{col.heading}</p>
            <ul className="mt-5 space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[13.5px] text-cream-50/70 hover:text-cream-50 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="md:col-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b86b0a]/80">Legal</p>
          <ul className="mt-5 space-y-3">
            <li><Link href="/privacy" className="text-[13.5px] text-cream-50/70 hover:text-cream-50 transition-colors">Privacy</Link></li>
            <li><Link href="/terms" className="text-[13.5px] text-cream-50/70 hover:text-cream-50 transition-colors">Terms</Link></li>
            <li><Link href="/login" className="text-[13.5px] text-cream-50/70 hover:text-cream-50 transition-colors">Admin sign in</Link></li>
          </ul>
        </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-forest-deep border-t border-cream-50/[0.08]">
        <div className="container-page py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-[12px] text-cream-50/50">© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
          <p className="text-[12px] text-cream-50/55">
            Crafted for India&apos;s most demanding event teams.
          </p>
        </div>
      </div>
    </footer>
  );
}
