// ============================================================
// ARCHIVO: src/lib/supabase.auth.ts
// Cliente de Supabase con soporte de cookies para Auth SSR
// ============================================================

import { createBrowserClient } from '@supabase/ssr';

// ── Cliente para uso en componentes del browser (Client Components) ──
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );