'use client';

import { useState, useEffect } from 'react';
import { ProductoIndividual } from '@/types';
import { StorageService } from '@/lib/storage.service';

export default function ProductosIndividualesAdmin() {
  const [productos, setProductos] = useState<ProductoIndividual[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState<ProductoIndividual | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: 0,
    emoji: '🍓',
    toppingsIncluidos: 1,
  });

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = () => {
    const data = StorageService.getProductosIndividuales();
    setProductos(data);
  };

  const handleNuevoProducto = () => {
    setEditingProducto(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: 0,
      emoji: '🍓',
      toppingsIncluidos: 1,
    });
    setShowModal(true);
  };

  const handleEditarProducto = (producto: ProductoIndividual) => {
    setEditingProducto(producto);
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      emoji: producto.emoji || '🍓',
      toppingsIncluidos: producto.toppingsIncluidos,
    });
    setShowModal(true);
  };

  const handleGuardar = () => {
    let nuevosProductos: ProductoIndividual[];

    if (editingProducto) {
      // Editar existente
      nuevosProductos = productos.map(p =>
        p.id === editingProducto.id
          ? { ...p, ...formData, updatedAt: new Date() }
          : p
      );
    } else {
      // Crear nuevo
      const nuevoProducto: ProductoIndividual = {
        id: Date.now().toString(),
        ...formData,
        tipo: 'individual',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      nuevosProductos = [...productos, nuevoProducto];
    }

    StorageService.saveProductosIndividuales(nuevosProductos);
    setProductos(nuevosProductos);
    setShowModal(false);
  };

  const toggleActivo = (id: string) => {
    const nuevosProductos = productos.map(p =>
      p.id === id ? { ...p, activo: !p.activo } : p
    );
    StorageService.saveProductosIndividuales(nuevosProductos);
    setProductos(nuevosProductos);
  };

  const handleEliminar = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      const nuevosProductos = productos.filter(p => p.id !== id);
      StorageService.saveProductosIndividuales(nuevosProductos);
      setProductos(nuevosProductos);
    }
  };

  return (
    <div>
      {/* Header con botón nuevo */}
      <div className="bg-white rounded-dolce-lg shadow-dolce p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Productos Individuales</h2>
            <p className="text-sm text-gray-600 mt-1">
              {productos.filter(p => p.activo).length} activos • {productos.filter(p => !p.activo).length} inactivos
            </p>
          </div>
          <button
            onClick={handleNuevoProducto}
            className="bg-gradient-to-r from-pink-seli to-pink-deep text-white px-6 py-3 rounded-dolce font-medium hover:shadow-lg transition-all flex items-center gap-2"
          >
            <span>+</span>
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="bg-white rounded-dolce-lg shadow-dolce overflow-hidden">
        {productos.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🍓</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No hay productos todavía</h3>
            <p className="text-gray-600 mb-6">Comienza agregando tu primer producto individual</p>
            <button
              onClick={handleNuevoProducto}
              className="bg-gradient-to-r from-pink-seli to-pink-deep text-white px-6 py-3 rounded-dolce font-medium hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              <span>+</span>
              <span>Crear Primer Producto</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Producto</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Precio</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Toppings Incluidos</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {productos.map((producto) => (
                <tr key={producto.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{producto.emoji}</span>
                      <div>
                        <p className="font-medium text-gray-800">{producto.nombre}</p>
                        <p className="text-sm text-gray-600">{producto.descripcion}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-lg font-bold text-pink-deep">${producto.precio}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-pink-100 text-pink-deep px-3 py-1 rounded-full text-sm font-medium">
                      {producto.toppingsIncluidos} topping{producto.toppingsIncluidos > 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActivo(producto.id)}
                      className={`px-4 py-2 rounded-dolce text-sm font-medium transition-colors ${
                        producto.activo
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {producto.activo ? '✓ Activo' : '✗ Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditarProducto(producto)}
                        className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(producto.id)}
                        className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Modal de crear/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-dolce-lg max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-dolce focus:ring-2 focus:ring-pink-deep focus:border-transparent"
                  placeholder="ej: Seli Clásico"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-dolce focus:ring-2 focus:ring-pink-deep focus:border-transparent"
                  rows={3}
                  placeholder="ej: Fresas con crema (6 oz)"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio ($) *
                  </label>
                  <input
                    type="number"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-dolce focus:ring-2 focus:ring-pink-deep focus:border-transparent"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emoji
                  </label>
                  <input
                    type="text"
                    value={formData.emoji}
                    onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-dolce focus:ring-2 focus:ring-pink-deep focus:border-transparent text-2xl text-center"
                    maxLength={2}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Toppings Incluidos *
                </label>
                <select
                  value={formData.toppingsIncluidos}
                  onChange={(e) => setFormData({ ...formData, toppingsIncluidos: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-dolce focus:ring-2 focus:ring-pink-deep focus:border-transparent"
                >
                  <option value={0}>Sin toppings incluidos</option>
                  <option value={1}>1 topping incluido</option>
                  <option value={2}>2 toppings incluidos</option>
                  <option value={3}>3 toppings incluidos</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-dolce text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                disabled={!formData.nombre || !formData.descripcion || formData.precio <= 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-seli to-pink-deep text-white rounded-dolce hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingProducto ? 'Guardar Cambios' : 'Crear Producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}