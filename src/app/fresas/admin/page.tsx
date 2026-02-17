'use client';

import { useState, useEffect } from 'react';
import ProductosIndividualesAdmin from '@/components/admin/ProductosIndividualesAdmin';
import PaquetesAdmin from '@/components/admin/PaquetesAdmin';
import ToppingsAdmin from '@/components/admin/ToppingsAdmin';
import TestConexion from '@/components/admin/TestConexion';

type TabType = 'individuales' | 'paquetes' | 'toppings';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('individuales');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-pink-deep text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-pink-deep font-playfair flex items-center gap-2">
                🍓 Administración Dolce Seli
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Gestiona productos, paquetes y toppings
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Test de conexión */}
        <TestConexion />

        {/* Tabs Navigation */}
        <div className="bg-white rounded-dolce-lg shadow-dolce overflow-hidden mb-6">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('individuales')}
                className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'individuales'
                    ? 'text-pink-deep border-b-2 border-pink-deep bg-pink-50'
                    : 'text-gray-600 hover:text-pink-deep hover:bg-gray-50'
                }`}
              >
                🍓 Productos Individuales
              </button>
              <button
                onClick={() => setActiveTab('paquetes')}
                className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'paquetes'
                    ? 'text-pink-deep border-b-2 border-pink-deep bg-pink-50'
                    : 'text-gray-600 hover:text-pink-deep hover:bg-gray-50'
                }`}
              >
                💝 Paquetes
              </button>
              <button
                onClick={() => setActiveTab('toppings')}
                className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'toppings'
                    ? 'text-pink-deep border-b-2 border-pink-deep bg-pink-50'
                    : 'text-gray-600 hover:text-pink-deep hover:bg-gray-50'
                }`}
              >
                ✨ Toppings
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in-up">
          {activeTab === 'individuales' && <ProductosIndividualesAdmin />}
          {activeTab === 'paquetes' && <PaquetesAdmin />}
          {activeTab === 'toppings' && <ToppingsAdmin />}
        </div>
      </div>
    </div>
  );
}