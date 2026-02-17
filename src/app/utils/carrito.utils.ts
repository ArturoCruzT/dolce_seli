// ============================================
// UTILIDADES PARA CONVERTIR CARRITO → PEDIDO
// ============================================

import type { ItemPedido, Topping } from '@/types';

// ============================================
// TIPO PARA EL CARRITO (FRONTEND)
// ============================================

export interface CarritoItem {
  tipo: 'individual' | 'paquete';
  productoId: string;
  nombre: string;
  cantidad: number;
  precio: number;

  // Toppings generales (individual o paquete completo)
  toppings?: Topping[];

  // Para paquetes donde cada item puede tener toppings distintos
  toppingsPorItem?: {
    itemIndex: number;
    toppings: Topping[];
  }[];
}

// ============================================
// CONVERTIR UN ITEM DE CARRITO → ItemPedido
// ============================================

export const convertirCarritoItemAItemPedido = (
  item: CarritoItem
): ItemPedido => {
  return {
    tipo: item.tipo,
    productoId: item.productoId,
    productoNombre: item.nombre,
    cantidad: item.cantidad,
    precioUnitario: item.precio,

    // 👇 Convertimos formato Topping → formato Pedido
    toppingsSeleccionados: (item.toppings ?? []).map((t) => ({
      toppingId: t.id,
      toppingNombre: t.nombre,
    })),

    toppingsPorItem: item.toppingsPorItem
      ? item.toppingsPorItem.map((subItem) => ({
          itemIndex: subItem.itemIndex,
          toppings: (subItem.toppings ?? []).map((t) => ({
            toppingId: t.id,
            toppingNombre: t.nombre,
          })),
        }))
      : undefined,
  };
};

// ============================================
// CONVERTIR TODO EL CARRITO
// ============================================

export const convertirCarritoAPedidoItems = (
  carrito: CarritoItem[]
): ItemPedido[] => {
  return carrito.map(convertirCarritoItemAItemPedido);
};
