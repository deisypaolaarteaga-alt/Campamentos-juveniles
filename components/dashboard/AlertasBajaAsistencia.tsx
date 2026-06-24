'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { ResumenPersona } from '@/types';

interface AlertasBajaAsistenciaProps {
  data: ResumenPersona[];
}

export function AlertasBajaAsistencia({ data }: AlertasBajaAsistenciaProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        <h3 className="font-semibold text-sm">Baja asistencia (&lt;60%)</h3>
      </div>
      {!data.length ? (
        <p className="text-muted-foreground text-sm">¡Excelente! No hay personas en estado crítico.</p>
      ) : (
        <div className="space-y-2">
          {data.map(r => (
            <div key={r.persona.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-border last:border-0">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{r.persona.nombre_completo}</p>
                <p className="text-xs text-red-500 font-semibold">{r.porcentaje}% asistencia</p>
              </div>
              <Link
                href={`/personas/${r.persona.id}`}
                className="text-xs text-primary hover:underline flex-shrink-0"
              >
                Ver perfil
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
