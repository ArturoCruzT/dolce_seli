'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import type { ProductoDb as Producto, Topping } from '@/types';

// ❌ OJO: aquí NO necesitas convertirCarritoAPedidoItems.
// Ese util es para convertir el carrito al guardar un pedido, no para el card.
// import { convertirCarritoAPedidoItems } from '@/app/utils/carrito.utils';

interface ProductCardProps {
  producto: Producto; // Usa el tipo real que tengas en tu proyecto (Producto/ProductoDb/ProductoIndividual|Paquete)
  toppings: Topping[];
  // Opcional: si quieres que el card “agregue al carrito”, pasa un callback
  onAddToCart?: (payload: {
    productoId: string;
    nombre: string;
    precioUnitario: number;
    cantidad: number;
    toppingsSeleccionados: Topping[];
  }) => void;
}

export default function ProductCard({ producto, toppings, onAddToCart }: ProductCardProps) {
  const [selectedToppingIds, setSelectedToppingIds] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const toppingsIncluidos = producto.toppings_incluidos ?? 1;

  const toggleTopping = (toppingId: string) => {
    setSelectedToppingIds((prev) =>
      prev.includes(toppingId) ? prev.filter((id) => id !== toppingId) : [...prev, toppingId]
    );
  };

  // ✅ Convertimos IDs → objetos Topping (esto evita el choque de tipos después)
  const selectedToppings = useMemo(() => {
    const set = new Set(selectedToppingIds);
    return toppings.filter((t) => set.has(t.id));
  }, [selectedToppingIds, toppings]);

  const calcularPrecioTotal = () => {
    const precioBase = producto.precio ?? 0;
    const extras = Math.max(0, selectedToppings.length - toppingsIncluidos) * 5;
    return precioBase + extras;
  };

  const handleAddToCart = () => {
    if (!onAddToCart) return;

    onAddToCart({
      productoId: producto.id,
      nombre: producto.nombre,
      precioUnitario: calcularPrecioTotal(), // si quieres unitario SIN extras, usa producto.precio
      cantidad: 1,
      toppingsSeleccionados: selectedToppings,
    });
  };

  const isPaquete = producto.tipo === 'paquete';

  return (
    <div className="bg-white rounded-[20px] shadow-[0_8px_25px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-300 hover:shadow-[0_12px_35px_rgba(231,93,117,0.15)] hover:-translate-y-1">
      {/* Imagen del producto */}
      <div className="relative h-56 bg-gradient-to-br from-pink-50 to-cream-50 overflow-hidden">
        {(producto as any).imagen ? (
          <Image
            src={(producto as any).imagen as string}
            alt={producto.nombre}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-6xl">{producto.emoji ?? '🍓'}</span>
          </div>
        )}

        {/* Badge de categoría */}
        {isPaquete && (
          <div className="absolute top-4 right-4 bg-pink-deep text-white px-3 py-1 rounded-full text-xs font-medium">
            Paquete
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-6">
        {/* Nombre y precio */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-gray-800 flex-1">{producto.nombre}</h3>
          <span className="text-2xl font-bold text-pink-deep ml-2">${calcularPrecioTotal()}</span>
        </div>

        {/* Descripción */}
        {producto.descripcion && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{producto.descripcion}</p>
        )}

        {/* Botón de toppings */}
        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          className="w-full bg-gradient-to-r from-pink-seli to-pink-deep text-white py-3 rounded-[16px] font-medium transition-all duration-300 hover:shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <span>✨</span>
          <span>{showDetails ? 'Ocultar Toppings' : 'Personalizar Toppings'}</span>
          <span className="text-xs">({toppingsIncluidos} incluido{toppingsIncluidos === 1 ? '' : 's'})</span>
        </button>

        {/* Panel de toppings */}
        {showDetails && (
          <div className="mt-4 p-4 bg-cream-dolce rounded-[16px] border border-pink-100">
            <p className="text-xs text-gray-600 mb-3 text-center">
              Selecciona tus toppings favoritos
              <br />
              <span className="text-pink-deep font-medium">Topping extra: $5 c/u</span>
            </p>

            <div className="grid grid-cols-2 gap-2">
              {toppings.map((topping) => {
                const selected = selectedToppingIds.includes(topping.id);
                return (
                  <button
                    type="button"
                    key={topping.id}
                    onClick={() => toggleTopping(topping.id)}
                    className={`py-2 px-3 rounded-[12px] text-sm font-medium transition-all duration-200 ${
                      selected
                        ? 'bg-pink-deep text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    {topping.emoji ? `${topping.emoji} ` : ''}
                    {topping.nombre}
                  </button>
                );
              })}
            </div>

            {selectedToppings.length > 0 && (
              <div className="mt-3 pt-3 border-t border-pink-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    Toppings seleccionados: {selectedToppings.length}
                  </span>
                  {selectedToppings.length > toppingsIncluidos && (
                    <span className="text-pink-deep font-medium">
                      +${(selectedToppings.length - toppingsIncluidos) * 5}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Nota */}
        <p className="text-xs text-center text-gray-500 mt-3">
          ✨ Incluye {toppingsIncluidos} topping{toppingsIncluidos === 1 ? '' : 's'} de tu elección
        </p>

        {/* Botón agregar (opcional) */}
        {onAddToCart && (
          <button
            type="button"
            onClick={handleAddToCart}
            className="mt-4 w-full bg-gray-900 text-white py-3 rounded-[16px] font-medium transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
          >
            Agregar al carrito
          </button>
        )}
      </div>
    </div>
  );
}
