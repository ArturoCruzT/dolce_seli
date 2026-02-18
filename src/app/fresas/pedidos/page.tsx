'use client';

// ============================================================
// ARCHIVO: src/app/fresas/pedidos/page.tsx
// CAMBIOS:
//  • Auto-refresh cada 60 segundos (antes era 30s)
//  • Las cards de pedidos en_camino muestran botón "🛵 Ver recorrido"
//    que lleva a /fresas/pedidos/[id]/repartidor
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pedido, EstadoPedido } from '@/types';
import { obtenerPedidos, actualizarEstadoPedido, eliminarPedido } from '@/lib/pedido.services';

// ============================================================
// CONFIGURACIÓN DE ESTADOS
// ============================================================

const ESTADOS: {
  value: EstadoPedido; label: string; emoji: string;
  color: string; bgColor: string; siguiente?: EstadoPedido; accion?: string;
}[] = [
  { value: 'pendiente',  label: 'Pendiente',  emoji: '⏳', color: 'text-amber-700',  bgColor: 'bg-amber-100',  siguiente: 'preparando', accion: 'Iniciar' },
  { value: 'preparando', label: 'Preparando', emoji: '👩‍🍳', color: 'text-blue-700',   bgColor: 'bg-blue-100',   siguiente: 'listo',     accion: 'Marcar listo' },
  { value: 'listo',      label: 'Listo',      emoji: '✅', color: 'text-green-700', bgColor: 'bg-green-100', siguiente: 'en_camino', accion: 'En camino' },
  { value: 'en_camino',  label: 'En camino',  emoji: '🛵', color: 'text-purple-700', bgColor: 'bg-purple-100', siguiente: 'entregado', accion: 'Entregado' },
  { value: 'entregado',  label: 'Entregado',  emoji: '🎉', color: 'text-gray-600',  bgColor: 'bg-gray-100' },
  { value: 'cancelado',  label: 'Cancelado',  emoji: '❌', color: 'text-red-700',   bgColor: 'bg-red-100' },
];

// ⏱️ Auto-refresh: 60 segundos
const INTERVALO_REFRESH_MS = 60_000;

// 🚨 Alerta si pedido pendiente lleva más de 30 min sin iniciar
const MINUTOS_ALERTA = 30;

const getEstado = (v: EstadoPedido) => ESTADOS.find(e => e.value === v) ?? ESTADOS[0];

const minutosDesde = (fecha?: string): number => {
  if (!fecha) return 0;
  return Math.floor((Date.now() - new Date(fecha).getTime()) / 60000);
};

const esAlerta = (p: Pedido): boolean =>
  p.estado === 'pendiente' && minutosDesde(p.created_at) >= MINUTOS_ALERTA;

