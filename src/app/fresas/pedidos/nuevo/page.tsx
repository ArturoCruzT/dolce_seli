'use client';

// ─────────────────────────────────────────────────────────────────────────────
// src/app/fresas/pedidos/nuevo/page.tsx  –  Nuevo Pedido · Dolce Seli
// ─────────────────────────────────────────────────────────────────────────────
// • Productos y toppings desde Supabase
// • 1 topping incluido, toppings extra +$5 c/u (acumulables)
// • Fecha y hora de entrega opcional (programar)
// • Dark theme Dolce Seli
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// ══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ══════════════════════════════════════════════════════════════════════════════

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

// Slot de toppings por producto/componente:
// Los primeros `toppingsIncluidos` son gratis, los demás cuestan EXTRA_PRECIO
interface SlotToppings {
  productoId: string;
  nombre: string;       // nombre del sub-producto (para paquetes)
  emoji?: string;
  toppingsIncluidos: number;
  toppings: Topping[];  // lista acumulable — el orden importa para calcular extras
}

interface ItemCarrito {
  uid: string;
  tipo: 'individual' | 'paquete';
  productoId: string;
  nombre: string;
  precio: number;
  cantidad: number;
  emoji?: string;
  toppingsIncluidos: number;
  // Individual: un SlotToppings por unidad  [cantidad]
  slotsPorUnidad: SlotToppings[];
  // Paquete:     un SlotToppings por componente × unidad  [cantidad][componentes]
  slotsPorComponente: SlotToppings[][];
  componentesBase: SlotToppings[];   // plantilla para nuevas unidades
}

type Paso = 'catalogo' | 'toppings' | 'cliente' | 'confirmar';

// ══════════════════════════════════════════════════════════════════════════════
// PALETA
// ══════════════════════════════════════════════════════════════════════════════

const DS = {
  rosa:      '#E85D75',
  rosaLight: '#F7A8B8',
  bg:        '#0b0b0c',
  surface:   'rgba(255,255,255,0.04)',
  border:    'rgba(247,168,184,0.15)',
  text:      '#ffffff',
  textMuted: 'rgba(255,255,255,0.5)',
  textFaint: 'rgba(255,255,255,0.25)',
} as const;

const EXTRA_PRECIO = 5;
const uid = () => Math.random().toString(36).slice(2, 9);

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS DE CÁLCULO
// ══════════════════════════════════════════════════════════════════════════════

const extrasSlot = (slot: SlotToppings): number =>
  Math.max(0, slot.toppings.length - slot.toppingsIncluidos) * EXTRA_PRECIO;

const calcExtrasItem = (item: ItemCarrito): number => {
  if (item.tipo === 'individual')
    return item.slotsPorUnidad.reduce((s, slot) => s + extrasSlot(slot), 0);
  return item.slotsPorComponente.flat().reduce((s, slot) => s + extrasSlot(slot), 0);
};

const calcSubtotalItem = (item: ItemCarrito): number =>
  (item.precio + calcExtrasItem(item) / item.cantidad) * item.cantidad;
// ^^ extras ya están sumados por todas las unidades dentro de los slots

const calcTotal = (carrito: ItemCarrito[]): number =>
  carrito.reduce((s, i) => s + calcSubtotalItem(i), 0);

// ──────────────────────────────────────────────────────────────────────────────
// Crea un SlotToppings vacío para un producto individual
const slotVacio = (prod: Producto): SlotToppings => ({
  productoId: prod.id,
  nombre: prod.nombre,
  emoji: prod.emoji,
  toppingsIncluidos: prod.toppings_incluidos,
  toppings: [],
});

// Crea un SlotToppings vacío para un componente de paquete
const slotVacioComp = (sub: Producto): SlotToppings => ({
  productoId: sub.id,
  nombre: sub.nombre,
  emoji: sub.emoji,
  toppingsIncluidos: sub.toppings_incluidos,
  toppings: [],
});

// Construye la lista de componentes base de un paquete
const buildComponentesBase = (paq: Producto, individuales: Producto[]): SlotToppings[] => {
  const productosIncluidos = (paq.productos_incluidos || []) as { productoId: string; cantidad: number }[];
  return productosIncluidos.flatMap((pi) => {
    const sub = individuales.find((p) => p.id === pi.productoId);
    return Array.from({ length: pi.cantidad }, () =>
      sub ? slotVacioComp(sub) : { productoId: pi.productoId, nombre: 'Producto', emoji: '🍓', toppingsIncluidos: 1, toppings: [] }
    );
  });
};

