'use client';

// ============================================================
// ARCHIVO: src/app/fresas/pedidos/nuevo/page.tsx
// Adaptado a la tabla real 'productos' de Supabase:
//   - tipo: 'individual' | 'paquete'
//   - toppings_incluidos (snake_case)
//   - productos_incluidos: [{productoId, cantidad}]
// ============================================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// ============================================================
// TIPOS — basados en la tabla real 'productos'
// ============================================================

interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  emoji?: string;
  tipo: 'individual' | 'paquete';
  toppings_incluidos: number;
  productos_incluidos?: { productoId: string; cantidad: number }[] | null;
  activo: boolean;
}

interface Topping {
  id: string;
  nombre: string;
  emoji?: string;
  activo: boolean;
}

interface ComponentePaquete {
  productoId: string;
  nombre: string;
  emoji?: string;
  toppingsIncluidos: number;
  toppings: { id: string; nombre: string; emoji?: string }[];
}

interface ItemCarrito {
  id: string;
  tipo: 'individual' | 'paquete';
  productoId: string;
  nombre: string;
  precio: number;
  cantidad: number;
  emoji?: string;
  toppingsIncluidos: number;
  toppings: { id: string; nombre: string; emoji?: string }[];
  componentesPaquete?: ComponentePaquete[];
}

// ============================================================
// HELPERS
// ============================================================

const EXTRA = 5;
const uid = () => Math.random().toString(36).substring(2, 9);

const calcularExtras = (item: ItemCarrito): number => {
  if (item.tipo === 'individual')
    return Math.max(0, item.toppings.length - item.toppingsIncluidos) * EXTRA;
  return (item.componentesPaquete || []).reduce(
    (s, c) => s + Math.max(0, c.toppings.length - c.toppingsIncluidos) * EXTRA,
    0
  );
};

const calcularSubtotal = (item: ItemCarrito) =>
  (item.precio + calcularExtras(item)) * item.cantidad;

// ============================================================
// TOPPING CHIP
// ============================================================

