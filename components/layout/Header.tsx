'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Sun, Moon, Bell } from 'lucide-react';
import { useBosque } from '@/lib/hooks/useBosque';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { bosque, loading } = useBosque();

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {/* Logo + nombre del bosque — visible en desktop */}
        {!loading && bosque && (
          <div className="hidden lg:flex items-center gap-2.5">
            {bosque.logo_url ? (
              <Image
                src={bosque.logo_url}
                alt={bosque.nombre}
                width={36}
                height={36}
                className="rounded-full object-cover flex-shrink-0"
                style={{ width: 36, height: 36 }}
                unoptimized
              />
            ) : (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: '#1C2B1E', color: '#FFFFFF' }}
              >
                {bosque.nombre.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-montserrat font-bold" style={{ fontSize: 15, color: 'var(--texto)' }}>
              {bosque.nombre}
            </span>
          </div>
        )}

        {/* Logo + nombre bosque en móvil */}
        {!loading && bosque && (
          <div className="flex lg:hidden items-center gap-2">
            {bosque.logo_url ? (
              <Image
                src={bosque.logo_url}
                alt={bosque.nombre}
                width={32}
                height={32}
                className="rounded-full object-cover flex-shrink-0"
                style={{ width: 32, height: 32 }}
                unoptimized
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: '#1C2B1E', color: '#FFFFFF' }}
              >
                {bosque.nombre.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-montserrat font-bold" style={{ fontSize: 15, color: 'var(--texto)' }}>
              {bosque.nombre}
            </span>
          </div>
        )}

        {title && <h1 className="font-semibold text-lg hidden sm:block">{title}</h1>}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-md hover:bg-accent transition-colors text-muted-foreground"
          aria-label="Cambiar tema"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button className="p-2 rounded-md hover:bg-accent transition-colors text-muted-foreground" aria-label="Notificaciones">
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