// Crea un ItemCarrito desde un producto
const crearItem = (prod: Producto, individuales: Producto[], cantidad = 1): ItemCarrito => {
  if (prod.tipo === 'individual') {
    return {
      uid: uid(), tipo: 'individual',
      productoId: prod.id, nombre: prod.nombre,
      precio: prod.precio, cantidad, emoji: prod.emoji,
      toppingsIncluidos: prod.toppings_incluidos,
      slotsPorUnidad: Array.from({ length: cantidad }, () => slotVacio(prod)),
      slotsPorComponente: [],
      componentesBase: [],
    };
  }
  const base = buildComponentesBase(prod, individuales);
  return {
    uid: uid(), tipo: 'paquete',
    productoId: prod.id, nombre: prod.nombre,
    precio: prod.precio, cantidad, emoji: prod.emoji,
    toppingsIncluidos: prod.toppings_incluidos,
    slotsPorUnidad: [],
    componentesBase: base,
    slotsPorComponente: Array.from({ length: cantidad }, () =>
      base.map((b) => ({ ...b, toppings: [] }))
    ),
  };
};

// Redimensiona slots al cambiar cantidad
const resizeItem = (item: ItemCarrito, n: number): ItemCarrito => {
  if (item.tipo === 'individual') {
    const slots = [...item.slotsPorUnidad];
    while (slots.length < n) slots.push({ ...slots[0] || { productoId: item.productoId, nombre: item.nombre, emoji: item.emoji, toppingsIncluidos: item.toppingsIncluidos }, toppings: [] });
    return { ...item, cantidad: n, slotsPorUnidad: slots.slice(0, n) };
  }
  const slots = [...item.slotsPorComponente];
  while (slots.length < n) slots.push(item.componentesBase.map((b) => ({ ...b, toppings: [] })));
  return { ...item, cantidad: n, slotsPorComponente: slots.slice(0, n) };
};

// ══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTE: SELECTOR DE TOPPINGS (multi-select acumulable)
// ══════════════════════════════════════════════════════════════════════════════

