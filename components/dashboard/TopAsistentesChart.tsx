'use client';

import Link from 'next/link';
import { ResumenPersona, NIVEL_COLORES } from '@/types';

interface TopAsistentesChartProps {
  data: ResumenPersona[];
}

export function TopAsistentesChart({ data }: TopAsistentesChartProps) {
  if (!data.length) return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="font-semibold mb-3 text-sm">Top 5 mejor asistencia</h3>
      <p className="text-muted-foreground text-sm">Sin datos disponibles</p>
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="font-semibold mb-4 text-sm">Top 5 mejor asistencia este mes</h3>
      <div className="space-y-3">
        {data.map((r, i) => (
          <Link key={r.persona.id} href={`/personas/${r.persona.id}`} className="flex items-center gap-3 hover:bg-accent rounded-lg p-1.5 transition-colors -mx-1.5">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{r.persona.nombre_completo}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${r.porcentaje}%`, backgroundColor: NIVEL_COLORES[r.persona.nivel_formacion] }}
                  />
                </div>
                <span className="text-xs font-semibold text-muted-foreground w-10 text-right">{r.porcentaje}%</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
