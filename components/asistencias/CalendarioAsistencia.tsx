'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Asistencia, EstadoAsistencia, ESTADO_ASISTENCIA_COLORES } from '@/types';
import { cn } from '@/lib/utils';

interface DiaInfo {
  asistentes: number;
  total: number;
  estados: Record<EstadoAsistencia, number>;
}

interface CalendarioAsistenciaProps {
  asistencias: Asistencia[];
  totalActivos: number;
  onDiaClick?: (fecha: string) => void;
  mes?: Date;
  onMesCambio?: (fecha: Date) => void;
}

export function CalendarioAsistencia({
  asistencias,
  totalActivos,
  onDiaClick,
  mes: mesProp,
  onMesCambio,
}: CalendarioAsistenciaProps) {
  const [mesLocal, setMesLocal] = useState(new Date());
  const mes = mesProp || mesLocal;

  const cambiarMes = (delta: number) => {
    const nuevo = new Date(mes.getFullYear(), mes.getMonth() + delta, 1);
    if (onMesCambio) onMesCambio(nuevo);
    else setMesLocal(nuevo);
  };

  const inicio = startOfMonth(mes);
  const fin = endOfMonth(mes);
  const dias = eachDayOfInterval({ start: inicio, end: fin });

  const diaPrimerDia = inicio.getDay(); // 0 = dom
  const offsetLunes = (diaPrimerDia + 6) % 7;

  const infoPorDia = new Map<string, DiaInfo>();
  for (const a of asistencias) {
    const key = a.fecha;
    if (!infoPorDia.has(key)) {
      infoPorDia.set(key, { asistentes: 0, total: 0, estados: { asistio: 0, no_asistio: 0, excusa: 0, tarde: 0, permiso: 0 } });
    }
    const info = infoPorDia.get(key)!;
    info.total++;
    info.estados[a.estado]++;
    if (a.estado === 'asistio' || a.estado === 'tarde') info.asistentes++;
  }

  const diasSemana = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      {/* Navegación */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => cambiarMes(-1)} className="p-1.5 rounded-lg hover:bg-accent">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="font-semibold text-sm capitalize">
          {format(mes, 'MMMM yyyy', { locale: es })}
        </h3>
        <button onClick={() => cambiarMes(1)} className="p-1.5 rounded-lg hover:bg-accent">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Cabecera días */}
      <div className="grid grid-cols-7 mb-2">
        {diasSemana.map(d => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      {/* Días */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: offsetLunes }).map((_, i) => <div key={`pre-${i}`} />)}
        {dias.map(dia => {
          const key = format(dia, 'yyyy-MM-dd');
          const info = infoPorDia.get(key);
          const hoy = isToday(dia);
          const porcentaje = info && totalActivos > 0 ? Math.round((info.asistentes / totalActivos) * 100) : null;

          return (
            <button
              key={key}
              onClick={() => onDiaClick?.(key)}
              className={cn(
                'aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-all relative group',
                hoy ? 'ring-2 ring-primary' : '',
                info ? 'hover:scale-105' : 'hover:bg-accent',
                onDiaClick ? 'cursor-pointer' : 'cursor-default'
              )}
              style={info ? {
                backgroundColor: `${porcentaje !== null && porcentaje >= 80 ? '#22c55e' : porcentaje !== null && porcentaje >= 60 ? '#eab308' : '#ef4444'}20`,
              } : {}}
            >
              <span className={cn('font-medium', hoy && 'text-primary')}>{format(dia, 'd')}</span>
              {info && (
                <span className="text-[9px] text-muted-foreground">{info.asistentes}/{totalActivos}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border">
        {[
          { color: '#22c55e', label: '≥80%' },
          { color: '#eab308', label: '60-79%' },
          { color: '#ef4444', label: '<60%' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: `${l.color}30`, border: `1px solid ${l.color}` }} />
            <span className="text-xs text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
