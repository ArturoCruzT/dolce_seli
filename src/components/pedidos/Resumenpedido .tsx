'use client';

import { useMemo } from 'react';
import { ProductoIndividual, Paquete, ItemPedido } from '@/types';

interface ResumenPedidoProps {
  items: ItemPedido[];
  productosIndividuales: ProductoIndividual[];
  paquetes: Paquete[];
  onEliminarItem: (index: number) => void;
  subtotal: number;
  costoEnvio: number;
  total: number;
  precioToppingExtra: number;
}

export default function ResumenPedido({
  items,
  productosIndividuales,
  paquetes,
  onEliminarItem,
  subtotal,
  costoEnvio,
  total,
  precioToppingExtra,
}: ResumenPedidoProps) {
  const mapIncluidos = useMemo(() => {
    const m = new Map<string, number>();

    productosIndividuales.forEach((p) => m.set(`individual:${p.id}`, p.toppingsIncluidos ?? 0));
    paquetes.forEach((p) => m.set(`paquete:${p.id}`, p.toppingsIncluidos ?? 0));

    return m;
  }, [productosIndividuales, paquetes]);

  const getToppingsIncluidos = (item: ItemPedido): number => {
    return mapIncluidos.get(`${item.tipo}:${item.productoId}`) ?? 0;
  };

  const calcularToppingsExtras = (item: ItemPedido): number => {
    const incluidos = getToppingsIncluidos(item);
    return Math.max(0, item.toppingsSeleccionados.length - incluidos);
  };

  const calcularCostoToppingsExtras = (item: ItemPedido): number => {
    const extras = calcularToppingsExtras(item);
    return extras * precioToppingExtra * item.cantidad;
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_55px_rgba(0,0,0,0.45)] p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-xl font-black text-white">🛒 Resumen del pedido</h3>
          <p className="text-sm text-white/60">
            {items.length === 0 ? 'Agrega productos para ver el total.' : `${items.length} item${items.length !== 1 ? 's' : ''} en el pedido`}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-white/50">Total</p>
          <p className="text-2xl font-black text-[#E85D75]">${total.toFixed(2)}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-10 rounded-2xl border border-white/10 bg-black/30">
          <div className="text-5xl mb-2">🛍️</div>
          <p className="text-white/60">No hay productos en el pedido</p>
        </div>
      ) : (
        <>
          {/* Lista de items */}
          <div className="space-y-3 mb-6 max-h-96 overflow-y-auto pr-1">
            {items.map((item, index) => {
              const incluidos = getToppingsIncluidos(item);
              const toppingsExtras = calcularToppingsExtras(item);
              const costoToppingsExtras = calcularCostoToppingsExtras(item);

              // Nota:
              // - Si en tu flujo item.precioUnitario YA incluye extras, entonces NO sumes costoToppingsExtras aquí.
              // - Si item.precioUnitario es el precio base, entonces sí lo sumas.
              const subtotalItem = item.precioUnitario * item.cantidad + costoToppingsExtras;

              return (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <h4 className="font-black text-white/90">
                        {item.tipo === 'paquete' ? '💝 ' : '🍓 '}
                        {item.productoNombre}
                      </h4>
                      <p className="text-sm text-white/60">
                        Cantidad: <b className="text-white/80">{item.cantidad}</b> · Unit: <b className="text-white/80">${item.precioUnitario.toFixed(2)}</b>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onEliminarItem(index)}
                      className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/10 active:scale-[0.99] transition"
                      title="Eliminar item"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Toppings */}
                  {item.toppingsSeleccionados.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-xs font-semibold text-white/60 mb-2">
                        Toppings <span className="text-white/35">({item.toppingsSeleccionados.length})</span>
                        <span className="ml-2 text-white/35">· Incluidos: {incluidos}</span>
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {item.toppingsSeleccionados.map((topping, tIndex) => {
                          const isIncluido = tIndex < incluidos;
                          return (
                            <span
                              key={tIndex}
                              className={`text-xs px-2.5 py-1 rounded-full border ${
                                isIncluido
                                  ? 'bg-emerald-400/10 text-emerald-200 border-emerald-300/20'
                                  : 'bg-[#E85D75]/10 text-[#ffd0d9] border-[#E85D75]/25'
                              }`}
                              title={isIncluido ? 'Incluido' : 'Extra'}
                            >
                              {topping.toppingNombre}
                              {!isIncluido && (
                                <span className="ml-1 text-[11px] opacity-90">
                                  +${precioToppingExtra}
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>

                      {toppingsExtras > 0 && (
                        <div className="mt-2 text-xs text-[#ffd0d9]">
                          +${costoToppingsExtras.toFixed(2)} por {toppingsExtras} topping{toppingsExtras !== 1 ? 's' : ''} extra{toppingsExtras !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Subtotal item */}
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-white/45">Subtotal item</span>
                    <span className="font-black text-white/90">${subtotalItem.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totales */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-2">
            <div className="flex justify-between text-white/70">
              <span>Subtotal</span>
              <span className="font-semibold text-white/85">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-white/70">
              <span>Envío</span>
              <span className="font-semibold text-white/85">
                {costoEnvio === 0 ? 'Gratis' : `$${costoEnvio.toFixed(2)}`}
              </span>
            </div>

            <div className="pt-3 mt-3 border-t border-white/10 flex justify-between text-lg font-black text-white">
              <span>Total</span>
              <span className="text-[#E85D75]">${total.toFixed(2)}</span>
            </div>

            <p className="text-[11px] text-white/35 mt-1">
              Extra topping: ${precioToppingExtra} · Los extras se calculan por cantidad.
            </p>
          </div>
        </>
      )}
    </div>
  );
}