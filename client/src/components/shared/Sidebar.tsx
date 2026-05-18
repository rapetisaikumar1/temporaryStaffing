'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Mail, Users, UserCheck, Calendar, ClipboardList,
  FileText, Clock, CreditCard, BarChart2, Settings, LogOut, ShieldCheck,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { SITE_NAME } from '@/lib/constants';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';

type NavItem = { label: string; href: string; icon: React.ElementType };
type NavGroup = { title: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  { title: 'Overview',       items: [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }] },
  { title: 'Operations',     items: [
    { label: 'Inquiries',   href: '/inquiries',   icon: Mail },
    { label: 'Clients',     href: '/clients',     icon: Users },
    { label: 'Staff',       href: '/staff',       icon: UserCheck },
    { label: 'Events',      href: '/events',      icon: Calendar },
    { label: 'Assignments', href: '/assignments', icon: ClipboardList },
  ]},
  { title: 'Finance',        items: [
    { label: 'Quotations',  href: '/quotations',  icon: FileText },
    { label: 'Attendance',  href: '/attendance',  icon: Clock },
    { label: 'Payments',    href: '/payments',    icon: CreditCard },
  ]},
  { title: 'Insights',       items: [{ label: 'Reports', href: '/reports', icon: BarChart2 }] },
  { title: 'Administration', items: [
    { label: 'Admin Users', href: '/users',    icon: ShieldCheck },
    { label: 'Settings',    href: '/settings', icon: Settings },
  ]},
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { clearAuth, user } = useAuthStore();

  const handleLogout = async () => {
    try { await authService.logout(); } finally { clearAuth(); router.replace('/login'); }
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col bg-white border-r border-ink-200/70">
      {/* Brand */}
      <Link href="/dashboard" className="flex items-center gap-2 px-5 h-[64px] border-b border-ink-200/70 shrink-0">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink-950">
          <span className="block h-1.5 w-1.5 rounded-[2px] bg-white" />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-[14.5px] font-semibold tracking-[-0.01em] text-ink-950">{SITE_NAME.toLowerCase()}</span>
          <span className="text-[10px] uppercase tracking-[0.16em] text-ink-400">Admin Console</span>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scroll-thin py-4 px-3">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.title} className={cn(gi > 0 && 'mt-5')}>
            <p className="px-2.5 mb-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-400">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ label, href, icon: Icon }) => {
                const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'group relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-colors',
                      active
                        ? 'bg-ink-100 text-ink-950 font-medium'
                        : 'text-ink-600 hover:text-ink-950 hover:bg-ink-50',
                    )}
                  >
                    <Icon className={cn('w-[16px] h-[16px] shrink-0', active ? 'text-ink-950' : 'text-ink-500 group-hover:text-ink-800')} />
                    <span className="flex-1 truncate">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-ink-200/70 p-3 shrink-0">
        {user && (
          <div className="flex items-center gap-2.5 px-2.5 py-2.5 mb-1 rounded-lg">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-ink-950 text-white text-[11px] font-medium shrink-0">
              {getInitials(user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-medium text-ink-950 truncate">{user.name}</p>
              <p className="text-[10.5px] text-ink-500 truncate uppercase tracking-[0.08em]">
                {user.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-ink-600 hover:text-ink-950 hover:bg-ink-50 transition-colors"
        >
          <LogOut className="w-[16px] h-[16px]" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
