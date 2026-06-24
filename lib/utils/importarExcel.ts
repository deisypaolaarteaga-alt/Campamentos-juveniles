import * as XLSX from 'xlsx';
import { EstadoAsistencia } from '@/types';
import { parse, isValid, format } from 'date-fns';

const ESTADO_MAP: Record<string, EstadoAsistencia> = {
  'asistió': 'asistio', 'asistio': 'asistio', 'p': 'asistio', 'presente': 'asistio',
  '✓': 'asistio', '1': 'asistio', 'si': 'asistio', 'sí': 'asistio', 'x': 'asistio',
  'faltó': 'no_asistio', 'falto': 'no_asistio', 'f': 'no_asistio', 'ausente': 'no_asistio',
  '0': 'no_asistio', 'no': 'no_asistio',
  'excusa': 'excusa', 'e': 'excusa', 'exc': 'excusa', 'justificado': 'excusa',
  'tarde': 'tarde', 't': 'tarde', 'llegó tarde': 'tarde',
  'permiso': 'permiso', 'pm': 'permiso', 'per': 'permiso',
};

export function detectarEstado(valor: string): EstadoAsistencia | null {
  if (!valor || valor.trim() === '') return null;
  return ESTADO_MAP[valor.toLowerCase().trim()] || null;
}

function parsearFecha(valor: string): string | null {
  const formatos = ['dd/MM/yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy', 'dd-MM-yyyy'];
  for (const fmt of formatos) {
    try {
      const date = parse(valor, fmt, new Date());
      if (isValid(date)) return format(date, 'yyyy-MM-dd');
    } catch { /* intentar siguiente */ }
  }
  return null;
}

export interface FilaImportada {
  nombre_completo?: string;
  documento?: string;
  [key: string]: string | undefined;
}

export interface ResultadoImportacion {
  filas: FilaImportada[];
  columnas: string[];
  errores: string[];
}

export function leerArchivoExcel(file: File): Promise<ResultadoImportacion> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const filas: FilaImportada[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
        const columnas = filas.length > 0 ? Object.keys(filas[0]) : [];
        resolve({ filas, columnas, errores: [] });
      } catch (err) {
        reject(new Error('No se pudo leer el archivo Excel'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsArrayBuffer(file);
  });
}

export { parsearFecha };
