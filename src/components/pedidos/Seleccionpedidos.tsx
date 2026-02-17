'use client';

import { useState } from 'react';
import { ProductoIndividual, Paquete, Topping, ItemPedido } from '@/types';

interface SeleccionProductoProps {
  productosIndividuales: ProductoIndividual[];
  paquetes: Paquete[];
  toppingsDisponibles: Topping[];
  onAgregarItem: (item: ItemPedido) => void;
}

type TipoSeleccion = 'individual' | 'paquete';

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

  const productoActual = tipoSeleccion === 'individual'
    ? productosIndividuales.find(p => p.id === productoSeleccionado)
    : paquetes.find(p => p.id === productoSeleccionado);

  const toppingsIncluidos = productoActual?.toppingsIncluidos || 0;
  const toppingsExtras = Math.max(0, toppingsSeleccionados.length - toppingsIncluidos);

  const toggleTopping = (toppingId: string) => {
    if (toppingsSeleccionados.includes(toppingId)) {
      setToppingsSeleccionados(toppingsSeleccionados.filter(id => id !== toppingId));
    } else {
      setToppingsSeleccionados([...toppingsSeleccionados, toppingId]);
    }
  };

  const handleAgregar = () => {
    if (!productoSeleccionado || !productoActual) {
      alert('⚠️ Selecciona un producto');
      return;
    }

    const toppingsConNombre = toppingsSeleccionados.map(id => {
      const topping = toppingsDisponibles.find(t => t.id === id);
      return {
        toppingId: id,
        toppingNombre: topping?.nombre || '',
      };
    });

    const item: ItemPedido = {
      tipo: tipoSeleccion,
      productoId: productoSeleccionado,
      productoNombre: productoActual.nombre,
      cantidad,
      precioUnitario: productoActual.precio,
      toppingsSeleccionados: toppingsConNombre,
    };

    onAgregarItem(item);

    // Limpiar selección
    setProductoSeleccionado('');
    setCantidad(1);
    setToppingsSeleccionados([]);
  };

  return (
    <div className="bg-white rounded-dolce-lg shadow-dolce p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        🍓 Agregar Productos
      </h2>

      {/* Selector de tipo */}
      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => {
            setTipoSeleccion('individual');
            setProductoSeleccionado('');
            setToppingsSeleccionados([]);
          }}
          className={`flex-1 px-4 py-3 rounded-dolce font-medium transition-all ${
            tipoSeleccion === 'individual'
              ? 'bg-gradient-to-r from-pink-seli to-pink-deep text-white shadow-dolce'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🍓 Producto Individual
        </button>
        <button
          type="button"
          onClick={() => {
            setTipoSeleccion('paquete');
            setProductoSeleccionado('');
            setToppingsSeleccionados([]);
          }}
          className={`flex-1 px-4 py-3 rounded-dolce font-medium transition-all ${
            tipoSeleccion === 'paquete'
              ? 'bg-gradient-to-r from-pink-seli to-pink-deep text-white shadow-dolce'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          💝 Paquete
        </button>
      </div>

      {/* Selector de producto */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecciona {tipoSeleccion === 'individual' ? 'producto' : 'paquete'}
        </label>
        <select
          value={productoSeleccionado}
          onChange={(e) => {
            setProductoSeleccionado(e.target.value);
            setToppingsSeleccionados([]);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-dolce focus:ring-2 focus:ring-pink-deep focus:border-transparent"
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
      </div>

      {/* Información del producto seleccionado */}
      {productoActual && (
        <div className="mb-4 p-4 bg-pink-50 rounded-dolce border border-pink-200">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Descripción:</strong> {productoActual.descripcion}
          </p>
          <p className="text-sm text-pink-deep font-medium">
            ✨ Incluye {toppingsIncluidos} topping{toppingsIncluidos !== 1 ? 's' : ''} gratis
          </p>
        </div>
      )}

      {/* Selector de cantidad */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cantidad
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCantidad(Math.max(1, cantidad - 1))}
            className="w-10 h-10 bg-gray-200 rounded-dolce-sm hover:bg-gray-300 transition-colors font-bold"
          >
            −
          </button>
          <input
            type="number"
            value={cantidad}
            onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 px-4 py-2 border border-gray-300 rounded-dolce text-center focus:ring-2 focus:ring-pink-deep focus:border-transparent"
            min="1"
          />
          <button
            type="button"
            onClick={() => setCantidad(cantidad + 1)}
            className="w-10 h-10 bg-gray-200 rounded-dolce-sm hover:bg-gray-300 transition-colors font-bold"
          >
            +
          </button>
        </div>
      </div>

      {/* Selector de toppings */}
      {productoActual && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Toppings ({toppingsSeleccionados.length} seleccionados)
            </label>
            {toppingsExtras > 0 && (
              <span className="text-sm text-pink-deep font-medium">
                +${toppingsExtras * 5} por {toppingsExtras} topping{toppingsExtras !== 1 ? 's' : ''} extra{toppingsExtras !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {toppingsDisponibles.map((topping) => {
              const isSelected = toppingsSeleccionados.includes(topping.id);
              const index = toppingsSeleccionados.indexOf(topping.id);
              const isIncluido = index < toppingsIncluidos;

              return (
                <button
                  key={topping.id}
                  type="button"
                  onClick={() => toggleTopping(topping.id)}
                  className={`p-3 rounded-dolce border-2 transition-all ${
                    isSelected
                      ? isIncluido
                        ? 'border-green-500 bg-green-50'
                        : 'border-pink-deep bg-pink-50'
                      : 'border-gray-200 hover:border-pink-seli'
                  }`}
                >
                  <div className="text-2xl mb-1">{topping.emoji}</div>
                  <div className="text-xs font-medium text-gray-700">
                    {topping.nombre}
                  </div>
                  {isSelected && (
                    <div className="text-xs mt-1">
                      {isIncluido ? (
                        <span className="text-green-600">✓ Incluido</span>
                      ) : (
                        <span className="text-pink-deep">+$5</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {toppingsDisponibles.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No hay toppings disponibles
            </p>
          )}
        </div>
      )}

      {/* Botón agregar */}
      <button
        type="button"
        onClick={handleAgregar}
        disabled={!productoSeleccionado}
        className="w-full px-6 py-3 bg-gradient-to-r from-pink-seli to-pink-deep text-white rounded-dolce font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ➕ Agregar al Pedido
      </button>
    </div>
  );
}