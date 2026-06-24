'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Plus, LayoutGrid, List, Search, Download, Users } from 'lucide-react';
import { usePersonas } from '@/lib/hooks/usePersonas';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { PersonaCard } from '@/components/personas/PersonaCard';
import { PersonaTable } from '@/components/personas/PersonaTable';
import { exportarPersonasExcel } from '@/lib/utils/exportarExcel';
import { Persona, NIVEL_LABELS, NivelFormacion } from '@/types';
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
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-montserrat font-bold text-2xl">Campistas</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{personas.length} registrados en total</p>
        </div>
        <Link
          href="/personas/nueva"
          className="btn-cj-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo campista</span>
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            value={busqueda}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, documento, email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={filtroEstado}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFiltroEstado(e.target.value)}
          className="px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activo en el Bosque</option>
          <option value="inactivo">Inactivo</option>
        </select>
        <select
          value={filtroNivel}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFiltroNivel(e.target.value)}
          className="px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Todos los niveles</option>
          {niveles.map(n => <option key={n} value={n}>{NIVEL_LABELS[n]}</option>)}
        </select>
        <div className="flex gap-1 bg-muted rounded-xl p-1">
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
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border hover:bg-accent text-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Exportar</span>
        </button>
      </div>

      {(busqueda || filtroEstado || filtroNivel) && (
        <p className="text-sm text-muted-foreground">{personasFiltradas.length} resultado(s)</p>
      )}

      {/* Contenido */}
      {loading ? (
        <div className={cn('grid gap-4', vista === 'tarjetas' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : '')}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-2xl skeleton-shimmer" />
          ))}
        </div>
      ) : personasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h3 className="font-montserrat font-semibold text-lg mb-2">
            {personas.length === 0 ? 'No hay campistas registrados' : 'Sin resultados'}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            {personas.length === 0
              ? 'Comienza registrando el primer campista del Bosque.'
              : 'Intenta con otros filtros o términos de búsqueda.'}
          </p>
          {personas.length === 0 && (
            <Link
              href="/personas/nueva"
              className="btn-cj-primary px-4 py-2 rounded-xl text-sm font-semibold"
            >
              Registrar primer campista
            </Link>
          )}
        </div>
      ) : vista === 'tarjetas' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {personasFiltradas.map((p: Persona) => (
            <PersonaCard
              key={p.id}
              persona={p}
              onToggleEstado={toggleEstado}
              onEliminar={pedirEliminar}
            />
          ))}
        </div>
      ) : (
        <PersonaTable
          personas={personasFiltradas}
          onToggleEstado={toggleEstado}
          onEliminar={pedirEliminar}
        />
      )}

      {/* Dialog confirmación eliminar */}
      {personaAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setPersonaAEliminar(null)} />
          <div className="relative bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-montserrat font-semibold mb-2">¿Eliminar campista?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Esta acción no se puede deshacer. Se eliminarán también todos los registros de asistencia de este campista.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setPersonaAEliminar(null)}
                className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-accent"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-sm hover:bg-destructive/90"
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
