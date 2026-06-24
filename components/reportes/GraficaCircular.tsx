'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GraficaCircularProps {
  data: { nombre: string; valor: number; color: string }[];
  titulo?: string;
  altura?: number;
}

export function GraficaCircular({ data, titulo, altura = 220 }: GraficaCircularProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      {titulo && <h3 className="font-semibold text-sm mb-4">{titulo}</h3>}
      <ResponsiveContainer width="100%" height={altura}>
        <PieChart>
          <Pie data={data} dataKey="valor" nameKey="nombre" cx="50%" cy="50%" outerRadius={80}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
          <Legend iconSize={10} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
