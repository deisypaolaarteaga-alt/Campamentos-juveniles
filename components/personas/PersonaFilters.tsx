'use client';

import { NIVEL_LABELS, NivelFormacion } from '@/types';

interface PersonaFiltersProps {
  estado: string;
  nivel: string;
  onEstadoChange: (v: string) => void;
  onNivelChange: (v: string) => void;
}

const NIVELES: NivelFormacion[] = ['campista','semilla','raiz','tallo','hoja','flor','fruto'];

export function PersonaFilters({ estado, nivel, onEstadoChange, onNivelChange }: PersonaFiltersProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      <select
        value={estado}
        onChange={e => onEstadoChange(e.target.value)}
        className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Todos los estados</option>
        <option value="activo">Activos</option>
        <option value="inactivo">Inactivos</option>
      </select>
      <select
        value={nivel}
        onChange={e => onNivelChange(e.target.value)}
        className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Todos los niveles</option>
        {NIVELES.map(n => <option key={n} value={n}>{NIVEL_LABELS[n]}</option>)}
      </select>
    </div>
  );
}
