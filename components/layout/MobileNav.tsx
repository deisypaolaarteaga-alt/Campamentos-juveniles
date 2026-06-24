'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CalendarCheck, Settings } from 'lucide-react';

const navItems = [
  { href: '/dashboard',     label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/personas',      label: 'Campistas',   icon: Users },
  { href: '/asistencias',   label: 'Asistencias', icon: CalendarCheck },
  { href: '/configuracion', label: 'Config',       icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
      style={{
        height: 64,
        backgroundColor: '#FFFFFF',
        boxShadow: '0 -1px 0 rgba(0,0,0,0.08), 0 -4px 16px rgba(0,0,0,0.1)',
      }}
    >
      <div className="flex items-center justify-around h-full">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
              style={{ color: isActive ? '#C1121F' : '#9CA3AF' }}
            >
              <Icon style={{ width: 22, height: 22 }} />
              <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, lineHeight: 1 }}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
