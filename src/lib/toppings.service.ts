import { supabase } from './supabase';
import { Topping, ToppingCreate, ToppingDb, convertirToppingDbATopping } from '@/types';

/**
 * Obtener todos los toppings
 */
export const obtenerToppings = async (): Promise<Topping[]> => {
  try {
    const { data, error } = await supabase
      .from('toppings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error al obtener toppings:', error);
      return [];
    }

    console.log('✅ Toppings obtenidos:', data?.length || 0);
    
    return (data as ToppingDb[]).map(convertirToppingDbATopping);
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return [];
  }
};

/**
 * Obtener toppings activos
 */
export const obtenerToppingsActivos = async (): Promise<Topping[]> => {
  try {
    const { data, error } = await supabase
      .from('toppings')
      .select('*')
      .eq('activo', true)
      .order('nombre', { ascending: true });

    if (error) {
      console.error('❌ Error al obtener toppings activos:', error);
      return [];
    }

    console.log('✅ Toppings activos obtenidos:', data?.length || 0);
    
    return (data as ToppingDb[]).map(convertirToppingDbATopping);
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return [];
  }
};

/**
 * Obtener topping por ID
 */
export const obtenerToppingPorId = async (id: string): Promise<Topping | null> => {
  try {
    const { data, error } = await supabase
      .from('toppings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error al obtener topping:', error);
      return null;
    }

    return convertirToppingDbATopping(data as ToppingDb);
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return null;
  }
};

/**
 * Crear topping
 */
export const crearTopping = async (topping: ToppingCreate): Promise<Topping | null> => {
  try {
    const { data, error } = await supabase
      .from('toppings')
      .insert([{
        nombre: topping.nombre,
        descripcion: topping.descripcion,
        emoji: topping.emoji,
        activo: true,
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear topping:', error);
      return null;
    }

    console.log('✅ Topping creado:', data.nombre);
    
    return convertirToppingDbATopping(data as ToppingDb);
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return null;
  }
};

/**
 * Actualizar topping
 */
export const actualizarTopping = async (
  id: string,
  cambios: Partial<ToppingCreate>
): Promise<Topping | null> => {
  try {
    const updateData: any = {};
    
    if (cambios.nombre !== undefined) updateData.nombre = cambios.nombre;
    if (cambios.descripcion !== undefined) updateData.descripcion = cambios.descripcion;
    if (cambios.emoji !== undefined) updateData.emoji = cambios.emoji;

    const { data, error } = await supabase
      .from('toppings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al actualizar topping:', error);
      return null;
    }

    console.log('✅ Topping actualizado:', data.nombre);
    
    return convertirToppingDbATopping(data as ToppingDb);
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return null;
  }
};

/**
 * Eliminar topping
 */
export const eliminarTopping = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('toppings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error al eliminar topping:', error);
      return false;
    }

    console.log('✅ Topping eliminado');
    return true;
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return false;
  }
};

/**
 * Cambiar estado activo del topping
 */
export const cambiarEstadoTopping = async (id: string, activo: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('toppings')
      .update({ activo })
      .eq('id', id);

    if (error) {
      console.error('❌ Error al cambiar estado:', error);
      return false;
    }

    console.log(`✅ Topping ${activo ? 'activado' : 'desactivado'}`);
    return true;
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return false;
  }
};