'use client';

// ================================================================
// ARCHIVO: src/app/fresas/admin/inventario/page.tsx
// Módulo completo de inventario para Dolce Seli
// Tabs: Insumos | Compras | Recetas | Costos | Mayoreo | Movimientos
// ================================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ================================================================
// TIPOS
// ================================================================

type Unidad = 'g' | 'ml' | 'piezas' | 'kg' | 'l';
type EstadoStock = 'ok' | 'bajo' | 'critico';
type TipoMovimiento = 'compra' | 'descuento_pedido' | 'ajuste_manual' | 'venta_mayoreo' | 'merma';
type TabId = 'insumos' | 'compras' | 'recetas' | 'costos' | 'mayoreo' | 'movimientos';

interface Insumo {
  id: string;
  nombre: string;
  descripcion?: string;
  unidad: Unidad;
  stock_actual: number;
  stock_minimo: number;
  stock_critico: number;
  costo_por_unidad: number;
  proveedor?: string;
  notas?: string;
  activo: boolean;
  estado_stock: EstadoStock;
  valor_inventario: number;
}

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  tipo: string;
  emoji?: string;
}

interface RecetaItem {
  id: string;
  producto_id: string;
  insumo_id: string;
  cantidad: number;
  notas?: string;
  insumo_nombre?: string;
  insumo_unidad?: string;
  insumo_costo?: number;
}

interface Compra {
  id: string;
  insumo_id: string;
  cantidad: number;
  costo_total: number;
  costo_unitario: number;
  proveedor?: string;
  notas?: string;
  fecha_compra: string;
  created_at: string;
  insumo_nombre?: string;
  insumo_unidad?: string;
}

interface VentaMayoreo {
  id: string;
  insumo_id: string;
  cantidad: number;
  precio_venta: number;
  presentacion?: string;
  cliente_nombre?: string;
  notas?: string;
  fecha: string;
  insumo_nombre?: string;
  insumo_unidad?: string;
}

interface Movimiento {
  id: string;
  insumo_id: string;
  tipo: TipoMovimiento;
  cantidad: number;
  stock_antes: number;
  stock_despues: number;
  referencia_tipo?: string;
  notas?: string;
  created_at: string;
  insumo_nombre?: string;
  insumo_unidad?: string;
}

interface CostoProducto {
  producto_id: string;
  producto: string;
  tipo: string;
  precio_venta: number;
  costo_insumos: number;
  margen_bruto: number;
  margen_porcentaje: number;
}

interface Stats {
  total: number;
  ok: number;
  bajo: number;
  critico: number;
  valor: number;
}

// ================================================================
// CONSTANTES
// ================================================================

const UNIDADES: Unidad[] = ['g', 'ml', 'piezas', 'kg', 'l'];

const ESTADO: Record<EstadoStock, { label: string; dot: string; badge: string }> = {
  ok:      { label: 'OK',       dot: 'bg-green-500',            badge: 'bg-green-100 text-green-700' },
  bajo:    { label: 'Bajo',     dot: 'bg-amber-500',            badge: 'bg-amber-100 text-amber-700' },
  critico: { label: '¡Crítico!',dot: 'bg-red-500 animate-pulse',badge: 'bg-red-100 text-red-700' },
};

const TIPO_MOV: Record<TipoMovimiento, { label: string; color: string }> = {
  compra:           { label: 'Compra',         color: 'text-green-600' },
  descuento_pedido: { label: 'Pedido',          color: 'text-blue-600' },
  ajuste_manual:    { label: 'Ajuste manual',  color: 'text-purple-600' },
  venta_mayoreo:    { label: 'Venta mayoreo',  color: 'text-orange-600' },
  merma:            { label: 'Merma',           color: 'text-red-600' },
};

// ================================================================
// HELPERS
// ================================================================

const ic = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F7A8B8] transition-all bg-white';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

