'use client';

import { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, Edit, CalendarCheck, Info,
  CheckCircle2, XCircle, FileText, Download, Upload, ChevronLeft, ChevronRight
} from 'lucide-react';
import { usePersona } from '@/lib/hooks/usePersonas';
import { useAsistenciasPersona } from '@/lib/hooks/useAsistencias';
import {
  NIVEL_COLORES, NIVEL_LABELS, NivelFormacion,
  EstadoAsistencia, ESTADO_ASISTENCIA_LABELS
} from '@/types';
import { NivelBadge } from '@/components/ui/NivelBadge';
import { calcularPorcentajeAsistencia } from '@/lib/utils/estadisticas';
import { formatearFechaLarga } from '@/lib/utils/formatearFecha';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';
import { subirFotoDocumento } from '@/lib/utils/subirFoto';
import { toast } from 'sonner';

const ESTADO_COLORES: Record<EstadoAsistencia, string> = {
  asistio:    'bg-green-500',
  no_asistio: 'bg-red-400',
  excusa:     'bg-yellow-400',
  tarde:      'bg-orange-400',
  permiso:    'bg-blue-400',
};

const ESTADO_BG_SUAVE: Record<EstadoAsistencia, string> = {
  asistio:    'bg-green-50 text-green-700 border-green-200',
  no_asistio: 'bg-red-50 text-red-600 border-red-200',
  excusa:     'bg-yellow-50 text-yellow-700 border-yellow-200',
  tarde:      'bg-orange-50 text-orange-700 border-orange-200',
  permiso:    'bg-blue-50 text-blue-700 border-blue-200',
};