function ToppingMultiPicker({
  label,
  slot,
  toppings,
  onChange,
}: {
  label: string;
  slot: SlotToppings;
  toppings: Topping[];
  onChange: (slot: SlotToppings) => void;
}) {
  const selectedIds = slot.toppings.map((t) => t.id);
  const extras = Math.max(0, slot.toppings.length - slot.toppingsIncluidos);

  const toggle = (t: Topping) => {
    const existe = selectedIds.includes(t.id);
    const next = existe
      ? slot.toppings.filter((x) => x.id !== t.id)
      : [...slot.toppings, t];
    onChange({ ...slot, toppings: next });
  };

  return (
    <div style={{ marginBottom: '0.9rem' }}>
      {/* Label + contadores */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <p style={{ fontSize: '0.72rem', color: DS.textMuted, fontWeight: 600, letterSpacing: '0.3px' }}>
          {slot.emoji ? `${slot.emoji} ` : ''}{label}
        </p>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.62rem', color: DS.textFaint, background: 'rgba(255,255,255,0.06)', padding: '0.12rem 0.5rem', borderRadius: 100 }}>
            {slot.toppingsIncluidos} incl.
          </span>
          {extras > 0 && (
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#fbbf24', background: 'rgba(251,191,36,0.12)', padding: '0.12rem 0.5rem', borderRadius: 100, border: '1px solid rgba(251,191,36,0.25)' }}>
              +${extras * EXTRA_PRECIO}
            </span>
          )}
        </div>
      </div>

      {/* Chips de toppings */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
        {toppings.map((t, idx) => {
          const sel = selectedIds.includes(t.id);
          const posicion = slot.toppings.findIndex((x) => x.id === t.id);
          const esExtra = sel && posicion >= slot.toppingsIncluidos;

          return (
            <button
              key={t.id}
              onClick={() => toggle(t)}
              style={{
                padding: '0.3rem 0.75rem', borderRadius: 100, fontSize: '0.72rem',
                fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                border: `1px solid ${
                  esExtra ? 'rgba(251,191,36,0.5)' :
                  sel     ? DS.rosa :
                            'rgba(255,255,255,0.1)'
                }`,
                background: esExtra ? 'rgba(251,191,36,0.12)' :
                            sel     ? 'rgba(232,93,117,0.18)' :
                                      'transparent',
                color: esExtra ? '#fbbf24' :
                       sel     ? DS.rosaLight :
                                 DS.textMuted,
              }}
            >
              {t.emoji ? `${t.emoji} ` : ''}{t.nombre}
              {esExtra && <span style={{ marginLeft: 3, fontSize: '0.62rem' }}>+$5</span>}
            </button>
          );
        })}
      </div>

      {/* Hint cuando hay toppings seleccionados */}
      {slot.toppings.length > 0 && (
        <p style={{ fontSize: '0.62rem', color: DS.textFaint, marginTop: '0.3rem' }}>
          {slot.toppings.length} seleccionado{slot.toppings.length !== 1 ? 's' : ''}
          {extras > 0 ? ` · ${extras} extra${extras !== 1 ? 's' : ''}` : ' · todos incluidos ✓'}
        </p>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTE: CARD DE ITEM EN CARRITO
// ══════════════════════════════════════════════════════════════════════════════

function CartItemCard({
  item, toppings, onChange, onRemove,
}: {
  item: ItemCarrito;
  toppings: Topping[];
  onChange: (u: ItemCarrito) => void;
  onRemove: () => void;
}) {
  const setCantidad = (n: number) => { if (n >= 1) onChange(resizeItem(item, n)); };

  const setSlotUnidad = (idx: number, slot: SlotToppings) => {
    const next = [...item.slotsPorUnidad];
    next[idx] = slot;
    onChange({ ...item, slotsPorUnidad: next });
  };

  const setSlotComp = (ui: number, ci: number, slot: SlotToppings) => {
    const next = item.slotsPorComponente.map((unidad, u) =>
      u !== ui ? unidad : unidad.map((s, c) => (c !== ci ? s : slot))
    );
    onChange({ ...item, slotsPorComponente: next });
  };

  const extras = calcExtrasItem(item);

  return (
    <div style={{ background: DS.surface, border: `1px solid ${DS.border}`, borderRadius: 16, overflow: 'hidden', marginBottom: '0.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(247,168,184,0.04)', borderBottom: `1px solid ${DS.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {item.emoji && <span style={{ fontSize: '1.4rem' }}>{item.emoji}</span>}
          <div>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: DS.text }}>{item.nombre}</p>
            <p style={{ fontSize: '0.68rem', color: DS.textMuted }}>
              ${item.precio} c/u
              {extras > 0 && <span style={{ color: '#fbbf24', marginLeft: 4 }}>+${extras} extras</span>}
              {' · '}subtotal <span style={{ color: DS.rosaLight, fontWeight: 700 }}>${calcSubtotalItem(item).toFixed(0)}</span>
            </p>
          </div>
        </div>

        {/* Stepper + eliminar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', background: 'rgba(0,0,0,0.35)', borderRadius: 100, padding: '0.12rem', border: `1px solid ${DS.border}` }}>
            <button onClick={() => setCantidad(item.cantidad - 1)}
              style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: 'none', color: DS.text, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: DS.text, minWidth: 18, textAlign: 'center' }}>{item.cantidad}</span>
            <button onClick={() => setCantidad(item.cantidad + 1)}
              style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(232,93,117,0.2)', border: 'none', color: DS.rosaLight, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          </div>
          <button onClick={onRemove}
            style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>✕</button>
        </div>
      </div>

      {/* Toppings */}
      <div style={{ padding: '0.85rem 1rem' }}>
        {item.tipo === 'individual'
          ? item.slotsPorUnidad.map((slot, idx) => (
              <ToppingMultiPicker
                key={idx}
                label={item.cantidad > 1 ? `Unidad ${idx + 1}` : 'Toppings'}
                slot={slot}
                toppings={toppings}
                onChange={(s) => setSlotUnidad(idx, s)}
              />
            ))
          : item.slotsPorComponente.map((comps, ui) => (
              <div key={ui} style={{ marginBottom: ui < item.cantidad - 1 ? '1rem' : 0 }}>
                {item.cantidad > 1 && (
                  <p style={{ fontSize: '0.62rem', color: DS.rosa, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    — Paquete {ui + 1} —
                  </p>
                )}
                {comps.map((slot, ci) => (
                  <ToppingMultiPicker
                    key={ci}
                    label={slot.nombre}
                    slot={slot}
                    toppings={toppings}
                    onChange={(s) => setSlotComp(ui, ci, s)}
                  />
                ))}
              </div>
            ))
        }
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ESTILOS REUTILIZABLES
// ══════════════════════════════════════════════════════════════════════════════

const inputStyle: React.CSSProperties = {
  width: '100%', background: DS.surface, border: `1px solid ${DS.border}`,
  borderRadius: 12, padding: '0.75rem 1rem', color: DS.text,
  fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  fontSize: '0.7rem', color: DS.textMuted, fontWeight: 600,
  letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'block',
};
const btnPrimary: React.CSSProperties = {
  padding: '0.85rem', background: 'linear-gradient(135deg,#E85D75,#c0304a)',
  border: 'none', borderRadius: 100, color: '#fff',
  fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer',
  boxShadow: '0 6px 20px rgba(232,93,117,0.35)',
};
const btnSecondary: React.CSSProperties = {
  padding: '0.85rem', background: 'transparent',
  border: `1px solid ${DS.border}`, borderRadius: 100,
  color: DS.textMuted, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
};

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════

export default function NuevoPedidoPage() {
  const router = useRouter();

  // ── Carga de datos ─────────────────────────────────────────────────────────
  const [loadingDatos, setLoadingDatos] = useState(true);
  const [individuales, setIndividuales] = useState<Producto[]>([]);
  const [paquetes,     setPaquetes]     = useState<Producto[]>([]);
  const [toppings,     setToppings]     = useState<Topping[]>([]);

  // ── Flujo ──────────────────────────────────────────────────────────────────
  const [paso,     setPaso]     = useState<Paso>('catalogo');
  const [carrito,  setCarrito]  = useState<ItemCarrito[]>([]);
  const [guardando,setGuardando]= useState(false);
  const [error,    setError]    = useState<string | null>(null);

  // ── Datos cliente ──────────────────────────────────────────────────────────
  const [cliente,     setCliente]     = useState('');
  const [telefono,    setTelefono]    = useState('');
  const [direccion,   setDireccion]   = useState('');
  const [linkMaps,    setLinkMaps]    = useState('');
  const [programar,   setProgramar]   = useState(false);
  const [fechaEntrega,setFechaEntrega]= useState('');
  const [horaEntrega, setHoraEntrega] = useState('');
  const [costoEnvio,  setCostoEnvio]  = useState(0);
  const [envioGratis, setEnvioGratis] = useState(false);
  const [tipoPago,    setTipoPago]    = useState<'efectivo' | 'transferencia' | 'tarjeta'>('efectivo');
  const [notas,       setNotas]       = useState('');

  // ── Cargar BD ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: prods }, { data: tops }] = await Promise.all([
          supabase.from('productos').select('*').eq('activo', true).order('created_at', { ascending: true }),
          supabase.from('toppings').select('*').eq('activo', true).order('nombre', { ascending: true }),
        ]);
        const todos = (prods || []) as Producto[];
        setIndividuales(todos.filter((p) => p.tipo === 'individual'));
        setPaquetes(todos.filter((p) => p.tipo === 'paquete'));
        setToppings((tops || []) as Topping[]);
        console.log('✅ Datos cargados:', todos.length, 'productos,', (tops||[]).length, 'toppings');
      } catch (err) {
        console.error('❌ Error al cargar datos:', err);
      } finally {
        setLoadingDatos(false);
      }
    };
    load();
  }, []);

  // ── Cálculos ───────────────────────────────────────────────────────────────
  const envio    = envioGratis ? 0 : costoEnvio;
  const subtotal = useMemo(() => calcTotal(carrito), [carrito]);
  const total    = subtotal + envio;
  const totalUnidades = carrito.reduce((s, i) => s + i.cantidad, 0);
  const hayItems = carrito.length > 0;

  // Hora de entrega combinada (para guardar)
  const horaEntregaFinal = programar && fechaEntrega
    ? `${fechaEntrega}${horaEntrega ? ' ' + horaEntrega : ''}`
    : '';

  // ── Carrito ────────────────────────────────────────────────────────────────
  const agregarProducto = useCallback((prod: Producto) => {
    setCarrito((prev) => {
      const existing = prev.find((i) => i.productoId === prod.id);
      if (existing) return prev.map((i) => i.uid === existing.uid ? resizeItem(i, i.cantidad + 1) : i);
      return [...prev, crearItem(prod, individuales, 1)];
    });
  }, [individuales]);

  const updateItem = useCallback((itemUid: string, updated: ItemCarrito) => {
    setCarrito((prev) => prev.map((i) => i.uid === itemUid ? updated : i));
  }, []);

  const removeItem = useCallback((itemUid: string) => {
    setCarrito((prev) => prev.filter((i) => i.uid !== itemUid));
  }, []);

  // ── Confirmar ──────────────────────────────────────────────────────────────
  const confirmar = async () => {
    if (!cliente.trim()) { setError('El nombre del cliente es requerido'); return; }
    setGuardando(true);
    setError(null);
    try {
      // Tipos explícitos para evitar que TS infiera never[] en toppingsPorItem
      type ToppingPayload = { toppingId: string; toppingNombre: string; esExtra: boolean };
      type ToppingPorItem = { itemIndex: number; nombreComponente: string; toppings: ToppingPayload[] };
      type ItemPayload = {
        tipo: 'individual' | 'paquete';
        productoId: string;
        productoNombre: string;
        precioUnitario: number;
        cantidad: number;
        toppingsSeleccionados: ToppingPayload[];
        toppingsPorItem: ToppingPorItem[];
      };

      const items: ItemPayload[] = carrito.flatMap((item) => {
        const base = {
          tipo: item.tipo as 'individual' | 'paquete',
          productoId: item.productoId,
          productoNombre: item.nombre,
          precioUnitario: item.precio,
        };

        if (item.tipo === 'individual') {
          return item.slotsPorUnidad.map((slot): ItemPayload => ({
            ...base, cantidad: 1,
            toppingsSeleccionados: slot.toppings.map((t, i) => ({
              toppingId: t.id,
              toppingNombre: t.nombre,
              esExtra: i >= slot.toppingsIncluidos,
            })),
            toppingsPorItem: [] as ToppingPorItem[],
          }));
        } else {
          return item.slotsPorComponente.map((comps): ItemPayload => ({
            ...base, cantidad: 1,
            toppingsSeleccionados: [] as ToppingPayload[],
            toppingsPorItem: comps.map((comp, ci) => ({
              itemIndex: ci,
              nombreComponente: comp.nombre,
              toppings: comp.toppings.map((t, i) => ({
                toppingId: t.id,
                toppingNombre: t.nombre,
                esExtra: i >= comp.toppingsIncluidos,
              })),
            })),
          }));
        }
      });

      const { error: dbError } = await supabase.from('pedidos').insert([{
        cliente:      cliente.trim(),
        telefono:     telefono.trim()    || null,
        direccion:    direccion.trim()   || null,
        link_maps:    linkMaps.trim()    || null,
        hora_entrega: horaEntregaFinal   || null,
        tipo_pago:    tipoPago,
        notas:        notas.trim()       || null,
        total,
        items,
        estado: 'pendiente',
      }]);

      if (dbError) throw dbError;
      console.log('✅ Pedido creado exitosamente, total:', total);
      router.push('/fresas/pedidos');
    } catch (e: any) {
      setError(e?.message ?? 'Error al guardar el pedido');
      setGuardando(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // LOADING
  // ══════════════════════════════════════════════════════════════════════════

  if (loadingDatos) return (
    <div style={{ minHeight: '100vh', background: DS.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Poppins',sans-serif" }}>
      <div style={{ fontSize: '4rem', animation: 'bounce 1s infinite' }}>🍓</div>
      <p style={{ color: DS.textMuted, marginTop: '1rem' }}>Cargando catálogo...</p>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}`}</style>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <div style={{ minHeight: '100vh', background: DS.bg, color: DS.text, fontFamily: "'Poppins',sans-serif" }}>

      {/* Fondo */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0.55,
        background: 'radial-gradient(900px 520px at 55% 10%,rgba(232,93,117,0.18),transparent 60%),radial-gradient(700px 520px at 85% 85%,rgba(168,85,247,0.08),transparent 60%)' }} />

      {/* ── HEADER ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(11,11,12,0.93)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${DS.border}` }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '0.75rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <button
              onClick={() => paso === 'catalogo' ? router.back() : setPaso(paso === 'toppings' ? 'catalogo' : paso === 'cliente' ? 'toppings' : 'cliente')}
              style={{ background: 'transparent', border: 'none', color: DS.textMuted, fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}
            >
              ← {paso === 'catalogo' ? 'Volver' : 'Atrás'}
            </button>
            <h1 style={{ fontSize: '0.95rem', fontWeight: 800, color: DS.text }}>🍓 Nuevo Pedido</h1>
            {hayItems
              ? <span style={{ fontSize: '0.82rem', fontWeight: 700, color: DS.rosaLight }}>${total.toFixed(0)}</span>
              : <span style={{ width: 48 }} />
            }
          </div>
          {/* Steps */}
          <div style={{ display: 'flex' }}>
            {(['catalogo', 'toppings', 'cliente', 'confirmar'] as Paso[]).map((p, idx) => {
              const pasos: Paso[] = ['catalogo','toppings','cliente','confirmar'];
              const active = paso === p;
              const done   = pasos.indexOf(paso) > idx;
              return (
                <div key={p} style={{ flex: 1, textAlign: 'center', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase', paddingBottom: '0.45rem', borderBottom: `2px solid ${active ? DS.rosa : done ? 'rgba(247,168,184,0.3)' : 'transparent'}`, color: active ? DS.rosaLight : done ? 'rgba(247,168,184,0.45)' : DS.textFaint, transition: 'all 0.2s' }}>
                  {idx + 1} {p === 'catalogo' ? 'Productos' : p === 'toppings' ? 'Toppings' : p === 'cliente' ? 'Cliente' : 'Confirmar'}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '1rem', position: 'relative' }}>

        {/* ══════════════════════════════════════════════════
            PASO 1 — CATÁLOGO
        ══════════════════════════════════════════════════ */}
        {paso === 'catalogo' && (
          <div>
            {individuales.length === 0 && paquetes.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: DS.textMuted }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🍓</div>
                <p style={{ fontWeight: 600 }}>No hay productos activos</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.35rem', color: DS.textFaint }}>Agrega productos desde el panel admin</p>
              </div>
            )}

            {/* Paquetes */}
            {paquetes.length > 0 && (
              <>
                <p style={{ fontSize: '0.63rem', color: DS.rosa, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.6rem' }}>💝 Paquetes</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.4rem' }}>
                  {paquetes.map((paq) => {
                    const productosIncluidos = (paq.productos_incluidos || []) as { productoId: string; cantidad: number }[];
                    const enCarrito = carrito.find((i) => i.productoId === paq.id);
                    return (
                      <button key={paq.id} onClick={() => agregarProducto(paq)}
                        style={{ background: enCarrito ? 'rgba(232,93,117,0.10)' : DS.surface, border: `1.5px solid ${enCarrito ? DS.rosa : DS.border}`, borderRadius: 16, padding: '0.85rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', transition: 'all 0.15s', textAlign: 'left' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          {paq.emoji && <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{paq.emoji}</span>}
                          <div>
                            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: DS.text }}>{paq.nombre}</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.2rem' }}>
                              {productosIncluidos.map((pi, i) => {
                                const prod = individuales.find((p) => p.id === pi.productoId);
                                return (
                                  <span key={i} style={{ fontSize: '0.63rem', background: 'rgba(247,168,184,0.12)', color: DS.rosaLight, padding: '0.12rem 0.5rem', borderRadius: 100, fontWeight: 600 }}>
                                    {pi.cantidad}× {prod?.nombre || 'Producto'}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ fontSize: '1.1rem', fontWeight: 800, color: DS.rosaLight }}>${paq.precio}</p>
                          {enCarrito && <span style={{ fontSize: '0.63rem', background: DS.rosa, color: '#fff', borderRadius: 100, padding: '0.08rem 0.4rem', fontWeight: 700 }}>×{enCarrito.cantidad}</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Individuales */}
            {individuales.length > 0 && (
              <>
                <p style={{ fontSize: '0.63rem', color: DS.rosa, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.6rem' }}>🍓 Individuales</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(148px,1fr))', gap: '0.5rem', marginBottom: '1.4rem' }}>
                  {individuales.map((prod) => {
                    const enCarrito = carrito.find((i) => i.productoId === prod.id);
                    return (
                      <button key={prod.id} onClick={() => agregarProducto(prod)}
                        style={{ background: enCarrito ? 'rgba(232,93,117,0.12)' : DS.surface, border: `1.5px solid ${enCarrito ? DS.rosa : DS.border}`, borderRadius: 16, padding: '0.85rem 0.75rem', cursor: 'pointer', textAlign: 'left', position: 'relative', transition: 'all 0.15s' }}
                      >
                        {enCarrito && (
                          <span style={{ position: 'absolute', top: 8, right: 8, background: DS.rosa, color: '#fff', borderRadius: '50%', width: 20, height: 20, fontSize: '0.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {enCarrito.cantidad}
                          </span>
                        )}
                        {prod.emoji && <span style={{ fontSize: '1.75rem', display: 'block', marginBottom: '0.3rem' }}>{prod.emoji}</span>}
                        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: DS.text, marginBottom: '0.1rem' }}>{prod.nombre}</p>
                        {prod.descripcion && <p style={{ fontSize: '0.67rem', color: DS.textFaint, marginBottom: '0.2rem', lineHeight: 1.4 }}>{prod.descripcion}</p>}
                        <p style={{ fontSize: '0.82rem', color: DS.rosaLight, fontWeight: 800 }}>${prod.precio}</p>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* CTA sticky */}
            {hayItems && (
              <div style={{ position: 'sticky', bottom: 0, padding: '1rem 0', background: `linear-gradient(to top,${DS.bg} 65%,transparent)` }}>
                <button onClick={() => setPaso('toppings')}
                  style={{ ...btnPrimary, width: '100%', padding: '1rem', fontSize: '0.95rem', boxShadow: '0 8px 30px rgba(232,93,117,0.4)' }}>
                  Elegir toppings · {totalUnidades} producto{totalUnidades !== 1 ? 's' : ''} · ${subtotal.toFixed(0)}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            PASO 2 — TOPPINGS
        ══════════════════════════════════════════════════ */}
        {paso === 'toppings' && (
          <div>
            {/* Leyenda */}
            <div style={{ background: 'rgba(247,168,184,0.06)', border: `1px solid ${DS.border}`, borderRadius: 12, padding: '0.65rem 0.9rem', marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', color: DS.textMuted }}>
                <span style={{ color: DS.rosaLight, fontWeight: 700 }}>✓ Rosa</span> = incluido
              </span>
              <span style={{ fontSize: '0.72rem', color: DS.textMuted }}>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>★ Amarillo</span> = extra +$5 c/u
              </span>
              <span style={{ fontSize: '0.72rem', color: DS.textFaint }}>Puedes seleccionar varios</span>
            </div>

            {carrito.map((item) => (
              <CartItemCard
                key={item.uid}
                item={item}
                toppings={toppings}
                onChange={(u) => updateItem(item.uid, u)}
                onRemove={() => removeItem(item.uid)}
              />
            ))}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button onClick={() => setPaso('catalogo')} style={{ ...btnSecondary, flex: 1 }}>← Productos</button>
              <button onClick={() => setPaso('cliente')} style={{ ...btnPrimary, flex: 2 }}>Datos del cliente →</button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            PASO 3 — CLIENTE
        ══════════════════════════════════════════════════ */}
        {paso === 'cliente' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>

            <div>
              <label style={labelStyle}>Nombre del cliente *</label>
              <input style={inputStyle} value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Nombre completo" />
            </div>

            <div>
              <label style={labelStyle}>Teléfono</label>
              <input style={inputStyle} value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="722 000 0000" type="tel" />
            </div>

            <div>
              <label style={labelStyle}>Dirección de entrega</label>
              <input style={inputStyle} value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Calle, número, colonia..." />
            </div>

            <div>
              <label style={labelStyle}>Link de Google Maps</label>
              <input style={inputStyle} value={linkMaps} onChange={(e) => setLinkMaps(e.target.value)} placeholder="https://maps.google.com/..." />
            </div>

            {/* ── Entrega programada ── */}
            <div style={{ background: DS.surface, border: `1px solid ${DS.border}`, borderRadius: 14, padding: '0.85rem 1rem' }}>
              {/* Toggle */}
              <button
                onClick={() => setProgramar(!programar)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>📅</span>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: DS.text }}>Programar entrega</p>
                    <p style={{ fontSize: '0.68rem', color: DS.textFaint }}>Opcional — para entregas en fecha/hora específica</p>
                  </div>
                </div>
                {/* Switch visual */}
                <div style={{ width: 40, height: 22, borderRadius: 100, background: programar ? DS.rosa : 'rgba(255,255,255,0.12)', border: `1px solid ${programar ? DS.rosa : DS.border}`, position: 'relative', transition: 'all 0.2s', flexShrink: 0 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: programar ? 20 : 2, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                </div>
              </button>

              {/* Campos de fecha y hora (solo si está activo) */}
              {programar && (
                <div style={{ marginTop: '0.85rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ ...labelStyle, marginBottom: '0.25rem' }}>Fecha</label>
                    <input
                      type="date"
                      style={{ ...inputStyle, colorScheme: 'dark' }}
                      value={fechaEntrega}
                      onChange={(e) => setFechaEntrega(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, marginBottom: '0.25rem' }}>Hora <span style={{ color: DS.textFaint, fontWeight: 400, textTransform: 'none' }}>(opcional)</span></label>
                    <input
                      type="time"
                      style={{ ...inputStyle, colorScheme: 'dark' }}
                      value={horaEntrega}
                      onChange={(e) => setHoraEntrega(e.target.value)}
                    />
                  </div>
                  {fechaEntrega && (
                    <div style={{ gridColumn: '1/-1' }}>
                      <p style={{ fontSize: '0.72rem', color: DS.rosaLight, background: 'rgba(232,93,117,0.1)', border: `1px solid rgba(232,93,117,0.2)`, borderRadius: 8, padding: '0.4rem 0.7rem' }}>
                        📅 Entrega: {new Date(fechaEntrega + 'T12:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                        {horaEntrega && ` a las ${horaEntrega}`}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Envío */}
            <div>
              <label style={labelStyle}>Costo de envío</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={() => setEnvioGratis(!envioGratis)}
                  style={{ padding: '0.5rem 1rem', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0, border: `1px solid ${envioGratis ? '#4ade80' : DS.border}`, background: envioGratis ? 'rgba(74,222,128,0.12)' : 'transparent', color: envioGratis ? '#4ade80' : DS.textMuted }}
                >
                  {envioGratis ? '✓ Gratis' : 'Gratis'}
                </button>
                {!envioGratis && (
                  <input style={{ ...inputStyle, flex: 1 }} type="number" value={costoEnvio || ''} onChange={(e) => setCostoEnvio(parseFloat(e.target.value) || 0)} placeholder="$0" min="0" />
                )}
              </div>
            </div>

            {/* Tipo de pago */}
            <div>
              <label style={labelStyle}>Tipo de pago</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['efectivo', 'transferencia', 'tarjeta'] as const).map((tp) => (
                  <button key={tp} onClick={() => setTipoPago(tp)}
                    style={{ flex: 1, padding: '0.6rem', borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize', border: `1.5px solid ${tipoPago === tp ? DS.rosa : DS.border}`, background: tipoPago === tp ? 'rgba(232,93,117,0.15)' : DS.surface, color: tipoPago === tp ? DS.rosaLight : DS.textMuted, fontSize: '0.75rem', fontWeight: 600 }}>
                    {tp === 'efectivo' ? '💵' : tp === 'transferencia' ? '🏦' : '💳'} {tp}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Notas adicionales</label>
              <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 70 }} value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Instrucciones especiales..." />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              <button onClick={() => setPaso('toppings')} style={{ ...btnSecondary, flex: 1 }}>← Toppings</button>
              <button
                onClick={() => { if (cliente.trim()) { setError(null); setPaso('confirmar'); } else setError('Nombre requerido'); }}
                style={{ ...btnPrimary, flex: 2 }}
              >
                Revisar pedido →
              </button>
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', textAlign: 'center' }}>{error}</p>}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            PASO 4 — CONFIRMAR
        ══════════════════════════════════════════════════ */}
        {paso === 'confirmar' && (
          <div>
            {/* Cliente */}
            <div style={{ background: DS.surface, border: `1px solid ${DS.border}`, borderRadius: 16, padding: '1rem', marginBottom: '0.75rem' }}>
              <p style={{ fontSize: '0.6rem', color: DS.rosa, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Cliente</p>
              <p style={{ fontWeight: 700, color: DS.text, marginBottom: '0.25rem' }}>{cliente}</p>
              {telefono        && <p style={{ fontSize: '0.8rem', color: DS.textMuted }}>📞 {telefono}</p>}
              {direccion       && <p style={{ fontSize: '0.8rem', color: DS.textMuted }}>📍 {direccion}</p>}
              {horaEntregaFinal && (
                <p style={{ fontSize: '0.8rem', color: DS.rosaLight, marginTop: '0.2rem' }}>📅 {horaEntregaFinal}</p>
              )}
              <p style={{ fontSize: '0.8rem', color: DS.textMuted, marginTop: '0.2rem' }}>
                {tipoPago === 'efectivo' ? '💵' : tipoPago === 'transferencia' ? '🏦' : '💳'} {tipoPago}
              </p>
            </div>

            {/* Productos */}
            <div style={{ background: DS.surface, border: `1px solid ${DS.border}`, borderRadius: 16, padding: '1rem', marginBottom: '0.75rem' }}>
              <p style={{ fontSize: '0.6rem', color: DS.rosa, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Productos</p>
              {carrito.map((item) => (
                <div key={item.uid} style={{ marginBottom: '0.7rem', paddingBottom: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p style={{ fontWeight: 600, color: DS.text }}>{item.cantidad}× {item.emoji} {item.nombre}</p>
                    <p style={{ color: DS.rosaLight, fontWeight: 700 }}>${calcSubtotalItem(item).toFixed(0)}</p>
                  </div>
                  {/* Toppings resumen */}
                  {item.tipo === 'individual'
                    ? item.slotsPorUnidad.map((slot, i) => slot.toppings.length > 0 && (
                        <p key={i} style={{ fontSize: '0.7rem', color: DS.textMuted }}>
                          {item.cantidad > 1 ? `U${i + 1}: ` : ''}
                          {slot.toppings.map((t, ti) => (
                            <span key={t.id}>{ti > 0 ? ', ' : ''}<span style={{ color: ti >= slot.toppingsIncluidos ? '#fbbf24' : DS.textMuted }}>{t.nombre}{ti >= slot.toppingsIncluidos ? ' +$5' : ''}</span></span>
                          ))}
                        </p>
                      ))
                    : item.slotsPorComponente.map((comps, ui) => (
                        <div key={ui} style={{ marginTop: '0.15rem' }}>
                          {item.cantidad > 1 && <p style={{ fontSize: '0.6rem', color: DS.rosa }}>Paq {ui + 1}</p>}
                          {comps.map((comp, ci) => comp.toppings.length > 0 && (
                            <p key={ci} style={{ fontSize: '0.7rem', color: DS.textMuted }}>
                              {comp.nombre}: {comp.toppings.map((t, ti) => (
                                <span key={t.id}>{ti > 0 ? ', ' : ''}<span style={{ color: ti >= comp.toppingsIncluidos ? '#fbbf24' : DS.textMuted }}>{t.nombre}{ti >= comp.toppingsIncluidos ? ' +$5' : ''}</span></span>
                              ))}
                            </p>
                          ))}
                        </div>
                      ))
                  }
                </div>
              ))}
              {/* Totales */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingTop: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: DS.textMuted }}>
                  <span>Subtotal</span><span>${subtotal.toFixed(0)}</span>
                </div>
                {(envio > 0 || envioGratis) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: envioGratis ? '#4ade80' : DS.textMuted }}>
                    <span>Envío</span><span>{envioGratis ? 'Gratis ✨' : `$${envio.toFixed(0)}`}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontWeight: 700, color: DS.text }}>Total</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 900, color: DS.rosaLight }}>${total.toFixed(0)}</p>
                </div>
              </div>
            </div>

            {notas && (
              <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 12, padding: '0.65rem 0.9rem', marginBottom: '0.75rem' }}>
                <p style={{ fontSize: '0.78rem', color: '#fbbf24' }}>📝 {notas}</p>
              </div>
            )}

            {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', textAlign: 'center', marginBottom: '0.5rem' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setPaso('cliente')} style={{ ...btnSecondary, flex: 1 }}>← Editar</button>
              <button
                onClick={confirmar}
                disabled={guardando}
                style={{ ...btnPrimary, flex: 2, background: guardando ? 'rgba(232,93,117,0.4)' : 'linear-gradient(135deg,#E85D75,#c0304a)', boxShadow: guardando ? 'none' : '0 6px 20px rgba(232,93,117,0.4)', cursor: guardando ? 'wait' : 'pointer' }}
              >
                {guardando ? '⏳ Guardando…' : '✅ Confirmar pedido'}
              </button>
            </div>
          </div>
        )}

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:${DS.bg}}
        input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.2)}
        input:focus,textarea:focus{border-color:rgba(232,93,117,0.5)!important;outline:none}
        input[type=date],input[type=time]{color:rgba(255,255,255,0.85)}
        button:active{transform:scale(0.97)}
      `}</style>
    </div>
  );
}