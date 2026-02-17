// ============================================
// TIPOS PARA SUPABASE DATABASE
// ============================================

// Base timestamps para todas las tablas
export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// PRODUCTOS INDIVIDUALES
// ============================================

export interface ProductoIndividual extends BaseEntity {
  nombre: string;
  descripcion: string;
  precio: number;
  emoji?: string;
  toppingsIncluidos: number;
  tipo: 'individual';
  activo: boolean;
}

export interface ProductoIndividualCreate {
  nombre: string;
  descripcion: string;
  precio: number;
  emoji?: string;
  toppingsIncluidos: number;
}

// ============================================
// PAQUETES
// ============================================

export interface ProductoPaqueteItem {
  productoId: string;
  cantidad: number;
}

export interface Paquete extends BaseEntity {
  nombre: string;
  descripcion: string;
  precio: number;
  tipo: 'paquete';
  productosIncluidos: ProductoPaqueteItem[];
  toppingsIncluidos: number;
  activo: boolean;
}

export interface PaqueteCreate {
  nombre: string;
  descripcion: string;
  precio: number;
  productosIncluidos: ProductoPaqueteItem[];
  toppingsIncluidos: number;
}

// ============================================
// TOPPINGS
// ============================================

export interface Topping extends BaseEntity {
  nombre: string;
  descripcion?: string;
  emoji?: string;
  activo: boolean;
}

export interface ToppingCreate {
  nombre: string;
  descripcion?: string;
  emoji?: string;
}

// ============================================
// PEDIDOS
// ============================================

export interface ItemPedido {
  tipo: 'individual' | 'paquete';
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  toppingsSeleccionados: {
    toppingId: string;
    toppingNombre: string;
  }[];
  // Para paquetes con selección individual de toppings
  toppingsPorItem?: {
    itemIndex: number;
    toppings: {
      toppingId: string;
      toppingNombre: string;
    }[];
  }[];
}

export type EstadoPedido = 
  | 'pendiente' 
  | 'preparando' 
  | 'listo' 
  | 'en_camino' 
  | 'entregado' 
  | 'cancelado';

export type TipoPago = 'efectivo' | 'transferencia' | 'tarjeta';

export interface Pedido extends BaseEntity {
  // Información del cliente
  cliente?: string;
  telefono?: string;
  direccion?: string;
  linkMaps?: string;
  
  // Detalles del pedido
  items: ItemPedido[];
  total: number;
  
  // Información de entrega
  horaEntrega?: string;
  tipoPago?: TipoPago;
  estado: EstadoPedido;
  notas?: string;
  
  // Timestamps de seguimiento
  horaInicioPreparacion?: string;
  horaListo?: string;
  horaInicioEntrega?: string;
  horaEntregaReal?: string;
}

export interface PedidoCreate {
  cliente?: string;
  telefono?: string;
  direccion?: string;
  linkMaps?: string;
  items: ItemPedido[];
  total: number;
  horaEntrega?: string;
  tipoPago?: TipoPago;
  notas?: string;
}

// ============================================
// TIPOS PARA SUPABASE DATABASE (Raw)
// ============================================

export interface ProductoDb {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  emoji?: string;
  tipo: 'individual' | 'paquete';
  toppings_incluidos: number;
  productos_incluidos?: any; // JSON para paquetes
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ToppingDb {
  id: string;
  nombre: string;
  descripcion?: string;
  emoji?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PedidoDb {
  id: string;
  cliente?: string;
  telefono?: string;
  direccion?: string;
  link_maps?: string;
  items: any; // JSON
  total: number;
  hora_entrega?: string;
  tipo_pago?: string;
  estado: string;
  notas?: string;
  hora_inicio_preparacion?: string;
  hora_listo?: string;
  hora_inicio_entrega?: string;
  hora_entrega_real?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// UTILIDADES DE CONVERSIÓN
// ============================================

export const convertirProductoDbAProducto = (dbProd: ProductoDb): ProductoIndividual | Paquete => {
  const base = {
    id: dbProd.id,
    nombre: dbProd.nombre,
    descripcion: dbProd.descripcion,
    precio: dbProd.precio,
    emoji: dbProd.emoji,
    toppingsIncluidos: dbProd.toppings_incluidos,
    activo: dbProd.activo,
    tipo: dbProd.tipo,
    created_at: dbProd.created_at,
    updated_at: dbProd.updated_at,
  };

  if (dbProd.tipo === 'paquete') {
    return {
      ...base,
      tipo: 'paquete',
      productosIncluidos: dbProd.productos_incluidos || [],
    } as Paquete;
  }

  return {
    ...base,
    tipo: 'individual',
  } as ProductoIndividual;
};

export const convertirToppingDbATopping = (dbTopping: ToppingDb): Topping => ({
  id: dbTopping.id,
  nombre: dbTopping.nombre,
  descripcion: dbTopping.descripcion,
  emoji: dbTopping.emoji,
  activo: dbTopping.activo,
  created_at: dbTopping.created_at,
  updated_at: dbTopping.updated_at,
});

export const convertirPedidoDbAPedido = (dbPedido: PedidoDb): Pedido => ({
  id: dbPedido.id,
  cliente: dbPedido.cliente,
  telefono: dbPedido.telefono,
  direccion: dbPedido.direccion,
  linkMaps: dbPedido.link_maps,
  items: dbPedido.items,
  total: dbPedido.total,
  horaEntrega: dbPedido.hora_entrega,
  tipoPago: dbPedido.tipo_pago as TipoPago,
  estado: dbPedido.estado as EstadoPedido,
  notas: dbPedido.notas,
  horaInicioPreparacion: dbPedido.hora_inicio_preparacion,
  horaListo: dbPedido.hora_listo,
  horaInicioEntrega: dbPedido.hora_inicio_entrega,
  horaEntregaReal: dbPedido.hora_entrega_real,
  created_at: dbPedido.created_at,
  updated_at: dbPedido.updated_at,
});