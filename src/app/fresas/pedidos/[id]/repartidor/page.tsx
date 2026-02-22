'use client';

// ============================================================
// ARCHIVO: src/app/fresas/pedidos/[id]/repartidor/page.tsx
// ✅ Ajustado al estilo de la página inicial (misma estética Dolce Seli)
// ❗ NO cambia la lógica: mismas funciones, mismos handlers, mismos datos.
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Pedido, EstadoPedido } from '@/types';
import { obtenerPedidoPorId, actualizarEstadoPedido } from '@/lib/pedido.services';

// ============================================================
// HELPERS
// ============================================================

const formatHora = (iso?: string): string => {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
};

const formatFecha = (iso?: string): string => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const minutosDesde = (fecha?: string): number => {
  if (!fecha) return 0;
  return Math.floor((Date.now() - new Date(fecha).getTime()) / 60000);
};

const formatMinutos = (min: number): string => {
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)}h ${min % 60}m`;
};

const buildGoogleMapsUrl = (address: string): string => {
  const encoded = encodeURIComponent(address);
  return `https://www.google.com/maps/dir/?api=1&destination=${encoded}&travelmode=driving`;
};

// ============================================================
// SECCIÓN: Estado del recorrido
// ============================================================

type FaseRepartidor = 'en_camino' | 'llego' | 'entregado';

