import { supabase } from './supabase';
import { Pedido, CrearPedidoDto } from './types';

// ============================================
// PEDIDOS
// ============================================

/**
 * Obtener todos los pedidos
 */
export async function obtenerPedidos(): Promise<Pedido[]> {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener pedidos:', error);
    throw error;
  }

  return data || [];
}

/**
 * Obtener pedidos por estado
 */
export async function obtenerPedidosPorEstado(
  estado: Pedido['estado']
): Promise<Pedido[]> {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .eq('estado', estado)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener pedidos por estado:', error);
    throw error;
  }

  return data || [];
}

/**
 * Obtener un pedido por ID
 */
export async function obtenerPedidoPorId(id: string): Promise<Pedido | null> {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error al obtener pedido por ID:', error);
    return null;
  }

  return data;
}

/**
 * Crear un nuevo pedido
 */
export async function crearPedido(pedidoDto: CrearPedidoDto): Promise<Pedido> {
  // Calcular el total sumando los subtotales de los items
  const total = pedidoDto.items.reduce((sum, item) => sum + item.subtotal, 0);

  const pedidoData = {
    cliente: pedidoDto.cliente,
    telefono: pedidoDto.telefono,
    direccion: pedidoDto.direccion || null,
    link_maps: pedidoDto.link_maps || null,
    hora_entrega: pedidoDto.hora_entrega || null,
    tipo_pago: pedidoDto.tipo_pago || null,
    total,
    items: pedidoDto.items,
    notas: pedidoDto.notas || null,
    estado: 'pendiente' as const,
  };

  const { data, error } = await supabase
    .from('pedidos')
    .insert([pedidoData])
    .select()
    .single();

  if (error) {
    console.error('Error al crear pedido:', error);
    throw error;
  }

  return data;
}

/**
 * Actualizar el estado de un pedido
 */
export async function actualizarEstadoPedido(
  id: string,
  nuevoEstado: Pedido['estado']
): Promise<Pedido> {
  const cambios: Partial<Pedido> = { estado: nuevoEstado };

  // Agregar timestamps según el estado
  const ahora = new Date().toISOString();
  
  if (nuevoEstado === 'en-preparacion') {
    cambios.hora_inicio_preparacion = ahora;
  } else if (nuevoEstado === 'listo') {
    cambios.hora_listo = ahora;
  } else if (nuevoEstado === 'entregado') {
    cambios.hora_entrega_real = ahora;
  }

  const { data, error } = await supabase
    .from('pedidos')
    .update(cambios)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar estado del pedido:', error);
    throw error;
  }

  return data;
}

/**
 * Actualizar datos de un pedido
 */
export async function actualizarPedido(
  id: string,
  cambios: Partial<Omit<Pedido, 'id' | 'created_at' | 'updated_at'>>
): Promise<Pedido> {
  const { data, error } = await supabase
    .from('pedidos')
    .update(cambios)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar pedido:', error);
    throw error;
  }

  return data;
}

/**
 * Cancelar un pedido
 */
export async function cancelarPedido(id: string): Promise<Pedido> {
  return actualizarEstadoPedido(id, 'cancelado');
}

/**
 * Obtener pedidos detallados (usando la vista)
 */
export async function obtenerPedidosDetallados(): Promise<any[]> {
  const { data, error } = await supabase
    .from('pedidos_detallados')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener pedidos detallados:', error);
    throw error;
  }

  return data || [];
}

/**
 * Obtener estadísticas de pedidos del día
 */
export async function obtenerEstadisticasHoy(): Promise<{
  total_pedidos: number;
  total_ventas: number;
  pedidos_pendientes: number;
  pedidos_en_preparacion: number;
  pedidos_listos: number;
}> {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('pedidos')
    .select('estado, total')
    .gte('created_at', hoy.toISOString());

  if (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }

  const estadisticas = {
    total_pedidos: data?.length || 0,
    total_ventas: data?.reduce((sum, p) => sum + Number(p.total), 0) || 0,
    pedidos_pendientes: data?.filter(p => p.estado === 'pendiente').length || 0,
    pedidos_en_preparacion: data?.filter(p => p.estado === 'en-preparacion').length || 0,
    pedidos_listos: data?.filter(p => p.estado === 'listo').length || 0,
  };

  return estadisticas;
}
