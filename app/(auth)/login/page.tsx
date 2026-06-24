'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await login(email, password);
    if (error) {
      toast.error('Credenciales incorrectas. Intenta de nuevo.');
    } else {
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm">
      {/* Logo + nombre */}
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

      {/* Card */}
      <div
        className="bg-white rounded-2xl p-8"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
      >
        <h2
          className="font-montserrat font-bold text-xl mb-6"
          style={{ color: '#1A1A2E' }}
        >
          Iniciar sesión
        </h2>

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
              style={{
                border: '1px solid #E0D9D0',
                backgroundColor: '#F9F7F5',
                color: '#1A1A2E',
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 pr-11 rounded-xl text-sm focus:outline-none focus:ring-2"
                style={{
                  border: '1px solid #E0D9D0',
                  backgroundColor: '#F9F7F5',
                  color: '#1A1A2E',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: '#9CA3AF' }}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-montserrat font-semibold text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: '#C8102E' }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link href="/recuperar" className="block text-sm" style={{ color: '#C8102E' }}>
            ¿Olvidaste tu contraseña?
          </Link>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            ¿No tienes cuenta?{' '}
            <Link href="/registro" className="font-semibold" style={{ color: '#C8102E' }}>
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
