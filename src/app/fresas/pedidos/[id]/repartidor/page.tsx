'use client';

// ============================================================
// ARCHIVO: src/app/fresas/pedidos/[id]/repartidor/page.tsx
// ============================================================

import { useState, useEffect, useCallback } from 'react';
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
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
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

// Google Maps Navigation URL — completamente gratuito, no requiere API key ni suscripción.
// Abre la app nativa de Google Maps en el dispositivo con navegación activa.
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
  color: string;
  bgGradient: string;
}[] = [
  {
    value: 'en_camino',
    label: 'En camino',
    emoji: '🛵',
    desc: 'Dirígete a la dirección del cliente',
    color: 'text-purple-700',
    bgGradient: 'from-purple-500 to-purple-700',
  },
  {
    value: 'llego',
    label: '¡Llegué!',
    emoji: '📍',
    desc: 'Ya estás en la dirección, confirma tu llegada',
    color: 'text-blue-700',
    bgGradient: 'from-blue-500 to-blue-700',
  },
  {
    value: 'entregado',
    label: 'Entregado',
    emoji: '🎉',
    desc: '¡Pedido entregado con éxito!',
    color: 'text-green-700',
    bgGradient: 'from-green-500 to-green-700',
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

  // Cargar pedido
  const cargar = useCallback(async () => {
    if (!pedidoId) return;
    const data = await obtenerPedidoPorId(pedidoId);
    if (data) {
      setPedido(data);
      // Si ya está marcado como entregado, mostrar fase final
      if (data.estado === 'entregado') setFase('entregado');
    }
    setLoading(false);
  }, [pedidoId]);

  useEffect(() => { cargar(); }, [cargar]);

  // Timer de tiempo transcurrido (actualiza cada minuto)
  useEffect(() => {
    if (!pedido?.created_at) return;
    setTiempoTranscurrido(minutosDesde(pedido.created_at));
    const interval = setInterval(() => {
      setTiempoTranscurrido(minutosDesde(pedido?.created_at));
    }, 60000);
    return () => clearInterval(interval);
  }, [pedido?.created_at]);

  // ── Acción: Marcar llegada ──────────────────────────────
  const handleLlegar = async () => {
    setProcesando(true);
    // No cambiamos el estado en DB al llegar, solo es una confirmación visual
    // para que el repartidor sepa que debe confirmar entrega.
    setFase('llego');
    setProcesando(false);
  };

  // ── Acción: Confirmar entrega ───────────────────────────
  const handleEntregar = async () => {
    if (!pedido) return;
    setProcesando(true);
    try {
      await actualizarEstadoPedido(pedido.id, 'entregado');
      setPedido(prev => prev ? { ...prev, estado: 'entregado' as EstadoPedido } : null);
      setFase('entregado');
    } catch (err) {
      console.error('❌ Error al marcar entregado:', err);
    } finally {
      setProcesando(false);
    }
  };

  // ── Abrir Google Maps ───────────────────────────────────
  const abrirMaps = () => {
    if (!pedido) return;
    const destino = pedido.linkMaps || pedido.direccion;
    if (!destino) return;

    // Si ya tiene un link de Maps, usarlo directo; si no, construir URL de navegación
    const url = pedido.linkMaps ?? buildGoogleMapsUrl(pedido.direccion ?? '');
    window.open(url, '_blank');
  };

  // ── Loading ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-cream-dolce flex flex-col items-center justify-center">
        <div className="text-6xl animate-bounce mb-4">🛵</div>
        <p className="text-gray-500 font-medium">Cargando pedido...</p>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-cream-dolce flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Pedido no encontrado</h2>
        <p className="text-gray-500 mb-6">No pudimos cargar los datos del pedido.</p>
        <button onClick={() => router.back()}
          className="bg-gradient-to-r from-pink-seli to-pink-deep text-white px-6 py-3 rounded-dolce font-bold">
          ← Volver
        </button>
      </div>
    );
  }

  const faseActual = FASES.find(f => f.value === fase) ?? FASES[0];
  const tieneDireccion = !!(pedido.direccion || pedido.linkMaps);

  return (
    <div className="min-h-screen bg-cream-dolce flex flex-col">

      {/* ── HEADER ── */}
      <div className={`bg-gradient-to-r ${faseActual.bgGradient} text-white px-4 pt-safe pt-4 pb-6`}>
        <div className="max-w-lg mx-auto">
          {/* Nav */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="bg-white/20 hover:bg-white/30 active:scale-95 transition-all rounded-full px-3 py-1.5 text-sm font-medium"
            >
              ← Pedidos
            </button>
            <span className="text-sm font-medium opacity-80">
              🍓 Dolce Seli
            </span>
          </div>

          {/* Estado actual */}
          <div className="text-center">
            <div className="text-6xl mb-2">{faseActual.emoji}</div>
            <h1 className="text-2xl font-bold mb-1">{faseActual.label}</h1>
            <p className="text-white/80 text-sm">{faseActual.desc}</p>
          </div>

          {/* Progreso visual */}
          {fase !== 'entregado' && (
            <div className="flex items-center gap-2 mt-5">
              {FASES.filter(f => f.value !== 'entregado').map((f, idx) => (
                <div key={f.value} className="flex items-center flex-1">
                  <div className={`flex-1 h-2 rounded-full transition-all ${
                    (fase === 'llego' && idx === 0) || fase === f.value
                      ? 'bg-white'
                      : 'bg-white/30'
                  }`} />
                  {idx < 1 && (
                    <div className={`w-3 h-3 rounded-full mx-1 border-2 border-white ${
                      fase === 'llego' ? 'bg-white' : 'bg-white/30'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-5 space-y-4 pb-8">

        {/* DATOS DEL CLIENTE */}
        <div className="bg-white rounded-dolce-lg shadow-dolce p-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Cliente</h2>

          <div className="space-y-3">
            {/* Nombre */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-lg shrink-0">
                👤
              </div>
              <div>
                <p className="font-bold text-gray-800 text-lg leading-tight">{pedido.cliente || 'Sin nombre'}</p>
                <p className="text-xs text-gray-400">Nombre del cliente</p>
              </div>
            </div>

            {/* Teléfono */}
            {pedido.telefono && (
              <a
                href={`tel:${pedido.telefono}`}
                className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-dolce p-3 active:scale-95 transition-all"
              >
                <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center text-white shrink-0">
                  📞
                </div>
                <div className="flex-1">
                  <p className="font-bold text-green-800">{pedido.telefono}</p>
                  <p className="text-xs text-green-600">Toca para llamar</p>
                </div>
                <span className="text-green-500 text-lg">→</span>
              </a>
            )}

            {/* WhatsApp rápido */}
            {pedido.telefono && (
              <a
                href={`https://wa.me/52${pedido.telefono.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(pedido.cliente ?? '')}%2C%20soy%20el%20repartidor%20de%20Dolce%20Seli%2C%20ya%20voy%20en%20camino%20con%20tu%20pedido%20🍓`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-dolce p-3 active:scale-95 transition-all"
              >
                <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white text-lg shrink-0">
                  💬
                </div>
                <div className="flex-1">
                  <p className="font-bold text-emerald-800">WhatsApp</p>
                  <p className="text-xs text-emerald-600">Enviar mensaje al cliente</p>
                </div>
                <span className="text-emerald-500 text-lg">→</span>
              </a>
            )}
          </div>
        </div>

        {/* DIRECCIÓN + MAPA */}
        {tieneDireccion && (
          <div className="bg-white rounded-dolce-lg shadow-dolce p-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Dirección de entrega</h2>

            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg shrink-0 mt-0.5">
                📍
              </div>
              <p className="text-gray-800 font-medium leading-snug flex-1">
                {pedido.direccion || 'Ver en mapa'}
              </p>
            </div>

            {/* Botón Google Maps — completamente gratuito, abre la app nativa */}
            <button
              onClick={abrirMaps}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3.5 rounded-dolce font-bold text-base active:scale-95 transition-all shadow-md"
            >
              <span className="text-xl">🗺️</span>
              <span>Navegar con Google Maps</span>
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">
              Abre Google Maps gratis en tu dispositivo
            </p>
          </div>
        )}

        {/* RESUMEN DEL PEDIDO */}
        <div className="bg-white rounded-dolce-lg shadow-dolce p-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Resumen del pedido</h2>

          {/* Items */}
          <div className="space-y-2 mb-4">
            {pedido.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start gap-2 py-2 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">
                    {item.cantidad}× {item.productoNombre}
                  </p>
                  {/* Toppings simples */}
                  {item.toppingsSeleccionados?.length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      + {item.toppingsSeleccionados.map(t => t.toppingNombre).join(', ')}
                    </p>
                  )}
                  {/* Toppings por componente (paquetes) */}
                  {item.toppingsPorItem?.map((tp, tpi) =>
                    tp.toppings.length > 0 ? (
                      <p key={tpi} className="text-xs text-gray-400 mt-0.5">
                        P{tpi + 1}: {tp.toppings.map(t => t.toppingNombre).join(', ')}
                      </p>
                    ) : null
                  )}
                </div>
                <p className="text-sm font-bold text-gray-700 shrink-0">
                  ${(item.precioUnitario * item.cantidad).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Total y pago */}
          <div className="bg-gray-50 rounded-dolce p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Total a cobrar</span>
              <span className="text-2xl font-bold text-pink-deep">${pedido.total.toFixed(2)}</span>
            </div>
            {pedido.tipoPago && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Forma de pago</span>
                <span className="text-sm font-semibold text-gray-700 capitalize">
                  {pedido.tipoPago === 'efectivo' ? '💵' : pedido.tipoPago === 'transferencia' ? '🏦' : '💳'} {pedido.tipoPago}
                </span>
              </div>
            )}
          </div>

          {/* Nota del pedido */}
          {pedido.notas && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-dolce px-3 py-2">
              <p className="text-xs font-bold text-yellow-700 mb-1">📝 Nota del cliente:</p>
              <p className="text-sm text-yellow-800">{pedido.notas}</p>
            </div>
          )}

          {/* Hora de entrega programada */}
          {pedido.horaEntrega && (
            <div className="mt-3 bg-purple-50 border border-purple-200 rounded-dolce px-3 py-2">
              <p className="text-xs font-bold text-purple-700 mb-1">📅 Entrega programada:</p>
              <p className="text-sm text-purple-800 font-semibold">{pedido.horaEntrega}</p>
            </div>
          )}
        </div>

        {/* INFO ADICIONAL */}
        <div className="bg-white rounded-dolce-lg shadow-dolce p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-dolce p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Hora del pedido</p>
              <p className="font-bold text-gray-700">{formatHora(pedido.created_at)}</p>
            </div>
            <div className="bg-gray-50 rounded-dolce p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Tiempo transcurrido</p>
              <p className={`font-bold ${tiempoTranscurrido > 45 ? 'text-red-600' : tiempoTranscurrido > 30 ? 'text-orange-600' : 'text-gray-700'}`}>
                {formatMinutos(tiempoTranscurrido)}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* ── BOTONES DE ACCIÓN (sticky bottom) ── */}
      {fase !== 'entregado' && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="max-w-lg mx-auto">
            {fase === 'en_camino' && (
              <button
                onClick={handleLlegar}
                disabled={procesando}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white text-lg font-bold rounded-dolce active:scale-95 transition-all shadow-lg disabled:opacity-60"
              >
                {procesando ? '⏳ Procesando...' : '📍 Ya llegué al destino'}
              </button>
            )}

            {fase === 'llego' && (
              <div className="space-y-3">
                {/* Confirmación visual de llegada */}
                <div className="bg-blue-50 border border-blue-200 rounded-dolce px-4 py-3 text-center">
                  <p className="text-sm font-medium text-blue-700">
                    📍 Confirmaste tu llegada — ahora entrega el pedido y pulsa el botón
                  </p>
                </div>
                <button
                  onClick={handleEntregar}
                  disabled={procesando}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-green-700 text-white text-lg font-bold rounded-dolce active:scale-95 transition-all shadow-lg disabled:opacity-60"
                >
                  {procesando ? '⏳ Confirmando...' : '🎉 Confirmar entrega'}
                </button>
                <button
                  onClick={() => setFase('en_camino')}
                  className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ← Todavía no llegué
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ESTADO FINAL: ENTREGADO ── */}
      {fase === 'entregado' && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="max-w-lg mx-auto space-y-3">
            <div className="bg-green-50 border border-green-300 rounded-dolce px-4 py-4 text-center">
              <div className="text-3xl mb-1">🎉</div>
              <p className="font-bold text-green-800 text-base">¡Pedido entregado con éxito!</p>
              <p className="text-xs text-green-600 mt-1">El estado fue actualizado automáticamente</p>
            </div>
            <button
              onClick={() => router.push('/fresas/pedidos')}
              className="w-full py-3.5 bg-gradient-to-r from-pink-seli to-pink-deep text-white font-bold rounded-dolce active:scale-95 transition-all"
            >
              ← Volver a pedidos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}