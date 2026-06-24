'use client';

import { useState, useEffect } from 'react';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const registro = async (email: string, password: string, nombre: string) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre_completo: nombre } },
    });
    return { error, session: data.session };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const recuperar = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined'
        ? `${window.location.origin}/recuperar`
        : undefined,
    });
    return { error };
  };

  return { user, loading, login, registro, logout, recuperar };
}
