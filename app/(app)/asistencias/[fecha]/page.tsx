'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { RegistroRapido } from '@/components/asistencias/RegistroRapido';
import { useAsistenciasFecha } from '@/lib/hooks/useAsistencias';
import { usePersonas } from '@/lib/hooks/usePersonas';

export default function AsistenciaFechaPage() {
  const { fecha } = useParams<{ fecha: string }>();
  const { asistencias, cargar } = useAsistenciasFecha(fecha);
  const { personas } = usePersonas({ estado: 'activo' });
  const personasActivas = personas.filter(p => p.estado === 'activo');

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-5">
        <Link href="/asistencias" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Volver al calendario
        </Link>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <RegistroRapido
          fecha={fecha}
          personas={personasActivas}
          asistenciasExistentes={asistencias}
          onGuardado={cargar}
        />
      </div>
    </div>
  );
}
