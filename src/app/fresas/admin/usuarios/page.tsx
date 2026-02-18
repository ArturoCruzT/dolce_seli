'use client';

// ============================================================
// ARCHIVO: src/app/fresas/admin/usuarios/page.tsx
// Panel de administración de usuarios
// Usa Supabase Admin API vía endpoint propio (server-side)
// ============================================================

import { useState, useEffect, useCallback } from 'react';

// ============================================================
// TIPOS
// ============================================================

interface Usuario {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  role?: string;
}

// ============================================================
// HELPERS
// ============================================================

const formatFecha = (iso?: string): string => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const getIniciales = (email: string): string => {
  return email.substring(0, 2).toUpperCase();
};

const colorFromEmail = (email: string): string => {
  const colors = [
    'bg-pink-100 text-pink-700',
    'bg-purple-100 text-purple-700',
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-orange-100 text-orange-700',
    'bg-teal-100 text-teal-700',
  ];
  const idx = email.charCodeAt(0) % colors.length;
  return colors[idx];
};

// ============================================================
// COMPONENTE MODAL: Crear usuario
// ============================================================

function ModalCrearUsuario({ onClose, onCreado }: {
  onClose: () => void;
  onCreado: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPass) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al crear el usuario');
        return;
      }

      console.log('✅ Usuario creado:', email);
      onCreado();
      onClose();
    } catch (err) {
      console.error('❌ Error:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-dolce-lg shadow-2xl w-full max-w-md p-6 animate-in">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Nuevo usuario</h2>
            <p className="text-xs text-gray-500 mt-0.5">Crea una cuenta para acceder al panel</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all">
            ✕
          </button>
        </div>

        <form onSubmit={handleCrear} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Correo electrónico *
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="usuario@dolceseli.com"
              required autoFocus
              className="w-full px-4 py-2.5 border border-gray-300 rounded-dolce focus:ring-2 focus:ring-pink-deep focus:border-transparent text-base outline-none transition-all"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Contraseña * <span className="text-gray-400 font-normal">(mínimo 6 caracteres)</span>
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-dolce focus:ring-2 focus:ring-pink-deep focus:border-transparent text-base outline-none transition-all"
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirmar contraseña *
            </label>
            <input
              type={showPass ? 'text' : 'password'} value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)}
              placeholder="••••••••" required
              className={`w-full px-4 py-2.5 border rounded-dolce focus:ring-2 focus:ring-pink-deep focus:border-transparent text-base outline-none transition-all ${
                confirmPass && password !== confirmPass
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-300'
              }`}
            />
            {confirmPass && password !== confirmPass && (
              <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-dolce px-4 py-3">
              <p className="text-sm text-red-700">❌ {error}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border-2 border-gray-200 text-gray-600 font-medium rounded-dolce hover:bg-gray-50 active:scale-95 transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={loading || !email || !password || !confirmPass}
              className="flex-[2] py-2.5 bg-gradient-to-r from-pink-seli to-pink-deep text-white font-bold rounded-dolce active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creando...
                </span>
              ) : '✅ Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTE MODAL: Cambiar contraseña
// ============================================================

function ModalCambiarPass({ usuario, onClose, onActualizado }: {
  usuario: Usuario;
  onClose: () => void;
  onActualizado: () => void;
}) {
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCambiar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPass) { setError('Las contraseñas no coinciden'); return; }
    if (password.length < 6) { setError('Mínimo 6 caracteres'); return; }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/usuarios/${usuario.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error al actualizar'); return; }

      console.log('✅ Contraseña actualizada para:', usuario.email);
      onActualizado();
      onClose();
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-dolce-lg shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Cambiar contraseña</h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[220px]">{usuario.email}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">✕</button>
        </div>

        <form onSubmit={handleCambiar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nueva contraseña</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoFocus
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-dolce focus:ring-2 focus:ring-pink-deep outline-none transition-all" />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPass ? '🙈' : '👁️'}</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar contraseña</label>
            <input type={showPass ? 'text' : 'password'} value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)} placeholder="••••••••" required
              className={`w-full px-4 py-2.5 border rounded-dolce focus:ring-2 focus:ring-pink-deep outline-none transition-all ${
                confirmPass && password !== confirmPass ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`} />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-dolce">❌ {error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border-2 border-gray-200 text-gray-600 font-medium rounded-dolce hover:bg-gray-50 active:scale-95 transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={loading || !password || !confirmPass}
              className="flex-[2] py-2.5 bg-gradient-to-r from-pink-seli to-pink-deep text-white font-bold rounded-dolce active:scale-95 disabled:opacity-50">
              {loading ? '⏳ Guardando...' : '🔑 Cambiar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// PÁGINA PRINCIPAL
// ============================================================

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalPass, setModalPass] = useState<Usuario | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; tipo: 'ok' | 'err' } | null>(null);

  const mostrarToast = (msg: string, tipo: 'ok' | 'err' = 'ok') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/usuarios');
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error al cargar usuarios'); return; }
      setUsuarios(data.usuarios || []);
      console.log('✅ Usuarios cargados:', data.usuarios?.length);
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const handleEliminar = async (usuario: Usuario) => {
    if (!confirm(`¿Eliminar al usuario ${usuario.email}?\n\nEsta acción no se puede deshacer.`)) return;

    setEliminando(usuario.id);
    try {
      const res = await fetch(`/api/admin/usuarios/${usuario.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { mostrarToast(data.error || 'Error al eliminar', 'err'); return; }
      mostrarToast(`Usuario ${usuario.email} eliminado`);
      setUsuarios(prev => prev.filter(u => u.id !== usuario.id));
    } catch {
      mostrarToast('Error de conexión', 'err');
    } finally {
      setEliminando(null);
    }
  };

  return (
    <div className="min-h-screen bg-cream-dolce">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-dolce shadow-lg font-medium text-sm transition-all ${
          toast.tipo === 'ok' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.tipo === 'ok' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* Modales */}
      {modalCrear && (
        <ModalCrearUsuario
          onClose={() => setModalCrear(false)}
          onCreado={() => { cargar(); mostrarToast('Usuario creado exitosamente'); }}
        />
      )}
      {modalPass && (
        <ModalCambiarPass
          usuario={modalPass}
          onClose={() => setModalPass(null)}
          onActualizado={() => mostrarToast('Contraseña actualizada')}
        />
      )}

      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">👥 Usuarios</h1>
            <p className="text-xs text-gray-500">
              {loading ? 'Cargando...' : `${usuarios.length} usuario${usuarios.length !== 1 ? 's' : ''} registrado${usuarios.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={() => setModalCrear(true)}
            className="bg-gradient-to-r from-pink-seli to-pink-deep text-white px-4 py-2.5 rounded-dolce font-bold text-sm active:scale-95 transition-all shadow-sm">
            + Nuevo usuario
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-5xl mb-4 animate-bounce">🍓</div>
            <p className="text-gray-500">Cargando usuarios...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-dolce-lg p-6 text-center">
            <div className="text-4xl mb-3">😕</div>
            <p className="font-bold text-red-700 mb-1">No se pudo cargar la lista</p>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button onClick={cargar}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-dolce font-medium hover:bg-red-200 transition-all">
              Reintentar
            </button>
          </div>
        )}

        {/* Lista de usuarios */}
        {!loading && !error && (
          <>
            {usuarios.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-6xl mb-4">👤</div>
                <h3 className="text-lg font-bold text-gray-700 mb-1">Sin usuarios</h3>
                <p className="text-gray-500 text-sm mb-6">Crea el primer usuario para acceder al panel</p>
                <button onClick={() => setModalCrear(true)}
                  className="bg-gradient-to-r from-pink-seli to-pink-deep text-white px-6 py-3 rounded-dolce font-bold active:scale-95 transition-all">
                  Crear primer usuario
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {usuarios.map(u => (
                  <div key={u.id}
                    className="bg-white rounded-dolce-lg shadow-dolce p-4 flex items-center gap-4 transition-all hover:shadow-dolce-hover">

                    {/* Avatar */}
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${colorFromEmail(u.email)}`}>
                      {getIniciales(u.email)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 truncate">{u.email}</p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          u.email_confirmed_at
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {u.email_confirmed_at ? '✓ Confirmado' : '⏳ Sin confirmar'}
                        </span>
                        {u.last_sign_in_at ? (
                          <span className="text-xs text-gray-400">
                            Último acceso: {formatFecha(u.last_sign_in_at)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Nunca ha ingresado</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Creado: {formatFecha(u.created_at)}
                      </p>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setModalPass(u)}
                        title="Cambiar contraseña"
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95">
                        🔑
                      </button>
                      <button
                        onClick={() => handleEliminar(u)}
                        disabled={eliminando === u.id}
                        title="Eliminar usuario"
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95 disabled:opacity-40">
                        {eliminando === u.id ? (
                          <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block" />
                        ) : '🗑️'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}