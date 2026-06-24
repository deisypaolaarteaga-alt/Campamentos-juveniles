import { cn } from '@/lib/utils';
import { EstadoAsistencia, ESTADO_ASISTENCIA_LABELS } from '@/types';

const CLASES: Record<EstadoAsistencia, string> = {
  asistio:    'bg-[#2D7048]/12 text-[#1A5C35] font-semibold',
  no_asistio: 'bg-[#B83A2E]/12 text-[#972E24] font-semibold',
  excusa:     'bg-[#A87C1A]/14 text-[#7A5810] font-semibold',
  tarde:      'bg-[#C67E1A]/14 text-[#8A5810] font-semibold',
  permiso:    'bg-[#2B5FA5]/12 text-[#1E447A] font-semibold',
};

interface EstadoBadgeProps {
  estado: EstadoAsistencia;
  className?: string;
}

export function EstadoBadge({ estado, className }: EstadoBadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', CLASES[estado], className)}>
      {ESTADO_ASISTENCIA_LABELS[estado]}
    </span>
  );
}
