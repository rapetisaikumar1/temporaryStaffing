'use client';

import { Bell, Search, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getInitials } from '@/lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 h-[64px] border-b border-ink-200/70 bg-white/85 backdrop-blur-xl flex items-center justify-between px-8 shrink-0">
      <div className="flex flex-col min-w-0">
        <h1 className="text-[17px] font-semibold text-ink-950 tracking-[-0.01em] truncate">{title}</h1>
        {subtitle && <p className="text-[12.5px] text-ink-500 mt-0.5 truncate">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {actions}

        <div className="hidden md:flex items-center gap-2 h-9 w-60 rounded-lg border border-ink-200 bg-white px-3 text-ink-500 hover:border-ink-300 transition-colors">
          <Search className="w-[14px] h-[14px] text-ink-400" />
          <input placeholder="Search…" className="flex-1 bg-transparent text-[13px] placeholder:text-ink-400 outline-none" />
          <kbd className="hidden lg:inline-flex items-center rounded border border-ink-200 bg-ink-50 px-1.5 py-px text-[10px] font-medium text-ink-500">⌘K</kbd>
        </div>

        <button className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-ink-200 bg-white hover:bg-ink-50 text-ink-600 transition-colors">
          <Bell className="w-[15px] h-[15px]" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        {user && (
          <button className="flex items-center gap-2.5 pl-1 pr-2.5 py-1 rounded-lg border border-ink-200 bg-white hover:bg-ink-50 transition-colors">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-ink-950 text-white text-[11px] font-medium">
              {getInitials(user.name)}
            </div>
            <div className="hidden sm:block leading-tight text-left">
              <p className="text-[12.5px] font-medium text-ink-950">{user.name}</p>
              <p className="text-[10.5px] text-ink-500 uppercase tracking-[0.08em]">{user.role.replace('_', ' ')}</p>
            </div>
            <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-ink-400" />
          </button>
        )}
      </div>
    </header>
  );
}
