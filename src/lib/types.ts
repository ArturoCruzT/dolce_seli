// ============================================
// TIPOS PARA DOLCE SELI
// ============================================

// Producto de la base de datos
export interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  icono: string | null;
  categoria: 'individual' | 'paquete';
  items: ItemPaquete[] | null; // Solo para paquetes
  activo: boolean;
  created_at: string;
}

// Item dentro de un paquete
export interface ItemPaquete {
  producto_id: string;
  cantidad: number;
  nombre?: string; // Agregado por la vista productos_expandidos
  icono?: string;
}

// Topping de la base de datos
export interface Topping {
  id: string;
  nombre: string;
  icono: string | null;
  activo: boolean;
  created_at: string;
}

// ============================================
// TIPOS PARA EL CARRITO
// ============================================

// Topping seleccionado para un producto
export interface ToppingSeleccionado {
  topping_id: string;
  nombre: string;
  incluido: boolean; // true si es el topping incluido, false si es extra
}

// Item en el carrito
export interface ItemCarrito {
  id: string; // ID único del item en el carrito
  producto_id: string;
  producto_nombre: string;
  producto_precio: number;
  producto_icono: string | null;
  categoria: 'individual' | 'paquete';
  cantidad: number;
  
  // Para productos individuales
  toppings?: ToppingSeleccionado[];
  
  // Para paquetes (cada item del paquete puede tener sus propios toppings)
  items_paquete?: ItemPaqueteCarrito[];
  
  subtotal: number;
}

// Item de paquete en el carrito (con toppings)
export interface ItemPaqueteCarrito {
  producto_id: string;
  producto_nombre: string;
  producto_icono: string | null;
  cantidad: number;
  toppings: ToppingSeleccionado[];
}

// ============================================
// TIPOS PARA PEDIDOS
// ============================================

export interface Pedido {
  id: string;
  // Cliente
  cliente: string;
  telefono: string;
  direccion: string | null;
  link_maps: string | null;
  // Entrega
  hora_entrega: string | null;
  tipo_pago: 'efectivo' | 'transferencia' | 'tarjeta' | null;
  // Montos
  total: number;
  // Estado
  estado: 'pendiente' | 'confirmado' | 'en-preparacion' | 'listo' | 'entregado' | 'cancelado';
  // Items (JSON)
  items: ItemCarrito[];
  notas: string | null;
  // Timestamps de seguimiento
  hora_inicio_preparacion: string | null;
  hora_listo: string | null;
  hora_inicio_entrega: string | null;
  hora_entrega_real: string | null;
  created_at: string;
  updated_at: string;
}

// DTO para crear un pedido
export interface CrearPedidoDto {
  cliente: string;
  telefono: string;
  direccion?: string;
  link_maps?: string;
  hora_entrega?: string;
  tipo_pago?: 'efectivo' | 'transferencia' | 'tarjeta';
  items: ItemCarrito[];
  notas?: string;
}

// ============================================
// TIPOS PARA VISTAS DE SUPABASE
// ============================================

// Producto expandido (con items detallados para paquetes)
export interface ProductoExpandido extends Producto {
  items_detallados: ItemPaqueteDetallado[] | null;
}

export interface ItemPaqueteDetallado extends ItemPaquete {
  nombre: string;
  icono: string | null;
}

