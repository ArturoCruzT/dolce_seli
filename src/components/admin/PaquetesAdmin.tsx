'use client';

import { useState, useEffect } from 'react';
import { Paquete, ProductoIndividual } from '@/types';
import { StorageService } from '@/lib/storage.service';

export default function PaquetesAdmin() {
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [productosDisponibles, setProductosDisponibles] = useState<ProductoIndividual[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPaquete, setEditingPaquete] = useState<Paquete | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: 0,
    toppingsIncluidos: 1,
    productos: [] as { productoId: string; cantidad: number }[],
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    const prods = StorageService.getProductosIndividuales();
    const paqs = StorageService.getPaquetes();
    setProductosDisponibles(prods.filter(p => p.activo));
    setPaquetes(paqs);
  };

  const handleNuevoPaquete = () => {
    setEditingPaquete(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: 0,
      toppingsIncluidos: 1,
      productos: [],
    });
    setShowModal(true);
  };

  const handleEditarPaquete = (paquete: Paquete) => {
    setEditingPaquete(paquete);
    setFormData({
      nombre: paquete.nombre,
      descripcion: paquete.descripcion,
      precio: paquete.precio,
      toppingsIncluidos: paquete.toppingsIncluidos,
      productos: paquete.productosIncluidos,
    });
    setShowModal(true);
  };

  const agregarProductoAPaquete = () => {
    setFormData({
      ...formData,
      productos: [...formData.productos, { productoId: '', cantidad: 1 }],
    });
  };

  const actualizarProductoPaquete = (index: number, field: 'productoId' | 'cantidad', value: string | number) => {
    const nuevosProductos = [...formData.productos];
    if (field === 'productoId') {
      nuevosProductos[index].productoId = value as string;
    } else {
      nuevosProductos[index].cantidad = value as number;
    }
    setFormData({ ...formData, productos: nuevosProductos });
  };

  const eliminarProductoPaquete = (index: number) => {
    setFormData({
      ...formData,
      productos: formData.productos.filter((_, i) => i !== index),
    });
  };

  const handleGuardar = () => {
    let nuevosPaquetes: Paquete[];

    if (editingPaquete) {
      nuevosPaquetes = paquetes.map(p =>
        p.id === editingPaquete.id
          ? {
              ...p,
              nombre: formData.nombre,
              descripcion: formData.descripcion,
              precio: formData.precio,
              toppingsIncluidos: formData.toppingsIncluidos,
              productosIncluidos: formData.productos,
              updatedAt: new Date(),
            }
          : p
      );
    } else {
      const nuevoPaquete: Paquete = {
        id: Date.now().toString(),
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: formData.precio,
        tipo: 'paquete',
        productosIncluidos: formData.productos,
        toppingsIncluidos: formData.toppingsIncluidos,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      nuevosPaquetes = [...paquetes, nuevoPaquete];
    }

    StorageService.savePaquetes(nuevosPaquetes);
    setPaquetes(nuevosPaquetes);
    setShowModal(false);
  };

  const toggleActivo = (id: string) => {
    const nuevosPaquetes = paquetes.map(p =>
      p.id === id ? { ...p, activo: !p.activo } : p
    );
    StorageService.savePaquetes(nuevosPaquetes);
    setPaquetes(nuevosPaquetes);
  };

  const handleEliminar = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este paquete?')) {
      const nuevosPaquetes = paquetes.filter(p => p.id !== id);
      StorageService.savePaquetes(nuevosPaquetes);
      setPaquetes(nuevosPaquetes);
    }
  };

  const getNombreProducto = (id: string) => {
    return productosDisponibles.find(p => p.id === id)?.nombre || 'Producto no encontrado';
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-dolce-lg shadow-dolce p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Paquetes</h2>
            <p className="text-sm text-gray-600 mt-1">
              Crea combinaciones de productos con precios especiales
            </p>
          </div>
          <button
            onClick={handleNuevoPaquete}
            className="bg-gradient-to-r from-pink-seli to-pink-deep text-white px-6 py-3 rounded-dolce font-medium hover:shadow-lg transition-all flex items-center gap-2"
          >
            <span>+</span>
            <span>Nuevo Paquete</span>
          </button>
        </div>
      </div>

      {/* Grid de paquetes */}
      {paquetes.length === 0 ? (
        <div className="bg-white rounded-dolce-lg shadow-dolce p-12 text-center">
          <div className="text-6xl mb-4">💝</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No hay paquetes todavía</h3>
          <p className="text-gray-600 mb-6">Crea combinaciones especiales de productos con precios promocionales</p>
          <button
            onClick={handleNuevoPaquete}
            className="bg-gradient-to-r from-pink-seli to-pink-deep text-white px-6 py-3 rounded-dolce font-medium hover:shadow-lg transition-all inline-flex items-center gap-2"
          >
            <span>+</span>
            <span>Crear Primer Paquete</span>
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
        {paquetes.map((paquete) => (
          <div key={paquete.id} className="bg-white rounded-dolce-lg shadow-dolce p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-1">{paquete.nombre}</h3>
                <p className="text-sm text-gray-600">{paquete.descripcion}</p>
              </div>
              <button
                onClick={() => toggleActivo(paquete.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  paquete.activo
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {paquete.activo ? 'Activo' : 'Inactivo'}
              </button>
            </div>

            <div className="border-t border-gray-100 pt-4 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Incluye:</p>
              <div className="space-y-1">
                {paquete.productosIncluidos.map((item, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <span className="text-pink-500 mr-2">•</span>
                    <span>{item.cantidad}x {getNombreProducto(item.productoId)}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ✨ {paquete.toppingsIncluidos} topping{paquete.toppingsIncluidos > 1 ? 's' : ''} incluido{paquete.toppingsIncluidos > 1 ? 's' : ''}
              </p>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-pink-deep">${paquete.precio}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditarPaquete(paquete)}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(paquete.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-dolce-lg max-w-2xl w-full p-6 shadow-2xl my-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              {editingPaquete ? 'Editar Paquete' : 'Nuevo Paquete'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Paquete *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-dolce focus:ring-2 focus:ring-pink-deep focus:border-transparent"
                  placeholder="ej: Esencia Seli"
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
                  rows={2}
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
                  />
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
                    <option value={0}>Sin toppings</option>
                    <option value={1}>1 topping</option>
                    <option value={2}>2 toppings</option>
                    <option value={3}>3 toppings</option>
                  </select>
                </div>
              </div>

              {/* Productos del paquete */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Productos Incluidos *
                  </label>
                  <button
                    onClick={agregarProductoAPaquete}
                    type="button"
                    className="text-sm text-pink-deep hover:text-pink-600 font-medium"
                  >
                    + Agregar Producto
                  </button>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {formData.productos.map((item, index) => (
                    <div key={index} className="flex gap-3 items-start bg-gray-50 p-3 rounded-dolce">
                      <select
                        value={item.productoId}
                        onChange={(e) => actualizarProductoPaquete(index, 'productoId', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-deep"
                      >
                        <option value="">Seleccionar producto...</option>
                        {productosDisponibles.map((prod) => (
                          <option key={prod.id} value={prod.id}>
                            {prod.nombre} - ${prod.precio}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        value={item.cantidad}
                        onChange={(e) => actualizarProductoPaquete(index, 'cantidad', parseInt(e.target.value) || 1)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-pink-deep"
                        min="1"
                      />

                      <button
                        onClick={() => eliminarProductoPaquete(index)}
                        type="button"
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}

                  {formData.productos.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No hay productos agregados. Haz clic en "Agregar Producto"
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                type="button"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-dolce text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                type="button"
                disabled={!formData.nombre || !formData.descripcion || formData.precio <= 0 || formData.productos.length === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-seli to-pink-deep text-white rounded-dolce hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingPaquete ? 'Guardar Cambios' : 'Crear Paquete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}