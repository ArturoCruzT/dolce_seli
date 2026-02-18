// ============================================================
// ARCHIVO: src/lib/supabase.server.ts
// Cliente de Supabase para Server Components y Middleware
// ============================================================

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // En Server Components el set puede fallar — es seguro ignorarlo
          }
        },
      },
    }
  );
};