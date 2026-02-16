import { supabase } from './supabase';
import { Topping } from './types';

// ============================================
// TOPPINGS
// ============================================

/**
 * Obtener todos los toppings activos
 */
export async function obtenerToppings(): Promise<Topping[]> {
  const { data, error } = await supabase
    .from('toppings')
    .select('*')
    .eq('activo', true)
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error al obtener toppings:', error);
    throw error;
  }

  return data || [];
}

/**
 * Obtener un topping por ID
 */
export async function obtenerToppingPorId(id: string): Promise<Topping | null> {
  const { data, error } = await supabase
    .from('toppings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error al obtener topping por ID:', error);
    return null;
  }

  return data;
}

/**
 * Crear un nuevo topping
 */
export async function crearTopping(topping: Omit<Topping, 'id' | 'created_at'>): Promise<Topping> {
  const { data, error } = await supabase
    .from('toppings')
    .insert([topping])
    .select()
    .single();

  if (error) {
    console.error('Error al crear topping:', error);
    throw error;
  }

  return data;
}

/**
 * Actualizar un topping
 */
export async function actualizarTopping(
  id: string,
  cambios: Partial<Omit<Topping, 'id' | 'created_at'>>
): Promise<Topping> {
  const { data, error } = await supabase
    .from('toppings')
    .update(cambios)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar topping:', error);
    throw error;
  }

  return data;
}

/**
 * Desactivar un topping (soft delete)
 */
export async function desactivarTopping(id: string): Promise<void> {
  const { error } = await supabase
    .from('toppings')
    .update({ activo: false })
    .eq('id', id);

  if (error) {
    console.error('Error al desactivar topping:', error);
    throw error;
  }
}

/**
 * Eliminar un topping (hard delete)
 */
export async function eliminarTopping(id: string): Promise<void> {
  const { error } = await supabase
    .from('toppings')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar topping:', error);
    throw error;
  }
}
