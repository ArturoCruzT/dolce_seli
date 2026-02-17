'use client';

import { useState, useEffect } from 'react';
import { Topping, ToppingCreate } from '@/types';
import {
  obtenerToppings,
  crearTopping,
  actualizarTopping,
  eliminarTopping,
  cambiarEstadoTopping,
} from '@/lib/toppings.service';

export default function ToppingsAdmin() {
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTopping, setEditingTopping] = useState<Topping | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<ToppingCreate>({
    nombre: '',
    descripcion: '',
    emoji: '✨',
  });

  useEffect(() => {
    cargarToppings();
  }, []);

  const cargarToppings = async () => {
    setLoading(true);
    const data = await obtenerToppings();
    setToppings(data);
    setLoading(false);
  };

  const handleNuevoTopping = () => {
    setEditingTopping(null);
    setFormData({
      nombre: '',
      descripcion: '',
      emoji: '✨',
    });
    setShowModal(true);
  };

  const handleEditarTopping = (topping: Topping) => {
    setEditingTopping(topping);
    setFormData({
      nombre: topping.nombre,
      descripcion: topping.descripcion || '',
      emoji: topping.emoji || '✨',
    });
    setShowModal(true);
  };

  const handleGuardar = async () => {
    setSaving(true);

    try {
      if (editingTopping) {
        const updated = await actualizarTopping(editingTopping.id, formData);
        if (updated) {
          setToppings(toppings.map(t => t.id === updated.id ? updated : t));
        }
      } else {
        const created = await crearTopping(formData);
        if (created) {
          setToppings([created, ...toppings]);
        }
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error al guardar topping:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleActivo = async (id: string) => {
    const topping = toppings.find(t => t.id === id);
    if (!topping) return;

    const success = await cambiarEstadoTopping(id, !topping.activo);
    if (success) {
      setToppings(toppings.map(t =>
        t.id === id ? { ...t, activo: !t.activo } : t
      ));
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este topping?')) return;

    const success = await eliminarTopping(id);
    if (success) {
      setToppings(toppings.filter(t => t.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">✨</div>
          <p className="text-gray-600">Cargando toppings...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-dolce-lg shadow-dolce p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Toppings</h2>
            <p className="text-sm text-gray-600 mt-1">
              Gestiona los toppings disponibles para personalizar los productos
            </p>
          </div>
          <button
            onClick={handleNuevoTopping}
            className="bg-gradient-to-r from-pink-seli to-pink-deep text-white px-6 py-3 rounded-dolce font-medium hover:shadow-lg transition-all flex items-center gap-2"
          >
            <span>+</span>
            <span>Nuevo Topping</span>
          </button>
        </div>
      </div>

      {/* Grid de toppings */}
      {toppings.length === 0 ? (
        <div className="bg-white rounded-dolce-lg shadow-dolce p-12 text-center">
          <div className="text-6xl mb-4">✨</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No hay toppings todavía</h3>
          <p className="text-gray-600 mb-6">Agrega toppings para que los clientes personalicen sus productos</p>
          <button
            onClick={handleNuevoTopping}
            className="bg-gradient-to-r from-pink-seli to-pink-deep text-white px-6 py-3 rounded-dolce font-medium hover:shadow-lg transition-all inline-flex items-center gap-2"
          >
            <span>+</span>
            <span>Crear Primer Topping</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {toppings.map((topping) => (
              <div 
                key={topping.id} 
                className="bg-white rounded-dolce-lg shadow-dolce p-6 hover:shadow-dolce-hover transition-all"
              >
                <div className="text-center mb-4">
                  <div className="text-5xl mb-3">{topping.emoji}</div>
                  <h3 className="font-bold text-gray-800 text-lg">{topping.nombre}</h3>
                  {topping.descripcion && (
                    <p className="text-sm text-gray-600 mt-1">{topping.descripcion}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => toggleActivo(topping.id)}
                    className={`w-full px-3 py-2 rounded-dolce text-sm font-medium transition-colors ${
                      topping.activo
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {topping.activo ? '✓ Activo' : '✗ Inactivo'}
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditarTopping(topping)}
                      className="flex-1 px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-dolce transition-colors"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(topping.id)}
                      className="px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-dolce transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Nota informativa */}
          <div className="mt-6 bg-pink-50 border border-pink-200 rounded-dolce-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="text-sm font-medium text-gray-800 mb-1">Sobre los toppings</p>
                <p className="text-sm text-gray-600">
                  Los toppings activos estarán disponibles para que los clientes personalicen sus productos. 
                  Cada producto incluye 1 topping gratis, los adicionales tienen un costo de <span className="font-semibold">$5 c/u</span>.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-dolce-lg max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              {editingTopping ? 'Editar Topping' : 'Nuevo Topping'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Topping *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-dolce focus:ring-2 focus:ring-pink-deep focus:border-transparent"
                  placeholder="ej: Nuez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-dolce focus:ring-2 focus:ring-pink-deep focus:border-transparent"
                  placeholder="ej: Nuez picada finamente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emoji Representativo
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={formData.emoji}
                    onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                    className="w-20 px-4 py-2 border border-gray-300 rounded-dolce focus:ring-2 focus:ring-pink-deep focus:border-transparent text-3xl text-center"
                    maxLength={2}
                  />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-2">
                      Selecciona un emoji que represente este topping
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {['🌰', '🥥', '🍫', '🍪', '🍚', '🥨', '🍬', '✨', '🍓', '🍒'].map(e => (
                        <button
                          key={e}
                          onClick={() => setFormData({ ...formData, emoji: e })}
                          type="button"
                          className="text-2xl hover:scale-125 transition-transform"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                type="button"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-dolce text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                type="button"
                disabled={!formData.nombre || saving}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-seli to-pink-deep text-white rounded-dolce hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : (editingTopping ? 'Guardar Cambios' : 'Crear Topping')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}