'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Asistencia, Persona, ResumenPersona } from '@/types';
import {
  rankingAsistencia,
  detectarPatrones,
  generarResumenMes,
} from '@/lib/utils/estadisticas';

export function useEstadisticasDashboard() {
  const [datos, setDatos] = useState({
    totalPersonas: 0,
    personasActivas: 0,
    asistenciasMes: 0,
    ausenciasMes: 0,
    personasNuevasAño: 0,
    porcentajeMes: 0,
    porcentajeMesAnterior: 0,
    tendencia6Meses: [] as { mes: string; porcentaje: number }[],
    distribucionNiveles: [] as { nivel: string; cantidad: number }[],
    topAsistentes: [] as ResumenPersona[],
    alertasBajaAsistencia: [] as ResumenPersona[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      const hoy = new Date();
      const año = hoy.getFullYear();
      const mes = hoy.getMonth() + 1;

      const [{ data: personas }, { data: asistencias }] = await Promise.all([
        supabase.from('personas').select('*'),
        supabase.from('asistencias').select('*')
          .gte('fecha', `${año}-01-01`)
          .lte('fecha', `${año}-12-31`),
      ]);

      const ps: Persona[] = personas || [];
      const as_: Asistencia[] = asistencias || [];

      const activas = ps.filter(p => p.estado === 'activo');
      const resumenMes = generarResumenMes(año, mes, as_);
      const mesAntNum = mes === 1 ? 12 : mes - 1;
      const mesAntAño = mes === 1 ? año - 1 : año;
      const mesAnterior = generarResumenMes(mesAntAño, mesAntNum, as_);

      const ranking = rankingAsistencia(activas, as_);
      const { criticos } = detectarPatrones(activas, as_);

      // Tendencia 6 meses
      const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      const tendencia = Array.from({ length: 6 }, (_, i) => {
        const m = ((mes - 6 + i + 12) % 12) + 1;
        const a = m > mes ? año - 1 : año;
        const r = generarResumenMes(a, m, as_);
        return { mes: meses[m - 1], porcentaje: r.porcentaje_asistencia };
      });

      // Distribución por nivel
      const niveles = ['campista','semilla','raiz','tallo','hoja','flor','fruto'];
      const distribucion = niveles.map(n => ({
        nivel: n,
        cantidad: activas.filter(p => p.nivel_formacion === n).length,
      })).filter(d => d.cantidad > 0);

      setDatos({
        totalPersonas: ps.length,
        personasActivas: activas.length,
        asistenciasMes: resumenMes.total_asistencias,
        ausenciasMes: resumenMes.total_ausencias,
        personasNuevasAño: ps.filter(p => p.año_ingreso === año).length,
        porcentajeMes: resumenMes.porcentaje_asistencia,
        porcentajeMesAnterior: mesAnterior.porcentaje_asistencia,
        tendencia6Meses: tendencia,
        distribucionNiveles: distribucion,
        topAsistentes: ranking.slice(0, 5),
        alertasBajaAsistencia: criticos.slice(0, 10),
      });
      setLoading(false);
    };
    cargar();
  }, []);

  return { ...datos, loading };
}
