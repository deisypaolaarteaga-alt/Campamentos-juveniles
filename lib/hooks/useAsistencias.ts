'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Asistencia, EstadoAsistencia } from '@/types';
import { toast } from 'sonner';

export function useAsistenciasFecha(fecha: string) {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    if (!fecha) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('asistencias')
      .select('*, persona:personas(*)')
      .eq('fecha', fecha);
    if (!error) setAsistencias(data || []);
    setLoading(false);
  }, [fecha]);

  useEffect(() => { cargar(); }, [cargar]);
  return { asistencias, loading, cargar };
}

export function useAsistenciasPersona(personaId: string) {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!personaId) return;
    supabase.from('asistencias').select('*')
      .eq('persona_id', personaId)
      .order('fecha', { ascending: false })
      .then(({ data, error }: { data: Asistencia[] | null; error: unknown }) => {
        if (!error) setAsistencias(data || []);
        setLoading(false);
      });
  }, [personaId]);

  return { asistencias, loading };
}

export function useAsistenciasMes(año: number, mes: number) {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    const inicio = `${año}-${String(mes).padStart(2, '0')}-01`;
    const fin = new Date(año, mes, 0);
    const finStr = `${año}-${String(mes).padStart(2, '0')}-${String(fin.getDate()).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('asistencias')
      .select('*, persona:personas(id, nombre_completo, foto_url)')
      .gte('fecha', inicio)
      .lte('fecha', finStr);

    if (!error) setAsistencias(data || []);
    setLoading(false);
  }, [año, mes]);

  useEffect(() => { cargar(); }, [cargar]);
  return { asistencias, loading, cargar };
}

export function useUpsertAsistencias() {
  const [guardando, setGuardando] = useState(false);

  const upsertMasivo = async (
    registros: Array<{ persona_id: string; fecha: string; estado: EstadoAsistencia; observacion?: string }>
  ): Promise<boolean> => {
    setGuardando(true);
    try {
      const { error } = await supabase
        .from('asistencias')
        .upsert(registros, { onConflict: 'persona_id,fecha' });
      if (error) throw error;
      toast.success(`${registros.length} registros guardados`);
      return true;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar asistencias');
      return false;
    } finally {
      setGuardando(false);
    }
  };

  return { upsertMasivo, guardando };
}
