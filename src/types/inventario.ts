// ============================================================
// TIPOS - Módulo de Inventario Dolce Seli
// src/types/inventario.ts
// ============================================================

export type UnidadMedida = 'g' | 'ml' | 'piezas' | 'kg' | 'l';
export type EstadoStock = 'ok' | 'bajo' | 'critico';
export type TipoMovimiento = 'compra' | 'descuento_pedido' | 'ajuste_manual' | 'venta_mayoreo' | 'merma';

// ─── Insumo ───────────────────────────────────────────────
export interface Insumo {
  id: string;
  nombre: string;
  descripcion?: string;
  unidad: UnidadMedida;
  stock_actual: number;
  stock_minimo: number;
  stock_critico: number;
  costo_por_unidad: number;
  notas?: string;
  proveedor?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface InsumoConStock extends Insumo {
  estado_stock: EstadoStock;
  valor_inventario: number;
}

export interface InsumoFormData {
  nombre: string;
  descripcion?: string;
  unidad: UnidadMedida;
  stock_actual: number;
  stock_minimo: number;
  stock_critico: number;
  costo_por_unidad: number;
  notas?: string;
  proveedor?: string;
}

// ─── Compra ───────────────────────────────────────────────
export interface CompraInsumo {
  id: string;
  insumo_id: string;
  cantidad: number;
  costo_total: number;
  costo_unitario: number;
  proveedor?: string;
  notas?: string;
  fecha_compra: string;
  created_at: string;
  // Join
  insumo?: Pick<Insumo, 'nombre' | 'unidad'>;
}

export interface CompraFormData {
  insumo_id: string;
  cantidad: number;
  costo_total: number;
  proveedor?: string;
  notas?: string;
  fecha_compra: string;
}

// ─── Receta ───────────────────────────────────────────────
export interface RecetaItem {
  id: string;
  producto_id: string;
  insumo_id: string;
  cantidad: number;
  notas?: string;
  created_at: string;
  updated_at: string;
  // Join
  insumo?: Pick<Insumo, 'nombre' | 'unidad' | 'costo_por_unidad'>;
}

export interface RecetaFormData {
  producto_id: string;
  insumo_id: string;
  cantidad: number;
  notas?: string;
}

// ─── Movimiento ───────────────────────────────────────────
export interface MovimientoInventario {
  id: string;
  insumo_id: string;
  tipo: TipoMovimiento;
  cantidad: number;
  stock_antes: number;
  stock_despues: number;
  referencia_id?: string;
  referencia_tipo?: string;
  notas?: string;
  created_at: string;
  // Join
  insumo?: Pick<Insumo, 'nombre' | 'unidad'>;
}

// ─── Venta Mayoreo ────────────────────────────────────────
export interface VentaMayoreo {
  id: string;
  insumo_id: string;
  cantidad: number;
  precio_venta: number;
  presentacion?: string;
  cliente_nombre?: string;
  notas?: string;
  fecha: string;
  created_at: string;
  // Join
  insumo?: Pick<Insumo, 'nombre' | 'unidad'>;
}

export interface VentaMayoreoFormData {
  insumo_id: string;
  cantidad: number;
  precio_venta: number;
  presentacion?: string;
  cliente_nombre?: string;
  notas?: string;
  fecha: string;
}

// ─── Vista Costo Producto ─────────────────────────────────
export interface CostoProducto {
  producto_id: string;
  producto: string;
  precio_venta: number;
  costo_insumos: number;
  margen_bruto: number;
  margen_porcentaje: number;
}

// ─── Alertas ──────────────────────────────────────────────
export interface AlertaStock {
  insumo: string;
  stock_restante: number;
  stock_minimo: number;
  unidad: string;
}

// ─── Dashboard Stats ──────────────────────────────────────
export interface InventarioDashboardStats {
  total_insumos: number;
  insumos_ok: number;
  insumos_bajo: number;
  insumos_criticos: number;
  valor_total_inventario: number;
}