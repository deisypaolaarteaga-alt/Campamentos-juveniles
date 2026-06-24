'use client';

import { Download, ChevronDown, FileSpreadsheet, FileText } from 'lucide-react';
import { useState } from 'react';

interface ExportarBtnProps {
  onExcel: () => void;
  onPDF: () => void;
  disabled?: boolean;
}

export function ExportarBtn({ onExcel, onPDF, disabled }: ExportarBtnProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-accent text-sm disabled:opacity-60"
      >
        <Download className="w-4 h-4" />
        Exportar
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-20 w-44 bg-popover border border-border rounded-lg shadow-lg py-1">
            <button
              onClick={() => { onExcel(); setOpen(false); }}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent w-full text-left"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />
              Exportar Excel
            </button>
            <button
              onClick={() => { onPDF(); setOpen(false); }}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent w-full text-left"
            >
              <FileText className="w-3.5 h-3.5 text-red-500" />
              Exportar PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
