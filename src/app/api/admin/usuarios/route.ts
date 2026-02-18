// ============================================================
// ARCHIVO: src/app/api/admin/usuarios/route.ts
// GET  → listar todos los usuarios
// POST → crear nuevo usuario
// Usa la SERVICE_ROLE_KEY para operaciones admin
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase.server';

// Cliente admin con service role (nunca exponerlo al cliente)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ⚠️ Solo en servidor
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Verificar que quien llama tiene sesión activa
const verificarSesion = async () => {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// ── GET /api/admin/usuarios ──────────────────────────────────
export async function GET() {
  const user = await verificarSesion();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    console.error('❌ Error al listar usuarios:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Mapear solo los campos necesarios (no exponer datos sensibles)
  const usuarios = data.users.map(u => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    email_confirmed_at: u.email_confirmed_at,
  }));

  console.log('✅ Usuarios listados:', usuarios.length);
  return NextResponse.json({ usuarios });
}

// ── POST /api/admin/usuarios ─────────────────────────────────
export async function POST(request: Request) {
  const user = await verificarSesion();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirmar sin necesitar correo
  });

  if (error) {
    console.error('❌ Error al crear usuario:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log('✅ Usuario creado:', data.user.email);
  return NextResponse.json({ usuario: data.user }, { status: 201 });
}