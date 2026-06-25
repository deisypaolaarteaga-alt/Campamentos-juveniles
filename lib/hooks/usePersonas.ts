'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Persona } from '@/types';
import { toast } from 'sonner';
import { PersonaFormData } from '@/lib/validations/personaSchema';

export function usePersonas(options?: { estado?: string; nivel?: string }) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('personas').select('*').order('nombre_completo', { ascending: true });
      if (options?.estado) query = query.eq('estado', options.estado);
      if (options?.nivel) query = query.eq('nivel_formacion', options.nivel);
      const { data, error: err } = await query;
      if (err) throw err;
      setPersonas(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar personas');
    } finally {
      setLoading(false);
    }
  }, [options?.estado, options?.nivel]);

  useEffect(() => { cargar(); }, [cargar]);

  const crearPersona = async (data: PersonaFormData): Promise<Persona | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        toast.error('Tu sesión ha expirado. Inicia sesión de nuevo.');
        return null;
      }
      const { data: nueva, error: err } = await supabase
        .from('personas')
        .insert([{ ...data, user_id: user.id }])
        .select()
        .single();
      if (err) throw err;
      toast.success('Persona registrada correctamente');
      await cargar();
      return nueva;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al crear persona');
      return null;
    }
  };

  const actualizarPersona = async (id: string, data: Partial<PersonaFormData>): Promise<boolean> => {
    try {
      const { error: err } = await supabase.from('personas').update(data).eq('id', id);
      if (err) throw err;
      toast.success('Persona actualizada correctamente');
      await cargar();
      return true;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar persona');
      return false;
    }
  };

  const eliminarPersona = async (id: string): Promise<boolean> => {
    try {
      const { error: err } = await supabase.from('personas').delete().eq('id', id);
      if (err) throw err;
      toast.success('Persona eliminada correctamente');
      await cargar();
      return true;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar persona');
      return false;
    }
  };

  const toggleEstado = async (id: string, estadoActual: string): Promise<boolean> => {
    const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
    return actualizarPersona(id, { estado: nuevoEstado as 'activo' | 'inactivo' });
  };

  return { personas, loading, error, cargar, crearPersona, actualizarPersona, eliminarPersona, toggleEstado };
}

export function usePersona(id: string) {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase.from('personas').select('*').eq('id', id).single()
      .then(({ data, error }: { data: Persona | null; error: unknown }) => {
        if (!error) setPersona(data);
        setLoading(false);
      });
  }, [id]);

  return { persona, loading };
}
