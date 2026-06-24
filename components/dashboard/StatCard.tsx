import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ReactNode } from 'react';

interface StatCardProps {
  titulo: string;
  valor: string | number;
  icono: ReactNode;
  descripcion?: string;
  tendencia?: number;
  loading?: boolean;
  borderColor?: string;
  iconBg?: string;
  iconColor?: string;
  /** @deprecated use borderColor/iconBg/iconColor instead */
  color?: string;
}

export function StatCard({
  titulo,
  valor,
  icono,
  descripcion,
  tendencia,
  loading,
  borderColor = '#003087',
  iconBg = 'rgba(0,48,135,0.1)',
  iconColor = '#003087',
}: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 shadow-card overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <div className="h-3 bg-muted rounded w-24 skeleton-shimmer" />
          <div className="w-10 h-10 rounded-xl bg-muted skeleton-shimmer" />
        </div>
        <div className="h-8 bg-muted rounded w-16 mb-2 skeleton-shimmer" />
        <div className="h-3 bg-muted rounded w-28 skeleton-shimmer" />
      </div>
    );
  }

  return (
    <div
      className="bg-card border border-border rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden"
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-muted-foreground font-medium pr-2 leading-tight">{titulo}</p>
        <div
          className="p-2.5 rounded-xl flex-shrink-0"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          {icono}
        </div>
      </div>

      <p className="font-montserrat text-2xl font-bold tracking-tight" style={{ color: borderColor }}>
        {valor}
      </p>

      {(descripcion || tendencia !== undefined) && (
        <div className="flex items-center gap-1 mt-1.5">
          {tendencia !== undefined && (
            <span
              className={cn(
                'flex items-center text-xs font-medium',
                tendencia > 0
                  ? 'text-green-600'
                  : tendencia < 0
                  ? 'text-red-500'
                  : 'text-muted-foreground'
              )}
            >
              {tendencia > 0 ? (
                <TrendingUp className="w-3 h-3 mr-0.5" />
              ) : tendencia < 0 ? (
                <TrendingDown className="w-3 h-3 mr-0.5" />
              ) : (
                <Minus className="w-3 h-3 mr-0.5" />
              )}
              {Math.abs(tendencia)}% vs mes anterior
            </span>
          )}
          {descripcion && <p className="text-xs text-muted-foreground">{descripcion}</p>}
        </div>
      )}
    </div>
  );
}
