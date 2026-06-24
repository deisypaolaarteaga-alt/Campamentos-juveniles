import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ResumenPersona } from '@/types';

export function exportarReportePDF(resumen: ResumenPersona[], periodo: string): void {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Reporte de Asistencias', 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Período: ${periodo}`, 14, 30);

  const datos = resumen.map((r, i) => [
    i + 1,
    r.persona.nombre_completo,
    r.persona.documento,
    r.persona.nivel_formacion,
    r.total_asistencias,
    r.total_ausencias,
    `${r.porcentaje}%`,
  ]);

  autoTable(doc, {
    head: [['#', 'Nombre', 'Documento', 'Nivel', 'Asist.', 'Ausencias', '%']],
    body: datos,
    startY: 40,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [99, 102, 241] },
    alternateRowStyles: { fillColor: [245, 245, 250] },
  });

  doc.save(`reporte_asistencias_${periodo}.pdf`);
}