const formatFecha = (iso?: string): string => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const formatMinutos = (min: number): string => {
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)}h ${min % 60}m`;
};

// ============================================================
// FILTRO ACTIVO
// ============================================================
type Filtro = 'activos' | EstadoPedido;

const FILTROS: { value: Filtro; label: string; emoji: string }[] = [
  { value: 'activos',    label: '',    emoji: '🔥' },
  { value: 'pendiente',  label: '',  emoji: '⏳' },
  { value: 'preparando', label: '', emoji: '👩‍🍳' },
  { value: 'listo',      label: '',      emoji: '✅' },
  { value: 'en_camino',  label: '',  emoji: '🛵' },
  { value: 'entregado',  label: '',  emoji: '🎉' },
  { value: 'cancelado',  label: '',  emoji: '❌' },
];

// ============================================================
// CARD DE PEDIDO
// ============================================================

function PedidoCard({ pedido, onCambiarEstado, onEliminar }: {
  pedido: Pedido;
  onCambiarEstado: (id: string, estado: EstadoPedido) => void;
  onEliminar: (id: string) => void;
}) {
  const router = useRouter();
  const estado = getEstado(pedido.estado);
  const alerta = esAlerta(pedido);
  const mins = minutosDesde(pedido.created_at);
  const [expandido, setExpandido] = useState(false);

  const tieneItems = pedido.items && pedido.items.length > 0;
  const estaEnCamino = pedido.estado === 'en_camino';

  return (
    <div className={`rounded-dolce-lg shadow-dolce overflow-hidden border-2 transition-all ${
      alerta
        ? 'border-orange-400 bg-orange-50 animate-pulse-slow'
        : estaEnCamino
          ? 'border-purple-300 bg-white'
          : 'border-transparent bg-white'
    }`}>
      {/* Alerta de tiempo */}
      {alerta && (
        <div className="bg-orange-500 text-white text-xs font-bold px-4 py-1.5 flex items-center gap-2">
          <span>🚨</span>
          <span>¡Pedido sin iniciar hace {formatMinutos(mins)}!</span>
        </div>
      )}

      {/* Banner repartidor para pedidos en camino */}
      {estaEnCamino && (
        <button
          onClick={() => router.push(`/fresas/pedidos/${pedido.id}/repartidor`)}
          className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white text-xs font-bold px-4 py-2 flex items-center justify-between active:opacity-80 transition-opacity"
        >
          <span className="flex items-center gap-2">
            <span>🛵</span>
            <span>Vista del repartidor</span>
          </span>
          <span>Ver recorrido →</span>
        </button>
      )}

      <div className="p-4">
        {/* Header de la card */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-800">{pedido.cliente || 'Sin nombre'}</h3>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${estado.bgColor} ${estado.color}`}>
                {estado.emoji} {estado.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">📞 {pedido.telefono || '—'}</p>
            {pedido.direccion && (
              <div className="flex items-center gap-1 mt-0.5">
                <p className="text-xs text-gray-500 truncate">📍 {pedido.direccion}</p>
                {pedido.linkMaps && (
                  <a href={pedido.linkMaps} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-500 shrink-0 hover:underline" onClick={e => e.stopPropagation()}>
                    ver mapa
                  </a>
                )}
              </div>
            )}
          </div>
          <div className="text-right shrink-0 ml-3">
            <p className="text-xl font-bold text-pink-deep">${pedido.total.toFixed(2)}</p>
            <p className="text-xs text-gray-400">{formatFecha(pedido.created_at)}</p>
          </div>
        </div>

        {/* Info de entrega programada */}
        {pedido.horaEntrega && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
            <span>📅</span>
            <p className="text-xs font-medium text-purple-700">Entrega programada: {pedido.horaEntrega}</p>
          </div>
        )}

        {/* Método de pago */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {pedido.tipoPago && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {pedido.tipoPago === 'efectivo' ? '💵' : pedido.tipoPago === 'transferencia' ? '🏦' : '💳'} {pedido.tipoPago}
            </span>
          )}
          <span className="text-xs text-gray-400">{mins > 0 ? `Hace ${formatMinutos(mins)}` : 'Ahora'}</span>
        </div>

        {/* Resumen de items */}
        {tieneItems && (
          <div className="mb-3">
            <button
              onClick={() => setExpandido(!expandido)}
              className="w-full text-left text-xs text-gray-500 flex items-center justify-between py-1 hover:text-gray-700"
            >
              <span>
                {pedido.items.length} producto{pedido.items.length !== 1 ? 's' : ''} ·{' '}
                {pedido.items.reduce((s, i) => s + i.cantidad, 0)} unidades
              </span>
              <span>{expandido ? '▲' : '▼'}</span>
            </button>

            {expandido && (
              <div className="mt-2 space-y-2">
                {pedido.items.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">
                          {item.cantidad}× {item.productoNombre}
                        </p>
                        {item.toppingsSeleccionados?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.toppingsSeleccionados.map((t, ti) => (
                              <span key={ti} className="text-xs bg-white border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                                {t.toppingNombre}
                              </span>
                            ))}
                          </div>
                        )}
                        {item.toppingsPorItem?.map((tp, tpi) => (
                          tp.toppings.length > 0 && (
                            <div key={tpi} className="mt-1">
                              <p className="text-xs text-gray-400">Producto {tpi + 1}:</p>
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {tp.toppings.map((t, ti) => (
                                  <span key={ti} className="text-xs bg-white border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                                    {t.toppingNombre}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                      <span className="text-sm font-bold text-gray-700 ml-2 shrink-0">
                        ${(item.precioUnitario * item.cantidad).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
                {pedido.notas && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2">
                    <p className="text-xs text-yellow-800"><span className="font-bold">📝 Nota:</span> {pedido.notas}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2 mt-2 flex-wrap">
          {/* Botón Vista Repartidor (solo en_camino, prominente) */}
          {estaEnCamino && (
            <Link
              href={`/fresas/pedidos/${pedido.id}/repartidor`}
              className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-purple-700 text-white text-sm font-bold rounded-dolce active:scale-95 transition-all text-center min-w-[120px]"
            >
              🛵 Iniciar recorrido
            </Link>
          )}

          {/* Botón avanzar estado (para estados que NO son en_camino, o como botón secundario) */}
          {estado.siguiente && !estaEnCamino && (
            <button
              onClick={() => onCambiarEstado(pedido.id, estado.siguiente!)}
              className="flex-1 py-2.5 bg-gradient-to-r from-pink-seli to-pink-deep text-white text-sm font-bold rounded-dolce active:scale-95 transition-all min-w-[100px]"
            >
              {estado.emoji} {estado.accion}
            </button>
          )}

          {/* Para en_camino: también botón de avanzar como alternativo */}
          {estaEnCamino && estado.siguiente && (
            <button
              onClick={() => onCambiarEstado(pedido.id, estado.siguiente!)}
              className="px-3 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-dolce active:scale-95 transition-all"
              title="Marcar como entregado directamente"
            >
              {estado.accion}
            </button>
          )}

          {/* Cancelar (solo si no está entregado ni ya cancelado) */}
          {pedido.estado !== 'entregado' && pedido.estado !== 'cancelado' && (
            <button
              onClick={() => onCambiarEstado(pedido.id, 'cancelado')}
              className="px-3 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-dolce active:scale-95 transition-all"
            >
              Cancelar
            </button>
          )}

          {/* Eliminar (solo entregados o cancelados) */}
          {(pedido.estado === 'entregado' || pedido.estado === 'cancelado') && (
            <button
              onClick={() => {
                if (confirm('¿Eliminar este pedido?')) onEliminar(pedido.id);
              }}
              className="px-3 py-2.5 text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-dolce active:scale-95 transition-all"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// INDICADOR DE PRÓXIMO REFRESH
// ============================================================

function RefreshIndicador({ segundosRestantes }: { segundosRestantes: number }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-400">
      <div className="relative w-3 h-3">
        <svg className="w-3 h-3 -rotate-90" viewBox="0 0 12 12">
          <circle cx="6" cy="6" r="5" fill="none" stroke="#e5e7eb" strokeWidth="2" />
          <circle
            cx="6" cy="6" r="5" fill="none" stroke="#f472b6" strokeWidth="2"
            strokeDasharray={`${2 * Math.PI * 5}`}
            strokeDashoffset={`${2 * Math.PI * 5 * (1 - segundosRestantes / 60)}`}
            className="transition-all duration-1000"
          />
        </svg>
      </div>
      <span>{segundosRestantes}s</span>
    </div>
  );
}

// ============================================================
// PÁGINA PRINCIPAL
// ============================================================

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>('activos');
  const [reloadKey, setReloadKey] = useState(0);
  const [segundosRestantes, setSegundosRestantes] = useState(60);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);

  const cargar = useCallback(async () => {
    const data = await obtenerPedidos();
    setPedidos(data);
    setLoading(false);
    setUltimaActualizacion(new Date());
    setSegundosRestantes(60); // reset countdown
    console.log('✅ Pedidos actualizados:', data.length, 'pedidos');
  }, []);

  useEffect(() => { cargar(); }, [cargar, reloadKey]);

  // ── Auto-refresh cada 60 segundos ────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setReloadKey(k => k + 1);
    }, INTERVALO_REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  // ── Countdown visual (actualiza cada segundo) ─────────────
  useEffect(() => {
    const tick = setInterval(() => {
      setSegundosRestantes(s => {
        if (s <= 1) return 60;
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [reloadKey]); // reset al recargar

  const handleCambiarEstado = async (id: string, estado: EstadoPedido) => {
    await actualizarEstadoPedido(id, estado);
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado } : p));
  };

  const handleEliminar = async (id: string) => {
    await eliminarPedido(id);
    setPedidos(prev => prev.filter(p => p.id !== id));
  };

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter(p => {
    if (filtro === 'activos') return ['pendiente', 'preparando', 'listo', 'en_camino'].includes(p.estado);
    return p.estado === filtro;
  });

  // Contadores
  const contadores = {
    activos: pedidos.filter(p => ['pendiente', 'preparando', 'listo', 'en_camino'].includes(p.estado)).length,
    pendiente: pedidos.filter(p => p.estado === 'pendiente').length,
    preparando: pedidos.filter(p => p.estado === 'preparando').length,
    listo: pedidos.filter(p => p.estado === 'listo').length,
    en_camino: pedidos.filter(p => p.estado === 'en_camino').length,
    entregado: pedidos.filter(p => p.estado === 'entregado').length,
    cancelado: pedidos.filter(p => p.estado === 'cancelado').length,
  };

  const alertas = pedidos.filter(esAlerta).length;

  const formatUltimaAct = (d: Date | null) => {
    if (!d) return '';
    return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-cream-dolce">
      {/* HEADER */}
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-800">🍓 Pedidos</h1>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500">
                  {contadores.activos} activo{contadores.activos !== 1 ? 's' : ''}
                  {alertas > 0 && (
                    <span className="ml-2 text-orange-600 font-bold">
                      · 🚨 {alertas} alerta{alertas !== 1 ? 's' : ''}
                    </span>
                  )}
                </p>
                {/* Indicador countdown */}
                <RefreshIndicador segundosRestantes={segundosRestantes} />
                {ultimaActualizacion && (
                  <span className="text-xs text-gray-300">{formatUltimaAct(ultimaActualizacion)}</span>
                )}
              </div>
            </div>
            <Link href="/fresas/pedidos/nuevo"
              className="bg-gradient-to-r from-pink-seli to-pink-deep text-white px-4 py-2.5 rounded-dolce font-bold text-sm active:scale-95 transition-all shadow-dolce-hover">
              + Nuevo
            </Link>
          </div>

          {/* Filtros horizontales */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {FILTROS.map(f => {
              const count = contadores[f.value as keyof typeof contadores] ?? 0;
              const activo = filtro === f.value;
              return (
                <button key={f.value} onClick={() => setFiltro(f.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                    activo
                      ? 'bg-pink-deep text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  <span>{f.emoji}</span>
                  <span>{f.label}</span>
                  {count > 0 && (
                    <span className={`rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold ${
                      activo ? 'bg-white text-pink-deep' : 'bg-pink-deep text-white'
                    }`}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="max-w-2xl mx-auto px-4 py-4 pb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-5xl mb-4 animate-bounce">🍓</div>
            <p className="text-gray-500">Cargando pedidos...</p>
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">Sin pedidos</h3>
            <p className="text-gray-500 text-sm mb-6">
              {filtro === 'activos' ? 'No hay pedidos activos en este momento' : `No hay pedidos con estado "${filtro}"`}
            </p>
            <Link href="/fresas/pedidos/nuevo"
              className="bg-gradient-to-r from-pink-seli to-pink-deep text-white px-6 py-3 rounded-dolce font-bold active:scale-95 transition-all">
              Crear primer pedido
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Alertas al tope */}
            {pedidosFiltrados.filter(esAlerta).map(p => (
              <PedidoCard key={`alerta-${p.id}`} pedido={p}
                onCambiarEstado={handleCambiarEstado} onEliminar={handleEliminar} />
            ))}
            {/* Resto de pedidos */}
            {pedidosFiltrados.filter(p => !esAlerta(p)).map(p => (
              <PedidoCard key={p.id} pedido={p}
                onCambiarEstado={handleCambiarEstado} onEliminar={handleEliminar} />
            ))}
          </div>
        )}

        {/* Botón refrescar manual */}
        <button
          onClick={() => setReloadKey(k => k + 1)}
          className="w-full mt-6 py-3 border-2 border-gray-300 text-gray-600 rounded-dolce text-sm font-medium hover:bg-gray-50 active:scale-95 transition-all"
        >
          🔄 Actualizar ahora
        </button>
      </div>
    </div>
  );
}