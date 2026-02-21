'use client';

// ─────────────────────────────────────────────────────────────────────────────
// src/components/FooterAdmin.tsx
// Footer con acceso oculto para administradores.
// Mecanismo: 5 clicks sobre el nombre de la marca revelan los enlaces admin.
// Sin estilos llamativos — invisible para clientes normales.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';

interface FooterAdminProps {
  nombre: string;
  tagline: string;
  ciudad: string;
}

const CLICKS_REQUERIDOS = 1;

const RUTAS_ADMIN = [
  { label: 'Pedidos',    href: '/fresas/pedidos',    emoji: '📋' },
  { label: 'Productos',  href: '/fresas/admin',  emoji: '🍓' },
  { label: 'Inventario', href: '/fresas/admin/inventario', emoji: '📦' },
] as const;

export const FooterAdmin: React.FC<FooterAdminProps> = ({ nombre, tagline, ciudad }) => {
  const [clicks, setClicks]     = useState<number>(0);
  const [visible, setVisible]   = useState<boolean>(true);

  const handleClick = useCallback(() => {
    const siguiente = clicks + 1;
    if (siguiente >= CLICKS_REQUERIDOS) {
      setVisible((v) => !v); // toggle — otro set de 5 clicks lo oculta
      setClicks(0);
    } else {
      setClicks(siguiente);
    }
  }, [clicks]);

  return (
    <footer
      style={{
        background: '#0a0a0a',
        borderTop: '1px solid rgba(247,168,184,0.08)',
        textAlign: 'center',
        padding: '3rem 1.5rem',
      }}
    >
      {/* Nombre de la marca — área clickeable para admin */}
      <p
        onClick={handleClick}
        style={{
          fontFamily: "'Great Vibes',cursive",
          fontSize: '3rem',
          color: '#F7A8B8',
          marginBottom: '0.25rem',
          cursor: 'default',          // sin puntero — parece texto normal
          userSelect: 'none',
        }}
      >
        {nombre}
      </p>

      <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.28)', fontStyle: 'italic' }}>
        {tagline}
      </p>
      <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.18)', marginTop: '0.5rem' }}>
        {ciudad} 🍓
      </p>

      {/* ── Panel admin oculto ── */}
      {visible && (
        <nav
          style={{
            marginTop: '2rem',
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
            animation: 'fade-up 0.3s ease both',
          }}
        >
          {RUTAS_ADMIN.map(({ label, href, emoji }) => (
            <a
              key={href}
              href={href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.3rem 0.85rem',
                borderRadius: 100,
                fontSize: '0.72rem',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.25)',           // muy apagado
                border: '1px solid rgba(255,255,255,0.07)',
                background: 'transparent',
                textDecoration: 'none',
                letterSpacing: '0.5px',
                transition: 'color 0.2s, border-color 0.2s',
              }}
              // Hover inline con CSS class sería ideal, pero sin hoja de estilos
              // usamos title para que no haya tooltip llamativo
              title=""
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(247,168,184,0.55)';
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(247,168,184,0.15)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.25)';
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.07)';
              }}
            >
              <span style={{ fontSize: '0.7rem' }}>{emoji}</span>
              {label}
            </a>
          ))}
        </nav>
      )}
    </footer>
  );
};
