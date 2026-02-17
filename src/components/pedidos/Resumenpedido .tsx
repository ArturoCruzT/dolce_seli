'use client';

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
  const getToppingsIncluidos = (item: ItemPedido): number => {
    if (item.tipo === 'individual') {
      const producto = productosIndividuales.find(p => p.id === item.productoId);
      return producto?.toppingsIncluidos || 0;
    } else if (item.tipo === 'paquete') {
      const paquete = paquetes.find(p => p.id === item.productoId);
      return paquete?.toppingsIncluidos || 0;
    }
    return 0;
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
    <div className="bg-white rounded-dolce-lg shadow-dolce p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        🛒 Resumen del Pedido
      </h3>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🛍️</div>
          <p className="text-gray-500">No hay productos en el pedido</p>
        </div>
      ) : (
        <>
          {/* Lista de items */}
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {items.map((item, index) => {
              const toppingsExtras = calcularToppingsExtras(item);
              const costoToppingsExtras = calcularCostoToppingsExtras(item);
              const subtotalItem = (item.precioUnitario * item.cantidad) + costoToppingsExtras;

              return (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-dolce border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">
                        {item.tipo === 'paquete' && '💝 '}
                        {item.productoNombre}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Cantidad: {item.cantidad} × ${item.precioUnitario}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onEliminarItem(index)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Toppings */}
                  {item.toppingsSeleccionados.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        Toppings:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {item.toppingsSeleccionados.map((topping, tIndex) => {
                          const isIncluido = tIndex < getToppingsIncluidos(item);
                          return (
                            <span
                              key={tIndex}
                              className={`text-xs px-2 py-1 rounded-full ${
                                isIncluido
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-pink-100 text-pink-700'
                              }`}
                            >
                              {topping.toppingNombre}
                              {!isIncluido && ' +$5'}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Costo toppings extras */}
                  {toppingsExtras > 0 && (
                    <div className="mt-2 text-xs text-pink-deep">
                      + ${costoToppingsExtras} por {toppingsExtras} topping{toppingsExtras !== 1 ? 's' : ''} extra{toppingsExtras !== 1 ? 's' : ''}
                    </div>
                  )}

                  {/* Subtotal del item */}
                  <div className="mt-2 pt-2 border-t border-gray-200 text-right">
                    <span className="font-bold text-gray-800">
                      Subtotal: ${subtotalItem.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totales */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-700">
              <span>Envío:</span>
              <span className="font-medium">
                {costoEnvio === 0 ? 'Gratis' : `$${costoEnvio.toFixed(2)}`}
              </span>
            </div>

            <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-gray-300">
              <span>Total:</span>
              <span className="text-pink-deep">${total.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}