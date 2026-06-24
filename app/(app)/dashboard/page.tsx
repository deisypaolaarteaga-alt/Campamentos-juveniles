'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Users, CalendarCheck, Clock, Search, UserPlus } from 'lucide-react';
import { usePersonas } from '@/lib/hooks/usePersonas';
import { useEstadisticasDashboard } from '@/lib/hooks/useEstadisticas';
import { useBosque } from '@/lib/hooks/useBosque';
import { NivelBadge } from '@/components/ui/NivelBadge';
import { NivelFormacion, NIVEL_COLORES } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

function CampfireSVG() {
  return (
    <svg width="120" height="96" viewBox="0 0 140 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="18"  cy="12" r="1.8" fill="#FFD700" opacity="0.9"/>
      <circle cx="52"  cy="6"  r="1.2" fill="#FFD700" opacity="0.7"/>
      <circle cx="95"  cy="9"  r="1.8" fill="#FFD700" opacity="0.9"/>
      <circle cx="122" cy="16" r="1.2" fill="#FFD700" opacity="0.8"/>
      <circle cx="78"  cy="4"  r="1.5" fill="#FFD700" opacity="0.6"/>
      <ellipse cx="70" cy="95" rx="62" ry="7"  fill="#2E7D32" opacity="0.2"/>
      <rect x="45" y="89" width="50" height="7" rx="3.5" fill="#6B3A2A"/>
      <rect x="51" y="84" width="38" height="6" rx="3" fill="#8B4513" transform="rotate( 20 70 87)"/>
      <rect x="51" y="84" width="38" height="6" rx="3" fill="#8B4513" transform="rotate(-20 70 87)"/>
      <path d="M64 90 C61 78 67 70 70 65 C73 70 79 78 76 90 Z" fill="#C8102E" opacity="0.85"/>
      <path d="M63 90 C60 80 66 72 70 68 C74 72 80 80 77 90 Z" fill="#FF6B35" opacity="0.9"/>
      <path d="M66 90 C64 82 68 75 70 72 C72 75 76 82 74 90 Z" fill="#FF8C00"/>
      <path d="M67 90 C66 85 69 79 70 76 C71 79 74 85 73 90 Z" fill="#FFD700"/>
    </svg>
  );
}

