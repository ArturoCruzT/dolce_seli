'use client';

import { useMemo, useState } from 'react';
import { ProductoIndividual, Paquete, Topping, ItemPedido } from '@/types';

interface SeleccionProductoProps {
  productosIndividuales: ProductoIndividual[];
  paquetes: Paquete[];
  toppingsDisponibles: Topping[];
  onAgregarItem: (item: ItemPedido) => void;
}

type TipoSeleccion = 'individual' | 'paquete';

const TOPPING_EXTRA_PRECIO = 5;

export default function SeleccionProducto({
  productosIndividuales,
  paquetes,
  toppingsDisponibles,
  onAgregarItem,
}: SeleccionProductoProps) {
  const [tipoSeleccion, setTipoSeleccion] = useState<TipoSeleccion>('individual');
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [toppingsSeleccionados, setToppingsSeleccionados] = useState<string[]>([]);

  const productoActual = useMemo(() => {
    return tipoSeleccion === 'individual'
      ? productosIndividuales.find((p) => p.id === productoSeleccionado)
      : paquetes.find((p) => p.id === productoSeleccionado);
  }, [tipoSeleccion, productoSeleccionado, productosIndividuales, paquetes]);

  const toppingsIncluidos = productoActual?.toppingsIncluidos ?? 0;
  const toppingsExtras = Math.max(0, toppingsSeleccionados.length - toppingsIncluidos);

  const totalUnitario = (productoActual?.precio ?? 0) + toppingsExtras * TOPPING_EXTRA_PRECIO;
  const totalLinea = totalUnitario * cantidad;

  const resetSeleccion = () => {
    setProductoSeleccionado('');
    setCantidad(1);
    setToppingsSeleccionados([]);
  };

  const toggleTopping = (toppingId: string) => {
    setToppingsSeleccionados((prev) =>
      prev.includes(toppingId) ? prev.filter((id) => id !== toppingId) : [...prev, toppingId]
    );
  };

  const handleAgregar = () => {
    if (!productoSeleccionado || !productoActual) {
      alert('⚠️ Selecciona un producto');
      return;
    }

    const toppingsConNombre = toppingsSeleccionados.map((id) => {
      const topping = toppingsDisponibles.find((t) => t.id === id);
      return { toppingId: id, toppingNombre: topping?.nombre || '' };
    });

    // ✅ OJO: tu ItemPedido ya trae toppingsSeleccionados y precioUnitario.
    // Aquí precioUnitario incluye extras para que el total del pedido sea correcto.
    const item: ItemPedido = {
      tipo: tipoSeleccion,
      productoId: productoSeleccionado,
      productoNombre: productoActual.nombre,
      cantidad,
      precioUnitario: totalUnitario,
      toppingsSeleccionados: toppingsConNombre,
    };

    onAgregarItem(item);
    resetSeleccion();
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_55px_rgba(0,0,0,0.45)] p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-black text-white">🍓 Agregar productos</h2>
          <p className="text-sm text-white/60">Selecciona producto, cantidad y toppings (si aplica).</p>
        </div>

        {/* Total preview */}
        <div className="text-right">
          <p className="text-xs text-white/50">Total</p>
          <p className="text-2xl font-black text-[#E85D75]">${Number.isFinite(totalLinea) ? totalLinea.toFixed(2) : '0.00'}</p>
          <p className="text-[11px] text-white/45">
            Unit: ${Number.isFinite(totalUnitario) ? totalUnitario.toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      {/* Selector de tipo */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          type="button"
          onClick={() => {
            setTipoSeleccion('individual');
            resetSeleccion();
          }}
          className={`px-4 py-3 rounded-2xl font-semibold transition-all border ${
            tipoSeleccion === 'individual'
              ? 'bg-gradient-to-r from-[#E85D75] to-[#c0304a] text-white border-white/10 shadow-[0_20px_80px_rgba(232,93,117,0.18)]'
              : 'bg-white/5 text-white/75 border-white/10 hover:bg-white/8'
          }`}
        >
          🍓 Individual
        </button>

        <button
          type="button"
          onClick={() => {
            setTipoSeleccion('paquete');
            resetSeleccion();
          }}
          className={`px-4 py-3 rounded-2xl font-semibold transition-all border ${
            tipoSeleccion === 'paquete'
              ? 'bg-gradient-to-r from-[#E85D75] to-[#c0304a] text-white border-white/10 shadow-[0_20px_80px_rgba(232,93,117,0.18)]'
              : 'bg-white/5 text-white/75 border-white/10 hover:bg-white/8'
          }`}
        >
          💝 Paquete
        </button>
      </div>

      {/* Selector de producto */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-white/80 mb-2">
          Selecciona {tipoSeleccion === 'individual' ? 'producto' : 'paquete'}
        </label>

        <div className="relative">
          <select
            value={productoSeleccionado}
            onChange={(e) => {
              setProductoSeleccionado(e.target.value);
              setToppingsSeleccionados([]);
            }}
            className="w-full appearance-none px-4 py-3 rounded-2xl border border-white/10 bg-black/35 text-white focus:outline-none focus:ring-2 focus:ring-[#E85D75]/60"
          >
            <option value="">-- Selecciona una opción --</option>

            {tipoSeleccion === 'individual'
              ? productosIndividuales.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.emoji} {prod.nombre} - ${prod.precio}
                  </option>
                ))
              : paquetes.map((paq) => (
                  <option key={paq.id} value={paq.id}>
                    💝 {paq.nombre} - ${paq.precio}
                  </option>
                ))}
          </select>

          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/50">▾</span>
        </div>
      </div>

      {/* Información del producto seleccionado */}
      {productoActual && (
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {tipoSeleccion === 'individual' ? '🍓' : '💝'} {productoActual.nombre}
              </p>
              {productoActual.descripcion && (
                <p className="text-sm text-white/65 mt-1 leading-relaxed">{productoActual.descripcion}</p>
              )}
            </div>

            <div className="text-right shrink-0">
              <p className="text-xs text-white/50">Base</p>
              <p className="text-lg font-black text-white">${(productoActual.precio ?? 0).toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/70">
              ✨ Incluye <b className="text-white/90">{toppingsIncluidos}</b> topping{toppingsIncluidos === 1 ? '' : 's'}
            </span>

            {toppingsExtras > 0 && (
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E85D75]/25 bg-[#E85D75]/10 px-3 py-1 text-xs text-[#ffd0d9]">
                +${toppingsExtras * TOPPING_EXTRA_PRECIO} por {toppingsExtras} extra{toppingsExtras === 1 ? '' : 's'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Cantidad */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-white/80 mb-2">Cantidad</label>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCantidad((c) => Math.max(1, c - 1))}
            className="w-11 h-11 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 text-white font-black transition"
          >
            −
          </button>

          <input
            type="number"
            value={cantidad}
            onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
            min={1}
            className="w-24 px-4 py-3 rounded-2xl border border-white/10 bg-black/35 text-white text-center font-semibold focus:outline-none focus:ring-2 focus:ring-[#E85D75]/60"
          />

          <button
            type="button"
            onClick={() => setCantidad((c) => c + 1)}
            className="w-11 h-11 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 text-white font-black transition"
          >
            +
          </button>

          {/* Mini hint */}
          <span className="text-xs text-white/45">
            Total: <b className="text-white/80">${totalLinea.toFixed(2)}</b>
          </span>
        </div>
      </div>

      {/* Toppings */}
      {productoActual && (
        <div className="mb-6">
          <div className="flex items-center justify-between gap-3 mb-3">
            <label className="block text-sm font-semibold text-white/80">
              Toppings <span className="text-white/40">({toppingsSeleccionados.length})</span>
            </label>

            <span className="text-xs text-white/45">
              Extra: <b className="text-white/80">${TOPPING_EXTRA_PRECIO}</b> c/u
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {toppingsDisponibles.map((topping) => {
              const isSelected = toppingsSeleccionados.includes(topping.id);
              const index = toppingsSeleccionados.indexOf(topping.id);
              const isIncluido = isSelected && index < toppingsIncluidos;

              return (
                <button
                  key={topping.id}
                  type="button"
                  onClick={() => toggleTopping(topping.id)}
                  className={`p-3 rounded-2xl border transition-all text-left ${
                    isSelected
                      ? isIncluido
                        ? 'border-emerald-300/40 bg-emerald-400/10'
                        : 'border-[#E85D75]/45 bg-[#E85D75]/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/8'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="text-2xl">{topping.emoji ?? '✨'}</div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white/85 truncate">{topping.nombre}</div>
                      {isSelected && (
                        <div className="text-[11px] mt-0.5">
                          {isIncluido ? (
                            <span className="text-emerald-200">✓ Incluido</span>
                          ) : (
                            <span className="text-[#ffd0d9]">+${TOPPING_EXTRA_PRECIO}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {toppingsDisponibles.length === 0 && (
            <p className="text-sm text-white/55 text-center py-4">No hay toppings disponibles</p>
          )}
        </div>
      )}

      {/* Botón agregar */}
      <button
        type="button"
        onClick={handleAgregar}
        disabled={!productoSeleccionado}
        className="w-full px-6 py-3 rounded-2xl font-bold transition-all border border-white/10
                   bg-gradient-to-r from-[#E85D75] to-[#c0304a] text-white
                   hover:shadow-[0_20px_80px_rgba(232,93,117,0.18)] active:scale-[0.99]
                   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ➕ Agregar al pedido
      </button>
    </div>
  );
}