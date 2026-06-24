import * as XLSX from 'xlsx';
import { Persona, Asistencia, ResumenPersona } from '@/types';
import { formatearFecha } from './formatearFecha';

export function exportarPersonasExcel(personas: Persona[]): void {
  const datos = personas.map(p => ({
    'Nombre Completo': p.nombre_completo,
    'Documento': p.documento,
    'Tipo Doc': p.tipo_documento,
    'Fecha Nacimiento': p.fecha_nacimiento ? formatearFecha(p.fecha_nacimiento) : '',
    'Año Ingreso': p.año_ingreso,
    'Nivel Formación': p.nivel_formacion,
    'Estado': p.estado,
    'Género': p.genero || '',
    'Teléfono': p.telefono || '',
    'Email': p.email || '',
    'Dirección': p.direccion || '',
    'Profesión': p.profesion || '',
    'Estudios': p.estudios || '',
  }));

  const ws = XLSX.utils.json_to_sheet(datos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Personas');
  XLSX.writeFile(wb, `personas_${formatearFecha(new Date(), 'yyyyMMdd')}.xlsx`);
}

export function exportarReporteExcel(
  resumen: ResumenPersona[],
  asistencias: Asistencia[],
  periodo: string
): void {
  const wb = XLSX.utils.book_new();

  // Hoja resumen
  const resumenDatos = resumen.map((r, i) => ({
    '#': i + 1,
    'Nombre': r.persona.nombre_completo,
    'Documento': r.persona.documento,
    'Nivel': r.persona.nivel_formacion,
    'Total Asistencias': r.total_asistencias,
    'Total Ausencias': r.total_ausencias,
    '% Asistencia': `${r.porcentaje}%`,
    'Racha Actual': r.racha_actual,
  }));
  const wsResumen = XLSX.utils.json_to_sheet(resumenDatos);
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

  // Hoja asistencias raw
  const asistDatos = asistencias.map(a => ({
    'Persona ID': a.persona_id,
    'Nombre': a.persona?.nombre_completo || '',
    'Fecha': formatearFecha(a.fecha),
    'Estado': a.estado,
    'Observación': a.observacion || '',
  }));
  const wsAsist = XLSX.utils.json_to_sheet(asistDatos);
  XLSX.utils.book_append_sheet(wb, wsAsist, 'Asistencias');

  XLSX.writeFile(wb, `reporte_${periodo}.xlsx`);
}
