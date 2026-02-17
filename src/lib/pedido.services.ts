import { supabase } from './supabase';
import { 
  Pedido, 
  PedidoCreate, 
  EstadoPedido, 
  PedidoDb, 
  convertirPedidoDbAPedido 
} from '@/types';

/**
 * Obtener todos los pedidos
 */
export const obtenerPedidos = async (): Promise<Pedido[]> => {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error al obtener pedidos:', error);
      return [];
    }

    console.log('✅ Pedidos obtenidos:', data?.length || 0);
    
    return (data as PedidoDb[]).map(convertirPedidoDbAPedido);
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return [];
  }
};

/**
 * Obtener pedidos por estado
 */
export const obtenerPedidosPorEstado = async (estado: EstadoPedido): Promise<Pedido[]> => {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('estado', estado)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error al obtener pedidos por estado:', error);
      return [];
    }

    console.log(`✅ Pedidos en estado "${estado}" obtenidos:`, data?.length || 0);
    
    return (data as PedidoDb[]).map(convertirPedidoDbAPedido);
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return [];
  }
};

/**
 * Obtener pedido por ID
 */
export const obtenerPedidoPorId = async (id: string): Promise<Pedido | null> => {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error al obtener pedido:', error);
      return null;
    }

    return convertirPedidoDbAPedido(data as PedidoDb);
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return null;
  }
};

/**
 * Crear pedido
 */
export const crearPedido = async (pedido: PedidoCreate): Promise<Pedido | null> => {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .insert([{
        cliente: pedido.cliente,
        telefono: pedido.telefono,
        direccion: pedido.direccion,
        link_maps: pedido.linkMaps,
        items: pedido.items,
        total: pedido.total,
        hora_entrega: pedido.horaEntrega,
        tipo_pago: pedido.tipoPago,
        estado: 'pendiente',
        notas: pedido.notas,
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear pedido:', error);
      return null;
    }

    console.log('✅ Pedido creado:', data.id);
    
    return convertirPedidoDbAPedido(data as PedidoDb);
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return null;
  }
};

/**
 * Actualizar estado del pedido
 */
export const actualizarEstadoPedido = async (
  id: string,
  estado: EstadoPedido
): Promise<Pedido | null> => {
  try {
    const updateData: any = { estado };
    const now = new Date().toISOString();

    // Actualizar timestamps según el estado
    switch (estado) {
      case 'preparando':
        updateData.hora_inicio_preparacion = now;
        break;
      case 'listo':
        updateData.hora_listo = now;
        break;
      case 'en_camino':
        updateData.hora_inicio_entrega = now;
        break;
      case 'entregado':
        updateData.hora_entrega_real = now;
        break;
    }

    const { data, error } = await supabase
      .from('pedidos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al actualizar estado del pedido:', error);
      return null;
    }

    console.log(`✅ Pedido actualizado a estado: ${estado}`);
    
    return convertirPedidoDbAPedido(data as PedidoDb);
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return null;
  }
};

/**
 * Actualizar información del pedido
 */
export const actualizarPedido = async (
  id: string,
  cambios: Partial<PedidoCreate>
): Promise<Pedido | null> => {
  try {
    const updateData: any = {};
    
    if (cambios.cliente !== undefined) updateData.cliente = cambios.cliente;
    if (cambios.telefono !== undefined) updateData.telefono = cambios.telefono;
    if (cambios.direccion !== undefined) updateData.direccion = cambios.direccion;
    if (cambios.linkMaps !== undefined) updateData.link_maps = cambios.linkMaps;
    if (cambios.items !== undefined) updateData.items = cambios.items;
    if (cambios.total !== undefined) updateData.total = cambios.total;
    if (cambios.horaEntrega !== undefined) updateData.hora_entrega = cambios.horaEntrega;
    if (cambios.tipoPago !== undefined) updateData.tipo_pago = cambios.tipoPago;
    if (cambios.notas !== undefined) updateData.notas = cambios.notas;

    const { data, error } = await supabase
      .from('pedidos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al actualizar pedido:', error);
      return null;
    }

    console.log('✅ Pedido actualizado');
    
    return convertirPedidoDbAPedido(data as PedidoDb);
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return null;
  }
};

/**
 * Cancelar pedido
 */
export const cancelarPedido = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pedidos')
      .update({ estado: 'cancelado' })
      .eq('id', id);

    if (error) {
      console.error('❌ Error al cancelar pedido:', error);
      return false;
    }

    console.log('✅ Pedido cancelado');
    return true;
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return false;
  }
};

/**
 * Eliminar pedido
 */
export const eliminarPedido = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pedidos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error al eliminar pedido:', error);
      return false;
    }

    console.log('✅ Pedido eliminado');
    return true;
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return false;
  }
};

/**
 * Obtener estadísticas de pedidos
 */
export const obtenerEstadisticasPedidos = async () => {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('estado, total, created_at');

    if (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      return null;
    }

    const estadisticas = {
      total: data.length,
      pendientes: data.filter(p => p.estado === 'pendiente').length,
      preparando: data.filter(p => p.estado === 'preparando').length,
      listos: data.filter(p => p.estado === 'listo').length,
      enCamino: data.filter(p => p.estado === 'en_camino').length,
      entregados: data.filter(p => p.estado === 'entregado').length,
      cancelados: data.filter(p => p.estado === 'cancelado').length,
      totalVentas: data
        .filter(p => p.estado === 'entregado')
        .reduce((sum, p) => sum + p.total, 0),
    };

    console.log('✅ Estadísticas calculadas');
    
    return estadisticas;
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return null;
  }
};