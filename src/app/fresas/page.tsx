'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import type { Paquete, ProductoIndividual, Topping } from '@/types';
import {
  obtenerPaquetes,
  obtenerProductosIndividuales,
  
} from '@/lib/productos.service';
import {
  obtenerToppings
} from '@/lib/toppings.service';


type LoadState = 'idle' | 'loading' | 'success' | 'error';

const PEDIDOS_HREF = '/fresas/pedidos'; // 👈 cambia si tu ruta es otra (ej: /admin/pedidos)
const ADMIN_HREF = '/fresas/admin'; // opcional

export default function FresasHomePage() {
  const [productos, setProductos] = useState<ProductoIndividual[]>([]);
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);

  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const cargarTodo = async () => {
    setLoadState('loading');
    setErrorMessage('');

    try {
      const [prods, paqs, tops] = await Promise.all([
        obtenerProductosIndividuales(),
        obtenerPaquetes(),
        obtenerToppings(),
      ]);

      setProductos(prods.filter((p) => p.activo));
      setPaquetes(paqs.filter((p) => p.activo));
      setToppings(tops.filter((t) => t.activo));

      console.log('✅ /fresas promo cargado:', {
        productos: prods.filter((p) => p.activo).length,
        paquetes: paqs.filter((p) => p.activo).length,
        toppings: tops.filter((t) => t.activo).length,
      });

      setLoadState('success');
    } catch (error) {
      console.error('❌ Error cargando /fresas promo:', error);
      setErrorMessage('No se pudo cargar la información de fresas. Intenta de nuevo.');
      setLoadState('error');
    }
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  const productosOrdenados = useMemo(() => {
    return [...productos].sort((a, b) => (a.precio ?? 0) - (b.precio ?? 0));
  }, [productos]);

  const paquetesOrdenados = useMemo(() => {
    return [...paquetes].sort((a, b) => (a.precio ?? 0) - (b.precio ?? 0));
  }, [paquetes]);

  if (loadState === 'loading' || loadState === 'idle') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-3">🍓</div>
          <p className="text-pink-deep text-xl font-medium">Cargando promoción...</p>
          <p className="text-gray-500 text-sm mt-2">Preparando lo dulce.</p>
        </div>
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-dolce-lg shadow-dolce p-8 border border-gray-200 max-w-lg w-full">
          <h1 className="text-2xl font-bold text-pink-deep font-playfair">🍓 Fresas con crema</h1>
          <p className="text-gray-600 mt-2">{errorMessage}</p>

          <div className="flex gap-3 mt-6">
            <button
              onClick={cargarTodo}
              className="flex-1 px-4 py-3 rounded-dolce text-white bg-gradient-to-r from-pink-seli to-pink-deep hover:shadow-lg transition-all"
            >
              Reintentar
            </button>
            <Link
              href="/"
              className="flex-1 px-4 py-3 rounded-dolce border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-center"
            >
              Ir al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-gray-500 text-xs">Dolce Seli</p>
              <h1 className="text-2xl md:text-3xl font-bold text-pink-deep font-playfair flex items-center gap-2">
                🍓 Promoción · Fresas con crema
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Página de promoción (no de pedidos)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="px-4 py-2 rounded-dolce border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
              >
                ← Inicio
              </Link>

              <Link
                href={ADMIN_HREF}
                className="px-4 py-2 rounded-dolce border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
              >
                Admin
              </Link>

              <Link
                href={PEDIDOS_HREF}
                className="px-5 py-2 rounded-dolce font-medium text-white bg-gradient-to-r from-pink-seli to-pink-deep hover:shadow-lg transition-all text-sm"
              >
                Ver pedidos
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* HERO PROMOCIONAL */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="bg-gray-50 rounded-dolce-lg shadow-dolce p-8 border border-gray-200">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
                  Se ve premium.
                  <span className="text-pink-deep"> Precio accesible.</span>
                </h2>

                <p className="text-gray-600 mt-3 max-w-3xl">
                  Dolce Seli es el detalle perfecto para sorprender: presentación cuidada,
                  ediciones especiales y toppings que elevan la experiencia.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-pink-50 text-pink-deep border border-pink-100">
                    Ediciones especiales
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-pink-50 text-pink-deep border border-pink-100">
                    Presentación lista para regalar
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-pink-50 text-pink-deep border border-pink-100">
                    Ideal para fechas y eventos
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Link
                  href={PEDIDOS_HREF}
                  className="px-6 py-3 rounded-dolce font-medium text-white bg-gradient-to-r from-pink-seli to-pink-deep hover:shadow-lg transition-all"
                >
                  📦 Ir a pedidos
                </Link>

                <Link
                  href="#catalogo"
                  className="px-6 py-3 rounded-dolce border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Ver catálogo ↓
                </Link>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
                Productos activos: {productos.length}
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
                Paquetes activos: {paquetes.length}
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
                Toppings activos: {toppings.length}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* DIFERENCIADORES */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-dolce-lg shadow-dolce p-6 border border-gray-200">
              <h3 className="font-bold text-gray-800">🎁 Presentación premium</h3>
              <p className="text-sm text-gray-600 mt-2">
                No es “un vaso”. Es un detalle bonito, listo para entregar.
              </p>
            </div>
            <div className="bg-white rounded-dolce-lg shadow-dolce p-6 border border-gray-200">
              <h3 className="font-bold text-gray-800">✨ Ediciones especiales</h3>
              <p className="text-sm text-gray-600 mt-2">
                Versiones limitadas que se ven increíbles y se venden rápido.
              </p>
            </div>
            <div className="bg-white rounded-dolce-lg shadow-dolce p-6 border border-gray-200">
              <h3 className="font-bold text-gray-800">🍓 Sabor + topping</h3>
              <p className="text-sm text-gray-600 mt-2">
                Toppings que elevan la experiencia y vuelven el producto memorable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CATÁLOGO (solo exhibición) */}
      <section id="catalogo" className="py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">🍓 Catálogo (exhibición)</h3>
              <p className="text-sm text-gray-600 mt-1">
                Esto es para mostrar lo que existe (no para pedir aquí).
              </p>
            </div>

            <Link
              href={PEDIDOS_HREF}
              className="text-sm font-medium text-pink-deep hover:text-pink-600"
            >
              Gestionar pedidos →
            </Link>
          </div>

          {/* Productos */}
          <div className="mt-6">
            <h4 className="text-lg font-bold text-gray-800">Productos individuales</h4>

            {productosOrdenados.length === 0 ? (
              <div className="bg-white rounded-dolce-lg shadow-dolce p-10 border border-gray-200 text-center mt-4">
                <p className="text-gray-700 font-medium">No hay productos activos.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {productosOrdenados.map((p) => (
                  <article key={p.id} className="bg-white rounded-dolce-lg shadow-dolce p-6 border border-gray-200">
                    <div className="flex items-start justify-between gap-3">
                      <h5 className="font-bold text-gray-800">
                        {p.emoji ? `${p.emoji} ` : ''}{p.nombre}
                      </h5>
                      <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 whitespace-nowrap">
                        {p.toppingsIncluidos ?? 0} topping{(p.toppingsIncluidos ?? 0) === 1 ? '' : 's'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mt-3">
                      {p.descripcion || '—'}
                    </p>

                    <p className="mt-4 text-2xl font-bold text-pink-deep">${p.precio}</p>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Paquetes */}
          <div className="mt-10">
            <h4 className="text-lg font-bold text-gray-800">Paquetes</h4>

            {paquetesOrdenados.length === 0 ? (
              <div className="bg-white rounded-dolce-lg shadow-dolce p-10 border border-gray-200 text-center mt-4">
                <p className="text-gray-700 font-medium">No hay paquetes activos.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6 mt-4">
                {paquetesOrdenados.map((paq) => (
                  <article key={paq.id} className="bg-white rounded-dolce-lg shadow-dolce p-6 border border-gray-200">
                    <div className="flex items-start justify-between gap-3">
                      <h5 className="font-bold text-gray-800">
                        {paq.emoji ? `${paq.emoji} ` : ''}{paq.nombre}
                      </h5>

                      <span className="text-xs px-3 py-1 rounded-full bg-pink-50 text-pink-deep border border-pink-100 whitespace-nowrap">
                        {paq.toppingsIncluidos ?? 0} topping{(paq.toppingsIncluidos ?? 0) === 1 ? '' : 's'} incl.
                      </span>
                    </div>

                    {paq.descripcion ? (
                      <p className="text-sm text-gray-600 mt-3">{paq.descripcion}</p>
                    ) : null}

                    <p className="mt-4 text-2xl font-bold text-pink-deep">${paq.precio}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* TOPPINGS (exhibición) */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">✨ Toppings disponibles</h3>
              <p className="text-sm text-gray-600 mt-1">
                Opciones activas en sistema (exhibición).
              </p>
            </div>

            <Link
              href={PEDIDOS_HREF}
              className="px-5 py-2 rounded-dolce font-medium text-white bg-gradient-to-r from-pink-seli to-pink-deep hover:shadow-lg transition-all text-sm"
            >
              Ver pedidos
            </Link>
          </div>

          {toppings.length === 0 ? (
            <div className="bg-gray-50 rounded-dolce-lg shadow-dolce p-10 border border-gray-200 text-center mt-6">
              <p className="text-gray-700 font-medium">No hay toppings activos.</p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {toppings.map((t) => (
                <div key={t.id} className="bg-gray-50 rounded-dolce p-4 border border-gray-200">
                  <p className="font-semibold text-gray-800">
                    {t.emoji ? `${t.emoji} ` : ''}{t.nombre}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{t.descripcion || '—'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
