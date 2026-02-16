import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching pedidos:', error);
    return NextResponse.json(
      { error: 'Error al obtener pedidos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('pedidos')
      .insert([
        {
          cliente_nombre: body.cliente.nombre,
          cliente_telefono: body.cliente.telefono,
          cliente_email: body.cliente.email,
          items: body.items,
          subtotal: body.subtotal,
          toppings_extras: body.toppingsExtras,
          total: body.total,
          entrega_tipo: body.entrega.tipo,
          entrega_direccion: body.entrega.direccion,
          entrega_fecha: body.entrega.fecha,
          entrega_hora: body.entrega.hora,
          estado: 'pendiente',
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('Error creating pedido:', error);
    return NextResponse.json(
      { error: 'Error al crear pedido' },
      { status: 500 }
    );
  }
}
