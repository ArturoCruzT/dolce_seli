'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Producto, Topping } from '@/types';

interface ProductCardProps {
  producto: Producto;
  toppings: Topping[];
}

export default function ProductCard({ producto, toppings }: ProductCardProps) {
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const toggleTopping = (toppingId: string) => {
    setSelectedToppings((prev) =>
      prev.includes(toppingId)
        ? prev.filter((id) => id !== toppingId)
        : [...prev, toppingId]
    );
  };

  const calcularPrecioTotal = () => {
    const precioBase = producto.precio;
    const precioToppingsExtra = selectedToppings.length > 1 
      ? (selectedToppings.length - 1) * 5 
      : 0;
    return precioBase + precioToppingsExtra;
  };

  return (
    <div className="bg-white rounded-[20px] shadow-[0_8px_25px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-300 hover:shadow-[0_12px_35px_rgba(231,93,117,0.15)] hover:-translate-y-1">
      {/* Imagen del producto */}
      <div className="relative h-56 bg-gradient-to-br from-pink-50 to-cream-50 overflow-hidden">
        {producto.imagen ? (
          <Image
            src={producto.imagen}
            alt={producto.nombre}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-6xl">🍓</span>
          </div>
        )}
        
        {/* Badge de categoría */}
        {producto.categoria === 'paquete' && (
          <div className="absolute top-4 right-4 bg-pink-deep text-white px-3 py-1 rounded-full text-xs font-medium">
            Paquete
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-6">
        {/* Nombre y precio */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-gray-800 flex-1">
            {producto.nombre}
          </h3>
          <span className="text-2xl font-bold text-pink-deep ml-2">
            ${calcularPrecioTotal()}
          </span>
        </div>

        {/* Descripción */}
        {producto.descripcion && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {producto.descripcion}
          </p>
        )}

        {/* Contenido del producto */}
        {producto.contenido && producto.contenido.length > 0 && (
          <div className="mb-4 space-y-1">
            {producto.contenido.map((item, index) => (
              <div key={index} className="flex items-center text-sm text-gray-700">
                <span className="text-pink-500 mr-2">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* Botón de toppings */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full bg-gradient-to-r from-pink-seli to-pink-deep text-white py-3 rounded-[16px] font-medium transition-all duration-300 hover:shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <span>✨</span>
          <span>{showDetails ? 'Ocultar Toppings' : 'Personalizar Toppings'}</span>
          <span className="text-xs">(1 incluido)</span>
        </button>

        {/* Panel de toppings */}
        {showDetails && (
          <div className="mt-4 p-4 bg-cream-dolce rounded-[16px] border border-pink-100">
            <p className="text-xs text-gray-600 mb-3 text-center">
              Selecciona tus toppings favoritos
              <br />
              <span className="text-pink-deep font-medium">
                Topping extra: $5 c/u
              </span>
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              {toppings.map((topping) => (
                <button
                  key={topping.id}
                  onClick={() => toggleTopping(topping.id)}
                  className={`py-2 px-3 rounded-[12px] text-sm font-medium transition-all duration-200 ${
                    selectedToppings.includes(topping.id)
                      ? 'bg-pink-deep text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-pink-300'
                  }`}
                >
                  {topping.nombre}
                </button>
              ))}
            </div>

            {selectedToppings.length > 0 && (
              <div className="mt-3 pt-3 border-t border-pink-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    Toppings seleccionados: {selectedToppings.length}
                  </span>
                  {selectedToppings.length > 1 && (
                    <span className="text-pink-deep font-medium">
                      +${(selectedToppings.length - 1) * 5}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Nota de topping incluido */}
        <p className="text-xs text-center text-gray-500 mt-3">
          ✨ Incluye 1 topping de tu elección
        </p>
      </div>
    </div>
  );
}