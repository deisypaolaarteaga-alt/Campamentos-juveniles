'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Search, ChevronLeft, ChevronRight, Check, X, Save } from 'lucide-react';
import { usePersonas } from '@/lib/hooks/usePersonas';
import { useAsistenciasFecha, useUpsertAsistencias } from '@/lib/hooks/useAsistencias';
import { NivelBadge } from '@/components/ui/NivelBadge';
import { Persona, NivelFormacion, NIVEL_COLORES, EstadoAsistencia } from '@/types';
import { format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type EstadoLocal = 'asistio' | 'no_asistio' | null;

function formatFechaHumana(fecha: Date): string {
  const raw = format(fecha, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export default function AsistenciasPage() {
  const [fecha, setFecha] = useState(new Date());
  const [busqueda, setBusqueda] = useState('');
  const [estados, setEstados] = useState<Record<string, EstadoLocal>>({});

  const fechaStr = format(fecha, 'yyyy-MM-dd');
  const { personas, loading: loadingPersonas } = usePersonas({ estado: 'activo' });
  const { asistencias, cargar: recargar } = useAsistenciasFecha(fechaStr);
  const { upsertMasivo, guardando } = useUpsertAsistencias();

  // Precarga estados guardados al cambiar de fecha
  const estadosPrevios = useMemo(() => {
    const mapa: Record<string, EstadoLocal> = {};
    asistencias.forEach(a => {
      if (a.estado === 'asistio' || a.estado === 'no_asistio') {
        mapa[a.persona_id] = a.estado;
      }
    });
    return mapa;
  }, [asistencias]);

  const estadoEfectivo = (personaId: string): EstadoLocal =>
    personaId in estados ? estados[personaId] : (estadosPrevios[personaId] ?? null);

  const marcar = (personaId: string, estado: EstadoLocal) => {
    setEstados(prev => ({
      ...prev,
      [personaId]: prev[personaId] === estado ? null : estado,
    }));
  };

  const marcados = personas.filter(p => estadoEfectivo(p.id) !== null);
  const marcadosAsistio = personas.filter(p => estadoEfectivo(p.id) === 'asistio');
  const marcadosNoAsistio = personas.filter(p => estadoEfectivo(p.id) === 'no_asistio');
  const hayCambios = Object.keys(estados).length > 0;

  const personasFiltradas = personas.filter(p =>
    p.nombre_completo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const marcarTodos = () => {
    const nuevos: Record<string, EstadoLocal> = {};
    personas.forEach(p => { nuevos[p.id] = 'asistio'; });
    setEstados(nuevos);
  };

  const guardar = async () => {
    const registros: Array<{ persona_id: string; fecha: string; estado: EstadoAsistencia }> = [];

    personas.forEach(p => {
      const e = estadoEfectivo(p.id);
      if (e !== null) {
        registros.push({ persona_id: p.id, fecha: fechaStr, estado: e });
      }
    });

    if (registros.length === 0) {
      toast.warning('No hay registros que guardar');
      return;
    }

    const ok = await upsertMasivo(registros);
    if (ok) {
      toast.success(`✅ Asistencia guardada — ${marcadosAsistio.length} asistieron, ${marcadosNoAsistio.length} no asistieron`);
      setEstados({});
      await recargar();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-28">

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-card border border-border p-6">
        {/* Selector de fecha */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => { setFecha(d => subDays(d, 1)); setEstados({}); }}
            className="p-2 rounded-xl border transition-colors"
            style={{ borderColor: '#E0D9D0' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F0EDE8'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="font-montserrat font-bold text-xl" style={{ color: '#1A1A2E' }}>
              Asistencia de hoy
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>
              {formatFechaHumana(fecha)}
            </p>
          </div>
          <button
            onClick={() => { setFecha(d => addDays(d, 1)); setEstados({}); }}
            className="p-2 rounded-xl border transition-colors"
            style={{ borderColor: '#E0D9D0' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F0EDE8'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Contador */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold" style={{ color: '#6B7280' }}>
            {marcados.length} de {personas.length} marcados ✅
          </p>
          <button
            onClick={marcarTodos}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: '#C8102E', backgroundColor: 'rgba(200,16,46,0.08)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(200,16,46,0.15)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(200,16,46,0.08)'; }}
          >
            Marcar todos como asistió
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6B7280' }} />
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar campista..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2"
          style={{
            border: '1px solid #E0D9D0',
            backgroundColor: '#FFFFFF',
            color: '#1A1A2E',
          }}
        />
      </div>

      {/* Lista */}
      {loadingPersonas ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 rounded-2xl skeleton-shimmer" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {personasFiltradas.map(persona => {
            const estado = estadoEfectivo(persona.id);
            const nivelColor = NIVEL_COLORES[persona.nivel_formacion as NivelFormacion];
            const inicial = persona.nombre_completo.charAt(0).toUpperCase();

            let rowBg = '#FFFFFF';
            if (estado === 'asistio')    rowBg = 'rgba(34,197,94,0.06)';
            if (estado === 'no_asistio') rowBg = 'rgba(239,68,68,0.06)';

            return (
              <div
                key={persona.id}
                className="flex items-center gap-3 p-3 rounded-2xl border transition-colors"
                style={{ borderColor: '#E0D9D0', backgroundColor: rowBg }}
              >
                {/* Foto */}
                {persona.foto_url ? (
                  <Image
                    src={persona.foto_url}
                    alt={persona.nombre_completo}
                    width={40}
                    height={40}
                    className="rounded-full object-cover flex-shrink-0"
                    style={{ border: `2px solid ${nivelColor}` }}
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: nivelColor }}
                  >
                    {inicial}
                  </div>
                )}

                {/* Nombre + nivel */}
                <div className="flex-1 min-w-0">
                  <p className="font-montserrat font-semibold text-sm truncate" style={{ color: '#1A1A2E' }}>
                    {persona.nombre_completo}
                  </p>
                  <NivelBadge nivel={persona.nivel_formacion as NivelFormacion} size="sm" />
                </div>

                {/* Botones */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => marcar(persona.id, 'asistio')}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors',
                      estado === 'asistio'
                        ? 'text-white'
                        : 'border'
                    )}
                    style={
                      estado === 'asistio'
                        ? { backgroundColor: '#22c55e', borderColor: 'transparent' }
                        : { backgroundColor: 'transparent', borderColor: '#E0D9D0', color: '#6B7280' }
                    }
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Asistió</span>
                  </button>

                  <button
                    onClick={() => marcar(persona.id, 'no_asistio')}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors',
                      estado === 'no_asistio'
                        ? 'text-white'
                        : 'border'
                    )}
                    style={
                      estado === 'no_asistio'
                        ? { backgroundColor: '#ef4444', borderColor: 'transparent' }
                        : { backgroundColor: 'transparent', borderColor: '#E0D9D0', color: '#6B7280' }
                    }
                  >
                    <X className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">No asistió</span>
                  </button>
                </div>
              </div>
            );
          })}

          {personasFiltradas.length === 0 && (
            <p className="text-center py-8 text-sm" style={{ color: '#6B7280' }}>
              {busqueda ? `Sin resultados para "${busqueda}"` : 'No hay campistas activos'}
            </p>
          )}
        </div>
      )}

      {/* Botón flotante */}
      {hayCambios && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={guardar}
            disabled={guardando}
            className="btn-cj-primary flex items-center gap-3 px-6 py-3.5 rounded-2xl text-sm font-bold shadow-lg disabled:opacity-60"
            style={{ minWidth: 260 }}
          >
            <Save className="w-4 h-4" />
            {guardando
              ? 'Guardando...'
              : `Guardar asistencias (${marcados.length} marcados)`
            }
          </button>
        </div>
      )}
    </div>
  );
}
