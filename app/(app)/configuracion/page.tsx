'use client';

import { useState, useEffect } from 'react';
import { NIVEL_COLORES, NIVEL_LABELS, NIVEL_EMOJIS, NIVELES, NivelFormacion } from '@/types';
import { FotoUpload } from '@/components/personas/FotoUpload';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

const DESCRIPCIONES_NIVEL: Record<NivelFormacion, string> = {
  campista: 'Nivel inicial, persona en proceso de integración a la comunidad del Bosque.',
  semilla:  'Comenzando a echar raíces, con potencial de crecimiento visible.',
  raiz:     'Establecida en la comunidad, con compromisos básicos cumplidos.',
  tallo:    'Crecimiento sostenido, participando activamente en actividades.',
  hoja:     'Contribuyendo de forma regular y siendo referente para otros.',
  flor:     'Liderando procesos y floreciendo en su desarrollo personal.',
  fruto:    'Nivel máximo. Campista que da frutos y multiplica su impacto en el Bosque.',
};

const inputClass = 'w-full px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring';
const inputStyle = { border: '1px solid var(--borde)', backgroundColor: '#FFFFFF', color: 'var(--texto)' };

export default function ConfiguracionPage() {
  const [bosqueId, setBosqueId]       = useState<string | null>(null);
  const [logoBosqueUrl, setLogoBosqueUrl] = useState('');
  const [nombreBosque, setNombreBosque]   = useState('');
  const [ciudad, setCiudad]               = useState('');
  const [guardando, setGuardando]         = useState(false);
  const [cargando, setCargando]           = useState(true);

  // Cargar configuración existente del bosque
  useEffect(() => {
    const cargar = async () => {
      const { data, error } = await supabase
        .from('bosque')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setBosqueId(data.id);
        setNombreBosque(data.nombre ?? '');
        setCiudad(data.ciudad ?? '');
        setLogoBosqueUrl(data.logo_url ?? '');
      }
      setCargando(false);
    };
    cargar();
  }, []);

  const guardar = async () => {
    setGuardando(true);
    try {
      const payload = {
        nombre:   nombreBosque.trim(),
        ciudad:   ciudad.trim(),
        logo_url: logoBosqueUrl,
      };

      if (bosqueId) {
        const { error } = await supabase
          .from('bosque')
          .update(payload)
          .eq('id', bosqueId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('bosque')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        if (data) setBosqueId(data.id);
      }

      toast.success('✅ Configuración guardada');
    } catch {
      toast.error('❌ Error al guardar la configuración');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-8 bg-muted rounded w-40 animate-pulse" />
        <div className="h-64 bg-muted rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-montserrat font-bold text-2xl">Configuración</h1>
        <p className="text-sm mt-1 text-muted-foreground">
          Personaliza Campamentos Juveniles según tu Bosque
        </p>
      </div>

      {/* Mi Bosque */}
      <div className="bg-white rounded-2xl shadow-card border border-border p-6 space-y-5">
        <h2 className="font-montserrat font-semibold">Mi Bosque</h2>

        {/* Logo */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-shrink-0">
            {logoBosqueUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={logoBosqueUrl}
                alt="Logo del Bosque"
                className="w-20 h-20 rounded-full object-cover"
                style={{ border: '3px solid var(--borde)' }}
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
                style={{ backgroundColor: '#163838', color: '#B83A2E', border: '3px solid var(--borde)' }}
              >
                🏕️
              </div>
            )}
          </div>
          <div className="flex-1">
            <FotoUpload
              fotoUrl={logoBosqueUrl}
              bucket="logos-bosques"
              onFotoChange={url => setLogoBosqueUrl(url)}
            />
          </div>
        </div>

        {/* Campos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Nombre del Bosque
            </label>
            <input
              type="text"
              value={nombreBosque}
              onChange={e => setNombreBosque(e.target.value)}
              placeholder="Ej: Bosque Los Pinos"
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ciudad</label>
            <input
              type="text"
              value={ciudad}
              onChange={e => setCiudad(e.target.value)}
              placeholder="Ej: Bogotá"
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <button
            onClick={guardar}
            disabled={guardando}
            className="btn-cj-primary px-5 py-2.5 rounded-xl text-sm font-semibold"
          >
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {/* Niveles de formación — solo lectura */}
      <div className="bg-white rounded-2xl shadow-card border border-border p-6">
        <h2 className="font-montserrat font-semibold mb-4">Niveles de formación</h2>
        <div className="space-y-3">
          {NIVELES.map(nivel => {
            const color = NIVEL_COLORES[nivel];
            return (
              <div
                key={nivel}
                className="flex items-start gap-4 p-4 rounded-xl"
                style={{
                  borderLeft: `4px solid ${color}`,
                  backgroundColor: `${color}0D`,
                  border: `1px solid ${color}28`,
                  borderLeftWidth: 4,
                  borderLeftColor: color,
                }}
              >
                <span className="text-2xl flex-shrink-0">{NIVEL_EMOJIS[nivel]}</span>
                <div>
                  <p className="font-montserrat font-semibold text-sm" style={{ color }}>
                    {NIVEL_LABELS[nivel]}
                  </p>
                  <p className="text-sm mt-0.5 text-muted-foreground">
                    {DESCRIPCIONES_NIVEL[nivel]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
