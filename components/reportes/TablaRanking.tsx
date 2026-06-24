'use client';

import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ResumenPersona, NIVEL_COLORES, NIVEL_LABELS } from '@/types';
import { cn } from '@/lib/utils';

interface TablaRankingProps {
  data: ResumenPersona[];
}

export function TablaRanking({ data }: TablaRankingProps) {
  if (!data.length) return (
    <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
      Sin datos disponibles para el período seleccionado
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm">Ranking de asistencia</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">#</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nombre</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Nivel</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">Asist.</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">%</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">Tendencia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((r, i) => (
              <tr key={r.persona.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                <td className="px-4 py-3">
                  <Link href={`/personas/${r.persona.id}`} className="font-medium hover:text-primary truncate max-w-[160px] block">
                    {r.persona.nombre_completo}
                  </Link>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: NIVEL_COLORES[r.persona.nivel_formacion] }}>
                    {NIVEL_LABELS[r.persona.nivel_formacion]}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">{r.total_asistencias}</td>
                <td className="px-4 py-3 text-center font-bold" style={{ color: r.porcentaje >= 80 ? '#22c55e' : r.porcentaje >= 60 ? '#eab308' : '#ef4444' }}>
                  {r.porcentaje}%
                </td>
                <td className="px-4 py-3 text-center">
                  {r.porcentaje >= 80 ? <TrendingUp className="w-4 h-4 text-green-500 mx-auto" /> :
                   r.porcentaje >= 60 ? <Minus className="w-4 h-4 text-yellow-500 mx-auto" /> :
                   <TrendingDown className="w-4 h-4 text-red-500 mx-auto" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
