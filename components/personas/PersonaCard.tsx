'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MoreVertical, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { useState } from 'react';
import { Persona, NIVEL_COLORES, NIVEL_LABELS } from '@/types';
import { cn } from '@/lib/utils';

interface PersonaCardProps {
  persona: Persona;
  onToggleEstado: (id: string, estado: string) => Promise<boolean>;
  onEliminar: (id: string) => void;
}

export function PersonaCard({ persona, onToggleEstado, onEliminar }: PersonaCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const nivelColor = NIVEL_COLORES[persona.nivel_formacion];

  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow relative">
      <div className="flex items-start justify-between mb-3">
        <Link href={`/personas/${persona.id}`} className="flex items-center gap-3">
          {persona.foto_url ? (
            <Image src={persona.foto_url} alt={persona.nombre_completo} width={44} height={44} className="rounded-full object-cover w-11 h-11" unoptimized />
          ) : (
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: nivelColor }}>
              {persona.nombre_completo.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium text-sm truncate max-w-[140px]">{persona.nombre_completo}</p>
            <p className="text-xs text-muted-foreground">{persona.documento}</p>
          </div>
        </Link>
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 rounded hover:bg-accent">
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-7 z-20 w-44 bg-popover border border-border rounded-lg shadow-lg py-1">
                <Link href={`/personas/${persona.id}/editar`} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent" onClick={() => setMenuOpen(false)}>
                  <Edit className="w-3.5 h-3.5" /> Editar
                </Link>
                <button
                  onClick={async () => { setMenuOpen(false); await onToggleEstado(persona.id, persona.estado); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent w-full text-left"
                >
                  {persona.estado === 'activo' ? <><UserX className="w-3.5 h-3.5" /> Archivar</> : <><UserCheck className="w-3.5 h-3.5" /> Activar</>}
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onEliminar(persona.id); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent w-full text-left text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: nivelColor }}
        >
          {NIVEL_LABELS[persona.nivel_formacion]}
        </span>
        <span className={cn(
          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
          persona.estado === 'activo'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
        )}>
          {persona.estado === 'activo' ? 'Activo' : 'Inactivo'}
        </span>
      </div>
      {persona.telefono && (
        <p className="text-xs text-muted-foreground mt-2 truncate">{persona.telefono}</p>
      )}
    </div>
  );
}