function Field({ label, required, children, className = '' }: {
  label: string; required?: boolean; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={className}>
      <label className={labelCls}>{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function fmt(n: number, decimals = 2) {
  return n.toFixed(decimals);
}

// ================================================================
// COMPONENTE PRINCIPAL
// ================================================================

export default function InventarioPage() {
  
  const [tab, setTab] = useState<TabId>('insumos');
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [costos, setCostos] = useState<CostoProducto[]>([]);
  const [ventas, setVentas] = useState<VentaMayoreo[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, ok: 0, bajo: 0, critico: 0, valor: 0 });
  const [loading, setLoading] = useState(true);

  // ── Carga de datos ──────────────────────────────────────
  const cargarTodo = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: ins },
        { data: prods },
        { data: comps },
        { data: cos },
        { data: vents },
        { data: movs },
      ] = await Promise.all([
        supabase.from('vista_insumos_stock').select('*'),
        supabase.from('productos').select('id,nombre,precio,tipo,emoji').eq('activo', true).order('nombre'),
        supabase.from('compras_insumos').select('*, insumo:insumos(nombre,unidad)').order('created_at', { ascending: false }).limit(50),
        supabase.from('vista_costo_productos').select('*'),
        supabase.from('ventas_mayoreo').select('*, insumo:insumos(nombre,unidad)').order('created_at', { ascending: false }).limit(50),
        supabase.from('movimientos_inventario').select('*, insumo:insumos(nombre,unidad)').order('created_at', { ascending: false }).limit(100),
      ]);

      const insumosData = (ins || []) as Insumo[];
      setInsumos(insumosData);
      setProductos((prods || []) as Producto[]);

      // Flatten joins
      setCompras((comps || []).map((c: any) => ({
        ...c,
        insumo_nombre: c.insumo?.nombre,
        insumo_unidad: c.insumo?.unidad,
      })));
      setCostos((cos || []) as CostoProducto[]);
      setVentas((vents || []).map((v: any) => ({
        ...v,
        insumo_nombre: v.insumo?.nombre,
        insumo_unidad: v.insumo?.unidad,
      })));
      setMovimientos((movs || []).map((m: any) => ({
        ...m,
        insumo_nombre: m.insumo?.nombre,
        insumo_unidad: m.insumo?.unidad,
      })));

      // Stats
      setStats({
        total: insumosData.length,
        ok: insumosData.filter(i => i.estado_stock === 'ok').length,
        bajo: insumosData.filter(i => i.estado_stock === 'bajo').length,
        critico: insumosData.filter(i => i.estado_stock === 'critico').length,
        valor: insumosData.reduce((s, i) => s + (i.valor_inventario || 0), 0),
      });
    } catch (e) {
      console.error('❌ Error al cargar inventario:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarTodo(); }, [cargarTodo]);

  // ── RENDER ──────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#FFF3E8] flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-3 animate-bounce">📦</div>
        <p className="text-gray-500 font-medium">Cargando inventario...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFF3E8]">
      {/* Header */}
      <div className="bg-white border-b border-[#F7A8B8]/30 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/fresas/admin" className="text-gray-400 hover:text-gray-600 text-sm">← Admin</a>
            <span className="text-gray-200">|</span>
            <div>
              <h1 className="text-lg font-bold text-[#5A3A2E]" style={{ fontFamily: 'Playfair Display, serif' }}>
                📦 Inventario
              </h1>
              <p className="text-xs text-gray-400">Control de insumos, recetas y costos</p>
            </div>
          </div>
          <button
            onClick={cargarTodo}
            className="text-xs text-[#E85D75] hover:text-[#D62839] font-medium px-3 py-1.5 rounded-lg hover:bg-[#F7A8B8]/20 transition-colors"
          >
            ↻ Actualizar
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5 space-y-5">
        {/* Stats */}
        <StatsCards stats={stats} />

        {/* Tabs */}
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm min-w-max">
            {([
              { id: 'insumos', icon: '🧪', label: 'Insumos' },
              { id: 'compras', icon: '🛒', label: 'Compras' },
              { id: 'recetas', icon: '📋', label: 'Recetas' },
              { id: 'costos', icon: '💰', label: 'Costos' },
              { id: 'mayoreo', icon: '📦', label: 'Mayoreo' },
              { id: 'movimientos', icon: '📊', label: 'Movimientos' },
            ] as const).map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                  ${tab === t.id
                    ? 'bg-[#E85D75] text-white shadow-sm'
                    : 'text-gray-500 hover:bg-[#F7A8B8]/20 hover:text-gray-700'
                  }`}
              >
                <span>{t.icon}</span>{t.label}
                {t.id === 'insumos' && stats.critico > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {stats.critico}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido por tab */}
        {tab === 'insumos' && (
          <TabInsumos insumos={insumos} onRefresh={cargarTodo} />
        )}
        {tab === 'compras' && (
          <TabCompras compras={compras} insumos={insumos} onRefresh={cargarTodo} />
        )}
        {tab === 'recetas' && (
          <TabRecetas productos={productos} insumos={insumos} onRefresh={cargarTodo} />
        )}
        {tab === 'costos' && (
          <TabCostos costos={costos} />
        )}
        {tab === 'mayoreo' && (
          <TabMayoreo ventas={ventas} insumos={insumos} onRefresh={cargarTodo} />
        )}
        {tab === 'movimientos' && (
          <TabMovimientos movimientos={movimientos} insumos={insumos} />
        )}
      </div>
    </div>
  );
}

// ================================================================
// STATS CARDS
// ================================================================

function StatsCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {[
        { label: 'Insumos',     value: stats.total,          icon: '🧪', cls: 'border-[#F7A8B8]/30',  txt: 'text-[#5A3A2E]' },
        { label: 'OK',          value: stats.ok,             icon: '✅', cls: 'border-green-200',      txt: 'text-green-700' },
        { label: 'Stock bajo',  value: stats.bajo,           icon: '⚠️', cls: 'border-amber-200',      txt: 'text-amber-700' },
        { label: 'Críticos',    value: stats.critico,        icon: '🚨', cls: 'border-red-200',        txt: 'text-red-600' },
        { label: 'Valor total', value: `$${stats.valor.toFixed(0)}`, icon: '💵', cls: 'border-[#E85D75]/20', txt: 'text-[#E85D75]' },
      ].map(c => (
        <div key={c.label} className={`bg-white border ${c.cls} rounded-2xl p-4 shadow-sm`}>
          <div className="text-xl mb-1">{c.icon}</div>
          <div className={`text-2xl font-bold ${c.txt}`}>{c.value}</div>
          <div className="text-xs text-gray-400 mt-0.5">{c.label}</div>
        </div>
      ))}
    </div>
  );
}

// ================================================================
// TAB INSUMOS
// ================================================================

function TabInsumos({ insumos, onRefresh }: { insumos: Insumo[]; onRefresh: () => void }) {
  
  const [filtro, setFiltro] = useState<'todos' | EstadoStock>('todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [ajusteId, setAjusteId] = useState<string | null>(null);
  const [ajusteVal, setAjusteVal] = useState(0);
  const [ajusteNota, setAjusteNota] = useState('');
  const [saving, setSaving] = useState(false);

  const EMPTY = {
    nombre: '', descripcion: '', unidad: 'g' as Unidad,
    stock_actual: 0, stock_minimo: 0, stock_critico: 0,
    costo_por_unidad: 0, proveedor: '', notas: '',
  };
  const [form, setForm] = useState(EMPTY);

  const lista = filtro === 'todos' ? insumos : insumos.filter(i => i.estado_stock === filtro);

  const handleSubmit = async () => {
    if (!form.nombre) return;
    setSaving(true);
    const payload = { ...form, activo: true };
    const { error } = editId
      ? await supabase.from('insumos').update(payload).eq('id', editId)
      : await supabase.from('insumos').insert([payload]);
    setSaving(false);
    if (error) { alert('Error: ' + error.message); return; }
    console.log('✅ Insumo guardado');
    setShowForm(false); setEditId(null); setForm(EMPTY); onRefresh();
  };

  const handleEdit = (i: Insumo) => {
    setForm({
      nombre: i.nombre, descripcion: i.descripcion || '',
      unidad: i.unidad, stock_actual: i.stock_actual,
      stock_minimo: i.stock_minimo, stock_critico: i.stock_critico,
      costo_por_unidad: i.costo_por_unidad,
      proveedor: i.proveedor || '', notas: i.notas || '',
    });
    setEditId(i.id); setShowForm(true);
  };

  const handleAjuste = async (insumoId: string) => {
    setSaving(true);
    const insumo = insumos.find(i => i.id === insumoId)!;
    const diff = ajusteVal - insumo.stock_actual;

    await supabase.from('insumos')
      .update({ stock_actual: ajusteVal }).eq('id', insumoId);

    await supabase.from('movimientos_inventario').insert([{
      insumo_id: insumoId, tipo: 'ajuste_manual',
      cantidad: diff, stock_antes: insumo.stock_actual,
      stock_despues: ajusteVal, referencia_tipo: 'ajuste', notas: ajusteNota || 'Ajuste manual',
    }]);

    setSaving(false);
    setAjusteId(null); setAjusteNota('');
    console.log('✅ Stock ajustado:', ajusteVal);
    onRefresh();
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Desactivar "${nombre}"? No se eliminará, solo se ocultará.`)) return;
    await supabase.from('insumos').update({ activo: false }).eq('id', id);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {(['todos', 'ok', 'bajo', 'critico'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all capitalize
                ${filtro === f ? 'bg-[#E85D75] text-white' : 'bg-white text-gray-500 hover:bg-[#F7A8B8]/20'}`}
            >
              {f === 'todos' ? `🧪 Todos (${insumos.length})` :
               f === 'ok'    ? `✅ OK (${insumos.filter(i => i.estado_stock === 'ok').length})` :
               f === 'bajo'  ? `⚠️ Bajo (${insumos.filter(i => i.estado_stock === 'bajo').length})` :
               `🚨 Crítico (${insumos.filter(i => i.estado_stock === 'critico').length})`}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY); }}
          className="bg-[#E85D75] text-white text-sm px-4 py-2 rounded-xl font-medium hover:bg-[#D62839] transition-colors"
        >
          + Nuevo insumo
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#F7A8B8]/30 space-y-4">
          <h3 className="font-semibold text-[#5A3A2E]">
            {editId ? '✏️ Editar insumo' : '➕ Nuevo insumo'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Nombre" required>
              <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                placeholder="Ej: Fresas frescas" className={ic} />
            </Field>
            <Field label="Unidad">
              <select value={form.unidad} onChange={e => setForm(p => ({ ...p, unidad: e.target.value as Unidad }))} className={ic}>
                {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </Field>
            <Field label="Stock actual">
              <input type="number" min="0" step="0.001" value={form.stock_actual}
                onChange={e => setForm(p => ({ ...p, stock_actual: +e.target.value || 0 }))} className={ic} />
            </Field>
            <Field label="Stock mínimo ⚠️">
              <input type="number" min="0" step="0.001" value={form.stock_minimo}
                onChange={e => setForm(p => ({ ...p, stock_minimo: +e.target.value || 0 }))} className={ic} />
            </Field>
            <Field label="Stock crítico 🚨">
              <input type="number" min="0" step="0.001" value={form.stock_critico}
                onChange={e => setForm(p => ({ ...p, stock_critico: +e.target.value || 0 }))} className={ic} />
            </Field>
            <Field label="Costo por unidad ($)">
              <input type="number" min="0" step="0.0001" value={form.costo_por_unidad}
                onChange={e => setForm(p => ({ ...p, costo_por_unidad: +e.target.value || 0 }))} className={ic} />
            </Field>
            <Field label="Proveedor">
              <input value={form.proveedor} onChange={e => setForm(p => ({ ...p, proveedor: e.target.value }))}
                placeholder="Costco, Mercado local..." className={ic} />
            </Field>
            <Field label="Notas internas" className="sm:col-span-2">
              <textarea value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
                placeholder="Receta interna, instrucciones de manejo, consejos..." rows={2}
                className={ic + ' resize-none'} />
            </Field>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSubmit} disabled={!form.nombre || saving}
              className="bg-[#E85D75] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-[#D62839] transition-colors disabled:opacity-50">
              {saving ? 'Guardando...' : editId ? 'Guardar cambios' : 'Crear insumo'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); }}
              className="text-gray-400 px-4 py-2 rounded-xl text-sm hover:bg-gray-100 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="space-y-2">
        {lista.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-400">
            <div className="text-4xl mb-2">🧪</div>
            <p>No hay insumos{filtro !== 'todos' ? ` con estado "${filtro}"` : ''}</p>
          </div>
        )}
        {lista.map(insumo => {
          const est = ESTADO[insumo.estado_stock];
          const isOpen = expandedId === insumo.id;
          const pct = insumo.stock_minimo > 0
            ? Math.min(100, (insumo.stock_actual / (insumo.stock_minimo * 2)) * 100)
            : 100;

          return (
            <div key={insumo.id}
              className={`bg-white rounded-2xl shadow-sm border transition-all
                ${insumo.estado_stock === 'critico' ? 'border-red-200' : 'border-[#F7A8B8]/20'}`}>
              {/* Row */}
              <div className="flex items-center gap-3 p-4 cursor-pointer select-none"
                onClick={() => setExpandedId(isOpen ? null : insumo.id)}>
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${est.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[#5A3A2E] text-sm">{insumo.nombre}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${est.badge}`}>{est.label}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-[100px]">
                      <div className={`h-1.5 rounded-full transition-all ${
                        insumo.estado_stock === 'critico' ? 'bg-red-400' :
                        insumo.estado_stock === 'bajo' ? 'bg-amber-400' : 'bg-green-400'}`}
                        style={{ width: `${Math.max(2, pct)}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">
                      {fmt(insumo.stock_actual, 1)} {insumo.unidad}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-medium text-[#5A3A2E]">
                    ${fmt(insumo.costo_por_unidad, 4)}/{insumo.unidad}
                  </div>
                  <div className="text-xs text-gray-400">
                    Val: ${fmt(insumo.valor_inventario)}
                  </div>
                </div>
                <span className="text-gray-400 text-xs">{isOpen ? '▲' : '▼'}</span>
              </div>

              {/* Detalle */}
              {isOpen && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-50 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    {[
                      ['Stock actual', `${fmt(insumo.stock_actual, 1)} ${insumo.unidad}`],
                      ['Mínimo ⚠️',    `${fmt(insumo.stock_minimo, 1)} ${insumo.unidad}`],
                      ['Crítico 🚨',   `${fmt(insumo.stock_critico, 1)} ${insumo.unidad}`],
                      ['Proveedor',    insumo.proveedor || '—'],
                    ].map(([l, v]) => (
                      <div key={l}>
                        <span className="text-xs text-gray-400 block">{l}</span>
                        <span className="font-medium text-[#5A3A2E]">{v}</span>
                      </div>
                    ))}
                  </div>
                  {insumo.notas && (
                    <div className="bg-[#FFF3E8] rounded-xl p-3 text-sm text-[#5A3A2E]">
                      <span className="text-xs font-medium text-gray-400 block mb-0.5">📝 Notas internas</span>
                      {insumo.notas}
                    </div>
                  )}
                  {/* Acciones */}
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => { setAjusteId(insumo.id); setAjusteVal(insumo.stock_actual); }}
                      className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                      📊 Ajustar stock
                    </button>
                    <button onClick={() => handleEdit(insumo)}
                      className="text-xs bg-[#FFF3E8] text-[#E85D75] px-3 py-1.5 rounded-lg hover:bg-[#F7A8B8]/30 transition-colors">
                      ✏️ Editar
                    </button>
                    <button onClick={() => handleDelete(insumo.id, insumo.nombre)}
                      className="text-xs bg-red-50 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                      🗑 Desactivar
                    </button>
                  </div>
                  {/* Ajuste de stock */}
                  {ajusteId === insumo.id && (
                    <div className="bg-blue-50 rounded-xl p-3 space-y-2">
                      <p className="text-xs font-medium text-blue-700">Ajuste manual de stock</p>
                      <div className="flex gap-2 flex-wrap">
                        <input type="number" step="0.001" value={ajusteVal}
                          onChange={e => setAjusteVal(+e.target.value || 0)}
                          className="border border-blue-200 rounded-lg px-3 py-1.5 text-sm w-28 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
                        <input placeholder="Motivo del ajuste..."
                          value={ajusteNota} onChange={e => setAjusteNota(e.target.value)}
                          className="border border-blue-200 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[150px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
                        <button onClick={() => handleAjuste(insumo.id)} disabled={saving}
                          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50">
                          {saving ? '...' : 'Guardar'}
                        </button>
                        <button onClick={() => setAjusteId(null)}
                          className="text-blue-400 px-2 py-1.5 hover:bg-blue-100 rounded-lg text-sm">✕</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ================================================================
// TAB COMPRAS
// ================================================================

function TabCompras({ compras, insumos, onRefresh }: {
  compras: Compra[]; insumos: Insumo[]; onRefresh: () => void;
}) {
  
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    insumo_id: '', cantidad: 0, costo_total: 0,
    proveedor: '', notas: '', fecha_compra: today(),
  });

  const cu = form.cantidad > 0 ? form.costo_total / form.cantidad : 0;
  const insumoSel = insumos.find(i => i.id === form.insumo_id);

  const handleSubmit = async () => {
    if (!form.insumo_id || form.cantidad <= 0 || form.costo_total < 0) return;
    setSaving(true);
    const { error } = await supabase.from('compras_insumos').insert([form]);
    setSaving(false);
    if (error) { alert('Error: ' + error.message); return; }
    console.log('✅ Compra registrada');
    setForm(p => ({ ...p, insumo_id: '', cantidad: 0, costo_total: 0, notas: '' }));
    onRefresh();
  };

  return (
    <div className="space-y-5">
      {/* Formulario */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#F7A8B8]/30 space-y-4">
        <h3 className="font-semibold text-[#5A3A2E]">🛒 Registrar compra de insumo</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Insumo" required>
            <select value={form.insumo_id} onChange={e => setForm(p => ({ ...p, insumo_id: e.target.value }))} className={ic}>
              <option value="">Seleccionar...</option>
              {insumos.map(i => <option key={i.id} value={i.id}>{i.nombre} ({i.unidad})</option>)}
            </select>
          </Field>
          <Field label={`Cantidad (${insumoSel?.unidad || 'unidad'})`} required>
            <input type="number" min="0" step="0.001" value={form.cantidad || ''}
              onChange={e => setForm(p => ({ ...p, cantidad: +e.target.value || 0 }))}
              placeholder="0" className={ic} />
          </Field>
          <Field label="Costo total ($)" required>
            <input type="number" min="0" step="0.01" value={form.costo_total || ''}
              onChange={e => setForm(p => ({ ...p, costo_total: +e.target.value || 0 }))}
              placeholder="0.00" className={ic} />
          </Field>
          <Field label="Proveedor">
            <input value={form.proveedor} onChange={e => setForm(p => ({ ...p, proveedor: e.target.value }))}
              placeholder="Costco, Mercado..." className={ic} />
          </Field>
          <Field label="Fecha">
            <input type="date" value={form.fecha_compra}
              onChange={e => setForm(p => ({ ...p, fecha_compra: e.target.value }))} className={ic} />
          </Field>
          <Field label="Notas">
            <input value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
              placeholder="Opcional" className={ic} />
          </Field>
        </div>
        {cu > 0 && insumoSel && (
          <div className="bg-[#FFF3E8] rounded-xl px-4 py-2.5 text-sm text-[#5A3A2E]">
            💡 Costo unitario: <strong>${fmt(cu, 4)}</strong> / {insumoSel.unidad}
            {' '}— el costo del insumo se actualizará automáticamente
          </div>
        )}
        <button onClick={handleSubmit} disabled={saving || !form.insumo_id || form.cantidad <= 0}
          className="bg-[#E85D75] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#D62839] transition-colors disabled:opacity-50">
          {saving ? 'Guardando...' : '✅ Registrar compra'}
        </button>
      </div>

      {/* Historial */}
      <TableWrapper title="📋 Historial de compras">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-400 uppercase">
              <Th>Insumo</Th><Th>Cantidad</Th><Th right>Costo total</Th>
              <Th right>$/unidad</Th><Th>Proveedor</Th><Th>Fecha</Th>
            </tr>
          </thead>
          <tbody>
            {compras.length === 0 && <EmptyRow cols={6} msg="Sin compras registradas" />}
            {compras.map(c => (
              <tr key={c.id} className="border-t border-gray-50 hover:bg-[#FFF3E8]/40">
                <td className="px-4 py-3 font-medium text-[#5A3A2E]">{c.insumo_nombre}</td>
                <td className="px-4 py-3 text-gray-600">{fmt(c.cantidad, 2)} {c.insumo_unidad}</td>
                <td className="px-4 py-3 text-right font-medium text-[#E85D75]">${fmt(c.costo_total)}</td>
                <td className="px-4 py-3 text-right text-gray-500">${fmt(c.costo_unitario, 4)}</td>
                <td className="px-4 py-3 text-gray-500">{c.proveedor || '—'}</td>
                <td className="px-4 py-3 text-gray-400">{c.fecha_compra}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrapper>
    </div>
  );
}

// ================================================================
// TAB RECETAS
// ================================================================

function TabRecetas({ productos, insumos, onRefresh }: {
  productos: Producto[]; insumos: Insumo[]; onRefresh: () => void;
}) {
  
  const [prodId, setProdId] = useState('');
  const [receta, setReceta] = useState<RecetaItem[]>([]);
  const [loadingR, setLoadingR] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState({ insumo_id: '', cantidad: 0, notas: '' });
  const [saving, setSaving] = useState(false);

  const prod = productos.find(p => p.id === prodId);

  const cargarReceta = async (pid: string) => {
    if (!pid) { setReceta([]); return; }
    setLoadingR(true);
    const { data } = await supabase
      .from('recetas')
      .select('*, insumo:insumos(nombre,unidad,costo_por_unidad)')
      .eq('producto_id', pid);
    setReceta((data || []).map((r: any) => ({
      ...r, insumo_nombre: r.insumo?.nombre,
      insumo_unidad: r.insumo?.unidad, insumo_costo: r.insumo?.costo_por_unidad,
    })));
    setLoadingR(false);
  };

  const handleSelectProd = (id: string) => { setProdId(id); cargarReceta(id); };

  const costoTotal = receta.reduce((s, r) => s + r.cantidad * (r.insumo_costo || 0), 0);
  const margen = prod ? prod.precio - costoTotal : 0;

  const disponibles = insumos.filter(i => !receta.some(r => r.insumo_id === i.id));

  const handleAdd = async () => {
    if (!newItem.insumo_id || newItem.cantidad <= 0) return;
    setSaving(true);
    const { error } = await supabase.from('recetas').upsert([{
      producto_id: prodId, ...newItem,
    }], { onConflict: 'producto_id,insumo_id' });
    setSaving(false);
    if (error) { alert('Error: ' + error.message); return; }
    setNewItem({ insumo_id: '', cantidad: 0, notas: '' });
    setAdding(false);
    cargarReceta(prodId);
    onRefresh();
  };

  const handleDel = async (id: string) => {
    if (!confirm('¿Quitar este insumo de la receta?')) return;
    await supabase.from('recetas').delete().eq('id', id);
    cargarReceta(prodId);
  };

  return (
    <div className="space-y-5">
      {/* Selector */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#F7A8B8]/30">
        <label className="text-sm font-medium text-[#5A3A2E] block mb-2">
          Selecciona un producto para configurar su receta
        </label>
        <select value={prodId} onChange={e => handleSelectProd(e.target.value)}
          className={ic + ' max-w-sm'}>
          <option value="">— Elegir producto —</option>
          {productos.map(p => (
            <option key={p.id} value={p.id}>{p.emoji || ''} {p.nombre} (${p.precio})</option>
          ))}
        </select>
      </div>

      {/* Receta */}
      {prodId && (
        <div className="bg-white rounded-2xl shadow-sm border border-[#F7A8B8]/30 overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-50 flex flex-wrap gap-4 items-center justify-between">
            <div>
              <h3 className="font-semibold text-[#5A3A2E]">
                📋 Receta: {prod?.emoji} {prod?.nombre}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Insumos y cantidades por unidad de producto</p>
            </div>
            <div className="flex gap-5 text-sm">
              <div className="text-center">
                <div className="text-[#E85D75] font-bold">${fmt(costoTotal)}</div>
                <div className="text-xs text-gray-400">Costo</div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 font-medium">${prod?.precio.toFixed(2)}</div>
                <div className="text-xs text-gray-400">Precio</div>
              </div>
              <div className="text-center">
                <div className={`font-bold ${margen >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  ${fmt(margen)}
                </div>
                <div className="text-xs text-gray-400">Margen</div>
              </div>
            </div>
          </div>

          {loadingR ? (
            <div className="py-8 text-center text-gray-400 text-sm">Cargando receta...</div>
          ) : (
            <>
              {receta.length === 0 && (
                <div className="py-8 text-center text-gray-400 text-sm">
                  Sin insumos configurados. Agrega el primer ingrediente.
                </div>
              )}
              {receta.map(item => (
                <div key={item.id}
                  className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 hover:bg-[#FFF3E8]/40 transition-colors">
                  <div className="flex-1">
                    <span className="text-sm font-medium text-[#5A3A2E]">{item.insumo_nombre}</span>
                    {item.notas && <span className="text-xs text-gray-400 ml-2">{item.notas}</span>}
                  </div>
                  <span className="text-sm text-gray-600">{item.cantidad} {item.insumo_unidad}</span>
                  <span className="text-sm text-[#E85D75] font-medium w-20 text-right">
                    ${fmt(item.cantidad * (item.insumo_costo || 0), 4)}
                  </span>
                  <button onClick={() => handleDel(item.id)}
                    className="text-red-300 hover:text-red-500 text-sm px-1.5 hover:bg-red-50 rounded-lg transition-colors">✕</button>
                </div>
              ))}

              {/* Total */}
              {receta.length > 0 && (
                <div className="flex items-center gap-3 px-5 py-3 bg-[#FFF3E8]/60 border-t border-gray-100">
                  <div className="flex-1 text-sm font-semibold text-[#5A3A2E]">Total costo por unidad</div>
                  <div className="text-sm font-bold text-[#E85D75]">${fmt(costoTotal, 4)}</div>
                  <div className="w-14" />
                </div>
              )}

              {/* Agregar insumo */}
              {adding ? (
                <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 space-y-2">
                  <p className="text-xs font-medium text-gray-500">Agregar insumo a la receta</p>
                  <div className="flex gap-2 flex-wrap">
                    <select value={newItem.insumo_id}
                      onChange={e => setNewItem(p => ({ ...p, insumo_id: e.target.value }))}
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1 min-w-[160px] bg-white focus:outline-none focus:ring-2 focus:ring-[#F7A8B8]">
                      <option value="">Elegir insumo...</option>
                      {disponibles.map(i => <option key={i.id} value={i.id}>{i.nombre} ({i.unidad})</option>)}
                    </select>
                    <input type="number" min="0" step="0.001" value={newItem.cantidad || ''}
                      onChange={e => setNewItem(p => ({ ...p, cantidad: +e.target.value || 0 }))}
                      placeholder="Cantidad"
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-24 bg-white focus:outline-none focus:ring-2 focus:ring-[#F7A8B8]" />
                    <input value={newItem.notas}
                      onChange={e => setNewItem(p => ({ ...p, notas: e.target.value }))}
                      placeholder="Nota (opcional)"
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1 min-w-[120px] bg-white focus:outline-none focus:ring-2 focus:ring-[#F7A8B8]" />
                    <button onClick={handleAdd} disabled={saving || !newItem.insumo_id || newItem.cantidad <= 0}
                      className="bg-[#E85D75] text-white px-4 py-2 rounded-xl text-sm hover:bg-[#D62839] transition-colors disabled:opacity-50">
                      {saving ? '...' : 'Agregar'}
                    </button>
                    <button onClick={() => setAdding(false)}
                      className="text-gray-400 px-2 py-2 hover:bg-gray-100 rounded-xl text-sm">✕</button>
                  </div>
                </div>
              ) : (
                <div className="px-5 py-3">
                  <button onClick={() => setAdding(true)}
                    className="text-sm text-[#E85D75] hover:text-[#D62839] font-medium transition-colors">
                    + Agregar insumo
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ================================================================
// TAB COSTOS
// ================================================================

function TabCostos({ costos }: { costos: CostoProducto[] }) {
  const maxM = Math.max(...costos.map(c => c.margen_porcentaje), 1);
  return (
    <div className="space-y-4">
      <TableWrapper title="💰 Costo y margen por producto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-400 uppercase">
              <Th>Producto</Th><Th>Tipo</Th>
              <Th right>Precio</Th><Th right>Costo</Th>
              <Th right>Margen $</Th><Th>Margen %</Th>
            </tr>
          </thead>
          <tbody>
            {costos.length === 0 && <EmptyRow cols={6} msg="Configura recetas para ver los costos" />}
            {costos.map(c => {
              const color = c.margen_porcentaje >= 50 ? 'text-green-600' :
                            c.margen_porcentaje >= 30 ? 'text-amber-600' : 'text-red-500';
              const barColor = c.margen_porcentaje >= 50 ? 'bg-green-400' :
                               c.margen_porcentaje >= 30 ? 'bg-amber-400' : 'bg-red-400';
              return (
                <tr key={c.producto_id} className="border-t border-gray-50 hover:bg-[#FFF3E8]/40">
                  <td className="px-4 py-3 font-medium text-[#5A3A2E]">{c.producto}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-[#FFF3E8] text-[#E85D75] px-2 py-0.5 rounded-full capitalize">
                      {c.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">${fmt(c.precio_venta)}</td>
                  <td className="px-4 py-3 text-right text-[#E85D75]">${fmt(c.costo_insumos)}</td>
                  <td className="px-4 py-3 text-right font-medium text-green-700">${fmt(c.margen_bruto)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-[80px]">
                        <div className={`h-1.5 rounded-full ${barColor}`}
                          style={{ width: `${(c.margen_porcentaje / maxM) * 100}%` }} />
                      </div>
                      <span className={`text-xs font-bold ${color}`}>{fmt(c.margen_porcentaje, 1)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableWrapper>
      <div className="bg-[#FFF3E8] rounded-2xl p-4 text-xs text-gray-500">
        🟢 ≥50% Excelente · 🟡 30-50% Bueno · 🔴 &lt;30% Revisar precio o costos
      </div>
    </div>
  );
}

// ================================================================
// TAB MAYOREO
// ================================================================

function TabMayoreo({ ventas, insumos, onRefresh }: {
  ventas: VentaMayoreo[]; insumos: Insumo[]; onRefresh: () => void;
}) {
  
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    insumo_id: '', cantidad: 0, precio_venta: 0,
    presentacion: '', cliente_nombre: '', notas: '', fecha: today(),
  });

  const insumoSel = insumos.find(i => i.id === form.insumo_id);
  const costo = insumoSel ? form.cantidad * insumoSel.costo_por_unidad : 0;
  const margen = form.precio_venta - costo;

  const handleSubmit = async () => {
    if (!form.insumo_id || form.cantidad <= 0 || form.precio_venta < 0) return;
    setSaving(true);
    const { error } = await supabase.from('ventas_mayoreo').insert([form]);
    setSaving(false);
    if (error) { alert('Error: ' + error.message); return; }
    console.log('✅ Venta mayoreo registrada');
    setForm(p => ({ ...p, insumo_id: '', cantidad: 0, precio_venta: 0, presentacion: '', cliente_nombre: '', notas: '' }));
    onRefresh();
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#F7A8B8]/30 space-y-4">
        <div>
          <h3 className="font-semibold text-[#5A3A2E]">📦 Registrar venta a mayoreo</h3>
          <p className="text-xs text-gray-400 mt-0.5">Venta de insumos en bolsitas, frascos u otras presentaciones</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Insumo" required>
            <select value={form.insumo_id} onChange={e => setForm(p => ({ ...p, insumo_id: e.target.value }))} className={ic}>
              <option value="">Seleccionar...</option>
              {insumos.map(i => <option key={i.id} value={i.id}>{i.nombre} — stock: {fmt(i.stock_actual, 1)} {i.unidad}</option>)}
            </select>
          </Field>
          <Field label={`Cantidad (${insumoSel?.unidad || 'unidad'})`} required>
            <input type="number" min="0" step="0.001" value={form.cantidad || ''}
              onChange={e => setForm(p => ({ ...p, cantidad: +e.target.value || 0 }))} className={ic} />
          </Field>
          <Field label="Precio de venta ($)" required>
            <input type="number" min="0" step="0.01" value={form.precio_venta || ''}
              onChange={e => setForm(p => ({ ...p, precio_venta: +e.target.value || 0 }))} className={ic} />
          </Field>
          <Field label="Presentación">
            <input value={form.presentacion} onChange={e => setForm(p => ({ ...p, presentacion: e.target.value }))}
              placeholder="Ej: bolsita 100g" className={ic} />
          </Field>
          <Field label="Cliente">
            <input value={form.cliente_nombre} onChange={e => setForm(p => ({ ...p, cliente_nombre: e.target.value }))}
              placeholder="Nombre del cliente" className={ic} />
          </Field>
          <Field label="Fecha">
            <input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} className={ic} />
          </Field>
        </div>
        {costo > 0 && (
          <div className="bg-[#FFF3E8] rounded-xl px-4 py-2.5 text-sm flex flex-wrap gap-4 text-[#5A3A2E]">
            <span>Costo: <strong>${fmt(costo)}</strong></span>
            <span className={margen >= 0 ? 'text-green-600' : 'text-red-500'}>
              Margen: <strong>${fmt(margen)}</strong>
            </span>
          </div>
        )}
        <button onClick={handleSubmit} disabled={saving || !form.insumo_id || form.cantidad <= 0}
          className="bg-[#E85D75] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#D62839] transition-colors disabled:opacity-50">
          {saving ? 'Guardando...' : '✅ Registrar venta'}
        </button>
      </div>

      <TableWrapper title="📋 Ventas mayoreo recientes">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-400 uppercase">
              <Th>Insumo</Th><Th>Presentación</Th>
              <Th right>Cantidad</Th><Th right>Precio</Th>
              <Th>Cliente</Th><Th>Fecha</Th>
            </tr>
          </thead>
          <tbody>
            {ventas.length === 0 && <EmptyRow cols={6} msg="Sin ventas mayoreo registradas" />}
            {ventas.map(v => (
              <tr key={v.id} className="border-t border-gray-50 hover:bg-[#FFF3E8]/40">
                <td className="px-4 py-3 font-medium text-[#5A3A2E]">{v.insumo_nombre}</td>
                <td className="px-4 py-3 text-gray-500">{v.presentacion || '—'}</td>
                <td className="px-4 py-3 text-right">{fmt(v.cantidad, 2)} {v.insumo_unidad}</td>
                <td className="px-4 py-3 text-right font-medium text-[#E85D75]">${fmt(v.precio_venta)}</td>
                <td className="px-4 py-3 text-gray-500">{v.cliente_nombre || '—'}</td>
                <td className="px-4 py-3 text-gray-400">{v.fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrapper>
    </div>
  );
}

// ================================================================
// TAB MOVIMIENTOS
// ================================================================

function TabMovimientos({ movimientos, insumos }: {
  movimientos: Movimiento[]; insumos: Insumo[];
}) {
  const [filtroInsumo, setFiltroInsumo] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  const lista = movimientos.filter(m => {
    if (filtroInsumo && m.insumo_id !== filtroInsumo) return false;
    if (filtroTipo && m.tipo !== filtroTipo) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <select value={filtroInsumo} onChange={e => setFiltroInsumo(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F7A8B8]">
          <option value="">Todos los insumos</option>
          {insumos.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
        </select>
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F7A8B8]">
          <option value="">Todos los tipos</option>
          {Object.entries(TIPO_MOV).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <TableWrapper title={`📊 Movimientos de inventario (${lista.length})`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-400 uppercase">
              <Th>Insumo</Th><Th>Tipo</Th>
              <Th right>Cantidad</Th><Th right>Stock antes</Th>
              <Th right>Stock después</Th><Th>Notas</Th><Th>Fecha</Th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 && <EmptyRow cols={7} msg="Sin movimientos" />}
            {lista.map(m => {
              const t = TIPO_MOV[m.tipo] || { label: m.tipo, color: 'text-gray-600' };
              return (
                <tr key={m.id} className="border-t border-gray-50 hover:bg-[#FFF3E8]/40">
                  <td className="px-4 py-2.5 font-medium text-[#5A3A2E]">{m.insumo_nombre}</td>
                  <td className={`px-4 py-2.5 font-medium ${t.color}`}>{t.label}</td>
                  <td className={`px-4 py-2.5 text-right font-medium ${m.cantidad >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {m.cantidad >= 0 ? '+' : ''}{fmt(m.cantidad, 2)} {m.insumo_unidad}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-400">{fmt(m.stock_antes, 2)}</td>
                  <td className="px-4 py-2.5 text-right text-gray-600 font-medium">{fmt(m.stock_despues, 2)}</td>
                  <td className="px-4 py-2.5 text-gray-400 max-w-[200px] truncate">{m.notas || '—'}</td>
                  <td className="px-4 py-2.5 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(m.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableWrapper>
    </div>
  );
}

// ================================================================
// COMPONENTES AUXILIARES
// ================================================================

function TableWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#F7A8B8]/20 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50">
        <h3 className="font-semibold text-[#5A3A2E]">{title}</h3>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={`px-4 py-3 font-medium text-left${right ? ' text-right' : ''}`}>{children}</th>
  );
}

function EmptyRow({ cols, msg }: { cols: number; msg: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-10 text-center text-gray-400">{msg}</td>
    </tr>
  );
}