function StatCard({ icono, titulo, valor, color }: {
  icono: React.ReactNode;
  titulo: string;
  valor: string | number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-3 sm:p-5 shadow-card border border-border flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
      <div className="flex-shrink-0 w-8 h-8 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
        <span style={{ color }}>{icono}</span>
      </div>
      <div className="min-w-0">
        <p className="font-montserrat font-bold text-lg sm:text-2xl leading-none" style={{ color: '#1A1A2E' }}>{valor}</p>
        <p className="text-[10px] sm:text-xs mt-0.5 leading-tight" style={{ color: '#6B7280' }}>{titulo}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [busqueda, setBusqueda] = useState('');
  const { personas, loading: loadingPersonas } = usePersonas({ estado: 'activo' });
  const stats = useEstadisticasDashboard();
  const { bosque } = useBosque();

  const fechaRaw = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  const fechaHoy = fechaRaw.charAt(0).toUpperCase() + fechaRaw.slice(1);

  const personasFiltradas = personas
    .filter(p => p.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo, 'es'));

  const sinCampistas = !loadingPersonas && personas.length === 0;

  const ultimaReunion = stats.loading ? '—' : (() => {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const diasDesdeUltimaSabado = (diaSemana + 1) % 7;
    const ultima = new Date(hoy);
    ultima.setDate(hoy.getDate() - diasDesdeUltimaSabado);
    return format(ultima, "d MMM", { locale: es });
  })();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Card identidad del Bosque */}
      <div
        className="rounded-2xl p-5 sm:p-8 flex items-center gap-4 sm:gap-6"
        style={{ background: 'linear-gradient(135deg, #0D2B2B 0%, #163838 100%)', boxShadow: '0 4px 24px rgba(13,43,43,0.35)' }}
      >
        {/* Avatar 80px */}
        {bosque?.logo_url ? (
          <Image
            src={bosque.logo_url}
            alt={bosque.nombre}
            width={80}
            height={80}
            className="rounded-full object-cover flex-shrink-0 w-14 h-14 sm:w-20 sm:h-20"
            style={{ border: '3px solid rgba(255,255,255,0.25)' }}
            unoptimized
          />
        ) : (
          <div
            className="w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold flex-shrink-0"
            style={{ backgroundColor: '#B83A2E', color: '#FFFFFF', border: '3px solid rgba(255,255,255,0.25)' }}
          >
            {bosque ? bosque.nombre.charAt(0).toUpperCase() : 'B'}
          </div>
        )}

        {/* Texto */}
        <div className="min-w-0">
          <h2 className="font-montserrat font-bold leading-tight text-white truncate text-xl sm:text-[28px]">
            {bosque ? bosque.nombre : 'Mi Bosque'}
          </h2>
          <p className="text-base mt-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {[bosque?.ciudad, !stats.loading ? `${stats.personasActivas} campistas activos` : null]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
      </div>

      {/* Bienvenida */}
      <div className="bg-white rounded-2xl shadow-card border border-border p-6">
        <div className="flex items-center gap-4">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 font-montserrat font-bold text-sm"
            style={{ backgroundColor: '#2D4A31', color: '#C8102E' }}
          >
            CJ
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-montserrat font-bold text-xl" style={{ color: '#1A1A2E' }}>
              Buenos días, Líder 👋
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>{fechaHoy}</p>
          </div>
        </div>
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid #E0D9D0' }} />

        {/* 3 stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 -mt-1">
          <StatCard
            icono={<Users className="w-5 h-5" />}
            titulo="Campistas"
            valor={stats.loading ? '—' : stats.personasActivas}
            color="#1C2B1E"
          />
          <StatCard
            icono={<CalendarCheck className="w-5 h-5" />}
            titulo="Asistencia"
            valor={stats.loading ? '—' : `${stats.porcentajeMes}%`}
            color="#C8102E"
          />
          <StatCard
            icono={<Clock className="w-5 h-5" />}
            titulo="Última reunión"
            valor={ultimaReunion}
            color="#8B4513"
          />
        </div>
      </div>

      {/* Lista de campistas */}
      <div className="bg-white rounded-2xl shadow-card border border-border p-6">
        <div className="flex items-center justify-between mb-5 gap-3">
          <h2 className="font-montserrat font-bold text-lg min-w-0 truncate" style={{ color: '#1A1A2E' }}>
            Campistas
            {!loadingPersonas && (
              <span className="ml-2 text-base font-normal" style={{ color: '#6B7280' }}>
                ({personas.length})
              </span>
            )}
          </h2>
          <Link
            href="/personas/nueva"
            className="btn-cj-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold flex-shrink-0 whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            Nuevo
          </Link>
        </div>

        {/* Buscador */}
        {!sinCampistas && (
          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6B7280' }} />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar campista..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2"
              style={{
                border: '1px solid #E0D9D0',
                backgroundColor: '#F0EDE8',
                color: '#1A1A2E',
              }}
            />
          </div>
        )}

        {/* Loading skeletons */}
        {loadingPersonas && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 rounded-2xl skeleton-shimmer" />
            ))}
          </div>
        )}

        {/* Estado vacío */}
        {sinCampistas && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CampfireSVG />
            <h3 className="font-montserrat font-bold text-xl mt-5 mb-2" style={{ color: '#1A1A2E' }}>
              Tu Bosque está listo 🌲
            </h3>
            <p className="text-sm mb-6" style={{ color: '#6B7280', maxWidth: 260 }}>
              Registra tu primer campista para comenzar
            </p>
            <Link
              href="/personas/nueva"
              className="btn-cj-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
            >
              Registrar campista
            </Link>
          </div>
        )}

        {/* Grid de campistas */}
        {!loadingPersonas && personasFiltradas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {personasFiltradas.map(persona => {
              const inicial = persona.nombre_completo.charAt(0).toUpperCase();
              const nivelColor = NIVEL_COLORES[persona.nivel_formacion as NivelFormacion];
              return (
                <div
                  key={persona.id}
                  className="flex items-center gap-3 p-4 rounded-2xl border card-hover"
                  style={{ borderColor: '#E0D9D0', backgroundColor: '#FAFAF9' }}
                >
                  {/* Foto / inicial */}
                  {persona.foto_url ? (
                    <Image
                      src={persona.foto_url}
                      alt={persona.nombre_completo}
                      width={40}
                      height={40}
                      className="rounded-full object-cover flex-shrink-0"
                      style={{ width: 40, height: 40, border: `2px solid ${nivelColor}` }}
                      unoptimized
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: nivelColor }}
                    >
                      {inicial}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-montserrat font-semibold text-sm truncate" style={{ color: '#1A1A2E' }}>
                      {persona.nombre_completo}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <NivelBadge nivel={persona.nivel_formacion as NivelFormacion} size="sm" />
                      <span
                        className={cn(
                          'text-xs',
                          persona.estado === 'activo' ? 'text-green-600' : 'text-gray-400'
                        )}
                      >
                        {persona.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>

                  {/* Link */}
                  <Link
                    href={`/personas/${persona.id}`}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0 transition-colors"
                    style={{ color: '#C8102E', backgroundColor: 'rgba(200,16,46,0.08)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(200,16,46,0.15)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(200,16,46,0.08)'; }}
                  >
                    Ver →
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Sin resultados de búsqueda */}
        {!loadingPersonas && !sinCampistas && personasFiltradas.length === 0 && (
          <p className="text-center py-8 text-sm" style={{ color: '#6B7280' }}>
            Sin resultados para &ldquo;{busqueda}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}
