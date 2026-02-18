// ============================================================
// ARCHIVO: src/middleware.ts  (en la raíz de src/)
// Protege todas las rutas dentro de /fresas/*
// Si no hay sesión activa → redirige a /login
// ============================================================

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Propagar cookies al request y al response
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Obtener sesión — esto refresca el token automáticamente
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Si está en /login y ya tiene sesión → redirigir al panel
  if (pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/fresas/pedidos', request.url));
  }

  // Si intenta acceder a /fresas/* sin sesión → redirigir a /login
  if (pathname.startsWith('/fresas') && !user) {
    const loginUrl = new URL('/login', request.url);
    // Guardar la URL original para redirigir después del login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

// Solo aplicar el middleware en estas rutas
export const config = {
  matcher: [
    '/fresas/:path*',
    '/login',
  ],
};