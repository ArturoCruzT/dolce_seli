import { supabase } from './supabase';
import { 
  ProductoIndividual, 
  Paquete, 
  ProductoIndividualCreate, 
  PaqueteCreate,
  ProductoDb,
  convertirProductoDbAProducto
} from '@/types';

// ============================================
// PRODUCTOS INDIVIDUALES
// ============================================

/**
 * Obtener todos los productos individuales activos
 */
export const obtenerProductosIndividuales = async (): Promise<ProductoIndividual[]> => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('tipo', 'individual')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error al obtener productos individuales:', error);
      return [];
    }

    console.log('✅ Productos individuales obtenidos:', data?.length || 0);
    
    return (data as ProductoDb[]).map(convertirProductoDbAProducto) as ProductoIndividual[];
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return [];
  }
};

/**
 * Obtener producto individual por ID
 */
export const obtenerProductoIndividualPorId = async (id: string): Promise<ProductoIndividual | null> => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .eq('tipo', 'individual')
      .single();

    if (error) {
      console.error('❌ Error al obtener producto individual:', error);
      return null;
    }

    return convertirProductoDbAProducto(data as ProductoDb) as ProductoIndividual;
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return null;
  }
};

/**
 * Crear producto individual
 */
export const crearProductoIndividual = async (
  producto: ProductoIndividualCreate
): Promise<ProductoIndividual | null> => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .insert([{
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        emoji: producto.emoji,
        tipo: 'individual',
        toppings_incluidos: producto.toppingsIncluidos,
        activo: true,
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear producto individual:', error);
      return null;
    }

    console.log('✅ Producto individual creado:', data.nombre);
    
    return convertirProductoDbAProducto(data as ProductoDb) as ProductoIndividual;
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return null;
  }
};

/**
 * Actualizar producto individual
 */
export const actualizarProductoIndividual = async (
  id: string,
  cambios: Partial<ProductoIndividualCreate>
): Promise<ProductoIndividual | null> => {
  try {
    const updateData: any = {};
    
    if (cambios.nombre !== undefined) updateData.nombre = cambios.nombre;
    if (cambios.descripcion !== undefined) updateData.descripcion = cambios.descripcion;
    if (cambios.precio !== undefined) updateData.precio = cambios.precio;
    if (cambios.emoji !== undefined) updateData.emoji = cambios.emoji;
    if (cambios.toppingsIncluidos !== undefined) {
      updateData.toppings_incluidos = cambios.toppingsIncluidos;
    }

    const { data, error } = await supabase
      .from('productos')
      .update(updateData)
      .eq('id', id)
      .eq('tipo', 'individual')
      .select()
      .single();

    if (error) {
      console.error('❌ Error al actualizar producto individual:', error);
      return null;
    }

    console.log('✅ Producto individual actualizado:', data.nombre);
    
    return convertirProductoDbAProducto(data as ProductoDb) as ProductoIndividual;
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return null;
  }
};

/**
 * Eliminar producto individual
 */
export const eliminarProductoIndividual = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id)
      .eq('tipo', 'individual');

    if (error) {
      console.error('❌ Error al eliminar producto individual:', error);
      return false;
    }

    console.log('✅ Producto individual eliminado');
    return true;
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return false;
  }
};

/**
 * Cambiar estado activo del producto individual
 */
export const cambiarEstadoProductoIndividual = async (
  id: string,
  activo: boolean
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('productos')
      .update({ activo })
      .eq('id', id)
      .eq('tipo', 'individual');

    if (error) {
      console.error('❌ Error al cambiar estado:', error);
      return false;
    }

    console.log(`✅ Producto ${activo ? 'activado' : 'desactivado'}`);
    return true;
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return false;
  }
};

// ============================================
// PAQUETES
// ============================================

/**
 * Obtener todos los paquetes
 */
export const obtenerPaquetes = async (): Promise<Paquete[]> => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('tipo', 'paquete')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error al obtener paquetes:', error);
      return [];
    }

    console.log('✅ Paquetes obtenidos:', data?.length || 0);
    
    return (data as ProductoDb[]).map(convertirProductoDbAProducto) as Paquete[];
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return [];
  }
};

/**
 * Obtener paquete por ID
 */
export const obtenerPaquetePorId = async (id: string): Promise<Paquete | null> => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .eq('tipo', 'paquete')
      .single();

    if (error) {
      console.error('❌ Error al obtener paquete:', error);
      return null;
    }

    return convertirProductoDbAProducto(data as ProductoDb) as Paquete;
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return null;
  }
};

/**
 * Crear paquete
 */
export const crearPaquete = async (paquete: PaqueteCreate): Promise<Paquete | null> => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .insert([{
        nombre: paquete.nombre,
        descripcion: paquete.descripcion,
        precio: paquete.precio,
        tipo: 'paquete',
        toppings_incluidos: paquete.toppingsIncluidos,
        productos_incluidos: paquete.productosIncluidos,
        activo: true,
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear paquete:', error);
      return null;
    }

    console.log('✅ Paquete creado:', data.nombre);
    
    return convertirProductoDbAProducto(data as ProductoDb) as Paquete;
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return null;
  }
};

/**
 * Actualizar paquete
 */
export const actualizarPaquete = async (
  id: string,
  cambios: Partial<PaqueteCreate>
): Promise<Paquete | null> => {
  try {
    const updateData: any = {};
    
    if (cambios.nombre !== undefined) updateData.nombre = cambios.nombre;
    if (cambios.descripcion !== undefined) updateData.descripcion = cambios.descripcion;
    if (cambios.precio !== undefined) updateData.precio = cambios.precio;
    if (cambios.toppingsIncluidos !== undefined) {
      updateData.toppings_incluidos = cambios.toppingsIncluidos;
    }
    if (cambios.productosIncluidos !== undefined) {
      updateData.productos_incluidos = cambios.productosIncluidos;
    }

    const { data, error } = await supabase
      .from('productos')
      .update(updateData)
      .eq('id', id)
      .eq('tipo', 'paquete')
      .select()
      .single();

    if (error) {
      console.error('❌ Error al actualizar paquete:', error);
      return null;
    }

    console.log('✅ Paquete actualizado:', data.nombre);
    
    return convertirProductoDbAProducto(data as ProductoDb) as Paquete;
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return null;
  }
};

/**
 * Eliminar paquete
 */
export const eliminarPaquete = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id)
      .eq('tipo', 'paquete');

    if (error) {
      console.error('❌ Error al eliminar paquete:', error);
      return false;
    }

    console.log('✅ Paquete eliminado');
    return true;
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return false;
  }
};

/**
 * Cambiar estado activo del paquete
 */
export const cambiarEstadoPaquete = async (id: string, activo: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('productos')
      .update({ activo })
      .eq('id', id)
      .eq('tipo', 'paquete');

    if (error) {
      console.error('❌ Error al cambiar estado:', error);
      return false;
    }

    console.log(`✅ Paquete ${activo ? 'activado' : 'desactivado'}`);
    return true;
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return false;
  }
};