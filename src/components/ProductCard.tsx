'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import type { ProductoDb as Producto, Topping } from '@/types';

interface ProductCardProps {
  producto: Producto;
  toppings: Topping[];
  onAddToCart?: (payload: {
    productoId: string;
    nombre: string;
    precioUnitario: number;
    cantidad: number;
    toppingsSeleccionados: Topping[];
  }) => void;

  // ✅ Modo admin: oculta personalización / carrito y muestra acciones
  adminMode?: boolean;
  onEditar?: (productoId: string) => void;
  onEliminar?: (productoId: string) => void;
}

export default function ProductCard({
  producto,
  toppings,
  onAddToCart,
  adminMode = false,
  onEditar,
  onEliminar,
}: ProductCardProps) {
  const [selectedToppingIds, setSelectedToppingIds] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const toppingsIncluidos = producto.toppings_incluidos ?? 1;

  const toggleTopping = (toppingId: string) => {
    setSelectedToppingIds((prev) =>
      prev.includes(toppingId) ? prev.filter((id) => id !== toppingId) : [...prev, toppingId]
    );
  };

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
      precioUnitario: calcularPrecioTotal(),
      cantidad: 1,
      toppingsSeleccionados: selectedToppings,
    });
  };

  const isPaquete = producto.tipo === 'paquete';

  // ✅ Imagen: soporta string (URL) o null sin romper build
  const img = (producto as any).imagen as string | undefined;

  return (
    <div className="bg-white rounded-[20px] shadow-[0_8px_25px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-300 hover:shadow-[0_12px_35px_rgba(231,93,117,0.15)] hover:-translate-y-1">
      {/* Imagen */}
      <div className="relative h-56 bg-gradient-to-br from-pink-50 to-cream-50 overflow-hidden">
        {img ? (
          <Image src={img} alt={producto.nombre} fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-6xl">{producto.emoji ?? '🍓'}</span>
          </div>
        )}

        {/* Badge */}
        <div className="absolute top-4 left-4 flex gap-2">
          {isPaquete && (
            <span className="bg-pink-deep text-white px-3 py-1 rounded-full text-xs font-medium">
              Paquete
            </span>
          )}
          {producto.activo === false && (
            <span className="bg-gray-900/80 text-white px-3 py-1 rounded-full text-xs font-medium">
              Inactivo
            </span>
          )}
        </div>

        {/* Acciones admin sobre la imagen */}
        {adminMode && (
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              type="button"
              onClick={() => onEditar?.(producto.id)}
              className="bg-white/90 hover:bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-semibold shadow"
            >
              ✏️ Editar
            </button>
            <button
              type="button"
              onClick={() => {
                const ok = confirm(`¿Eliminar "${producto.nombre}"?`);
                if (ok) onEliminar?.(producto.id);
              }}
              className="bg-red-600/95 hover:bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-6">
        {/* Nombre / precio */}
        <div className="flex justify-between items-start mb-3 gap-3">
          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-gray-800 truncate">{producto.nombre}</h3>
            {producto.descripcion && (
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">{producto.descripcion}</p>
            )}
          </div>

          <span className="text-2xl font-bold text-pink-deep whitespace-nowrap">
            ${adminMode ? (producto.precio ?? 0) : calcularPrecioTotal()}
          </span>
        </div>

        {/* Meta admin */}
        {adminMode && (
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              ID: {producto.id.slice(0, 8)}…
            </span>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              Tipo: {producto.tipo}
            </span>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              Toppings incluidos: {toppingsIncluidos}
            </span>
          </div>
        )}

        {/* ✅ Modo cliente: personalización toppings */}
        {!adminMode && (
          <>
            <button
              type="button"
              onClick={() => setShowDetails((v) => !v)}
              className="w-full bg-gradient-to-r from-pink-seli to-pink-deep text-white py-3 rounded-[16px] font-medium transition-all duration-300 hover:shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>✨</span>
              <span>{showDetails ? 'Ocultar Toppings' : 'Personalizar Toppings'}</span>
              <span className="text-xs">
                ({toppingsIncluidos} incluido{toppingsIncluidos === 1 ? '' : 's'})
              </span>
            </button>

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
                      <span className="text-gray-600">Toppings seleccionados: {selectedToppings.length}</span>
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

            <p className="text-xs text-center text-gray-500 mt-3">
              ✨ Incluye {toppingsIncluidos} topping{toppingsIncluidos === 1 ? '' : 's'} de tu elección
            </p>

            {onAddToCart && (
              <button
                type="button"
                onClick={handleAddToCart}
                className="mt-4 w-full bg-gray-900 text-white py-3 rounded-[16px] font-medium transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              >
                Agregar al carrito
              </button>
            )}
          </>
        )}

        {/* ✅ Modo admin: acciones abajo (rápidas) */}
        {adminMode && (
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => onEditar?.(producto.id)}
              className="flex-1 py-3 rounded-[16px] font-semibold bg-gray-900 text-white hover:opacity-95 active:scale-[0.99] transition"
            >
              ✏️ Editar
            </button>
            <button
              type="button"
              onClick={() => {
                const ok = confirm(`¿Eliminar "${producto.nombre}"?`);
                if (ok) onEliminar?.(producto.id);
              }}
              className="px-4 py-3 rounded-[16px] font-semibold bg-red-600 text-white hover:bg-red-600/95 active:scale-[0.99] transition"
              title="Eliminar"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}