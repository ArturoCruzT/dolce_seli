import { createClient } from '@supabase/supabase-js';

// Validar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('❌ NEXT_PUBLIC_SUPABASE_URL no está definida en las variables de entorno');
}

if (!supabaseAnonKey) {
  throw new Error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY no está definida en las variables de entorno');
}

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Log de inicialización (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  console.log('✅ Supabase inicializado');
  console.log('📍 URL:', supabaseUrl);
}

// Helper para verificar la conexión
export const verificarConexion = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('productos').select('count').limit(1);
    
    if (error) {
      console.error('❌ Error de conexión a Supabase:', error);
      return false;
    }
    
    console.log('✅ Conexión a Supabase exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error inesperado al verificar conexión:', error);
    return false;
  }
};