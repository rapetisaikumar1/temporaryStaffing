'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { NAV_LINKS, SITE_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white border-b-2 border-[#e8eaed] shadow-[0_2px_20px_rgba(0,0,0,0.08)]">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#b86b0a]" />
      <div className="container-page flex h-[72px] items-center justify-between gap-8">

        {/* Brand */}
        <Link href="/" onClick={close} className="flex items-center shrink-0">
          <span className="text-[21px] font-black leading-none text-[#0d1b2a] tracking-tight">
            {SITE_NAME}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center flex-1 justify-center">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-4 py-2 text-[14px] font-medium rounded transition-colors',
                  active
                    ? 'text-[#0d1b2a]'
                    : 'text-[#5a6478] hover:text-[#0d1b2a] hover:bg-black/[0.03]',
                )}
              >
                {link.label}
                {active && (
                  <span className="absolute left-4 right-4 -bottom-[1px] h-[2px] bg-[#b86b0a] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 h-10 px-5 rounded bg-[#1b2e45] text-white text-[14px] font-bold hover:bg-[#253f5e] transition-colors whitespace-nowrap"
          >
            Request staff
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden h-8 w-8 inline-flex items-center justify-center rounded text-[#5a6478] hover:text-[#0d1b2a] hover:bg-black/[0.05] transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-black/[0.07] bg-white">
          <div className="container-page py-4 flex flex-col gap-0.5">
            {NAV_LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={close}
                  className={cn(
                    'py-3 px-3 text-[15px] font-medium rounded-lg transition-colors',
                    active ? 'text-[#0d1b2a] bg-black/[0.04]' : 'text-[#5a6478] hover:text-[#0d1b2a]',
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
            <div className="mt-3 pt-3 border-t border-black/[0.07]">
              <Link href="/contact" onClick={close} className="flex items-center justify-center h-10 rounded bg-[#1b2e45] text-white text-[13.5px] font-bold hover:bg-[#253f5e] transition-colors">
                Request staff
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
