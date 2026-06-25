'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { personaSchema, PersonaFormData } from '@/lib/validations/personaSchema';
import { calcularEdad } from '@/lib/utils/calcularEdad';
import { NIVEL_COLORES, NivelFormacion, Persona } from '@/types';
import { NivelBadge } from '@/components/ui/NivelBadge';
import { FotoUpload } from '@/components/personas/FotoUpload';
import { ChevronDown, ChevronUp, Calendar, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PersonaFiles {
  fotoFile: File | null;
  fotoDocFile: File | null;
}

interface PersonaFormProps {
  persona?: Persona;
  onSubmit: (data: PersonaFormData, files: PersonaFiles) => Promise<boolean>;
  loading?: boolean;
}

const NIVELES: NivelFormacion[] = ['campista','semilla','raiz','tallo','hoja','flor','fruto'];
const TIPOS_SANGRE = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

type Seccion = 'medica' | 'documento';

export function PersonaForm({ persona, onSubmit, loading }: PersonaFormProps) {
  const router = useRouter();
  const [seccionesAbiertas, setSeccionesAbiertas] = useState<Record<Seccion, boolean>>({
    medica: false,
    documento: false,
  });
  const [edad, setEdad] = useState<number | null>(null);
  const [fotoFile, setFotoFile]       = useState<File | null>(null);
  const [fotoDocFile, setFotoDocFile] = useState<File | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PersonaFormData>({
    resolver: zodResolver(personaSchema),
    defaultValues: persona ? {
      nombre_completo: persona.nombre_completo,
      documento: persona.documento,
      tipo_documento: persona.tipo_documento,
      fecha_nacimiento: persona.fecha_nacimiento || '',
      genero: persona.genero || '',
      telefono: persona.telefono || '',
      estado: persona.estado,
      nivel_formacion: persona.nivel_formacion,
      tipo_sangre: persona.tipo_sangre || '',
      eps: persona.eps || '',
      alergias: persona.alergias || '',
      contacto_emergencia_nombre: persona.contacto_emergencia_nombre || '',
      contacto_emergencia_telefono: persona.contacto_emergencia_telefono || '',
      foto_url: persona.foto_url || '',
      foto_documento_url: persona.foto_documento_url || '',
      campos_dinamicos: {},
    } : {
      tipo_documento: 'CC',
      estado: 'activo',
      nivel_formacion: 'campista',
      campos_dinamicos: {},
      foto_url: '',
      foto_documento_url: '',
    },
  });

  const fechaNacimiento   = watch('fecha_nacimiento');
  const nivelSeleccionado = watch('nivel_formacion');

  useEffect(() => {
    if (fechaNacimiento) setEdad(calcularEdad(fechaNacimiento));
    else setEdad(null);
  }, [fechaNacimiento]);

  const toggleSeccion = (s: Seccion) => {
    setSeccionesAbiertas(prev => ({ ...prev, [s]: !prev[s] }));
  };

  const onFormSubmit = async (data: PersonaFormData) => {
    const ok = await onSubmit(data, { fotoFile, fotoDocFile });
    if (ok) router.push('/personas');
  };

  const inputClass = 'w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring';
  const inputStyle = { border: '1px solid #E0D9D0', backgroundColor: '#FFFFFF', color: '#1A1A2E' };
  const labelClass = 'block text-sm font-medium mb-1';

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 max-w-2xl mx-auto pb-40 md:pb-4">

      {/* Foto de perfil */}
      <div className="bg-white rounded-2xl shadow-card border border-border p-5">
        <p className="font-montserrat font-semibold text-sm mb-4" style={{ color: '#1A1A2E' }}>
          Foto de perfil
        </p>
        <div className="flex justify-center">
          <FotoUpload
            fotoUrl={persona?.foto_url}
            nombre={persona?.nombre_completo}
            onFileChange={file => setFotoFile(file)}
          />
        </div>
      </div>

      {/* Datos personales */}
      <div className="bg-white rounded-2xl shadow-card border border-border p-5">
        <h2 className="font-montserrat font-semibold text-sm mb-4" style={{ color: '#1A1A2E' }}>
          Datos personales
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="sm:col-span-2">
            <label className={labelClass}>Nombre completo *</label>
            <input {...register('nombre_completo')} className={inputClass} style={inputStyle} />
            {errors.nombre_completo && (
              <p className="text-xs text-red-500 mt-1">{errors.nombre_completo.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Tipo de documento</label>
            <select {...register('tipo_documento')} className={inputClass} style={inputStyle}>
              <option value="CC">CC</option>
              <option value="TI">TI</option>
              <option value="CE">CE</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Número de documento *</label>
            <input {...register('documento')} className={inputClass} style={inputStyle} />
            {errors.documento && (
              <p className="text-xs text-red-500 mt-1">{errors.documento.message}</p>
            )}
          </div>

          <div className="min-w-0">
            <label className={labelClass}>
              Fecha de nacimiento
              {edad !== null && (
                <span className="font-normal ml-1" style={{ color: '#6B7280' }}>({edad} años)</span>
              )}
            </label>
            <div className="relative">
              <input type="date" {...register('fecha_nacimiento')} autoComplete="off" className={cn(inputClass, 'pr-10')} style={inputStyle} />
              {fechaNacimiento ? (
                <button
                  type="button"
                  onClick={() => setValue('fecha_nacimiento', '')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  aria-label="Limpiar fecha"
                >
                  <X className="w-4 h-4" style={{ color: '#6B7280' }} />
                </button>
              ) : (
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#6B7280' }} />
              )}
            </div>
          </div>

          <div>
            <label className={labelClass}>Género</label>
            <select {...register('genero')} className={inputClass} style={inputStyle}>
              <option value="">Seleccionar...</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Teléfono</label>
            <input {...register('telefono')} className={inputClass} style={inputStyle} />
          </div>

          <div>
            <label className={labelClass}>Estado</label>
            <select {...register('estado')} className={inputClass} style={inputStyle}>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          {/* Selector de nivel */}
          <div className="sm:col-span-2">
            <label className={labelClass}>Nivel de formación *</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {NIVELES.map(nivel => (
                <button
                  type="button"
                  key={nivel}
                  onClick={() => setValue('nivel_formacion', nivel)}
                  className={cn(
                    'transition-all duration-200',
                    nivelSeleccionado === nivel ? 'scale-105' : 'opacity-50 hover:opacity-80'
                  )}
                >
                  <NivelBadge
                    nivel={nivel}
                    size="sm"
                    className={nivelSeleccionado === nivel ? 'ring-2' : ''}
                    style={nivelSeleccionado === nivel ? { outlineColor: NIVEL_COLORES[nivel] } : undefined}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Información médica — colapsable */}
      <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSeccion('medica')}
          className="w-full flex items-center justify-between p-4 transition-colors"
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F0EDE8'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
        >
          <span className="font-montserrat font-semibold text-sm" style={{ color: '#1A1A2E' }}>
            ⚕️ Información médica
          </span>
          {seccionesAbiertas.medica
            ? <ChevronUp className="w-4 h-4" style={{ color: '#6B7280' }} />
            : <ChevronDown className="w-4 h-4" style={{ color: '#6B7280' }} />}
        </button>

        {seccionesAbiertas.medica && (
          <div className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ borderTop: '1px solid #E0D9D0' }}>
            <div className="mt-4">
              <label className={labelClass}>Tipo de sangre</label>
              <select {...register('tipo_sangre')} className={inputClass} style={inputStyle}>
                <option value="">Seleccionar...</option>
                {TIPOS_SANGRE.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="mt-4">
              <label className={labelClass}>EPS</label>
              <input {...register('eps')} placeholder="Nombre de la EPS" className={inputClass} style={inputStyle} />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Alergias</label>
              <textarea
                {...register('alergias')}
                rows={2}
                placeholder="Describe alergias conocidas..."
                className={cn(inputClass, 'resize-none')}
                style={inputStyle}
              />
            </div>

            <div>
              <label className={labelClass}>Contacto de emergencia — Nombre</label>
              <input
                {...register('contacto_emergencia_nombre')}
                placeholder="Nombre completo"
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div>
              <label className={labelClass}>Contacto de emergencia — Teléfono</label>
              <input
                {...register('contacto_emergencia_telefono')}
                placeholder="300 000 0000"
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>
        )}
      </div>

      {/* Documento de identidad — colapsable */}
      <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSeccion('documento')}
          className="w-full flex items-center justify-between p-4 transition-colors"
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F0EDE8'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
        >
          <span className="font-montserrat font-semibold text-sm" style={{ color: '#1A1A2E' }}>
            📄 Documento de identidad
          </span>
          {seccionesAbiertas.documento
            ? <ChevronUp className="w-4 h-4" style={{ color: '#6B7280' }} />
            : <ChevronDown className="w-4 h-4" style={{ color: '#6B7280' }} />}
        </button>

        {seccionesAbiertas.documento && (
          <div className="p-4 pt-0" style={{ borderTop: '1px solid #E0D9D0' }}>
            <div className="mt-4">
              <FotoUpload
                fotoUrl={persona?.foto_documento_url}
                variante="rectangular"
                label="Foto del documento (cédula o tarjeta de identidad)"
                onFileChange={file => setFotoDocFile(file)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Botones — fijos abajo en móvil, normales en desktop */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-background border-t border-border z-20 md:relative md:bottom-auto md:bg-transparent md:border-0 md:p-0 md:flex md:justify-end">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border text-sm font-medium transition-all active:scale-95"
            style={{ borderColor: '#E0D9D0', color: '#1A1A2E' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 md:flex-none btn-cj-primary px-5 py-2.5 rounded-xl text-sm font-semibold"
          >
            {loading ? 'Guardando...' : persona ? 'Guardar cambios' : 'Registrar campista'}
          </button>
        </div>
      </div>
    </form>
  );
}
