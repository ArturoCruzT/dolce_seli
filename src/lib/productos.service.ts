import { supabase } from './supabase';
import { Producto, ProductoExpandido } from './types';

// ============================================
// PRODUCTOS
// ============================================

/**
 * Obtener todos los productos activos
 */
export async function obtenerProductos(): Promise<Producto[]> {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('activo', true)
    .order('categoria', { ascending: true })
    .order('precio', { ascending: true });

  if (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }

  return data || [];
}

/**
 * Obtener productos por categoría
 */
export async function obtenerProductosPorCategoria(
  categoria: 'individual' | 'paquete'
): Promise<Producto[]> {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('categoria', categoria)
    .eq('activo', true)
    .order('precio', { ascending: true });

  if (error) {
    console.error('Error al obtener productos por categoría:', error);
    throw error;
  }

  return data || [];
}

/**
 * Obtener productos expandidos (con detalles de items en paquetes)
 */
export async function obtenerProductosExpandidos(): Promise<ProductoExpandido[]> {
  const { data, error } = await supabase
    .from('productos_expandidos')
    .select('*')
    .eq('activo', true)
    .order('categoria', { ascending: true })
    .order('precio', { ascending: true });

  if (error) {
    console.error('Error al obtener productos expandidos:', error);
    throw error;
  }

  return data || [];
}

/**
 * Obtener un producto por ID
 */
export async function obtenerProductoPorId(id: string): Promise<Producto | null> {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error al obtener producto por ID:', error);
    return null;
  }

  return data;
}

/**
 * Crear un nuevo producto
 */
export async function crearProducto(producto: Omit<Producto, 'id' | 'created_at'>): Promise<Producto> {
  const { data, error } = await supabase
    .from('productos')
    .insert([producto])
    .select()
    .single();

  if (error) {
    console.error('Error al crear producto:', error);
    throw error;
  }

  return data;
}

/**
 * Actualizar un producto
 */
export async function actualizarProducto(
  id: string,
  cambios: Partial<Omit<Producto, 'id' | 'created_at'>>
): Promise<Producto> {
  const { data, error } = await supabase
    .from('productos')
    .update(cambios)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar producto:', error);
    throw error;
  }

  return data;
}

/**
 * Desactivar un producto (soft delete)
 */
export async function desactivarProducto(id: string): Promise<void> {
  const { error } = await supabase
    .from('productos')
    .update({ activo: false })
    .eq('id', id);

  if (error) {
    console.error('Error al desactivar producto:', error);
    throw error;
  }
}

/**
 * Eliminar un producto (hard delete)
 */
export async function eliminarProducto(id: string): Promise<void> {
  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar producto:', error);
    throw error;
  }
}
