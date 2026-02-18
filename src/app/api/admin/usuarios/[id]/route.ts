// ============================================================
// ARCHIVO: src/app/api/admin/usuarios/[id]/route.ts
// PATCH  → cambiar contraseña de un usuario
// DELETE → eliminar un usuario
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase.server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const verificarSesion = async () => {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// ── PATCH /api/admin/usuarios/[id] ──────────────────────────
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verificarSesion();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  const { password } = await request.json();

  if (!password || password.length < 6) {
    return NextResponse.json({ error: 'Contraseña inválida (mínimo 6 caracteres)' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(id, { password });

  if (error) {
    console.error('❌ Error al actualizar contraseña:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log('✅ Contraseña actualizada para usuario:', id);
  return NextResponse.json({ ok: true });
}

// ── DELETE /api/admin/usuarios/[id] ─────────────────────────
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verificarSesion();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;

  // Evitar que el admin se elimine a sí mismo
  if (user.id === id) {
    return NextResponse.json(
      { error: 'No puedes eliminar tu propia cuenta desde aquí' },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

  if (error) {
    console.error('❌ Error al eliminar usuario:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log('✅ Usuario eliminado:', id);
  return NextResponse.json({ ok: true });
}