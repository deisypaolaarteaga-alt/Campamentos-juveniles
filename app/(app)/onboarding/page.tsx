'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { subirFotoBosque } from '@/lib/utils/subirFoto';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const [nombre, setNombre] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingBosque, setCheckingBosque] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data } = await supabase
        .from('bosque')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();
      if (data) { router.push('/dashboard'); return; }
      setCheckingBosque(false);
    };
    check();
  }, [router]);

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) { toast.error('El nombre del Bosque es requerido'); return; }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('Sesión expirada'); router.push('/login'); return; }

      let logo_url: string | null = null;
      if (logoFile) {
        logo_url = await subirFotoBosque(user.id, logoFile);
      }

      const { error } = await supabase.from('bosque').insert([{
        nombre: nombre.trim(),
        ciudad: ciudad.trim() || null,
        logo_url,
        user_id: user.id,
      }]);

      if (error) throw error;
      toast.success('¡Bosque creado!');
      router.push('/dashboard');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al crear el Bosque');
    } finally {
      setLoading(false);
    }
  };

  if (checkingBosque) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C8102E', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#F4F1EE' }}
    >
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo-campamentos.png"
            alt="Campamentos Juveniles Colombia"
            width={80}
            height={80}
            className="mb-3"
            unoptimized
          />
          <h1 className="font-montserrat font-bold text-2xl text-center" style={{ color: '#0D2B2B' }}>
            ¡Bienvenido!
          </h1>
          <p className="text-base mt-1 text-center" style={{ color: '#4A6060' }}>
            Cuéntanos sobre tu Bosque 🌲
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Logo upload */}
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center transition-opacity hover:opacity-75"
                style={{ backgroundColor: '#F0EDE8', border: '2px dashed #D1D5DB' }}
              >
                {logoPreview ? (
                  <Image
                    src={logoPreview}
                    alt="Logo"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-4xl">🌲</span>
                )}
              </button>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>
                Toca para subir el logo (opcional)
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogo}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                Nombre del Bosque *
              </label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Ej: Bosque Colonos"
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2"
                style={{ border: '1px solid #E0D9D0', backgroundColor: '#F9F7F5', color: '#1A1A2E' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                Ciudad
              </label>
              <input
                type="text"
                value={ciudad}
                onChange={e => setCiudad(e.target.value)}
                placeholder="Ej: Bogotá"
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2"
                style={{ border: '1px solid #E0D9D0', backgroundColor: '#F9F7F5', color: '#1A1A2E' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-montserrat font-semibold text-white transition-opacity disabled:opacity-60"
              style={{ backgroundColor: '#C8102E' }}
            >
              {loading ? 'Creando...' : 'Crear mi Bosque'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
