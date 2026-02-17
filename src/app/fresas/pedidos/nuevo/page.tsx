'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ProductoIndividual,
  Paquete,
  Topping,
  PedidoCreate,
  ItemPedido,
} from '@/types';
import { obtenerProductosIndividuales, obtenerPaquetes } from '@/lib/productos.service';
import { obtenerToppingsActivos } from '@/lib/toppings.service';
import { crearPedido } from '@/lib/pedido.services';

// ============================================
// TIPOS INTERNOS DEL POS
// ============================================

interface ItemCarrito {
  id: string; // uuid único por item en carrito
  tipo: 'individual' | 'paquete';
  productoId: string;
  nombre: string;
  precio: number;
  cantidad: number;
  emoji?: string;
  toppingsIncluidos: number;
  // Para individuales: toppings directos
  toppings: { id: string; nombre: string; emoji?: string }[];
  // Para paquetes: toppings por cada producto componente
  componentesPaquete?: {
    productoId: string;
    nombre: string;
    toppingsIncluidos: number;
    toppings: { id: string; nombre: string; emoji?: string }[];
  }[];
}

const PRECIO_TOPPING_EXTRA = 5;

// ============================================
// UTILIDADES
// ============================================

const calcularCostoToppingsExtras = (item: ItemCarrito): number => {
  if (item.tipo === 'individual') {
    const extras = Math.max(0, item.toppings.length - item.toppingsIncluidos);
    return extras * PRECIO_TOPPING_EXTRA;
  } else {
    const extrasTotal = (item.componentesPaquete || []).reduce((sum, comp) => {
      const extras = Math.max(0, comp.toppings.length - comp.toppingsIncluidos);
      return sum + extras * PRECIO_TOPPING_EXTRA;
    }, 0);
    return extrasTotal;
  }
};

const calcularSubtotalItem = (item: ItemCarrito): number =>
  (item.precio + calcularCostoToppingsExtras(item)) * item.cantidad;

const generarId = () => Math.random().toString(36).substring(2, 9);

// ============================================
// COMPONENTES INTERNOS
// ============================================

