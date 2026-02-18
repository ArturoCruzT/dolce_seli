'use client';

// ============================================================
// ARCHIVO: src/components/auth/LogoutButton.tsx
// Botón de cerrar sesión — úsalo en el header del panel admin
// ============================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase.auth';

interface LogoutButtonProps {
  className?: string;
  variant?: 'icon' | 'full';
}

export default function LogoutButton({ className = '', variant = 'full' }: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    console.log('✅ Sesión cerrada');
    router.replace('/login');
    router.refresh();
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        title="Cerrar sesión"
        className={`p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all active:scale-95 disabled:opacity-50 ${className}`}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block" />
        ) : (
          <span className="text-lg">🚪</span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95 disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        <span>🚪</span>
      )}
      {!loading ? 'Cerrar sesión' : 'Saliendo...'}
    </button>
  );
}