export default function CampistaPerfilPage() {
  const { id } = useParams<{ id: string }>();
  const { persona, loading } = usePersona(id);
  const { asistencias } = useAsistenciasPersona(id);
  const [tab, setTab] = useState<'info' | 'asistencias'>('info');
  const [mesCalendario, setMesCalendario] = useState(new Date());
  const [modalDocumento, setModalDocumento] = useState(false);
  const [fotoDocumentoUrl, setFotoDocumentoUrl] = useState<string | null | undefined>(undefined);
  const [subiendoDoc, setSubiendoDoc] = useState(false);
  const docInputRef = useRef<HTMLInputElement>(null);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-36 rounded-2xl skeleton-shimmer" />
        <div className="h-24 rounded-2xl skeleton-shimmer" />
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="text-center py-20">
        <p style={{ color: '#6B7280' }}>Campista no encontrado</p>
        <Link href="/personas" className="text-primary hover:underline text-sm mt-2 inline-block">
          Volver a campistas
        </Link>
      </div>
    );
  }

  const nivelColor = NIVEL_COLORES[persona.nivel_formacion as NivelFormacion];
  const efectivaFotoDocUrl = fotoDocumentoUrl !== undefined ? fotoDocumentoUrl : persona.foto_documento_url;

  const descargarDocumento = async (url: string, nombreCampista: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const extension = blob.type.split('/')[1] || 'jpg';
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `documento-${nombreCampista}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Documento descargado');
    } catch {
      toast.error('Error al descargar');
    }
  };

  const handleSubirDocumento = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoDoc(true);
    try {
      const url = await subirFotoDocumento(persona.id, file);
      if (url) {
        const { error } = await supabase.from('personas').update({ foto_documento_url: url }).eq('id', persona.id);
        if (error) {
          console.error('[SubirDocumento] Error actualizando persona:', error.message);
          toast.error(`Error al guardar: ${error.message}`);
        } else {
          setFotoDocumentoUrl(url);
          toast.success('✅ Documento subido correctamente');
        }
      } else {
        toast.error('No se pudo subir el documento');
      }
    } finally {
      setSubiendoDoc(false);
      if (docInputRef.current) docInputRef.current.value = '';
    }
  };

  const porcentaje = calcularPorcentajeAsistencia(asistencias);
  const totalAsistencias = asistencias.filter(a => a.estado === 'asistio').length;
  const totalAusencias  = asistencias.filter(a => a.estado === 'no_asistio').length;

  // Calendario
  const inicio      = startOfMonth(mesCalendario);
  const fin         = endOfMonth(mesCalendario);
  const diasMes     = eachDayOfInterval({ start: inicio, end: fin });
  const asistPorDia = new Map<string, EstadoAsistencia>(asistencias.map(a => [a.fecha, a.estado]));
  const offsetLunes = (inicio.getDay() + 6) % 7;

  // Datos personales visibles
  const infoItems = [
    { label: 'Tipo de documento', valor: persona.tipo_documento },
    { label: 'Número de documento', valor: persona.documento },
    persona.fecha_nacimiento
      ? { label: 'Fecha de nacimiento', valor: (() => {
          const parts = persona.fecha_nacimiento!.split('-');
          const d = new Date(+parts[0], +parts[1]-1, +parts[2]);
          const age = new Date().getFullYear() - d.getFullYear();
          return `${d.toLocaleDateString('es-CO')} (${age} años)`;
        })() }
      : null,
    persona.genero    ? { label: 'Género',    valor: persona.genero }    : null,
    persona.telefono  ? { label: 'Teléfono',  valor: persona.telefono }  : null,
  ].filter(Boolean) as { label: string; valor: string }[];

  const hayInfoMedica = persona.tipo_sangre || persona.eps || persona.alergias || persona.contacto_emergencia_nombre;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Link href="/personas" className="inline-flex items-center gap-2 text-sm hover:underline" style={{ color: '#6B7280' }}>
        <ArrowLeft className="w-4 h-4" />
        Volver a campistas
      </Link>

      {/* Header del perfil */}
      <div className="bg-white rounded-2xl shadow-card border border-border p-6">
        <div className="flex items-start gap-5">
          {/* Foto */}
          {persona.foto_url ? (
            <Image
              src={persona.foto_url}
              alt={persona.nombre_completo}
              width={80}
              height={80}
              className="rounded-full object-cover flex-shrink-0"
              style={{ border: `3px solid ${nivelColor}` }}
              unoptimized
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
              style={{ backgroundColor: nivelColor, border: `3px solid ${nivelColor}` }}
            >
              {persona.nombre_completo.charAt(0)}
            </div>
          )}

          {/* Nombre + badges */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="font-montserrat font-bold text-[22px] leading-tight" style={{ color: '#1A1A2E' }}>
                  {persona.nombre_completo}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <NivelBadge nivel={persona.nivel_formacion as NivelFormacion} size="md" />
                  <span
                    className={cn(
                      'px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                      persona.estado === 'activo'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-gray-50 text-gray-500 border-gray-200'
                    )}
                  >
                    {persona.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <p className="text-sm mt-1.5" style={{ color: '#6B7280' }}>
                  {asistencias.length} asistencias registradas
                </p>
              </div>
              <Link
                href={`/personas/${id}/editar`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium flex-shrink-0 border transition-colors"
                style={{ borderColor: '#E0D9D0', color: '#1A1A2E' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F0EDE8'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
              >
                <Edit className="w-3.5 h-3.5" />
                Editar
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: '#E0D9D0' }}>
        {([
          { id: 'info',        label: 'Información', icon: Info },
          { id: 'asistencias', label: 'Asistencias',  icon: CalendarCheck },
        ] as const).map(({ id: tabId, label, icon: Icon }) => (
          <button
            key={tabId}
            onClick={() => setTab(tabId)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              tab === tabId
                ? 'bg-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
            style={{ color: tab === tabId ? '#1A1A2E' : '#6B7280' }}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Información */}
      {tab === 'info' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-card border border-border p-5">
            <h3 className="font-montserrat font-semibold text-sm mb-4" style={{ color: '#1A1A2E' }}>
              Datos personales
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {infoItems.map(({ label, valor }) => (
                <div key={label}>
                  <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: '#6B7280' }}>{label}</p>
                  <p className="text-sm font-medium" style={{ color: '#1A1A2E' }}>{valor}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tipo de sangre prominente + info médica */}
          {hayInfoMedica && (
            <div className="bg-white rounded-2xl shadow-card border border-border p-5">
              <h3 className="font-montserrat font-semibold text-sm mb-4" style={{ color: '#1A1A2E' }}>
                ⚕️ Emergencias
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {persona.tipo_sangre && (
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-1.5" style={{ color: '#6B7280' }}>Tipo de sangre</p>
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-bold text-white" style={{ backgroundColor: '#C8102E' }}>
                      {persona.tipo_sangre}
                    </span>
                  </div>
                )}
                {persona.eps && (
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: '#6B7280' }}>EPS</p>
                    <p className="text-sm font-medium">{persona.eps}</p>
                  </div>
                )}
                {persona.alergias && (
                  <div className="sm:col-span-2">
                    <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: '#6B7280' }}>Alergias</p>
                    <p className="text-sm">{persona.alergias}</p>
                  </div>
                )}
                {persona.contacto_emergencia_nombre && (
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: '#6B7280' }}>Contacto emergencia</p>
                    <p className="text-sm font-medium">{persona.contacto_emergencia_nombre}</p>
                  </div>
                )}
                {persona.contacto_emergencia_telefono && (
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: '#6B7280' }}>Teléfono emergencia</p>
                    <p className="text-sm font-medium">{persona.contacto_emergencia_telefono}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Documento */}
          <div className="bg-white rounded-2xl shadow-card border border-border p-5">
            <h3 className="font-montserrat font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: '#1A1A2E' }}>
              📄 Documento de identidad
            </h3>
            {efectivaFotoDocUrl ? (
              <>
                <div className="rounded-xl overflow-hidden mb-3" style={{ border: '1px solid #E0D9D0' }}>
                  <Image
                    src={efectivaFotoDocUrl}
                    alt="Documento de identidad"
                    width={800}
                    height={600}
                    className="w-full h-auto object-contain rounded-xl"
                    style={{ width: '100%', height: 'auto' }}
                    unoptimized
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setModalDocumento(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors"
                    style={{ borderColor: '#E0D9D0', color: '#1A1A2E' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F0EDE8'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                  >
                    🔍 Ver en pantalla completa
                  </button>
                  <button
                    onClick={() => descargarDocumento(efectivaFotoDocUrl, persona.nombre_completo)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors"
                    style={{ borderColor: '#E0D9D0', color: '#1A1A2E' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F0EDE8'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar
                  </button>
                </div>
              </>
            ) : (
              <div
                className="rounded-xl p-8 flex flex-col items-center gap-3 text-center"
                style={{ border: '2px dashed #D1D5DB' }}
              >
                <FileText className="w-10 h-10" style={{ color: '#9CA3AF' }} />
                <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Sin documento cargado</p>
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  disabled={subiendoDoc}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60 text-white"
                  style={{ backgroundColor: '#C8102E' }}
                  onMouseEnter={e => { if (!subiendoDoc) (e.currentTarget as HTMLElement).style.backgroundColor = '#A50D25'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#C8102E'; }}
                >
                  {subiendoDoc ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      Subir documento
                    </>
                  )}
                </button>
                <input
                  ref={docInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSubirDocumento}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Asistencias */}
      {tab === 'asistencias' && (
        <div className="space-y-5">
          {/* 3 stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl shadow-card border border-border p-4 text-center">
              <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <p className="font-montserrat font-bold text-2xl text-green-600">{totalAsistencias}</p>
              <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Asistencias</p>
            </div>
            <div className="bg-white rounded-2xl shadow-card border border-border p-4 text-center">
              <XCircle className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <p className="font-montserrat font-bold text-2xl text-red-500">{totalAusencias}</p>
              <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Ausencias</p>
            </div>
            <div className="bg-white rounded-2xl shadow-card border border-border p-4 text-center">
              <span className="block text-lg mb-1">📊</span>
              <p
                className="font-montserrat font-bold text-2xl"
                style={{ color: nivelColor }}
              >
                {porcentaje}%
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>General</p>
            </div>
          </div>

          {/* Calendario mensual */}
          <div className="bg-white rounded-2xl shadow-card border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setMesCalendario(new Date(mesCalendario.getFullYear(), mesCalendario.getMonth() - 1))}
                className="p-1.5 rounded-lg transition-colors"
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F0EDE8'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="font-montserrat font-semibold text-sm capitalize" style={{ color: '#1A1A2E' }}>
                {format(mesCalendario, 'MMMM yyyy', { locale: es })}
              </h3>
              <button
                onClick={() => setMesCalendario(new Date(mesCalendario.getFullYear(), mesCalendario.getMonth() + 1))}
                className="p-1.5 rounded-lg transition-colors"
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F0EDE8'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {['Lu','Ma','Mi','Ju','Vi','Sá','Do'].map(d => (
                <div key={d} className="text-center text-xs font-medium py-1" style={{ color: '#6B7280' }}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: offsetLunes }).map((_, i) => <div key={`pre-${i}`} />)}
              {diasMes.map(dia => {
                const key    = format(dia, 'yyyy-MM-dd');
                const estado = asistPorDia.get(key);
                const asistio    = estado === 'asistio';
                const noAsistio  = estado === 'no_asistio';
                return (
                  <div
                    key={key}
                    className="aspect-square flex items-center justify-center rounded-lg text-xs font-medium"
                    style={{
                      backgroundColor: asistio ? '#22c55e' : noAsistio ? 'rgba(239,68,68,0.15)' : 'transparent',
                      color: asistio ? '#fff' : noAsistio ? '#ef4444' : '#6B7280',
                    }}
                    title={estado ? ESTADO_ASISTENCIA_LABELS[estado] : 'Sin registro'}
                  >
                    {format(dia, 'd')}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-3 mt-3 pt-3" style={{ borderTop: '1px solid #E0D9D0' }}>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs" style={{ color: '#6B7280' }}>Asistió</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(239,68,68,0.4)' }} />
                <span className="text-xs" style={{ color: '#6B7280' }}>No asistió</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-gray-200" />
                <span className="text-xs" style={{ color: '#6B7280' }}>Sin registro</span>
              </div>
            </div>
          </div>

          {/* Historial cronológico */}
          <div className="bg-white rounded-2xl shadow-card border border-border p-5">
            <h3 className="font-montserrat font-semibold text-sm mb-4" style={{ color: '#1A1A2E' }}>
              Historial completo
            </h3>
            {asistencias.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: '#6B7280' }}>Sin registros de asistencia</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {asistencias.map(a => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between py-2.5 px-1"
                    style={{ borderBottom: '1px solid #F0EDE8' }}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#1A1A2E' }}>
                        {formatearFechaLarga(a.fecha)}
                      </p>
                      {a.observacion && (
                        <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{a.observacion}</p>
                      )}
                    </div>
                    <span className={cn(
                      'px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                      ESTADO_BG_SUAVE[a.estado]
                    )}>
                      {ESTADO_ASISTENCIA_LABELS[a.estado]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal documento */}
      {modalDocumento && efectivaFotoDocUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" onClick={() => setModalDocumento(false)} />
          <div className="relative bg-white border border-border rounded-2xl p-4 max-w-2xl w-full shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-montserrat font-semibold text-sm" style={{ color: '#1A1A2E' }}>
                📄 Documento de identidad
              </h3>
              <button
                onClick={() => setModalDocumento(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-base font-medium transition-colors"
                style={{ color: '#6B7280' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F0EDE8'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
              >
                ✕
              </button>
            </div>
            {/* Imagen centrada grande */}
            <div className="flex items-center justify-center rounded-xl overflow-hidden" style={{ backgroundColor: '#F9F9F9', minHeight: 200 }}>
              <Image
                src={efectivaFotoDocUrl}
                alt="Documento de identidad"
                width={900}
                height={700}
                className="w-full h-auto object-contain rounded-xl"
                style={{ width: '100%', height: 'auto', maxHeight: '65vh' }}
                unoptimized
              />
            </div>
            {/* Footer con botón descargar */}
            <div className="flex justify-end mt-3 pt-3" style={{ borderTop: '1px solid #E0D9D0' }}>
              <button
                onClick={() => descargarDocumento(efectivaFotoDocUrl, persona.nombre_completo)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-medium transition-colors"
                style={{ borderColor: '#E0D9D0', color: '#1A1A2E' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F0EDE8'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
              >
                <Download className="w-3.5 h-3.5" />
                Descargar documento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
