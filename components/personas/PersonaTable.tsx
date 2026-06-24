'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Edit, Trash2, UserCheck, UserX, Eye } from 'lucide-react';
import { Persona, NIVEL_COLORES, NIVEL_LABELS } from '@/types';
import { cn } from '@/lib/utils';

interface PersonaTableProps {
  personas: Persona[];
  onToggleEstado: (id: string, estado: string) => Promise<boolean>;
  onEliminar: (id: string) => unknown;
}

export function PersonaTable({ personas, onToggleEstado, onEliminar }: PersonaTableProps) {
  if (!personas.length) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Persona</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Documento</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Nivel</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {personas.map(persona => {
            const nivelColor = NIVEL_COLORES[persona.nivel_formacion];
            return (
              <tr key={persona.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {persona.foto_url ? (
                      <Image src={persona.foto_url} alt={persona.nombre_completo} width={32} height={32} className="rounded-full object-cover w-8 h-8 flex-shrink-0" unoptimized />
                    ) : (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: nivelColor }}>
                        {persona.nombre_completo.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium truncate max-w-[160px]">{persona.nombre_completo}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">{persona.documento}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{persona.documento}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: nivelColor }}>
                    {NIVEL_LABELS[persona.nivel_formacion]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    persona.estado === 'activo'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  )}>
                    {persona.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/personas/${persona.id}`} className="p-1.5 rounded hover:bg-accent text-muted-foreground" title="Ver perfil">
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                    <Link href={`/personas/${persona.id}/editar`} className="p-1.5 rounded hover:bg-accent text-muted-foreground" title="Editar">
                      <Edit className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => onToggleEstado(persona.id, persona.estado)}
                      className="p-1.5 rounded hover:bg-accent text-muted-foreground"
                      title={persona.estado === 'activo' ? 'Archivar' : 'Activar'}
                    >
                      {persona.estado === 'activo' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => onEliminar(persona.id)}
                      className="p-1.5 rounded hover:bg-accent text-red-500"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
