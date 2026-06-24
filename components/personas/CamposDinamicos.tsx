'use client';

import { CampoPersonalizado } from '@/types';

interface CamposDinamicosProps {
  campos: CampoPersonalizado[];
  valores: Record<string, unknown>;
  onChange: (nombre: string, valor: unknown) => void;
}

export function CamposDinamicos({ campos, valores, onChange }: CamposDinamicosProps) {
  const activos = campos.filter(c => c.activo);

  if (!activos.length) return null;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-muted-foreground">Campos adicionales</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {activos.map(campo => (
          <div key={campo.id}>
            <label className="block text-sm font-medium mb-1">
              {campo.etiqueta}
              {campo.obligatorio && <span className="text-destructive ml-1">*</span>}
            </label>
            {campo.tipo === 'text' && (
              <input
                type="text"
                value={String(valores[campo.nombre_campo] ?? '')}
                onChange={e => onChange(campo.nombre_campo, e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            )}
            {campo.tipo === 'number' && (
              <input
                type="number"
                value={String(valores[campo.nombre_campo] ?? '')}
                onChange={e => onChange(campo.nombre_campo, e.target.valueAsNumber)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            )}
            {campo.tipo === 'date' && (
              <input
                type="date"
                value={String(valores[campo.nombre_campo] ?? '')}
                onChange={e => onChange(campo.nombre_campo, e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            )}
            {campo.tipo === 'textarea' && (
              <textarea
                value={String(valores[campo.nombre_campo] ?? '')}
                onChange={e => onChange(campo.nombre_campo, e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            )}
            {campo.tipo === 'select' && (
              <select
                value={String(valores[campo.nombre_campo] ?? '')}
                onChange={e => onChange(campo.nombre_campo, e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Seleccionar...</option>
                {campo.opciones?.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            )}
            {campo.tipo === 'boolean' && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(valores[campo.nombre_campo])}
                  onChange={e => onChange(campo.nombre_campo, e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Sí</span>
              </label>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
