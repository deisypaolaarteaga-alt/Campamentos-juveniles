'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';

export default function RecuperarPage() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const { recuperar } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await recuperar(email);
    if (error) {
      toast.error('No se pudo enviar el correo. Verifica el email.');
    } else {
      setEnviado(true);
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-col items-center mb-8">
        <Image
          src="/logo-campamentos.png"
          alt="Campamentos Juveniles Colombia"
          width={88}
          height={88}
          className="mb-4"
          unoptimized
        />
        <h1
          className="font-montserrat font-bold text-2xl text-center"
          style={{ color: '#0D2B2B' }}
        >
          Campamentos Juveniles Colombia
        </h1>
      </div>

      <div
        className="bg-white rounded-2xl p-8"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
      >
        <h2 className="font-montserrat font-bold text-xl mb-2" style={{ color: '#1A1A2E' }}>
          Recuperar contraseña
        </h2>

        {enviado ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">📧</div>
            <p className="text-sm font-semibold mb-1" style={{ color: '#1A1A2E' }}>
              ¡Correo enviado!
            </p>
            <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
              Revisa tu bandeja en <strong>{email}</strong> y sigue el enlace para restablecer tu contraseña.
            </p>
            <Link href="/login" className="text-sm font-semibold" style={{ color: '#C8102E' }}>
              ← Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm mb-5" style={{ color: '#6B7280' }}>
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  required
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
                {loading ? 'Enviando...' : 'Enviar link de recuperación'}
              </button>
            </form>
            <div className="mt-4 text-center">
              <Link href="/login" className="text-sm" style={{ color: '#C8102E' }}>
                ← Volver al inicio de sesión
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
