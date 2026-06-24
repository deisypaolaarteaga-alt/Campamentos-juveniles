'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface GraficaBarrasProps {
  data: Record<string, unknown>[];
  barras: { dataKey: string; nombre: string; color: string }[];
  xAxisKey?: string;
  yUnit?: string;
  titulo?: string;
  altura?: number;
}

export function GraficaBarras({ data, barras, xAxisKey = 'nombre', yUnit = '', titulo, altura = 200 }: GraficaBarrasProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      {titulo && <h3 className="font-semibold text-sm mb-4">{titulo}</h3>}
      <ResponsiveContainer width="100%" height={altura}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey={xAxisKey} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} unit={yUnit} />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
          />
          {barras.length > 1 && <Legend iconSize={10} />}
          {barras.map(b => (
            <Bar key={b.dataKey} dataKey={b.dataKey} fill={b.color} radius={[4, 4, 0, 0]} name={b.nombre} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
