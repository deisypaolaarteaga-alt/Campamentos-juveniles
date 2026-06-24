'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AsistenciaMensualChartProps {
  data: { mes: string; porcentaje: number }[];
}

export function AsistenciaMensualChart({ data }: AsistenciaMensualChartProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="font-semibold mb-4 text-sm">Asistencia por mes (últimos 6 meses)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="mes" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
          <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" className="fill-muted-foreground" />
          <Tooltip
            formatter={(v: number) => [`${v}%`, 'Asistencia']}
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
          />
          <Bar dataKey="porcentaje" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.porcentaje >= 80 ? '#22c55e' : entry.porcentaje >= 60 ? '#eab308' : '#ef4444'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
