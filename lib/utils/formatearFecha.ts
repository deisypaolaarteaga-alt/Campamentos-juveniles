import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatearFecha(fecha: string | Date, formato = 'dd/MM/yyyy'): string {
  try {
    const date = typeof fecha === 'string' ? parseISO(fecha) : fecha;
    if (!isValid(date)) return '';
    return format(date, formato, { locale: es });
  } catch {
    return '';
  }
}

export function formatearFechaLarga(fecha: string | Date): string {
  return formatearFecha(fecha, "d 'de' MMMM 'de' yyyy");
}

export function formatearMes(año: number, mes: number): string {
  const date = new Date(año, mes - 1, 1);
  return format(date, "MMMM yyyy", { locale: es });
}
