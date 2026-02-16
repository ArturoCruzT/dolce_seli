'use client';

import { useState, useEffect } from 'react';
import { Producto, Topping, ItemCarrito, ToppingSeleccionado, ItemPaqueteCarrito } from '@/lib/types';

interface ModalPersonalizarProps {
  producto: Producto;
  toppings: Topping[];
  onClose: () => void;
  onAgregar: (item: ItemCarrito) => void;
}

export default function ModalPersonalizar({
  producto,
  toppings,
  onClose,
  onAgregar,
}: ModalPersonalizarProps) {
  const [cantidad, setCantidad] = useState(1);
  const [toppingsSeleccionados, setToppingsSeleccionados] = useState<ToppingSeleccionado[]>([]);
  
  // Para paquetes: toppings de cada item
  const [toppingsPorItem, setToppingsPorItem] = useState<{ [key: string]: ToppingSeleccionado[] }>({});

  const esPaquete = producto.categoria === 'paquete';

  // Calcular subtotal
  const subtotal = producto.precio * cantidad;

  const handleToggleTopping = (topping: Topping) => {
    setToppingsSeleccionados((prev) => {
      const existe = prev.find((t) => t.topping_id === topping.id);
      
      if (existe) {
        // Si ya existe, quitarlo
        return prev.filter((t) => t.topping_id !== topping.id);
      } else {
        // Si no existe, agregarlo
        // El primero es incluido, los demás son extras
        const esIncluido = prev.length === 0;
        return [
          ...prev,
          {
            topping_id: topping.id,
            nombre: topping.nombre,
            incluido: esIncluido,
          },
        ];
      }
    });
  };

  const handleToggleToppingPaquete = (itemProductoId: string, topping: Topping) => {
    setToppingsPorItem((prev) => {
      const toppingsActuales = prev[itemProductoId] || [];
      const existe = toppingsActuales.find((t) => t.topping_id === topping.id);

      if (existe) {
        // Quitar topping
        return {
          ...prev,
          [itemProductoId]: toppingsActuales.filter((t) => t.topping_id !== topping.id),
        };
      } else {
        // Agregar topping
        const esIncluido = toppingsActuales.length === 0;
        return {
          ...prev,
          [itemProductoId]: [
            ...toppingsActuales,
            {
              topping_id: topping.id,
              nombre: topping.nombre,
              incluido: esIncluido,
            },
          ],
        };
      }
    });
  };

  const handleAgregar = () => {
    let itemCarrito: ItemCarrito;

    if (esPaquete && producto.items) {
      // Crear items del paquete con toppings
      const itemsPaquete: ItemPaqueteCarrito[] = producto.items.map((item) => ({
        producto_id: item.producto_id,
        producto_nombre: item.nombre || 'Producto',
        producto_icono: item.icono || null,
        cantidad: item.cantidad,
        toppings: toppingsPorItem[item.producto_id] || [],
      }));

      itemCarrito = {
        id: crypto.randomUUID(),
        producto_id: producto.id,
        producto_nombre: producto.nombre,
        producto_precio: producto.precio,
        producto_icono: producto.icono,
        categoria: 'paquete',
        cantidad,
        items_paquete: itemsPaquete,
        subtotal,
      };
    } else {
      // Producto individual
      itemCarrito = {
        id: crypto.randomUUID(),
        producto_id: producto.id,
        producto_nombre: producto.nombre,
        producto_precio: producto.precio,
        producto_icono: producto.icono,
        categoria: 'individual',
        cantidad,
        toppings: toppingsSeleccionados,
        subtotal,
      };
    }

    onAgregar(itemCarrito);
  };

  const toppingEstaSeleccionado = (toppingId: string, itemProductoId?: string) => {
    if (itemProductoId) {
      // Para paquetes
      const toppingsItem = toppingsPorItem[itemProductoId] || [];
      return toppingsItem.some((t) => t.topping_id === toppingId);
    } else {
      // Para individuales
      return toppingsSeleccionados.some((t) => t.topping_id === toppingId);
    }
  };

  const contarToppingsSeleccionados = (itemProductoId?: string) => {
    if (itemProductoId) {
      return (toppingsPorItem[itemProductoId] || []).length;
    }
    return toppingsSeleccionados.length;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {producto.icono} {producto.nombre}
            </h2>
            <p className="text-sm text-gray-500">{producto.descripcion}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Producto Individual */}
          {!esPaquete && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Selecciona tu topping
              </h3>
              <p className="text-sm text-pink-600 mb-4">
                ✨ Primer topping incluido
              </p>
              <div className="grid grid-cols-2 gap-3">
                {toppings.map((topping) => {
                  const seleccionado = toppingEstaSeleccionado(topping.id);
                  const esIncluido = toppingsSeleccionados.find(
                    (t) => t.topping_id === topping.id
                  )?.incluido;

                  return (
                    <button
                      key={topping.id}
                      onClick={() => handleToggleTopping(topping)}
                      className={`p-3 rounded-lg border-2 transition ${
                        seleccionado
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{topping.icono}</span>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-sm">{topping.nombre}</p>
                          {seleccionado && (
                            <p className="text-xs text-pink-600">
                              {esIncluido ? '✨ Incluido' : '+$5'}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Paquete */}
          {esPaquete && producto.items && (
            <div className="mb-6 space-y-6">
              <p className="text-sm text-pink-600">
                ✨ Cada producto del paquete incluye 1 topping
              </p>
              {producto.items.map((item, idx) => (
                <div key={item.producto_id} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    {item.icono} {item.nombre} ({item.cantidad}x)
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    {contarToppingsSeleccionados(item.producto_id)} topping
                    {contarToppingsSeleccionados(item.producto_id) !== 1 ? 's' : ''}{' '}
                    seleccionado
                    {contarToppingsSeleccionados(item.producto_id) !== 1 ? 's' : ''}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {toppings.map((topping) => {
                      const seleccionado = toppingEstaSeleccionado(
                        topping.id,
                        item.producto_id
                      );
                      const toppingsItem = toppingsPorItem[item.producto_id] || [];
                      const esIncluido = toppingsItem.find(
                        (t) => t.topping_id === topping.id
                      )?.incluido;

                      return (
                        <button
                          key={topping.id}
                          onClick={() =>
                            handleToggleToppingPaquete(item.producto_id, topping)
                          }
                          className={`p-2 rounded-lg border-2 transition text-sm ${
                            seleccionado
                              ? 'border-pink-500 bg-pink-50'
                              : 'border-gray-200 hover:border-pink-300'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <span>{topping.icono}</span>
                            <span className="text-xs">{topping.nombre}</span>
                            {seleccionado && (
                              <span className="text-xs text-pink-600 ml-auto">
                                {esIncluido ? '✨' : '+$5'}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cantidad */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Cantidad</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition"
              >
                -
              </button>
              <span className="text-2xl font-bold">{cantidad}</span>
              <button
                onClick={() => setCantidad(cantidad + 1)}
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-3xl font-bold text-pink-600">${subtotal}</p>
          </div>
          <button
            onClick={handleAgregar}
            className="bg-pink-500 text-white px-8 py-3 rounded-lg hover:bg-pink-600 transition font-semibold"
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
