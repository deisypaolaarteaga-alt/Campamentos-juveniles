'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useBosque } from '@/lib/hooks/useBosque';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { bosque, loading } = useBosque();

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-10">
      {/* Logo + nombre del bosque */}
      <div className="flex items-center gap-2.5 min-w-0">
        {!loading && bosque && (
          <>
            {/* Desktop */}
            <div className="hidden lg:flex items-center gap-2.5">
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
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: '#1C2B1E', color: '#FFFFFF' }}
                >
                  {bosque.nombre.charAt(0).toUpperCase()}
                </div>
              )}
              <span
                className="font-montserrat font-bold truncate"
                style={{ fontSize: 15, color: 'var(--texto)' }}
              >
                {bosque.nombre}
              </span>
            </div>

            {/* Móvil */}
            <div className="flex lg:hidden items-center gap-2">
              {bosque.logo_url ? (
                <Image
                  src={bosque.logo_url}
                  alt={bosque.nombre}
                  width={30}
                  height={30}
                  className="rounded-full object-cover flex-shrink-0"
                  style={{ width: 30, height: 30 }}
                  unoptimized
                />
              ) : (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: '#1C2B1E', color: '#FFFFFF' }}
                >
                  {bosque.nombre.charAt(0).toUpperCase()}
                </div>
              )}
              <span
                className="font-montserrat font-bold truncate max-w-[140px]"
                style={{ fontSize: 14, color: 'var(--texto)' }}
              >
                {bosque.nombre}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg hover:bg-muted active:scale-95 transition-all"
          style={{ color: 'var(--texto-suave)' }}
          aria-label="Cambiar tema"
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4" />
            : <Moon className="w-4 h-4" />
          }
        </button>
      </div>
    </header>
  );
}
