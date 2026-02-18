'use client';

// ============================================================
// ARCHIVO: src/app/login/page.tsx
// Página de inicio de sesión con diseño Dolce Seli
// Usa Supabase Auth con email + contraseña
// ============================================================

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase.auth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/fresas/pedidos';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  const supabase = createClient();

  // Si ya hay sesión activa, redirigir
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace(redirect);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('❌ Error de login:', error.message);
      setError(traducirError(error.message));
      setLoading(false);
      return;
    }

    console.log('✅ Login exitoso — redirigiendo a:', redirect);
    router.replace(redirect);
    router.refresh();
  };

  // Traducir mensajes de error de Supabase al español
  const traducirError = (msg: string): string => {
    if (msg.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos';
    if (msg.includes('Email not confirmed')) return 'Confirma tu correo antes de iniciar sesión';
    if (msg.includes('Too many requests')) return 'Demasiados intentos. Espera un momento';
    if (msg.includes('User not found')) return 'No existe una cuenta con ese correo';
    return 'Error al iniciar sesión. Intenta de nuevo';
  };

  return (
    <div className="min-h-screen bg-cream-dolce flex flex-col items-center justify-center px-4">

      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-pink-seli/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-pink-deep/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-seli/5 rounded-full blur-3xl" />
      </div>

      {/* Card de login */}
      <div className="relative w-full max-w-sm">

        {/* Logo / Marca */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🍓</div>
          <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
            Dolce Seli
          </h1>
          <p className="text-gray-500 text-sm mt-1">Panel de administración</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-dolce-lg shadow-[0_8px_40px_rgba(232,93,117,0.12)] p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Iniciar sesión</h2>

          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">
                  ✉️
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="hola@dolceseli.com"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-dolce focus:ring-2 focus:ring-pink-deep focus:border-transparent text-base transition-all outline-none"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">
                  🔒
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-dolce focus:ring-2 focus:ring-pink-deep focus:border-transparent text-base transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-sm"
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-dolce px-4 py-3 flex items-start gap-2">
                <span className="text-red-500 text-sm shrink-0">❌</span>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3.5 bg-gradient-to-r from-pink-seli to-pink-deep text-white font-bold text-base rounded-dolce active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_15px_rgba(232,93,117,0.35)] mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                'Entrar al panel 🍓'
              )}
            </button>
          </form>

          {/* Separador */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              ¿Problemas para entrar? Contacta al administrador
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Dolce Seli · Antojos que se disfrutan bonito 🍓
        </p>
      </div>
    </div>
  );
}