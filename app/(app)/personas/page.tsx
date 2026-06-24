'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, LayoutGrid, List, Search, Download, Users, ChevronRight } from 'lucide-react';
import { usePersonas } from '@/lib/hooks/usePersonas';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { PersonaCard } from '@/components/personas/PersonaCard';
import { PersonaTable } from '@/components/personas/PersonaTable';
import { exportarPersonasExcel } from '@/lib/utils/exportarExcel';
import { Persona, NIVEL_LABELS, NivelFormacion, NIVEL_COLORES } from '@/types';
import { cn } from '@/lib/utils';

export default function CampistasPage() {
  const { personas, loading, toggleEstado, eliminarPersona } = usePersonas();
  const [vista, setVista] = useLocalStorage<'tabla' | 'tarjetas'>('personas-vista', 'tabla');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('');
  const [personaAEliminar, setPersonaAEliminar] = useState<string | null>(null);
  const pedirEliminar = (id: string) => setPersonaAEliminar(id);

  const personasFiltradas = useMemo<Persona[]>(() => {
    return personas.filter((p: Persona) => {
      const q = busqueda.toLowerCase();
      const coincide = !q ||
        p.nombre_completo.toLowerCase().includes(q) ||
        p.documento.includes(q) ||
        (p.email?.toLowerCase().includes(q) ?? false) ||
        (p.telefono?.includes(q) ?? false);
      const estadoOk = !filtroEstado || p.estado === filtroEstado;
      const nivelOk = !filtroNivel || p.nivel_formacion === filtroNivel;
      return coincide && estadoOk && nivelOk;
    });
  }, [personas, busqueda, filtroEstado, filtroNivel]);

  const confirmarEliminar = useCallback(async () => {
    if (!personaAEliminar) return;
    await eliminarPersona(personaAEliminar);
    setPersonaAEliminar(null);
  }, [personaAEliminar, eliminarPersona]);

  const niveles: NivelFormacion[] = ['campista','semilla','raiz','tallo','hoja','flor','fruto'];

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-24 lg:pb-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-montserrat font-bold text-2xl">Campistas</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{personas.length} registrados</p>
        </div>
        {/* Botón solo visible en desktop — en móvil hay FAB */}
        <Link
          href="/personas/nueva"
          className="hidden sm:flex btn-cj-primary items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Nuevo campista
        </Link>
      </div>

      {/* Buscador siempre visible */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            value={busqueda}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, documento..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-input bg-background text-sm"
          />
        </div>

        {/* Vista toggle + export — solo desktop */}
        <div className="hidden sm:flex gap-1 bg-muted rounded-xl p-1">
          <button
            onClick={() => setVista('tabla')}
            className={cn('p-1.5 rounded-lg transition-colors', vista === 'tabla' ? 'bg-background shadow-sm' : 'hover:bg-background/50')}
            title="Vista tabla"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setVista('tarjetas')}
            className={cn('p-1.5 rounded-lg transition-colors', vista === 'tarjetas' ? 'bg-background shadow-sm' : 'hover:bg-background/50')}
            title="Vista tarjetas"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={() => exportarPersonasExcel(personas)}
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border border-border hover:bg-accent text-sm transition-colors active:scale-95"
        >
          <Download className="w-4 h-4" />
          Exportar
        </button>
      </div>

      {/* Filtros estado + nivel — solo desktop */}
      <div className="hidden sm:flex gap-3">
        <select
          value={filtroEstado}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFiltroEstado(e.target.value)}
          className="px-3 py-2 rounded-xl border border-input bg-background text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activo en el Bosque</option>
          <option value="inactivo">Inactivo</option>
        </select>
        <select
          value={filtroNivel}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFiltroNivel(e.target.value)}
          className="px-3 py-2 rounded-xl border border-input bg-background text-sm"
        >
          <option value="">Todos los niveles</option>
          {niveles.map(n => <option key={n} value={n}>{NIVEL_LABELS[n]}</option>)}
        </select>
      </div>

      {(busqueda || filtroEstado || filtroNivel) && (
        <p className="text-sm text-muted-foreground">{personasFiltradas.length} resultado(s)</p>
      )}

      {/* Contenido */}
      {loading ? (
        <div className={cn('grid gap-4', vista === 'tarjetas' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : '')}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-2xl skeleton-shimmer" />
          ))}
        </div>
      ) : personasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: 'rgba(200,16,46,0.08)' }}
          >
            <Users className="w-10 h-10" style={{ color: '#C8102E', opacity: 0.5 }} />
          </div>
          <h3 className="font-montserrat font-semibold text-lg mb-2">
            {personas.length === 0 ? 'Sin campistas registrados' : 'Sin resultados'}
          </h3>
          <p className="text-muted-foreground text-sm mb-5 max-w-xs">
            {personas.length === 0
              ? 'Registra el primer campista de tu Bosque.'
              : 'Intenta con otros filtros o términos de búsqueda.'}
          </p>
          {personas.length === 0 && (
            <Link
              href="/personas/nueva"
              className="btn-cj-primary px-5 py-2.5 rounded-xl text-sm font-semibold"
            >
              Registrar primer campista
            </Link>
          )}
        </div>
      ) : (
        /* En móvil siempre vista lista; en desktop respeta la preferencia */
        <div className="sm:hidden space-y-2">
          {personasFiltradas.map((p: Persona) => (
            <MobilePersonaRow key={p.id} persona={p} />
          ))}
        </div>
      )}

      {/* Desktop: vista elegida */}
      {!loading && personasFiltradas.length > 0 && (
        <div className="hidden sm:block">
          {vista === 'tarjetas' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {personasFiltradas.map((p: Persona) => (
                <PersonaCard key={p.id} persona={p} onToggleEstado={toggleEstado} onEliminar={pedirEliminar} />
              ))}
            </div>
          ) : (
            <PersonaTable personas={personasFiltradas} onToggleEstado={toggleEstado} onEliminar={pedirEliminar} />
          )}
        </div>
      )}

      {/* FAB móvil — botón flotante nuevo campista */}
      <Link
        href="/personas/nueva"
        className="sm:hidden fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full btn-cj-primary flex items-center justify-center shadow-xl"
        aria-label="Nuevo campista"
      >
        <Plus className="w-6 h-6" />
      </Link>

      {/* Dialog confirmación eliminar */}
      {personaAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setPersonaAEliminar(null)} />
          <div className="relative bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-montserrat font-semibold mb-2">¿Eliminar campista?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Esta acción no se puede deshacer. Se eliminarán también sus registros de asistencia.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setPersonaAEliminar(null)}
                className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted active:scale-95 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-sm active:scale-95 transition-all"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MobilePersonaRow({ persona }: { persona: Persona }) {
  const nivelColor = NIVEL_COLORES[persona.nivel_formacion as NivelFormacion];
  const inicial = persona.nombre_completo.charAt(0).toUpperCase();

  return (
    <Link
      href={`/personas/${persona.id}`}
      className="flex items-center gap-3 p-3 rounded-2xl border bg-card active:scale-[0.98] transition-all card-hover"
      style={{ borderColor: 'var(--borde)' }}
    >
      {persona.foto_url ? (
        <Image
          src={persona.foto_url}
          alt={persona.nombre_completo}
          width={48}
          height={48}
          className="rounded-full object-cover flex-shrink-0"
          style={{ width: 48, height: 48, border: `3px solid ${nivelColor}` }}
          unoptimized
        />
      ) : (
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center font-montserrat font-bold text-xl text-white flex-shrink-0"
          style={{ backgroundColor: nivelColor }}
        >
          {inicial}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-montserrat font-semibold text-sm truncate">{persona.nombre_completo}</p>
        <p className="text-xs mt-0.5 text-muted-foreground capitalize">
          {persona.nivel_formacion} · {persona.estado === 'activo' ? '🟢 Activo' : '⚫ Inactivo'}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    </Link>
  );
}
