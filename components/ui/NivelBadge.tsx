'use client';

import { cn } from '@/lib/utils';
import { NIVEL_COLORES, NIVEL_EMOJIS, NIVEL_LABELS, NivelFormacion } from '@/types';

interface NivelBadgeProps {
  nivel: NivelFormacion;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
  lg: 'text-base px-3 py-1.5 gap-2 font-bold',
};

export function NivelBadge({ nivel, size = 'md', className, style }: NivelBadgeProps) {
  const color = NIVEL_COLORES[nivel];
  const emoji = NIVEL_EMOJIS[nivel];
  const label = NIVEL_LABELS[nivel];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold border select-none',
        SIZE_CLASSES[size],
        className
      )}
      style={{
        backgroundColor: `${color}18`,
        color: color,
        borderColor: `${color}40`,
        ...style,
      }}
    >
      <span role="img" aria-label={label}>{emoji}</span>
      <span>{label}</span>
    </span>
  );
}