// Chip de topping seleccionable
const ToppingChip = ({
  topping,
  seleccionado,
  esExtra,
  onToggle,
}: {
  topping: Topping;
  seleccionado: boolean;
  esExtra: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    onClick={onToggle}
    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all active:scale-95 min-w-[72px] ${
      seleccionado
        ? esExtra
          ? 'border-pink-deep bg-pink-deep text-white shadow-md'
          : 'border-green-500 bg-green-50 text-green-700'
        : 'border-gray-200 bg-white text-gray-600 hover:border-pink-seli'
    }`}
  >
    <span className="text-xl">{topping.emoji || '✨'}</span>
    <span className="text-xs font-medium leading-tight text-center">{topping.nombre}</span>
    {seleccionado && esExtra && (
      <span className="text-xs font-bold">+$5</span>
    )}
  </button>
);

// Panel de toppings para un componente
const PanelToppings = ({
  titulo,
  emoji,
  toppingsIncluidos,
  seleccionados,
  disponibles,
  onToggle,
}: {
  titulo: string;
  emoji?: string;
  toppingsIncluidos: number;
  seleccionados: { id: string; nombre: string; emoji?: string }[];
  disponibles: Topping[];
  onToggle: (t: Topping) => void;
}) => {
  const ids = seleccionados.map(t => t.id);
  const extras = Math.max(0, seleccionados.length - toppingsIncluidos);

  return (
    <div className="bg-gray-50 rounded-xl p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-700">
          {emoji && <span className="mr-1">{emoji}</span>}
          {titulo}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {toppingsIncluidos} incluido{toppingsIncluidos !== 1 ? 's' : ''}
          </span>
          {extras > 0 && (
            <span className="text-xs font-bold text-pink-deep bg-pink-100 px-2 py-0.5 rounded-full">
              +${extras * PRECIO_TOPPING_EXTRA}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {disponibles.map(t => {
          const sel = ids.includes(t.id);
          const idx = ids.indexOf(t.id);
          const esExtra = sel && idx >= toppingsIncluidos;
          return (
            <ToppingChip
              key={t.id}
              topping={t}
              seleccionado={sel}
              esExtra={esExtra}
              onToggle={() => onToggle(t)}
            />
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// PÁGINA PRINCIPAL DEL POS
// ============================================

type PasoActivo = 'productos' | 'toppings' | 'cliente' | 'confirmado';

export default function POSPage() {
  // Datos del catálogo
  const [individuales, setIndividuales] = useState<ProductoIndividual[]>([]);
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [loading, setLoading] = useState(true);

  // Carrito y paso actual
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [paso, setPaso] = useState<PasoActivo>('productos');

  // Item que se está configurando (toppings)
  const [itemEnConfig, setItemEnConfig] = useState<ItemCarrito | null>(null);

  // Datos del cliente
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [linkMaps, setLinkMaps] = useState('');
  const [programar, setProgramar] = useState(false);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [costoEnvio, setCostoEnvio] = useState<number>(0);
  const [envioGratis, setEnvioGratis] = useState(false);
  const [tipoPago, setTipoPago] = useState<'efectivo' | 'transferencia' | 'tarjeta'>('efectivo');
  const [notas, setNotas] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setLoading(true);
    const [prods, paqs, tops] = await Promise.all([
      obtenerProductosIndividuales(),
      obtenerPaquetes(),
      obtenerToppingsActivos(),
    ]);
    setIndividuales(prods.filter(p => p.activo));
    setPaquetes(paqs.filter(p => p.activo));
    setToppings(tops);
    setLoading(false);
  };

  // Agregar producto individual al carrito y pasar a config de toppings
  const agregarIndividual = (prod: ProductoIndividual) => {
    const item: ItemCarrito = {
      id: generarId(),
      tipo: 'individual',
      productoId: prod.id,
      nombre: prod.nombre,
      precio: prod.precio,
      cantidad: 1,
      emoji: prod.emoji,
      toppingsIncluidos: prod.toppingsIncluidos,
      toppings: [],
    };
    setItemEnConfig(item);
    setPaso('toppings');
  };

  // Agregar paquete al carrito y pasar a config de toppings
  const agregarPaquete = (paq: Paquete) => {
    // Construir componentes del paquete con referencia a productos
    const componentes = paq.productosIncluidos.map(pi => {
      const prod = individuales.find(p => p.id === pi.productoId);
      return {
        productoId: pi.productoId,
        nombre: prod?.nombre || 'Producto',
        toppingsIncluidos: prod?.toppingsIncluidos || 0,
        toppings: [] as { id: string; nombre: string; emoji?: string }[],
      };
    });

    const item: ItemCarrito = {
      id: generarId(),
      tipo: 'paquete',
      productoId: paq.id,
      nombre: paq.nombre,
      precio: paq.precio,
      cantidad: 1,
      toppingsIncluidos: paq.toppingsIncluidos,
      toppings: [],
      componentesPaquete: componentes,
    };
    setItemEnConfig(item);
    setPaso('toppings');
  };

  // Toggle topping en item individual
  const toggleToppingIndividual = (topping: Topping) => {
    if (!itemEnConfig) return;
    const existe = itemEnConfig.toppings.find(t => t.id === topping.id);
    const nuevos = existe
      ? itemEnConfig.toppings.filter(t => t.id !== topping.id)
      : [...itemEnConfig.toppings, { id: topping.id, nombre: topping.nombre, emoji: topping.emoji }];
    setItemEnConfig({ ...itemEnConfig, toppings: nuevos });
  };

  // Toggle topping en componente de paquete
  const toggleToppingComponente = (compIdx: number, topping: Topping) => {
    if (!itemEnConfig || !itemEnConfig.componentesPaquete) return;
    const comps = [...itemEnConfig.componentesPaquete];
    const comp = { ...comps[compIdx] };
    const existe = comp.toppings.find(t => t.id === topping.id);
    comp.toppings = existe
      ? comp.toppings.filter(t => t.id !== topping.id)
      : [...comp.toppings, { id: topping.id, nombre: topping.nombre, emoji: topping.emoji }];
    comps[compIdx] = comp;
    setItemEnConfig({ ...itemEnConfig, componentesPaquete: comps });
  };

  // Confirmar item con toppings y añadir al carrito
  const confirmarItemYAgregar = () => {
    if (!itemEnConfig) return;
    setCarrito([...carrito, itemEnConfig]);
    setItemEnConfig(null);
    setPaso('productos');
  };

  // Saltar toppings y agregar directo
  const saltarToppings = () => {
    if (!itemEnConfig) return;
    setCarrito([...carrito, itemEnConfig]);
    setItemEnConfig(null);
    setPaso('productos');
  };

  const eliminarDelCarrito = (id: string) => {
    setCarrito(carrito.filter(i => i.id !== id));
  };

  const cambiarCantidad = (id: string, delta: number) => {
    setCarrito(carrito.map(i =>
      i.id === id ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i
    ));
  };

  const subtotal = carrito.reduce((s, i) => s + calcularSubtotalItem(i), 0);
  const envio = envioGratis ? 0 : costoEnvio;
  const total = subtotal + envio;

  const confirmarPedido = async () => {
    if (!nombre || !telefono) return;
    setSaving(true);

    const items: ItemPedido[] = carrito.map(item => ({
      tipo: item.tipo,
      productoId: item.productoId,
      productoNombre: item.nombre,
      cantidad: item.cantidad,
      precioUnitario: item.precio,
      toppingsSeleccionados: item.toppings,
      toppingsPorItem: item.componentesPaquete?.map((comp, idx) => ({
        itemIndex: idx,
        toppings: comp.toppings,
      })),
    }));

    const pedido: PedidoCreate = {
      cliente: nombre,
      telefono,
      direccion: direccion || undefined,
      linkMaps: linkMaps || undefined,
      items,
      total,
      horaEntrega: programar && fecha && hora ? `${fecha} ${hora}` : undefined,
      tipoPago,
      notas: notas || undefined,
    };

    const resultado = await crearPedido(pedido);
    setSaving(false);

    if (resultado) {
      setPaso('confirmado');
    }
  };

  const reiniciar = () => {
    setCarrito([]);
    setNombre('');
    setTelefono('');
    setDireccion('');
    setLinkMaps('');
    setProgramar(false);
    setFecha('');
    setHora('');
    setCostoEnvio(0);
    setEnvioGratis(false);
    setTipoPago('efectivo');
    setNotas('');
    setPaso('productos');
    setItemEnConfig(null);
  };

  if (loading) return (
    <div className="min-h-screen bg-cream-dolce flex items-center justify-center">
      <div className="text-center">
        <div className="text-7xl mb-4 animate-bounce">🍓</div>
        <p className="text-gray-500 font-medium">Cargando catálogo...</p>
      </div>
    </div>
  );

  // ============================================
  // PANTALLA CONFIRMADO
  // ============================================
  if (paso === 'confirmado') return (
    <div className="min-h-screen bg-cream-dolce flex items-center justify-center p-4">
      <div className="bg-white rounded-dolce-lg shadow-dolce-lg p-8 max-w-sm w-full text-center">
        <div className="text-7xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Pedido creado!</h2>
        <p className="text-gray-600 mb-2">Para <strong>{nombre}</strong></p>
        <p className="text-3xl font-bold text-pink-deep mb-6">${total.toFixed(2)}</p>
        <button
          onClick={reiniciar}
          className="w-full py-4 bg-gradient-to-r from-pink-seli to-pink-deep text-white font-bold rounded-dolce text-lg active:scale-95 transition-transform"
        >
          Nuevo Pedido 🍓
        </button>
      </div>
    </div>
  );

  // ============================================
  // PANTALLA DE TOPPINGS
  // ============================================
  if (paso === 'toppings' && itemEnConfig) return (
    <div className="min-h-screen bg-cream-dolce flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => { setItemEnConfig(null); setPaso('productos'); }}
          className="text-gray-600 p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all"
        >
          ← Volver
        </button>
        <div>
          <h1 className="font-bold text-gray-800">
            {itemEnConfig.emoji && <span className="mr-1">{itemEnConfig.emoji}</span>}
            {itemEnConfig.nombre}
          </h1>
          <p className="text-xs text-gray-500">Elige los toppings</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32">
        {/* Individual */}
        {itemEnConfig.tipo === 'individual' && (
          <PanelToppings
            titulo={itemEnConfig.nombre}
            emoji={itemEnConfig.emoji}
            toppingsIncluidos={itemEnConfig.toppingsIncluidos}
            seleccionados={itemEnConfig.toppings}
            disponibles={toppings}
            onToggle={toggleToppingIndividual}
          />
        )}

        {/* Paquete: un panel por cada componente */}
        {itemEnConfig.tipo === 'paquete' && itemEnConfig.componentesPaquete && (
          <>
            <p className="text-sm text-gray-500 mb-3">
              Selecciona los toppings para cada producto del paquete:
            </p>
            {itemEnConfig.componentesPaquete.map((comp, idx) => (
              <PanelToppings
                key={idx}
                titulo={comp.nombre}
                toppingsIncluidos={comp.toppingsIncluidos}
                seleccionados={comp.toppings}
                disponibles={toppings}
                onToggle={(t) => toggleToppingComponente(idx, t)}
              />
            ))}
          </>
        )}
      </div>

      {/* Botones fijos abajo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex gap-3">
        <button
          onClick={saltarToppings}
          className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-dolce active:scale-95 transition-all"
        >
          Sin toppings
        </button>
        <button
          onClick={confirmarItemYAgregar}
          className="flex-2 flex-grow py-3 bg-gradient-to-r from-pink-seli to-pink-deep text-white font-bold rounded-dolce active:scale-95 transition-all"
        >
          Agregar ✓
        </button>
      </div>
    </div>
  );

  // ============================================
  // PANTALLA DE DATOS DEL CLIENTE
  // ============================================
  if (paso === 'cliente') return (
    <div className="min-h-screen bg-cream-dolce flex flex-col">
      <div className="bg-white shadow-sm px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => setPaso('productos')}
          className="text-gray-600 p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all"
        >
          ← Volver
        </button>
        <div>
          <h1 className="font-bold text-gray-800">Datos del cliente</h1>
          <p className="text-xs text-gray-500">Total: ${total.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-4">
        {/* Cliente */}
        <div className="bg-white rounded-dolce-lg shadow-dolce p-4">
          <h2 className="font-bold text-gray-700 mb-3">👤 Cliente</h2>
          <div className="space-y-3">
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Nombre *"
              className="w-full px-4 py-3 border border-gray-300 rounded-dolce focus:ring-2 focus:ring-pink-deep text-base"
            />
            <input
              type="tel"
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              placeholder="Teléfono *"
              className="w-full px-4 py-3 border border-gray-300 rounded-dolce focus:ring-2 focus:ring-pink-deep text-base"
            />
            <input
              type="text"
              value={direccion}
              onChange={e => setDireccion(e.target.value)}
              placeholder="Dirección"
              className="w-full px-4 py-3 border border-gray-300 rounded-dolce focus:ring-2 focus:ring-pink-deep text-base"
            />
            <input
              type="url"
              value={linkMaps}
              onChange={e => setLinkMaps(e.target.value)}
              placeholder="Link Google Maps"
              className="w-full px-4 py-3 border border-gray-300 rounded-dolce focus:ring-2 focus:ring-pink-deep text-base"
            />
          </div>
        </div>

        {/* Entrega */}
        <div className="bg-white rounded-dolce-lg shadow-dolce p-4">
          <h2 className="font-bold text-gray-700 mb-3">📅 Entrega</h2>
          <label className="flex items-center gap-3 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={programar}
              onChange={e => setProgramar(e.target.checked)}
              className="w-5 h-5 text-pink-deep rounded"
            />
            <span className="font-medium text-gray-700">Programar fecha y hora</span>
          </label>
          {programar && (
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-dolce focus:ring-2 focus:ring-pink-deep text-base"
              />
              <input
                type="time"
                value={hora}
                onChange={e => setHora(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-dolce focus:ring-2 focus:ring-pink-deep text-base"
              />
            </div>
          )}
        </div>

        {/* Envío */}
        <div className="bg-white rounded-dolce-lg shadow-dolce p-4">
          <h2 className="font-bold text-gray-700 mb-3">🚚 Envío</h2>
          <label className="flex items-center gap-3 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={envioGratis}
              onChange={e => setEnvioGratis(e.target.checked)}
              className="w-5 h-5 text-pink-deep rounded"
            />
            <span className="font-medium text-gray-700">Envío gratis</span>
          </label>
          {!envioGratis && (
            <input
              type="number"
              value={costoEnvio}
              onChange={e => setCostoEnvio(parseFloat(e.target.value) || 0)}
              placeholder="Costo de envío $"
              className="w-full px-4 py-3 border border-gray-300 rounded-dolce focus:ring-2 focus:ring-pink-deep text-base"
              min="0"
            />
          )}
        </div>

        {/* Pago */}
        <div className="bg-white rounded-dolce-lg shadow-dolce p-4">
          <h2 className="font-bold text-gray-700 mb-3">💳 Pago</h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { v: 'efectivo', label: 'Efectivo', icon: '💵' },
              { v: 'transferencia', label: 'Transfer.', icon: '🏦' },
              { v: 'tarjeta', label: 'Tarjeta', icon: '💳' },
            ].map(m => (
              <button
                key={m.v}
                type="button"
                onClick={() => setTipoPago(m.v as any)}
                className={`flex flex-col items-center py-3 rounded-dolce border-2 transition-all active:scale-95 ${
                  tipoPago === m.v
                    ? 'border-pink-deep bg-pink-50 text-pink-deep'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                <span className="text-2xl mb-1">{m.icon}</span>
                <span className="text-xs font-medium">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notas */}
        <div className="bg-white rounded-dolce-lg shadow-dolce p-4">
          <h2 className="font-bold text-gray-700 mb-3">📝 Notas</h2>
          <textarea
            value={notas}
            onChange={e => setNotas(e.target.value)}
            placeholder="Instrucciones especiales, dedicatorias..."
            className="w-full px-4 py-3 border border-gray-300 rounded-dolce focus:ring-2 focus:ring-pink-deep text-base"
            rows={2}
          />
        </div>

        {/* Resumen final */}
        <div className="bg-white rounded-dolce-lg shadow-dolce p-4">
          <h2 className="font-bold text-gray-700 mb-3">🧾 Resumen</h2>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Envío</span>
              <span>{envioGratis ? 'Gratis' : `$${costoEnvio.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-bold text-base text-gray-800 pt-2 border-t border-gray-200 mt-2">
              <span>Total</span>
              <span className="text-pink-deep">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Botón confirmar fijo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <button
          onClick={confirmarPedido}
          disabled={!nombre || !telefono || saving}
          className="w-full py-4 bg-gradient-to-r from-pink-seli to-pink-deep text-white font-bold text-lg rounded-dolce active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? '⏳ Guardando...' : `✅ Confirmar Pedido · $${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  );

  // ============================================
  // PANTALLA PRINCIPAL: CATÁLOGO + CARRITO
  // ============================================

  const hayItems = carrito.length > 0;

  return (
    <div className="min-h-screen bg-cream-dolce">

      {/* HEADER */}
      <div className="bg-white shadow-sm px-4 py-3 sticky top-0 z-20">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div>
            <h1 className="font-bold text-gray-800 text-lg leading-tight">🍓 Dolce Seli</h1>
            <p className="text-xs text-gray-500">Nuevo pedido</p>
          </div>
          {hayItems && (
            <div className="flex items-center gap-2">
              <span className="bg-pink-deep text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {carrito.reduce((s, i) => s + i.cantidad, 0)}
              </span>
              <span className="font-bold text-gray-800">${subtotal.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto pb-40">

        {/* SECCIÓN: PRODUCTOS INDIVIDUALES */}
        <div className="px-4 pt-5">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
            🍓 Individuales
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {individuales.map(prod => (
              <button
                key={prod.id}
                type="button"
                onClick={() => agregarIndividual(prod)}
                className="bg-white rounded-dolce-lg shadow-dolce p-4 text-left active:scale-95 transition-all hover:shadow-dolce-hover border-2 border-transparent hover:border-pink-seli"
              >
                <div className="text-3xl mb-2">{prod.emoji || '🍓'}</div>
                <p className="font-bold text-gray-800 text-sm leading-tight">{prod.nombre}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{prod.descripcion}</p>
                <p className="text-pink-deep font-bold mt-2">${prod.precio}</p>
                <p className="text-xs text-gray-400">
                  {prod.toppingsIncluidos} topping{prod.toppingsIncluidos !== 1 ? 's' : ''} incluido{prod.toppingsIncluidos !== 1 ? 's' : ''}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* SECCIÓN: PAQUETES */}
        {paquetes.length > 0 && (
          <div className="px-4 pt-6">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              💝 Paquetes
            </h2>
            <div className="space-y-3">
              {paquetes.map(paq => (
                <button
                  key={paq.id}
                  type="button"
                  onClick={() => agregarPaquete(paq)}
                  className="w-full bg-white rounded-dolce-lg shadow-dolce p-4 text-left active:scale-95 transition-all hover:shadow-dolce-hover border-2 border-transparent hover:border-pink-seli"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">💝</span>
                        <p className="font-bold text-gray-800">{paq.nombre}</p>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{paq.descripcion}</p>
                      <div className="flex flex-wrap gap-1">
                        {paq.productosIncluidos.map((item, i) => {
                          const prod = individuales.find(p => p.id === item.productoId);
                          return (
                            <span key={i} className="text-xs bg-pink-50 text-pink-deep px-2 py-0.5 rounded-full">
                              {item.cantidad}× {prod?.nombre || 'Producto'}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div className="text-right ml-3">
                      <p className="text-pink-deep font-bold text-lg">${paq.precio}</p>
                      <p className="text-xs text-gray-400">
                        {paq.toppingsIncluidos} topping{paq.toppingsIncluidos !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CARRITO */}
        {hayItems && (
          <div className="px-4 pt-6">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              🛒 Carrito
            </h2>
            <div className="space-y-3">
              {carrito.map((item) => {
                const costoExtra = calcularCostoToppingsExtras(item);
                const subtotalItem = calcularSubtotalItem(item);

                return (
                  <div key={item.id} className="bg-white rounded-dolce-lg shadow-dolce p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{item.emoji || (item.tipo === 'paquete' ? '💝' : '🍓')}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-sm">{item.nombre}</p>

                        {/* Toppings del individual */}
                        {item.tipo === 'individual' && item.toppings.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.toppings.map((t, i) => (
                              <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${
                                i < item.toppingsIncluidos
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-pink-100 text-pink-700'
                              }`}>
                                {t.emoji} {t.nombre}
                                {i >= item.toppingsIncluidos && ' +$5'}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Toppings por componente del paquete */}
                        {item.tipo === 'paquete' && item.componentesPaquete?.map((comp, ci) => (
                          comp.toppings.length > 0 && (
                            <div key={ci} className="mt-1">
                              <p className="text-xs text-gray-400">{comp.nombre}:</p>
                              <div className="flex flex-wrap gap-1">
                                {comp.toppings.map((t, ti) => (
                                  <span key={ti} className={`text-xs px-2 py-0.5 rounded-full ${
                                    ti < comp.toppingsIncluidos
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-pink-100 text-pink-700'
                                  }`}>
                                    {t.emoji} {t.nombre}
                                    {ti >= comp.toppingsIncluidos && ' +$5'}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )
                        ))}

                        {costoExtra > 0 && (
                          <p className="text-xs text-pink-deep mt-1">+${costoExtra} toppings extra</p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => eliminarDelCarrito(item.id)}
                          className="text-red-400 hover:text-red-600 p-1 rounded active:scale-95"
                        >
                          ✕
                        </button>
                        <p className="font-bold text-gray-800 text-sm">${subtotalItem.toFixed(2)}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => cambiarCantidad(item.id, -1)}
                            className="w-7 h-7 bg-gray-100 rounded-lg font-bold text-gray-700 active:scale-95 transition-all"
                          >
                            −
                          </button>
                          <span className="font-bold text-gray-800 w-5 text-center">{item.cantidad}</span>
                          <button
                            onClick={() => cambiarCantidad(item.id, 1)}
                            className="w-7 h-7 bg-gray-100 rounded-lg font-bold text-gray-700 active:scale-95 transition-all"
                          >
                            +
                          </button>
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

      {/* BOTÓN CHECKOUT FIJO */}
      {hayItems && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-20">
          <button
            onClick={() => setPaso('cliente')}
            className="w-full py-4 bg-gradient-to-r from-pink-seli to-pink-deep text-white font-bold text-lg rounded-dolce active:scale-95 transition-all shadow-dolce-hover"
          >
            Continuar · ${total.toFixed(2)} →
          </button>
        </div>
      )}
    </div>
  );
}