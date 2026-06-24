'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface BosqueData {
  id: string;
  nombre: string;
  ciudad: string | null;
  logo_url: string | null;
}

export function useBosque() {
  const [bosque, setBosque] = useState<BosqueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from('bosque')
        .select('id, nombre, ciudad, logo_url')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (data) setBosque(data as BosqueData);
      setLoading(false);
    };
    cargar();
  }, []);

  return { bosque, loading };
}
