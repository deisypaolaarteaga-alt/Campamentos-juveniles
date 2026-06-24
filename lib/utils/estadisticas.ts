import { Asistencia, EstadisticasMes, Persona, ResumenPersona } from '@/types';
import { parseISO, isSameMonth, isSameYear, compareDesc } from 'date-fns';

export function calcularPorcentajeAsistencia(asistencias: Asistencia[]): number {
  if (!asistencias.length) return 0;
  const asistidas = asistencias.filter(a => a.estado === 'asistio' || a.estado === 'tarde').length;
  return Math.round((asistidas / asistencias.length) * 100);
}

export function calcularRachaActual(asistencias: Asistencia[], personaId: string): number {
  const propias = asistencias
    .filter(a => a.persona_id === personaId)
    .sort((a, b) => compareDesc(parseISO(a.fecha), parseISO(b.fecha)));

  let racha = 0;
  for (const a of propias) {
    if (a.estado === 'asistio' || a.estado === 'tarde') {
      racha++;
    } else {
      break;
    }
  }
  return racha;
}

export function generarResumenMes(año: number, mes: number, asistencias: Asistencia[]): EstadisticasMes {
  const delMes = asistencias.filter(a => {
    const fecha = parseISO(a.fecha);
    return isSameMonth(fecha, new Date(año, mes - 1)) && isSameYear(fecha, new Date(año, mes - 1));
  });

  const personasUnicas = new Set(delMes.map(a => a.persona_id)).size;

  return {
    mes,
    año,
    total_personas: personasUnicas,
    total_asistencias: delMes.filter(a => a.estado === 'asistio').length,
    total_ausencias: delMes.filter(a => a.estado === 'no_asistio').length,
    total_excusas: delMes.filter(a => a.estado === 'excusa').length,
    total_tarde: delMes.filter(a => a.estado === 'tarde').length,
    total_permiso: delMes.filter(a => a.estado === 'permiso').length,
    porcentaje_asistencia: calcularPorcentajeAsistencia(delMes),
  };
}

export function rankingAsistencia(personas: Persona[], asistencias: Asistencia[]): ResumenPersona[] {
  return personas
    .map(persona => {
      const propias = asistencias.filter(a => a.persona_id === persona.id);
      const total_asistencias = propias.filter(a => a.estado === 'asistio' || a.estado === 'tarde').length;
      const total_ausencias = propias.filter(a => a.estado === 'no_asistio').length;
      const porcentaje = calcularPorcentajeAsistencia(propias);
      const racha_actual = calcularRachaActual(asistencias, persona.id);

      return { persona, total_asistencias, total_ausencias, porcentaje, racha_actual };
    })
    .sort((a, b) => b.porcentaje - a.porcentaje);
}

export function detectarPatrones(personas: Persona[], asistencias: Asistencia[]) {
  const ranking = rankingAsistencia(personas, asistencias);
  return {
    constantes: ranking.filter(r => r.porcentaje >= 90),
    enRiesgo: ranking.filter(r => r.porcentaje >= 60 && r.porcentaje < 80),
    criticos: ranking.filter(r => r.porcentaje < 60),
  };
}

export function tendenciaMensual(personaId: string, asistencias: Asistencia[]): number[] {
  const ahora = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const mesDate = new Date(ahora.getFullYear(), ahora.getMonth() - 11 + i, 1);
    const delMes = asistencias.filter(a => {
      const fecha = parseISO(a.fecha);
      return a.persona_id === personaId &&
        isSameMonth(fecha, mesDate) &&
        isSameYear(fecha, mesDate);
    });
    return calcularPorcentajeAsistencia(delMes);
  });
}
