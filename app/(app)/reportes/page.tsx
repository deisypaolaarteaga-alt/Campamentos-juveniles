'use client';

import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { Download, FileText, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { supabase } from '@/lib/supabase/client';
import { Persona, Asistencia, NIVEL_COLORES, NIVEL_LABELS, NivelFormacion, ESTADO_ASISTENCIA_COLORES, ESTADO_ASISTENCIA_LABELS, EstadoAsistencia } from '@/types';
import { rankingAsistencia, detectarPatrones, generarResumenMes } from '@/lib/utils/estadisticas';
import { exportarReporteExcel } from '@/lib/utils/exportarExcel';
import { exportarReportePDF } from '@/lib/utils/exportarPDF';
import { cn } from '@/lib/utils';

export default function ReportesPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [año, setAño] = useState(new Date().getFullYear());
  const [mesSeleccionado, setMesSeleccionado] = useState<number | null>(null);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      const [{ data: ps }, { data: as_ }] = await Promise.all([
        supabase.from('personas').select('*').eq('estado', 'activo'),
        supabase.from('asistencias').select('*')
          .gte('fecha', `${año}-01-01`)
          .lte('fecha', `${año}-12-31`),
      ]);
      setPersonas(ps || []);
      setAsistencias(as_ || []);
      setLoading(false);
    };
    cargar();
  }, [año]);

  const asistenciasFiltradas = useMemo(() => {
    if (!mesSeleccionado) return asistencias;
    const mes = String(mesSeleccionado).padStart(2, '0');
    return asistencias.filter(a => a.fecha.startsWith(`${año}-${mes}`));
  }, [asistencias, mesSeleccionado, año]);

  const ranking = useMemo(() => rankingAsistencia(personas, asistenciasFiltradas), [personas, asistenciasFiltradas]);
  const { constantes, enRiesgo, criticos } = useMemo(() => detectarPatrones(personas, asistenciasFiltradas), [personas, asistenciasFiltradas]);

  const tendenciaMensual = useMemo(() => {
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return meses.map((mes, i) => {
      const r = generarResumenMes(año, i + 1, asistencias);
      return { mes, porcentaje: r.porcentaje_asistencia, asistencias: r.total_asistencias, ausencias: r.total_ausencias };
    });
  }, [año, asistencias]);

  const distribucionEstados = useMemo(() => {
    const conteos: Record<string, number> = {};
    for (const a of asistenciasFiltradas) {
      conteos[a.estado] = (conteos[a.estado] || 0) + 1;
    }
    return Object.entries(conteos).map(([estado, cantidad]) => ({
      estado,
      cantidad,
      label: ESTADO_ASISTENCIA_LABELS[estado as EstadoAsistencia],
      color: ESTADO_ASISTENCIA_COLORES[estado as EstadoAsistencia],
    }));
  }, [asistenciasFiltradas]);

  const distribucionNiveles = useMemo(() => {
    return ['campista','semilla','raiz','tallo','hoja','flor','fruto'].map(nivel => ({
      nivel,
      label: NIVEL_LABELS[nivel as NivelFormacion],
      cantidad: personas.filter(p => p.nivel_formacion === nivel).length,
      color: NIVEL_COLORES[nivel as NivelFormacion],
    })).filter(d => d.cantidad > 0);
  }, [personas]);

  const periodo = mesSeleccionado
    ? `${año}-${String(mesSeleccionado).padStart(2, '0')}`
    : String(año);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="h-8 bg-muted rounded w-32 animate-pulse" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reportes</h1>
          <p className="text-muted-foreground text-sm mt-1">Análisis de asistencia y estadísticas</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={año}
            onChange={e => setAño(Number(e.target.value))}
            className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
          >
            {[2022, 2023, 2024, 2025, 2026].map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select
            value={mesSeleccionado || ''}
            onChange={e => setMesSeleccionado(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
          >
            <option value="">Año completo</option>
            {['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
          <button
            onClick={() => exportarReporteExcel(ranking, asistenciasFiltradas, periodo)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-accent text-sm"
          >
            <Download className="w-4 h-4" /> Excel
          </button>
          <button
            onClick={() => exportarReportePDF(ranking, periodo)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-accent text-sm"
          >
            <FileText className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Personas activas', valor: personas.length },
          { label: 'Total registros', valor: asistenciasFiltradas.length },
          { label: 'Consistentes (>90%)', valor: constantes.length, color: 'text-green-600' },
          { label: 'Críticos (<60%)', valor: criticos.length, color: 'text-red-500' },
        ].map(({ label, valor, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${color || ''}`}>{valor}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tendencia mensual */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-4">Tendencia mensual {año}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={tendenciaMensual} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: number) => [`${v}%`]} />
              <Line type="monotone" dataKey="porcentaje" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} name="Asistencia" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución estados */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-4">Distribución por estado</h3>
          {distribucionEstados.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={distribucionEstados} dataKey="cantidad" nameKey="label" cx="50%" cy="50%" outerRadius={75} label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {distribucionEstados.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Sin datos</div>
          )}
        </div>

        {/* Barras asistencia vs ausencias */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-4">Asistencias vs Ausencias por mes</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tendenciaMensual} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="asistencias" fill="#22c55e" radius={[3, 3, 0, 0]} name="Asistencias" />
              <Bar dataKey="ausencias" fill="#ef4444" radius={[3, 3, 0, 0]} name="Ausencias" />
              <Legend iconSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución niveles */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-4">Personas por nivel de formación</h3>
          <div className="space-y-2">
            {distribucionNiveles.map(({ nivel, label, cantidad, color }) => (
              <div key={nivel} className="flex items-center gap-3">
                <span className="text-xs w-16 text-right text-muted-foreground">{label}</span>
                <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${personas.length > 0 ? (cantidad / personas.length) * 100 : 0}%`, backgroundColor: color }}
                  />
                </div>
                <span className="text-xs font-semibold w-6 text-right">{cantidad}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patrones */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { titulo: 'Asistencia constante (>90%)', personas: constantes, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
          { titulo: 'En riesgo (60-80%)', personas: enRiesgo, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
          { titulo: 'Estado crítico (<60%)', personas: criticos, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30' },
        ].map(({ titulo, personas: ps, color, bg }) => (
          <div key={titulo} className={`border border-border rounded-xl p-4 ${bg}`}>
            <h3 className={`font-semibold text-sm mb-3 ${color}`}>{titulo}</h3>
            <p className={`text-3xl font-bold mb-3 ${color}`}>{ps.length}</p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {ps.slice(0, 8).map(r => (
                <div key={r.persona.id} className="flex justify-between text-xs">
                  <span className="truncate max-w-[140px]">{r.persona.nombre_completo}</span>
                  <span className={`font-semibold ${color}`}>{r.porcentaje}%</span>
                </div>
              ))}
              {ps.length > 8 && <p className="text-xs text-muted-foreground">+{ps.length - 8} más</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Ranking completo */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">Ranking completo de asistencia</h3>
        </div>
        {ranking.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Sin datos para el período seleccionado</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">#</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Nivel</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Asist.</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Ausen.</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">%</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Tendencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ranking.map((r, i) => (
                  <tr key={r.persona.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground font-mono">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{r.persona.nombre_completo}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: NIVEL_COLORES[r.persona.nivel_formacion] }}>
                        {NIVEL_LABELS[r.persona.nivel_formacion]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-green-600 font-medium">{r.total_asistencias}</td>
                    <td className="px-4 py-3 text-center text-red-500 font-medium">{r.total_ausencias}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        'font-bold',
                        r.porcentaje >= 90 ? 'text-green-600' : r.porcentaje >= 60 ? 'text-yellow-600' : 'text-red-500'
                      )}>
                        {r.porcentaje}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.porcentaje >= 80 ? <TrendingUp className="w-4 h-4 text-green-500 mx-auto" /> :
                       r.porcentaje >= 60 ? <Minus className="w-4 h-4 text-yellow-500 mx-auto" /> :
                       <TrendingDown className="w-4 h-4 text-red-500 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
