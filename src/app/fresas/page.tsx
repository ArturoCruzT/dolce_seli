// ─────────────────────────────────────────────────────────────────────────────
// src/app/admin/page.tsx  –  Dolce Seli · Admin Welcome
// Stack: Next.js 14 · TypeScript · Tailwind CSS
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LogoutButton from '@/components/auth/LogoutButton';

import heroFreses from '@/images/hero-fresas.png';

const BRAND = {
  nombre: 'Dolce Seli',
  tagline: 'Panel de administración',
} as const;

type AdminAction = {
  id: 'pedidos' | 'inventario' | 'productos';
  title: string;
  desc: string;
  emoji: string;
  href: string;
  accent: 'pink' | 'amber' | 'emerald';
};

const ACTIONS: AdminAction[] = [
  {
    id: 'pedidos',
    title: 'Pedidos',
    desc: 'Revisa, actualiza estados y entrega.',
    emoji: '🧾',
    href: '/fresas/pedidos',
    accent: 'pink',
  },
  {
    id: 'inventario',
    title: 'Inventario',
    desc: 'Insumos, existencias y mínimos.',
    emoji: '📦',
    href: '/fresas/admin/inventario',
    accent: 'amber',
  },
  {
    id: 'productos',
    title: 'Productos',
    desc: 'Menú, paquetes, toppings y precios.',
    emoji: '🍓',
    href: '/fresas/admin',
    accent: 'emerald',
  },
];

function accentStyles(accent: AdminAction['accent']) {
  switch (accent) {
    case 'pink':
      return {
        ring: 'hover:ring-pink-300/30',
        border: 'border-pink-200/10 hover:border-pink-200/25',
        glow: 'hover:shadow-[0_20px_80px_rgba(232,93,117,0.18)]',
        chip: 'bg-pink-500/15 text-pink-200 border-pink-200/20',
        iconBg: 'bg-pink-500/12 border-pink-200/15',
      };
    case 'amber':
      return {
        ring: 'hover:ring-amber-300/30',
        border: 'border-amber-200/10 hover:border-amber-200/25',
        glow: 'hover:shadow-[0_20px_80px_rgba(246,179,32,0.18)]',
        chip: 'bg-amber-500/15 text-amber-200 border-amber-200/20',
        iconBg: 'bg-amber-500/12 border-amber-200/15',
      };
    case 'emerald':
      return {
        ring: 'hover:ring-emerald-300/30',
        border: 'border-emerald-200/10 hover:border-emerald-200/25',
        glow: 'hover:shadow-[0_20px_80px_rgba(16,185,129,0.16)]',
        chip: 'bg-emerald-500/15 text-emerald-200 border-emerald-200/20',
        iconBg: 'bg-emerald-500/12 border-emerald-200/15',
      };
  }
}

export default function AdminWelcomePage() {
  return (
    <main className="min-h-screen bg-[#0b0b0c] text-white">
      {/* Fondo / decoración */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(900px 500px at 55% 15%, rgba(232,93,117,0.22), transparent 60%), radial-gradient(800px 500px at 20% 70%, rgba(246,179,32,0.14), transparent 60%), radial-gradient(700px 500px at 80% 80%, rgba(16,185,129,0.10), transparent 60%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(247,168,184,1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Contenedor */}
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-10">

        {/* Barra superior con botón de sesión */}
        <div className="flex justify-end mb-6">
          <LogoutButton />
        </div>

        {/* Header */}
        <header className="flex flex-col items-center gap-5 text-center">
          <div className="relative h-[140px] w-[140px] overflow-hidden rounded-full border border-white/10 bg-white/5 shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
            <Image
              src={heroFreses}
              alt="Dolce Seli"
              fill
              priority
              className="object-cover"
              sizes="140px"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm tracking-[0.35em] text-white/55 uppercase">
              {BRAND.nombre}
            </p>
            <h1 className="text-balance font-black leading-tight text-[clamp(2rem,5vw,3.2rem)]">
              {BRAND.tagline}{' '}
              <span className="italic text-[#E85D75]">🍓</span>
            </h1>
            <p className="mx-auto max-w-xl text-white/60">
              Entra rápido a lo importante: pedidos del día, control de inventario
              y actualización del menú.
            </p>
          </div>
        </header>

        {/* Cards */}
        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIONS.map((a) => {
            const s = accentStyles(a.accent);
            return (
              <Link
                key={a.id}
                href={a.href}
                className={[
                  'group relative rounded-2xl border bg-white/[0.04] p-5',
                  'transition-all duration-200 hover:-translate-y-1',
                  'ring-1 ring-transparent',
                  s.border,
                  s.ring,
                  s.glow,
                ].join(' ')}
              >
                {/* Top gradient line */}
                <div
                  className="absolute left-0 top-0 h-[2px] w-0 group-hover:w-full transition-all duration-300"
                  style={{
                    background:
                      a.accent === 'pink'
                        ? 'linear-gradient(90deg,#E85D75,#F7A8B8)'
                        : a.accent === 'amber'
                        ? 'linear-gradient(90deg,#f6b320,#ffd27a)'
                        : 'linear-gradient(90deg,#10b981,#6ee7b7)',
                  }}
                />

                <div className="flex items-start justify-between gap-3">
                  <div className={['flex h-12 w-12 items-center justify-center rounded-xl border', s.iconBg].join(' ')}>
                    <span className="text-2xl">{a.emoji}</span>
                  </div>
                  <span className={['inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold', s.chip].join(' ')}>
                    Entrar →
                  </span>
                </div>

                <div className="mt-4 space-y-1">
                  <h2 className="text-lg font-bold">{a.title}</h2>
                  <p className="text-sm text-white/60">{a.desc}</p>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-white/45">
                  <span className="rounded-full bg-black/30 px-2 py-1 border border-white/10">
                    Ruta: {a.href}
                  </span>
                </div>
              </Link>
            );
          })}
        </section>

        {/* Footer mini */}
        <footer className="mt-auto pt-10 text-center text-xs text-white/35">
          © {new Date().getFullYear()} Dolce Seli · Admin
        </footer>
      </div>
    </main>
  );
}