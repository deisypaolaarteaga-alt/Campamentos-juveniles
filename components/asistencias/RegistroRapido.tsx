'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Search, CheckCheck, Save } from 'lucide-react';
import { Persona, EstadoAsistencia, Asistencia, ESTADO_ASISTENCIA_LABELS, NIVEL_COLORES } from '@/types';
import { useUpsertAsistencias } from '@/lib/hooks/useAsistencias';
import { formatearFechaLarga } from '@/lib/utils/formatearFecha';
import { cn } from '@/lib/utils';

interface RegistroRapidoProps {
  fecha: string;
  personas: Persona[];
  asistenciasExistentes: Asistencia[];
  onGuardado?: () => void;
  onCerrar?: () => void;
}

const ESTADOS: { valor: EstadoAsistencia; color: string }[] = [
  { valor: 'asistio', color: 'bg-green-500' },
  { valor: 'no_asistio', color: 'bg-red-500' },
  { valor: 'excusa', color: 'bg-yellow-500' },
  { valor: 'tarde', color: 'bg-orange-500' },
  { valor: 'permiso', color: 'bg-blue-500' },
];

export function RegistroRapido({ fecha, personas, asistenciasExistentes, onGuardado, onCerrar }: RegistroRapidoProps) {
  const [busqueda, setBusqueda] = useState('');
  const { upsertMasivo, guardando } = useUpsertAsistencias();

  const estadosIniciales = useMemo(() => {
    const mapa: Record<string, EstadoAsistencia> = {};
    for (const a of asistenciasExistentes) {
      mapa[a.persona_id] = a.estado;
    }
    return mapa;
  }, [asistenciasExistentes]);

  const [estados, setEstados] = useState<Record<string, EstadoAsistencia>>(estadosIniciales);

  const personasFiltradas = personas.filter(p =>
    p.nombre_completo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const marcarTodos = () => {
    const nuevo: Record<string, EstadoAsistencia> = {};
    for (const p of personas) nuevo[p.id] = 'asistio';
    setEstados(nuevo);
  };

  const setEstado = (personaId: string, estado: EstadoAsistencia) => {
    setEstados(prev => ({ ...prev, [personaId]: estado }));
  };

  const guardar = async () => {
    const registros = Object.entries(estados).map(([persona_id, estado]) => ({
      persona_id,
      fecha,
      estado: estado as EstadoAsistencia,
    }));
    const ok = await upsertMasivo(registros);
    if (ok) onGuardado?.();
  };

  const contadores = {
    asistio: Object.values(estados).filter(e => e === 'asistio').length,
    no_asistio: Object.values(estados).filter(e => e === 'no_asistio').length,
    sin_marcar: personas.length - Object.keys(estados).length,
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold">Registro de asistencia</h2>
        <p className="text-sm text-muted-foreground capitalize">{formatearFechaLarga(fecha)}</p>
        <div className="flex gap-3 mt-2 text-xs">
          <span className="text-green-600 font-medium">{contadores.asistio} asistieron</span>
          <span className="text-red-500 font-medium">{contadores.no_asistio} no asistieron</span>
          {contadores.sin_marcar > 0 && <span className="text-muted-foreground">{contadores.sin_marcar} sin marcar</span>}
        </div>
      </div>

      {/* Búsqueda y acciones */}
      <div className="p-3 flex gap-2 border-b border-border">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar persona..."
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          onClick={marcarTodos}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500 text-white text-xs font-medium hover:bg-green-600 transition-colors"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          Todos
        </button>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {personasFiltradas.map(persona => {
          const estadoActual = estados[persona.id];
          const nivelColor = NIVEL_COLORES[persona.nivel_formacion];
          return (
            <div key={persona.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50">
              {persona.foto_url ? (
                <Image src={persona.foto_url} alt={persona.nombre_completo} width={32} height={32} className="rounded-full object-cover w-8 h-8 flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: nivelColor }}>
                  {persona.nombre_completo.charAt(0)}
                </div>
              )}
              <span className="flex-1 text-sm font-medium truncate">{persona.nombre_completo}</span>
              <div className="flex gap-1">
                {ESTADOS.map(({ valor, color }) => (
                  <button
                    key={valor}
                    onClick={() => setEstado(persona.id, valor)}
                    title={ESTADO_ASISTENCIA_LABELS[valor]}
                    className={cn(
                      'w-6 h-6 rounded-full transition-all',
                      estadoActual === valor ? cn(color, 'ring-2 ring-offset-1 ring-current scale-110') : 'bg-muted opacity-40 hover:opacity-70'
                    )}
                  />
                ))}
              </div>
            </div>
          );
        })}
        {!personasFiltradas.length && (
          <p className="text-center text-muted-foreground text-sm py-8">No se encontraron personas</p>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border flex gap-2">
        {onCerrar && (
          <button onClick={onCerrar} className="flex-1 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent">
            Cancelar
          </button>
        )}
        <button
          onClick={guardar}
          disabled={guardando}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {guardando ? 'Guardando...' : 'Guardar todo'}
        </button>
      </div>
    </div>
  );
}
