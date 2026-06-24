'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { CampoPersonalizado } from '@/types';
import { toast } from 'sonner';

export function useCamposDinamicos() {
  const [campos, setCampos] = useState<CampoPersonalizado[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('campos_personalizados')
      .select('*')
      .order('orden');
    if (!error) setCampos(data || []);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const crear = async (campo: Omit<CampoPersonalizado, 'id' | 'created_at'>): Promise<boolean> => {
    try {
      const { error } = await supabase.from('campos_personalizados').insert([campo]);
      if (error) throw error;
      toast.success('Campo creado correctamente');
      await cargar();
      return true;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al crear campo');
      return false;
    }
  };

  const actualizar = async (id: string, data: Partial<CampoPersonalizado>): Promise<boolean> => {
    try {
      const { error } = await supabase.from('campos_personalizados').update(data).eq('id', id);
      if (error) throw error;
      toast.success('Campo actualizado');
      await cargar();
      return true;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar campo');
      return false;
    }
  };

  const eliminar = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('campos_personalizados').delete().eq('id', id);
      if (error) throw error;
      toast.success('Campo eliminado');
      await cargar();
      return true;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar campo');
      return false;
    }
  };

  return { campos, loading, crear, actualizar, eliminar, cargar };
}
