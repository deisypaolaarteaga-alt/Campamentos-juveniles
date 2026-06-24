'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useBosque } from '@/lib/hooks/useBosque';
import { useAuth } from '@/lib/hooks/useAuth';
import { LayoutDashboard, Users, CalendarCheck, Settings, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';

const navItems = [
  { href: '/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/personas',      label: 'Campistas',     icon: Users },
  { href: '/asistencias',   label: 'Asistencias',   icon: CalendarCheck },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
];

function LogoSidebar({ size = 44, collapsed }: { size?: number; collapsed: boolean }) {
  return (
    <div
      className="flex-shrink-0 overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: '#FFFFFF',
        border: '2px solid rgba(255,255,255,0.2)',
      }}
    >
      <Image
        src="/logo-campamentos.png"
        alt="Campamentos Juveniles Colombia"
        width={size}
        height={size}
        className="w-full h-full object-contain"
        priority
        unoptimized
      />
    </div>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { bosque } = useBosque();
  const { logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-screen sticky top-0 transition-all duration-300 z-10',
        collapsed ? 'w-16' : 'w-64'
      )}
      style={{ backgroundColor: '#0D2B2B' }}
    >
      {/* Header — logo oficial CJ */}
      <div
        className={cn('flex items-center gap-3 p-4 h-20', collapsed && 'justify-center px-2')}
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <LogoSidebar size={44} collapsed={collapsed} />
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-montserrat font-bold text-white text-[13px] leading-tight">
              Campamentos Juveniles
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Colombia 🇨🇴
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                collapsed && 'justify-center px-2'
              )}
              style={{
                color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                backgroundColor: isActive ? '#163838' : 'transparent',
                borderLeft: isActive ? '3px solid #B83A2E' : '3px solid transparent',
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = '#163838';
                if (!isActive) (e.currentTarget as HTMLElement).style.color = '#FFFFFF';
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)';
              }}
            >
              <Icon className={cn('flex-shrink-0', collapsed ? 'w-5 h-5' : 'w-4 h-4')} />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Sección logo del bosque — siempre visible, "Mi Bosque" si aún no hay datos */}
      <div
        className={cn('px-3 py-3', collapsed && 'px-2')}
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        {collapsed ? (
          /* Colapsado: solo avatar */
          bosque?.logo_url ? (
            <div className="flex justify-center">
              <Image
                src={bosque.logo_url}
                alt={bosque.nombre}
                width={32}
                height={32}
                className="rounded-full object-cover"
                style={{ border: '2px solid rgba(255,255,255,0.15)' }}
                unoptimized
              />
            </div>
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mx-auto"
              style={{ backgroundColor: '#B83A2E', color: '#FFFFFF' }}
            >
              {bosque ? bosque.nombre.charAt(0).toUpperCase() : 'B'}
            </div>
          )
        ) : (
          /* Expandido: avatar + nombre + ciudad */
          <div className="flex items-center gap-2.5">
            {bosque?.logo_url ? (
              <Image
                src={bosque.logo_url}
                alt={bosque.nombre}
                width={40}
                height={40}
                className="rounded-full object-cover flex-shrink-0"
                style={{ border: '2px solid rgba(255,255,255,0.15)' }}
                unoptimized
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: '#B83A2E', color: '#FFFFFF' }}
              >
                {bosque ? bosque.nombre.charAt(0).toUpperCase() : 'B'}
              </div>
            )}
            <div className="min-w-0">
              <p
                className="text-[12px] font-semibold leading-tight truncate"
                style={{ color: 'rgba(255,255,255,0.9)' }}
              >
                {bosque ? bosque.nombre : 'Mi Bosque'}
              </p>
              {bosque?.ciudad && (
                <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {bosque.ciudad}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 pb-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
          <p className="text-[10px] text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
            © 2024 Campamentos Juveniles
          </p>
        </div>
      )}

      {/* Cerrar sesión */}
      <div className="px-3 pb-1" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px' }}>
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
            collapsed && 'justify-center px-2'
          )}
          style={{ color: 'rgba(255,255,255,0.5)' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = '#163838';
            (e.currentTarget as HTMLElement).style.color = '#FFFFFF';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)';
          }}
          title={collapsed ? 'Cerrar sesión' : undefined}
        >
          <LogOut className={cn('flex-shrink-0', collapsed ? 'w-5 h-5' : 'w-4 h-4')} />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>

      {/* Botón colapsar */}
      <div className="p-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center px-3 py-2 rounded-xl transition-colors"
          style={{ color: 'rgba(255,255,255,0.5)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#163838'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
          aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