const FASES: {
  value: FaseRepartidor;
  label: string;
  emoji: string;
  desc: string;
  // ✅ mantenemos estructura pero lo hacemos "Dolce" (pink/cream) como la home
  pillBg: string;
  heroBg: string;
  ring: string;
}[] = [
  {
    value: 'en_camino',
    label: 'En camino',
    emoji: '🛵',
    desc: 'Dirígete a la dirección del cliente',
    pillBg: 'bg-pink-50 text-pink-deep border-pink-200',
    heroBg: 'from-pink-seli to-pink-deep',
    ring: 'ring-pink-200',
  },
  {
    value: 'llego',
    label: '¡Llegué!',
    emoji: '📍',
    desc: 'Ya estás en la dirección, confirma tu llegada',
    pillBg: 'bg-blue-50 text-blue-700 border-blue-200',
    heroBg: 'from-pink-seli to-pink-deep', // ✅ mismo hero que home
    ring: 'ring-blue-200',
  },
  {
    value: 'entregado',
    label: 'Entregado',
    emoji: '🎉',
    desc: '¡Pedido entregado con éxito!',
    pillBg: 'bg-green-50 text-green-700 border-green-200',
    heroBg: 'from-pink-seli to-pink-deep', // ✅ mismo hero que home
    ring: 'ring-green-200',
  },
];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function RepartidorPage() {
  const router = useRouter();
  const params = useParams();
  const pedidoId = params?.id as string;

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [fase, setFase] = useState<FaseRepartidor>('en_camino');
  const [procesando, setProcesando] = useState(false);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);

  const cargar = useCallback(async () => {
    if (!pedidoId) return;
    const data = await obtenerPedidoPorId(pedidoId);
    if (data) {
      setPedido(data);
      if (data.estado === 'entregado') setFase('entregado');
    }
    setLoading(false);
  }, [pedidoId]);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    if (!pedido?.created_at) return;
    setTiempoTranscurrido(minutosDesde(pedido.created_at));
    const interval = setInterval(() => {
      setTiempoTranscurrido(minutosDesde(pedido?.created_at));
    }, 60000);
    return () => clearInterval(interval);
  }, [pedido?.created_at]);

  const handleLlegar = async () => {
    setProcesando(true);
    setFase('llego');
    setProcesando(false);
  };

  const handleEntregar = async () => {
    if (!pedido) return;
    setProcesando(true);
    try {
      await actualizarEstadoPedido(pedido.id, 'entregado');
      setPedido(prev => (prev ? { ...prev, estado: 'entregado' as EstadoPedido } : null));
      setFase('entregado');
    } catch (err) {
      console.error('❌ Error al marcar entregado:', err);
    } finally {
      setProcesando(false);
    }
  };

  const abrirMaps = () => {
    if (!pedido) return;
    const destino = pedido.linkMaps || pedido.direccion;
    if (!destino) return;
    const url = pedido.linkMaps ?? buildGoogleMapsUrl(pedido.direccion ?? '');
    window.open(url, '_blank');
  };

  // ====== UI computed ======
  const faseActual = useMemo(() => FASES.find(f => f.value === fase) ?? FASES[0], [fase]);
  const tieneDireccion = !!(pedido?.direccion || pedido?.linkMaps);

  const semaforoTiempo = useMemo(() => {
    if (tiempoTranscurrido > 45) return 'text-red-600';
    if (tiempoTranscurrido > 30) return 'text-orange-600';
    return 'text-gray-800';
  }, [tiempoTranscurrido]);

  // ── Loading ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-cream-dolce flex flex-col items-center justify-center">
        <div className="text-6xl animate-bounce mb-4">🛵</div>
        <p className="text-gray-500 font-medium">Cargando pedido...</p>
      </div>
    );
  }

  // ── No pedido ───────────────────────────────────────────
  if (!pedido) {
    return (
      <div className="min-h-screen bg-cream-dolce flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Pedido no encontrado</h2>
        <p className="text-gray-500 mb-6">No pudimos cargar los datos del pedido.</p>
        <button
          onClick={() => router.back()}
          className="bg-gradient-to-r from-pink-seli to-pink-deep text-white px-6 py-3 rounded-dolce font-bold active:scale-95 transition-all shadow-dolce-hover"
        >
          ← Volver
        </button>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-cream-dolce">
      {/* ===== Header sticky (como POS/home) ===== */}
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 active:scale-95 transition-all text-sm font-medium flex items-center gap-1"
            >
              ← Pedidos
            </button>

            <div className="text-center flex-1 min-w-0">
              <p className="text-xs text-gray-500">Repartidor</p>
              <p className="font-bold text-gray-800 truncate">
                #{(pedido.id || '').slice(0, 6).toUpperCase()} · {pedido.cliente || 'Cliente'}
              </p>
            </div>

            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${faseActual.pillBg}`}>
              {faseActual.emoji} {faseActual.label}
            </span>
          </div>
        </div>
      </div>

      {/* ===== Hero card (estilo home: gradiente pink) ===== */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div
          className={`rounded-dolce-lg shadow-dolce-lg overflow-hidden bg-gradient-to-r ${faseActual.heroBg}`}
        >
          <div className="p-5 text-white">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-xl font-black leading-tight">
                  {faseActual.emoji} {faseActual.label}
                </h1>
                <p className="text-white/80 text-sm mt-1">{faseActual.desc}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="bg-white/15 border border-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    🕒 Pedido: {formatHora(pedido.created_at)}
                  </span>
                  <span className="bg-white/15 border border-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    ⏱️ Transcurrido: {formatMinutos(tiempoTranscurrido)}
                  </span>
                  <span className="bg-white/15 border border-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    💰 Total: ${pedido.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className={`shrink-0 w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-3xl ring-4 ${faseActual.ring}`}>
                🍓
              </div>
            </div>

            {/* Progreso minimalista */}
            {fase !== 'entregado' && (
              <div className="mt-5">
                <div className="flex items-center gap-2">
                  {(['en_camino', 'llego'] as const).map((v, idx) => {
                    const activo = fase === v || (fase === 'llego' && v === 'en_camino');
                    return (
                      <div key={v} className="flex-1">
                        <div className={`h-2 rounded-full ${activo ? 'bg-white' : 'bg-white/30'}`} />
                        {idx === 0 && (
                          <div className={`mt-2 text-[11px] font-semibold ${fase === 'llego' ? 'text-white' : 'text-white/80'}`}>
                            {fase === 'llego' ? '✅ Llegaste' : 'En ruta'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== Content ===== */}
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4 pb-28">
        {/* Cliente */}
        <div className="bg-white rounded-dolce-lg shadow-dolce p-4">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
            👤 Cliente
          </h2>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-pink-100 rounded-full flex items-center justify-center text-xl shrink-0">
              👤
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-800 text-lg leading-tight truncate">
                {pedido.cliente || 'Sin nombre'}
              </p>
              <p className="text-xs text-gray-500">Creado: {formatFecha(pedido.created_at)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {pedido.telefono && (
              <a
                href={`tel:${pedido.telefono}`}
                className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-dolce p-3 active:scale-95 transition-all hover:border-pink-seli"
              >
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white shrink-0">
                  📞
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 truncate">{pedido.telefono}</p>
                  <p className="text-xs text-gray-500">Toca para llamar</p>
                </div>
                <span className="text-gray-400 text-lg">→</span>
              </a>
            )}

            {pedido.telefono && (
              <a
                href={`https://wa.me/52${pedido.telefono.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(
                  pedido.cliente ?? ''
                )}%2C%20soy%20el%20repartidor%20de%20Dolce%20Seli%2C%20ya%20voy%20en%20camino%20con%20tu%20pedido%20🍓`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-dolce p-3 active:scale-95 transition-all hover:border-pink-seli"
              >
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white text-lg shrink-0">
                  💬
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800">WhatsApp</p>
                  <p className="text-xs text-gray-500">Mensaje rápido</p>
                </div>
                <span className="text-gray-400 text-lg">→</span>
              </a>
            )}
          </div>
        </div>

        {/* Dirección */}
        {tieneDireccion && (
          <div className="bg-white rounded-dolce-lg shadow-dolce p-4">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              📍 Entrega
            </h2>

            <div className="bg-gray-50 border border-gray-200 rounded-dolce p-3 mb-3">
              <p className="text-sm text-gray-800 font-semibold leading-snug">
                {pedido.direccion || 'Ver en mapa'}
              </p>
              {pedido.linkMaps && (
                <p className="text-xs text-gray-500 mt-1 truncate">
                  Link maps disponible
                </p>
              )}
            </div>

            <button
              onClick={abrirMaps}
              className="w-full py-3.5 bg-gradient-to-r from-pink-seli to-pink-deep text-white font-bold rounded-dolce active:scale-95 transition-all shadow-dolce-hover flex items-center justify-center gap-2"
            >
              <span className="text-xl">🗺️</span>
              Navegar con Google Maps
            </button>

            <p className="text-center text-xs text-gray-400 mt-2">
              Abre Google Maps gratis en tu dispositivo
            </p>
          </div>
        )}

        {/* Resumen */}
        <div className="bg-white rounded-dolce-lg shadow-dolce p-4">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
            🧾 Resumen
          </h2>

          <div className="space-y-2 mb-4">
            {pedido.items?.map((item, idx) => (
              <div
                key={idx}
                className="bg-gray-50 border border-gray-200 rounded-dolce p-3"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 text-sm">
                      {item.cantidad}× {item.productoNombre}
                    </p>

                    {item.toppingsSeleccionados?.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        + {item.toppingsSeleccionados.map(t => t.toppingNombre).join(', ')}
                      </p>
                    )}

                    {item.toppingsPorItem?.map((tp, tpi) =>
                      tp.toppings.length > 0 ? (
                        <p key={tpi} className="text-xs text-gray-500 mt-1">
                          P{tpi + 1}: {tp.toppings.map(t => t.toppingNombre).join(', ')}
                        </p>
                      ) : null
                    )}
                  </div>

                  <p className="text-sm font-black text-gray-800 shrink-0">
                    ${(item.precioUnitario * item.cantidad).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-dolce p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total a cobrar</span>
              <span className="text-2xl font-black text-pink-deep">
                ${pedido.total.toFixed(2)}
              </span>
            </div>

            {pedido.tipoPago && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Forma de pago</span>
                <span className="text-sm font-bold text-gray-800 capitalize">
                  {pedido.tipoPago === 'efectivo'
                    ? '💵'
                    : pedido.tipoPago === 'transferencia'
                    ? '🏦'
                    : '💳'}{' '}
                  {pedido.tipoPago}
                </span>
              </div>
            )}
          </div>

          {pedido.notas && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-dolce px-3 py-2">
              <p className="text-xs font-bold text-yellow-700 mb-1">📝 Nota</p>
              <p className="text-sm text-yellow-900">{pedido.notas}</p>
            </div>
          )}

          {pedido.horaEntrega && (
            <div className="mt-3 bg-purple-50 border border-purple-200 rounded-dolce px-3 py-2">
              <p className="text-xs font-bold text-purple-700 mb-1">📅 Programado</p>
              <p className="text-sm text-purple-900 font-bold">{pedido.horaEntrega}</p>
            </div>
          )}
        </div>

        {/* Estado / métricas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-dolce-lg shadow-dolce p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Hora del pedido</p>
            <p className="font-black text-gray-800">{formatHora(pedido.created_at)}</p>
          </div>
          <div className="bg-white rounded-dolce-lg shadow-dolce p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Tiempo transcurrido</p>
            <p className={`font-black ${semaforoTiempo}`}>{formatMinutos(tiempoTranscurrido)}</p>
          </div>
        </div>
      </div>

      {/* ===== Bottom actions sticky (como la home: barra blanca + CTA gradiente) ===== */}
      {fase !== 'entregado' && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-3"
          style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}
        >
          <div className="max-w-2xl mx-auto">
            {fase === 'en_camino' && (
              <button
                onClick={handleLlegar}
                disabled={procesando}
                className="w-full py-3.5 bg-gradient-to-r from-pink-seli to-pink-deep text-white text-base font-black rounded-dolce active:scale-95 transition-all disabled:opacity-60 shadow-dolce-hover"
              >
                {procesando ? '⏳ Procesando...' : '📍 Ya llegué al destino'}
              </button>
            )}

            {fase === 'llego' && (
              <div className="space-y-2">
                <div className="bg-gray-50 border border-gray-200 rounded-dolce px-3 py-2 text-center">
                  <p className="text-sm font-bold text-gray-700">
                    📍 Listo — entrega el pedido y confirma
                  </p>
                </div>

                <button
                  onClick={handleEntregar}
                  disabled={procesando}
                  className="w-full py-3.5 bg-gradient-to-r from-pink-seli to-pink-deep text-white text-base font-black rounded-dolce active:scale-95 transition-all disabled:opacity-60 shadow-dolce-hover"
                >
                  {procesando ? '⏳ Confirmando...' : '🎉 Confirmar entrega'}
                </button>

                <button
                  onClick={() => setFase('en_camino')}
                  className="w-full py-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                >
                  ← Todavía no llegué
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {fase === 'entregado' && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-3"
          style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}
        >
          <div className="max-w-2xl mx-auto space-y-2">
            <div className="bg-green-50 border border-green-200 rounded-dolce px-4 py-3 text-center">
              <p className="font-black text-green-800">✅ Pedido entregado</p>
              <p className="text-xs text-green-700 mt-1">Estado actualizado</p>
            </div>

            <button
              onClick={() => router.push('/fresas/pedidos')}
              className="w-full py-3.5 bg-gradient-to-r from-pink-seli to-pink-deep text-white font-black rounded-dolce active:scale-95 transition-all shadow-dolce-hover"
            >
              ← Volver a pedidos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}