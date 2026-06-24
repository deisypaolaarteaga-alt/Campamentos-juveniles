'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface GraficaLineasProps {
  data: Record<string, unknown>[];
  lineas: { dataKey: string; nombre: string; color: string }[];
  xAxisKey?: string;
  yUnit?: string;
  titulo?: string;
  altura?: number;
}

export function GraficaLineas({ data, lineas, xAxisKey = 'nombre', yUnit = '', titulo, altura = 200 }: GraficaLineasProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      {titulo && <h3 className="font-semibold text-sm mb-4">{titulo}</h3>}
      <ResponsiveContainer width="100%" height={altura}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey={xAxisKey} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} unit={yUnit} />
          <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
          {lineas.length > 1 && <Legend iconSize={10} />}
          {lineas.map(l => (
            <Line key={l.dataKey} type="monotone" dataKey={l.dataKey} stroke={l.color} strokeWidth={2} dot={{ r: 3 }} name={l.nombre} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
