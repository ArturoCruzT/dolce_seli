import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para las tablas de Supabase
export interface PedidoDb {
  id: string;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_email?: string;
  items: any; // JSON
  subtotal: number;
  toppings_extras: number;
  total: number;
  entrega_tipo: 'recoger' | 'domicilio';
  entrega_direccion?: string;
  entrega_fecha: string;
  entrega_hora: string;
  estado: 'pendiente' | 'confirmado' | 'en-preparacion' | 'listo' | 'entregado' | 'cancelado';
  created_at: string;
  updated_at: string;
}