const ToppingChip = ({
  t, sel, esExtra, onToggle,
}: {
  t: Topping; sel: boolean; esExtra: boolean; onToggle: () => void;
}) => (
  <button
    type="button"
    onClick={onToggle}
    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all active:scale-95 min-w-[70px] ${
      sel
        ? esExtra
          ? 'border-pink-deep bg-pink-deep text-white shadow-md'
          : 'border-green-500 bg-green-50 text-green-700'
        : 'border-gray-200 bg-white text-gray-600 hover:border-pink-seli'
    }`}
  >
    <span className="text-xl leading-none">{t.emoji || '✨'}</span>
    <span className="text-[11px] font-medium leading-tight text-center">{t.nombre}</span>
    {sel && esExtra && <span className="text-[10px] font-bold">+$5</span>}
  </button>
);

// ============================================================
// PANEL TOPPINGS
// ============================================================

const PanelToppings = ({
  titulo, emoji, toppingsIncluidos, seleccionados, disponibles, onToggle,
}: {
  titulo: string; emoji?: string; toppingsIncluidos: number;
  seleccionados: { id: string; nombre: string; emoji?: string }[];
  disponibles: Topping[]; onToggle: (t: Topping) => void;
}) => {
  const ids = seleccionados.map(t => t.id);
  const extras = Math.max(0, seleccionados.length - toppingsIncluidos);
  return (
    <div className="bg-gray-50 rounded-2xl p-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-gray-800">
          {emoji && <span className="mr-1">{emoji}</span>}{titulo}
        </p>
        <div className="flex gap-2">
          <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200">
            {toppingsIncluidos} gratis
          </span>
          {extras > 0 && (
            <span className="text-xs font-bold text-white bg-pink-deep px-2 py-0.5 rounded-full">
              +${extras * EXTRA}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {disponibles.map(t => {
          const sel = ids.includes(t.id);
          const idx = ids.indexOf(t.id);
          return (
            <ToppingChip
              key={t.id} t={t} sel={sel}
              esExtra={sel && idx >= toppingsIncluidos}
              onToggle={() => onToggle(t)}
            />
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// RESUMEN CARRITO
// ============================================================

const ResumenCarrito = ({
  carrito, subtotal, envio, total, envioGratis, costoEnvio,
}: {
  carrito: ItemCarrito[]; subtotal: number; envio: number; total: number;
  envioGratis: boolean; costoEnvio: number;
}) => (
  <div className="bg-white rounded-dolce-lg shadow-dolce p-4">
    <h2 className="font-bold text-gray-700 mb-3 text-sm">🧾 Resumen del pedido</h2>
    <div className="space-y-2 mb-3 max-h-60 overflow-y-auto">
      {carrito.map(item => {
        const sub = calcularSubtotal(item);
        return (
          <div
            key={item.id}
            className="flex justify-between items-start gap-2 py-1.5 border-b border-gray-100 last:border-0"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {item.cantidad}× {item.emoji} {item.nombre}
              </p>
              {item.tipo === 'individual' && item.toppings.length > 0 && (
                <p className="text-xs text-gray-400 truncate">
                  {item.toppings.map(t => t.nombre).join(', ')}
                </p>
              )}
              {item.tipo === 'paquete' && item.componentesPaquete?.map((c, ci) =>
                c.toppings.length > 0 ? (
                  <p key={ci} className="text-xs text-gray-400 truncate">
                    {c.nombre}: {c.toppings.map(t => t.nombre).join(', ')}
                  </p>
                ) : null
              )}
            </div>
            <p className="text-sm font-bold text-gray-700 shrink-0">${sub.toFixed(2)}</p>
          </div>
        );
      })}
    </div>
    <div className="space-y-1 text-sm text-gray-600 border-t border-gray-100 pt-3">
      <div className="flex justify-between">
        <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span>Envío</span>
        <span>{envioGratis ? 'Gratis ✨' : costoEnvio > 0 ? `$${costoEnvio.toFixed(2)}` : '—'}</span>
      </div>
      <div className="flex justify-between font-bold text-base text-gray-800 pt-2 border-t border-gray-200 mt-2">
        <span>Total</span>
        <span className="text-pink-deep text-lg">${total.toFixed(2)}</span>
      </div>
    </div>
  </div>
);

// ============================================================
// PÁGINA PRINCIPAL
// ============================================================

type Paso = 'catalogo' | 'toppings' | 'cliente' | 'confirmado';

export default function POSPage() {
  const [individuales, setIndividuales] = useState<Producto[]>([]);
  const [paquetes, setPaquetes] = useState<Producto[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [loading, setLoading] = useState(true);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [paso, setPaso] = useState<Paso>('catalogo');
  const [itemEnConfig, setItemEnConfig] = useState<ItemCarrito | null>(null);

  // Datos cliente
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [linkMaps, setLinkMaps] = useState('');
  const [programar, setProgramar] = useState(false);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [costoEnvio, setCostoEnvio] = useState(0);
  const [envioGratis, setEnvioGratis] = useState(false);
  const [tipoPago, setTipoPago] = useState<'efectivo' | 'transferencia' | 'tarjeta'>('efectivo');
  const [notas, setNotas] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Una sola query — la tabla 'productos' tiene ambos tipos
      const [{ data: prods }, { data: tops }] = await Promise.all([
        supabase
          .from('productos')
          .select('*')
          .eq('activo', true)
          .order('created_at', { ascending: true }),
        supabase
          .from('toppings')
          .select('*')
          .eq('activo', true)
          .order('nombre', { ascending: true }),
      ]);

      const todos = (prods || []) as Producto[];
      setIndividuales(todos.filter(p => p.tipo === 'individual'));
      setPaquetes(todos.filter(p => p.tipo === 'paquete'));
      setToppings((tops || []) as Topping[]);
    } catch (err) {
      console.error('❌ Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Agregar individual ──────────────────────────────────
  const agregarIndividual = (prod: Producto) => {
    setItemEnConfig({
      id: uid(),
      tipo: 'individual',
      productoId: prod.id,
      nombre: prod.nombre,
      precio: prod.precio,
      cantidad: 1,
      emoji: prod.emoji,
      toppingsIncluidos: prod.toppings_incluidos,
      toppings: [],
    });
    setPaso('toppings');
  };

  // ── Agregar paquete ─────────────────────────────────────
  const agregarPaquete = (paq: Producto) => {
    // Construir componentes desde productos_incluidos
    const productosIncluidos = (paq.productos_incluidos || []) as { productoId: string; cantidad: number }[];

    const componentes: ComponentePaquete[] = productosIncluidos.flatMap(pi => {
      const prod = individuales.find(p => p.id === pi.productoId);
      // Si hay cantidad > 1, crear una entrada por cada unidad para toppings individuales
      return Array.from({ length: pi.cantidad }, () => ({
        productoId: pi.productoId,
        nombre: prod?.nombre || 'Producto',
        emoji: prod?.emoji,
        toppingsIncluidos: prod?.toppings_incluidos || 0,
        toppings: [],
      }));
    });

    setItemEnConfig({
      id: uid(),
      tipo: 'paquete',
      productoId: paq.id,
      nombre: paq.nombre,
      precio: paq.precio,
      cantidad: 1,
      emoji: paq.emoji,
      toppingsIncluidos: paq.toppings_incluidos,
      toppings: [],
      componentesPaquete: componentes,
    });
    setPaso('toppings');
  };

  // ── Toggle toppings ─────────────────────────────────────
  const toggleToppingInd = (t: Topping) => {
    if (!itemEnConfig) return;
    const existe = itemEnConfig.toppings.find(x => x.id === t.id);
    setItemEnConfig({
      ...itemEnConfig,
      toppings: existe
        ? itemEnConfig.toppings.filter(x => x.id !== t.id)
        : [...itemEnConfig.toppings, { id: t.id, nombre: t.nombre, emoji: t.emoji }],
    });
  };

  const toggleToppingComp = (idx: number, t: Topping) => {
    if (!itemEnConfig?.componentesPaquete) return;
    const comps = itemEnConfig.componentesPaquete.map((c, i) => {
      if (i !== idx) return c;
      const existe = c.toppings.find(x => x.id === t.id);
      return {
        ...c,
        toppings: existe
          ? c.toppings.filter(x => x.id !== t.id)
          : [...c.toppings, { id: t.id, nombre: t.nombre, emoji: t.emoji }],
      };
    });
    setItemEnConfig({ ...itemEnConfig, componentesPaquete: comps });
  };

  const confirmarItem = () => {
    if (!itemEnConfig) return;
    setCarrito(prev => [...prev, itemEnConfig]);
    setItemEnConfig(null);
    setPaso('catalogo');
  };

  const eliminar = (id: string) => setCarrito(c => c.filter(i => i.id !== id));
  const cambiarCantidad = (id: string, d: number) =>
    setCarrito(c => c.map(i => i.id === id ? { ...i, cantidad: Math.max(1, i.cantidad + d) } : i));

  const subtotal = carrito.reduce((s, i) => s + calcularSubtotal(i), 0);
  const envio = envioGratis ? 0 : costoEnvio;
  const total = subtotal + envio;
  const hayItems = carrito.length > 0;

  // ── Confirmar pedido ────────────────────────────────────
  const confirmarPedido = async () => {
    if (!nombre || !telefono) return;
    setSaving(true);
    try {
      // Construir items en el formato del JSON de pedidos
      const items = carrito.map(item => ({
        tipo: item.tipo,
        productoId: item.productoId,
        productoNombre: item.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.precio,
        extras: calcularExtras(item),
        toppingsSeleccionados: item.toppings.map(t => ({
          toppingId: t.id,
          toppingNombre: t.nombre,
        })),
        toppingsPorItem: item.componentesPaquete?.map((c, idx) => ({
          itemIndex: idx,
          nombreComponente: c.nombre,
          toppings: c.toppings.map(t => ({
            toppingId: t.id,
            toppingNombre: t.nombre,
          })),
        })),
      }));

      const { error } = await supabase.from('pedidos').insert([{
        cliente: nombre,
        telefono,
        direccion: direccion || null,
        link_maps: linkMaps || null,
        items,
        total,
        tipo_pago: tipoPago,
        notas: notas || null,
        estado: 'pendiente',
        hora_entrega: programar && fecha && hora ? `${fecha} ${hora}` : null,
      }]);

      if (error) throw error;
      console.log('✅ Pedido creado exitosamente');
      setPaso('confirmado');
    } catch (err) {
      console.error('❌ Error al crear pedido:', err);
      alert('Error al crear el pedido. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const reiniciar = () => {
    setCarrito([]);
    setNombre(''); setTelefono(''); setDireccion(''); setLinkMaps('');
    setProgramar(false); setFecha(''); setHora('');
    setCostoEnvio(0); setEnvioGratis(false);
    setTipoPago('efectivo'); setNotas('');
    setPaso('catalogo'); setItemEnConfig(null);
  };

  // ── LOADING ─────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-cream-dolce flex items-center justify-center">
      <div className="text-center">
        <div className="text-7xl mb-4 animate-bounce">🍓</div>
        <p className="text-gray-500 font-medium">Cargando catálogo...</p>
      </div>
    </div>
  );

  // ── CONFIRMADO ───────────────────────────────────────────
  if (paso === 'confirmado') return (
    <div className="min-h-screen bg-cream-dolce flex items-center justify-center p-4">
      <div className="bg-white rounded-dolce-lg shadow-dolce-lg p-8 max-w-sm w-full text-center">
        <div className="text-7xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Pedido creado!</h2>
        <p className="text-gray-600 mb-1">Para <strong>{nombre}</strong></p>
        <p className="text-3xl font-bold text-pink-deep mb-8">${total.toFixed(2)}</p>
        <button
          onClick={reiniciar}
          className="w-full py-4 bg-gradient-to-r from-pink-seli to-pink-deep text-white font-bold rounded-dolce text-lg active:scale-95 transition-transform"
        >
          Nuevo Pedido 🍓
        </button>
      </div>
    </div>
  );

  // ── TOPPINGS ─────────────────────────────────────────────
  if (paso === 'toppings' && itemEnConfig) return (
    <div className="min-h-screen bg-cream-dolce flex flex-col">
      <div className="bg-white shadow-sm px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button
          onClick={() => { setItemEnConfig(null); setPaso('catalogo'); }}
          className="text-gray-600 p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all text-xl"
        >←</button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-gray-800 truncate">
            {itemEnConfig.emoji && <span className="mr-1">{itemEnConfig.emoji}</span>}
            {itemEnConfig.nombre}
          </h1>
          <p className="text-xs text-gray-500">Elige los toppings</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32 max-w-2xl mx-auto w-full">
        {itemEnConfig.tipo === 'individual' && (
          <PanelToppings
            titulo={itemEnConfig.nombre}
            emoji={itemEnConfig.emoji}
            toppingsIncluidos={itemEnConfig.toppingsIncluidos}
            seleccionados={itemEnConfig.toppings}
            disponibles={toppings}
            onToggle={toggleToppingInd}
          />
        )}
        {itemEnConfig.tipo === 'paquete' && itemEnConfig.componentesPaquete && (
          <>
            <p className="text-sm text-gray-500 mb-3 font-medium">
              Selecciona los toppings para cada producto del paquete:
            </p>
            {itemEnConfig.componentesPaquete.map((comp, idx) => (
              <PanelToppings
                key={idx}
                titulo={`${comp.emoji || ''} ${comp.nombre}`.trim()}
                emoji={undefined}
                toppingsIncluidos={comp.toppingsIncluidos}
                seleccionados={comp.toppings}
                disponibles={toppings}
                onToggle={t => toggleToppingComp(idx, t)}
              />
            ))}
          </>
        )}
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-100 px-4 py-4 flex gap-3"
        style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.10)' }}
      >
        <div className="max-w-2xl mx-auto w-full flex gap-3">
          <button
            onClick={confirmarItem}
            className="flex-1 py-3.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-dolce active:scale-95 transition-all text-base"
          >
            Sin toppings
          </button>
          <button
            onClick={confirmarItem}
            className="flex-[2] py-3.5 bg-gradient-to-r from-pink-seli to-pink-deep text-white font-bold rounded-dolce active:scale-95 transition-all text-base"
          >
            Agregar al pedido ✓
          </button>
        </div>
      </div>
    </div>
  );

  // ── PASO CLIENTE ─────────────────────────────────────────
  if (paso === 'cliente') return (
    <div className="min-h-screen bg-cream-dolce flex flex-col">
      <div className="bg-white shadow-sm px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button
          onClick={() => setPaso('catalogo')}
          className="text-gray-600 p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all text-xl"
        >←</button>
        <div>
          <h1 className="font-bold text-gray-800">Datos del cliente</h1>
          <p className="text-xs text-gray-500">
            Total: <span className="font-bold text-pink-deep">${total.toFixed(2)}</span>
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 lg:pb-8">
        <div className="max-w-6xl mx-auto px-4 py-5 lg:grid lg:grid-cols-[1fr_380px] lg:gap-6 lg:items-start">

          {/* Formulario */}
          <div className="space-y-4">
            <div className="bg-white rounded-dolce-lg shadow-dolce p-5">
              <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-pink-100 rounded-full flex items-center justify-center text-sm">👤</span>
                Cliente
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text" value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Nombre *"
                  className={inputCls}
                />
                <input
                  type="tel" value={telefono}
                  onChange={e => setTelefono(e.target.value)}
                  placeholder="Teléfono *"
                  className={inputCls}
                />
                <input
                  type="text" value={direccion}
                  onChange={e => setDireccion(e.target.value)}
                  placeholder="Dirección de entrega"
                  className={inputCls + ' sm:col-span-2'}
                />
                <input
                  type="url" value={linkMaps}
                  onChange={e => setLinkMaps(e.target.value)}
                  placeholder="Link Google Maps (opcional)"
                  className={inputCls + ' sm:col-span-2'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Entrega */}
              <div className="bg-white rounded-dolce-lg shadow-dolce p-5">
                <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center text-sm">📅</span>
                  Entrega
                </h2>
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox" checked={programar}
                    onChange={e => setProgramar(e.target.checked)}
                    className="w-5 h-5 text-pink-deep rounded accent-pink-deep"
                  />
                  <span className="font-medium text-gray-700 text-sm">Programar fecha y hora</span>
                </label>
                {programar && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date" value={fecha}
                      onChange={e => setFecha(e.target.value)}
                      className="px-3 py-2.5 border border-gray-300 rounded-dolce focus:ring-2 focus:ring-pink-deep text-sm"
                    />
                    <input
                      type="time" value={hora}
                      onChange={e => setHora(e.target.value)}
                      className="px-3 py-2.5 border border-gray-300 rounded-dolce focus:ring-2 focus:ring-pink-deep text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Envío */}
              <div className="bg-white rounded-dolce-lg shadow-dolce p-5">
                <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-sm">🚚</span>
                  Envío
                </h2>
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox" checked={envioGratis}
                    onChange={e => setEnvioGratis(e.target.checked)}
                    className="w-5 h-5 text-pink-deep rounded accent-pink-deep"
                  />
                  <span className="font-medium text-gray-700 text-sm">Envío gratis</span>
                </label>
                {!envioGratis && (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                    <input
                      type="number" value={costoEnvio}
                      onChange={e => setCostoEnvio(parseFloat(e.target.value) || 0)}
                      placeholder="0.00" min="0"
                      className="w-full pl-7 pr-4 py-2.5 border border-gray-300 rounded-dolce focus:ring-2 focus:ring-pink-deep text-base"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Pago */}
            <div className="bg-white rounded-dolce-lg shadow-dolce p-5">
              <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center text-sm">💳</span>
                Método de pago
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { v: 'efectivo', l: 'Efectivo', i: '💵' },
                  { v: 'transferencia', l: 'Transferencia', i: '🏦' },
                  { v: 'tarjeta', l: 'Tarjeta', i: '💳' },
                ] as const).map(m => (
                  <button
                    key={m.v} type="button"
                    onClick={() => setTipoPago(m.v)}
                    className={`flex flex-col items-center py-3 px-2 rounded-dolce border-2 transition-all active:scale-95 ${
                      tipoPago === m.v
                        ? 'border-pink-deep bg-pink-50 text-pink-deep shadow-md'
                        : 'border-gray-200 text-gray-600 hover:border-pink-seli hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl mb-1">{m.i}</span>
                    <span className="text-xs font-medium leading-tight text-center">{m.l}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div className="bg-white rounded-dolce-lg shadow-dolce p-5">
              <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-yellow-100 rounded-full flex items-center justify-center text-sm">📝</span>
                Notas especiales
              </h2>
              <textarea
                value={notas} onChange={e => setNotas(e.target.value)}
                placeholder="Ej: Sin nuez, entregar en portón azul, etc..."
                className={inputCls + ' resize-none'}
                rows={3}
              />
            </div>

            {/* Botón confirmar — móvil */}
            <div className="lg:hidden">
              <button
                onClick={confirmarPedido}
                disabled={!nombre || !telefono || saving}
                className="w-full py-4 bg-gradient-to-r from-pink-seli to-pink-deep text-white font-bold text-lg rounded-dolce active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-dolce-hover"
              >
                {saving ? '⏳ Guardando...' : `✅ Confirmar Pedido · $${total.toFixed(2)}`}
              </button>
            </div>
          </div>

          {/* Sidebar resumen — desktop */}
          <div className="hidden lg:block space-y-4 sticky top-20">
            <ResumenCarrito
              carrito={carrito} subtotal={subtotal} envio={envio} total={total}
              envioGratis={envioGratis} costoEnvio={costoEnvio}
            />
            <button
              onClick={confirmarPedido}
              disabled={!nombre || !telefono || saving}
              className="w-full py-4 bg-gradient-to-r from-pink-seli to-pink-deep text-white font-bold text-lg rounded-dolce active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-dolce-hover"
            >
              {saving ? '⏳ Guardando...' : `✅ Confirmar Pedido · $${total.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>

      {/* Barra fija — móvil */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-3"
        style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}
      >
        <button
          onClick={confirmarPedido}
          disabled={!nombre || !telefono || saving}
          className="w-full py-3.5 bg-gradient-to-r from-pink-seli to-pink-deep text-white font-bold text-base rounded-dolce active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? '⏳ Guardando...' : `✅ Confirmar Pedido · $${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  );

  // ── CATÁLOGO ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream-dolce">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 sticky top-0 z-20">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Link
              href="/fresas/pedidos"
              className="text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 active:scale-95 transition-all text-sm font-medium flex items-center gap-1"
            >
              ← Pedidos
            </Link>
            <div className="w-px h-6 bg-gray-200" />
            <div>
              <h1 className="font-bold text-gray-800 text-lg">🍓 Dolce Seli — POS</h1>
              <p className="text-xs text-gray-500">Selecciona productos para el pedido</p>
            </div>
          </div>
          {/* Contador móvil */}
          {hayItems && (
            <div className="flex items-center gap-2 lg:hidden">
              <span className="bg-pink-deep text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {carrito.reduce((s, i) => s + i.cantidad, 0)}
              </span>
              <span className="font-bold text-gray-800">${subtotal.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Layout */}
      <div
        className="max-w-6xl mx-auto lg:grid lg:grid-cols-[1fr_360px] lg:gap-6 lg:items-start px-4 py-5"
        style={{ paddingBottom: hayItems ? '96px' : '32px' }}
      >
        {/* Catálogo */}
        <div>
          {/* Sin productos */}
          {individuales.length === 0 && paquetes.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">🍓</div>
              <p className="font-medium">No hay productos activos</p>
              <p className="text-sm mt-1">Agrega productos desde el panel admin</p>
            </div>
          )}

          {/* PAQUETES */}
          {paquetes.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">💝 Paquetes</h2>
              <div className="space-y-3">
                {paquetes.map(paq => {
                  const productosIncluidos = (paq.productos_incluidos || []) as { productoId: string; cantidad: number }[];
                  return (
                    <button
                      key={paq.id} type="button"
                      onClick={() => agregarPaquete(paq)}
                      className="w-full bg-white rounded-dolce-lg shadow-dolce p-4 text-left active:scale-95 transition-all hover:shadow-dolce-hover border-2 border-transparent hover:border-pink-seli"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">{paq.emoji || '💝'}</span>
                            <p className="font-bold text-gray-800">{paq.nombre}</p>
                          </div>
                          {paq.descripcion && (
                            <p className="text-xs text-gray-500 mb-2">{paq.descripcion}</p>
                          )}
                          <div className="flex flex-wrap gap-1">
                            {productosIncluidos.map((pi, i) => {
                              const prod = individuales.find(p => p.id === pi.productoId);
                              return (
                                <span
                                  key={i}
                                  className="text-xs bg-pink-50 text-pink-deep px-2 py-0.5 rounded-full font-medium"
                                >
                                  {pi.cantidad}× {prod?.nombre || 'Producto'}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-pink-deep font-bold text-xl">${paq.precio}</p>
                          <p className="text-xs text-gray-400">
                            {paq.toppings_incluidos} topping{paq.toppings_incluidos !== 1 ? 's' : ''} incl.
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* INDIVIDUALES */}
          {individuales.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">🍓 Individuales</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {individuales.map(prod => (
                  <button
                    key={prod.id} type="button"
                    onClick={() => agregarIndividual(prod)}
                    className="bg-white rounded-dolce-lg shadow-dolce p-4 text-left active:scale-95 transition-all hover:shadow-dolce-hover border-2 border-transparent hover:border-pink-seli"
                  >
                    <div className="text-3xl mb-2">{prod.emoji || '🍓'}</div>
                    <p className="font-bold text-gray-800 text-sm leading-tight">{prod.nombre}</p>
                    {prod.descripcion && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{prod.descripcion}</p>
                    )}
                    <p className="text-pink-deep font-bold mt-2 text-base">${prod.precio}</p>
                    <p className="text-xs text-gray-400">
                      {prod.toppings_incluidos} topping{prod.toppings_incluidos !== 1 ? 's' : ''} incl.
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Carrito — solo móvil */}
          {hayItems && (
            <div className="lg:hidden mb-4">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">🛒 Carrito</h2>
              <div className="space-y-3">
                {carrito.map(item => {
                  const extra = calcularExtras(item);
                  const sub = calcularSubtotal(item);
                  return (
                    <div key={item.id} className="bg-white rounded-dolce-lg shadow-dolce p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl shrink-0">{item.emoji || (item.tipo === 'paquete' ? '💝' : '🍓')}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-sm">{item.nombre}</p>
                          {item.tipo === 'individual' && item.toppings.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.toppings.map((t, i) => (
                                <span
                                  key={i}
                                  className={`text-xs px-2 py-0.5 rounded-full ${
                                    i < item.toppingsIncluidos
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-pink-100 text-pink-700'
                                  }`}
                                >
                                  {t.nombre}{i >= item.toppingsIncluidos ? ' +$5' : ''}
                                </span>
                              ))}
                            </div>
                          )}
                          {extra > 0 && (
                            <p className="text-xs text-pink-deep mt-1 font-medium">+${extra} extra</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <button onClick={() => eliminar(item.id)} className="text-red-400 text-lg leading-none">✕</button>
                          <p className="font-bold text-sm">${sub.toFixed(2)}</p>
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => cambiarCantidad(item.id, -1)} className="w-7 h-7 bg-gray-100 rounded-lg font-bold text-gray-700">−</button>
                            <span className="font-bold w-5 text-center text-sm">{item.cantidad}</span>
                            <button onClick={() => cambiarCantidad(item.id, 1)} className="w-7 h-7 bg-gray-100 rounded-lg font-bold text-gray-700">+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar carrito — desktop */}
        <div className="hidden lg:block sticky top-20 space-y-4">
          {hayItems ? (
            <>
              <div className="bg-white rounded-dolce-lg shadow-dolce p-4">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">🛒 Carrito</h2>
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {carrito.map(item => {
                    const extra = calcularExtras(item);
                    const sub = calcularSubtotal(item);
                    return (
                      <div key={item.id} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                        <span className="text-xl shrink-0">{item.emoji || '🍓'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-sm leading-tight">{item.nombre}</p>
                          {item.tipo === 'individual' && item.toppings.map((t, i) => (
                            <span
                              key={i}
                              className={`inline-block text-xs px-1.5 py-0.5 rounded-full mr-1 mt-0.5 ${
                                i < item.toppingsIncluidos
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-pink-100 text-pink-700'
                              }`}
                            >
                              {t.nombre}
                            </span>
                          ))}
                          {item.tipo === 'paquete' && item.componentesPaquete?.map((c, ci) =>
                            c.toppings.length > 0 ? (
                              <p key={ci} className="text-xs text-gray-400 truncate mt-0.5">
                                {c.nombre}: {c.toppings.map(t => t.nombre).join(', ')}
                              </p>
                            ) : null
                          )}
                          {extra > 0 && <p className="text-xs text-pink-deep font-medium">+${extra} extra</p>}
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <button onClick={() => eliminar(item.id)} className="text-red-300 hover:text-red-500 text-sm">✕</button>
                          <p className="font-bold text-sm text-gray-800">${sub.toFixed(2)}</p>
                          <div className="flex items-center gap-1">
                            <button onClick={() => cambiarCantidad(item.id, -1)} className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-700">−</button>
                            <span className="w-5 text-center text-sm font-bold">{item.cantidad}</span>
                            <button onClick={() => cambiarCantidad(item.id, 1)} className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-700">+</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>{carrito.reduce((s, i) => s + i.cantidad, 0)} producto{carrito.reduce((s, i) => s + i.cantidad, 0) !== 1 ? 's' : ''}</span>
                    <span className="font-bold text-gray-800">${subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setPaso('cliente')}
                className="w-full py-4 bg-gradient-to-r from-pink-seli to-pink-deep text-white font-bold text-base rounded-dolce active:scale-95 transition-all shadow-dolce-hover"
              >
                Continuar con el pedido → <br />
                <span className="text-2xl font-black">${subtotal.toFixed(2)}</span>
              </button>
            </>
          ) : (
            <div className="bg-white rounded-dolce-lg shadow-dolce p-8 text-center text-gray-400">
              <div className="text-5xl mb-3">🛒</div>
              <p className="font-medium text-sm">El carrito está vacío</p>
              <p className="text-xs mt-1">Selecciona productos del catálogo</p>
            </div>
          )}
        </div>
      </div>

      {/* Checkout fijo — móvil */}
      {hayItems && (
        <div
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-100 px-4 py-4"
          style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.10)' }}
        >
          <button
            onClick={() => setPaso('cliente')}
            className="w-full py-4 bg-gradient-to-r from-pink-seli to-pink-deep text-white font-bold text-lg rounded-dolce active:scale-95 transition-all"
          >
            Continuar · ${total.toFixed(2)} →
          </button>
        </div>
      )}
    </div>
  );
}

const inputCls = 'w-full px-4 py-3 border border-gray-300 rounded-dolce focus:ring-2 focus:ring-pink-deep focus:border-transparent text-base transition-all';