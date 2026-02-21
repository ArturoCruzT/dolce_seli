// ─────────────────────────────────────────────────────────────────────────────
// src/app/fresas/page.tsx  –  Dolce Seli · Home Page
// Stack: Next.js 14 · TypeScript · Tailwind CSS
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import Image from 'next/image';
import heroFreses from '@/images/hero-fresas.png';
import seliDuo from '@/images/seli-duo.png';
import seliClasico from '@/images/seli-clasico.png';
import seliMediano from '@/images/seli-mediano.png';
import seliChoco from '@/images/seli-choco.png';
import seliFamiliar from '@/images/familia-seli.png';
import momentoDolce from '@/images/momento dolce.png';
import paraCompartir from '@/images/momento dolce.png';
import esenciaSeli from '@/images/esencia-seli.png';
import oreoEdicion from '@/images/oreo.png'; // 🔧 pon tu imagen en: src/images/edicion-oreo.png

// ══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ══════════════════════════════════════════════════════════════════════════════

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  emoji: string;
  tipo: 'individual' | 'paquete';
  badge?: string;
  incluye?: string[];
  toppingsSugeridos?: string;
  imagen?: import('next/image').StaticImageData;
}

interface OpcionPedido {
  id: string;
  nombre: string;
  emoji: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  href: string;
}

interface Testimonio {
  id: string;
  texto: string;
}

interface PasoCalidad {
  id: string;
  emoji: string;
  titulo: string;
  descripcion: string;
}

interface PuntoVenta {
  id: string;
  titulo: string;
  emoji: string;
  direccion?: string;
  horarios: string[];
  ctaLabel: string;
  ctaHref: string;
  ctaTipo: 'whatsapp' | 'maps' | 'plataforma';
}

// ══════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ══════════════════════════════════════════════════════════════════════════════

const WA_NUMERO = '7221645362';

const buildWAUrl = (mensaje: string): string =>
  `https://wa.me/${WA_NUMERO}?text=${encodeURIComponent(mensaje)}`;

const WA_MENSAJE_HERO = 'Hola, se me antojaron las fresas 🤤 Quiero el Dúo Dolce 🍓';
const TOPPING_EXTRA_PRECIO = 5;

const BRAND = {
  nombre: 'Dolce Seli',
  tagline: 'Antojos que se disfrutan bonito',
  ciudad: 'Metepec, Estado de México',
} as const;

const PRODUCTOS: Producto[] = [
  { id: 'seli-clasico',   nombre: 'Seli Clásico',  descripcion: 'Fresas con crema (6 oz)',               precio: 30,  emoji: '🍓', tipo: 'individual', imagen: seliClasico },
  { id: 'seli-choco',     nombre: 'Seli Choco',     descripcion: 'Fresas con chocolate semiamargo',       precio: 35,  emoji: '🍫', tipo: 'individual', toppingsSugeridos: 'Sugerido: coco o nuez', imagen: seliChoco },
  { id: 'seli-mediano',   nombre: 'Seli Mediano',   descripcion: 'Fresas con crema (12 oz)',              precio: 50,  emoji: '🍓', tipo: 'individual', imagen: seliMediano },
  { id: 'momento-dolce',  nombre: 'Momento Dolce',  descripcion: 'Para ese momento especial',             precio: 135, emoji: '💝', tipo: 'paquete', badge: 'Especial',   incluye: ['2 Seli Medianos'], imagen: momentoDolce },
  { id: 'esencia-seli',   nombre: 'Esencia Seli',   descripcion: 'El combo perfecto para empezar',        precio: 65,  emoji: '✨', tipo: 'paquete', badge: 'Paquete',    incluye: ['1 Seli Clásico', '1 Seli Choco'], imagen: esenciaSeli },
  { id: 'duo-dolce',      nombre: 'Dúo Dolce',      descripcion: 'Perfecto para compartir',               precio: 90,  emoji: '🩷', tipo: 'paquete', badge: '⭐ Estrella', incluye: ['1 Seli Mediano', '1 Seli Choco'], imagen: seliDuo },
  { id: 'para-compartir', nombre: 'Para Compartir', descripcion: 'Doble porción de felicidad',            precio: 100, emoji: '🤝', tipo: 'paquete', badge: 'Paquete',    incluye: ['2 Seli Medianos'], imagen: paraCompartir },
  { id: 'familia-seli',   nombre: 'Familia Seli',   descripcion: 'Para que alcance para todos',           precio: 140, emoji: '🏠', tipo: 'paquete', badge: 'Familia',    incluye: ['3 Seli Medianos'], imagen: seliFamiliar },
];

const TOPPINGS: string[] = ['Nuez', 'Coco rallado', 'Chocoreta', 'ChocoCrispis', 'Arroz inflado', 'Krankys', 'Fruti Lupis'];

const TESTIMONIOS: Testimonio[] = [
  { id: 't1', texto: 'Se acabaron en minutos 🤤' },
  { id: 't2', texto: 'Saben a domingo feliz.' },
  { id: 't3', texto: 'No puedo pedir solo una vez.' },
  { id: 't4', texto: 'Las mejores que he probado.' },
];

const PASOS_CALIDAD: PasoCalidad[] = [
  { id: 'frescas',   emoji: '🍓', titulo: 'Fresas frescas seleccionadas',  descripcion: 'Nada de congeladas. Solo la mejor calidad.' },
  { id: 'crema',     emoji: '🥣', titulo: 'Crema con receta especial',      descripcion: 'Ese sabor único que no encontrarás en otro lado.' },
  { id: 'momento',   emoji: '⚡', titulo: 'Preparación al momento',         descripcion: 'Hechas al pedido. Siempre frescas, nunca de ayer.' },
  { id: 'porciones', emoji: '💝', titulo: 'Porciones generosas',            descripcion: 'Los antojos no tienen medias tintas.' },
];

const OPCIONES_PEDIDO: OpcionPedido[] = [
  { id: 'whatsapp', nombre: 'WhatsApp', emoji: '💬', bgColor: 'rgba(37,211,102,0.12)',  textColor: '#25D366', borderColor: 'rgba(37,211,102,0.35)', href: buildWAUrl(WA_MENSAJE_HERO) },
  { id: 'didi',     nombre: 'Didi Food', emoji: '🛵', bgColor: 'rgba(255,102,0,0.12)', textColor: '#FF6600', borderColor: 'rgba(255,102,0,0.35)',  href: '#' },
  { id: 'rappi',    nombre: 'Rappi',     emoji: '🛵', bgColor: 'rgba(255,68,0,0.12)',  textColor: '#FF4400', borderColor: 'rgba(255,68,0,0.35)',   href: '#' },
];

const PUNTOS_VENTA: PuntoVenta[] = [
  {
    id: 'mercadito', titulo: 'Punto Físico', emoji: '🛍',
    direccion: 'Mercadito de San Gabriel\nInfonavit San Gabriel, Metepec, Edo. Méx.',
    horarios: ['Domingos 10:00 AM – 2:00 PM'],
    ctaLabel: '📍 Ver en Maps',
    ctaHref: 'https://www.google.com/maps/search/?api=1&query=Mercadito+San+Gabriel+Infonavit+Metepec',
    ctaTipo: 'maps',
  },
  {
    id: 'domicilio', titulo: 'A Domicilio', emoji: '🚗',
    horarios: ['Viernes 6:00 PM – 9:00 PM', 'Sábados 12:00 PM – 9:00 PM'],
    ctaLabel: '💬 Pedir a domicilio',
    ctaHref: buildWAUrl('Hola, quiero pedir a domicilio 🍓'),
    ctaTipo: 'whatsapp',
  },
  {
    id: 'plataformas', titulo: 'Plataformas', emoji: '🛵',
    horarios: ['Viernes y Sábados 12:00 PM – 10:00 PM'],
    ctaLabel: 'Didi Food y Rappi', ctaHref: '#', ctaTipo: 'plataforma',
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTES UI BASE
// ══════════════════════════════════════════════════════════════════════════════

interface ButtonProps {
  children: React.ReactNode;
  href: string;
  variant?: 'primary' | 'whatsapp' | 'maps' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const BUTTON_VARIANTS: Record<NonNullable<ButtonProps['variant']>, React.CSSProperties> = {
  primary:  { background: 'linear-gradient(135deg,#E85D75,#c0304a)', color: '#fff', boxShadow: '0 8px 30px rgba(232,93,117,0.4)' },
  whatsapp: { background: '#25D366', color: '#fff', boxShadow: '0 4px 15px rgba(37,211,102,0.35)' },
  maps:     { background: 'rgba(66,133,244,0.12)', color: '#4285F4', border: '1px solid rgba(66,133,244,0.35)' },
  outline:  { background: 'transparent', color: '#F7A8B8', border: '1px solid rgba(247,168,184,0.3)' },
};

const BUTTON_SIZES: Record<NonNullable<ButtonProps['size']>, React.CSSProperties> = {
  sm: { padding: '0.5rem 1.25rem', fontSize: '0.85rem' },
  md: { padding: '0.75rem 1.75rem', fontSize: '1rem' },
  lg: { padding: '1rem 2.5rem', fontSize: '1.1rem' },
};

const Button: React.FC<ButtonProps> = ({ children, href, variant = 'primary', size = 'md', className = '' }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${className}`}
    style={{ ...BUTTON_VARIANTS[variant], ...BUTTON_SIZES[size] }}
  >
    {children}
  </a>
);

interface SectionHeaderProps {
  label: string;
  title: string;
  theme?: 'dark' | 'light';
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ label, title, theme = 'dark' }) => (
  <div className="text-center mb-12">
    <span style={{ fontFamily: "'Great Vibes',cursive", fontSize: '1.8rem', color: '#E85D75', display: 'block', marginBottom: '0.25rem' }}>
      {label}
    </span>
    <h2
      style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, lineHeight: 1.15, color: theme === 'light' ? '#5A3A2E' : '#fff' }}
      dangerouslySetInnerHTML={{ __html: title }}
    />
    <div style={{ width: 56, height: 2, background: 'linear-gradient(90deg,#E85D75,#F7A8B8)', borderRadius: 2, margin: '1.25rem auto 0' }} />
  </div>
);

interface MenuCardProps {
  producto: Producto;
}

const MenuCard: React.FC<MenuCardProps> = ({ producto }) => {
  const waUrl = buildWAUrl(`Hola, quiero pedir: ${producto.nombre} 🍓`);
  return (
    <div
      className="group hover:-translate-y-1.5 hover:border-[rgba(247,168,184,0.35)] hover:bg-white/[0.07]"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(247,168,184,0.13)', borderRadius: 20, overflow: 'hidden', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', transition: 'transform 0.2s, border-color 0.2s, background 0.2s' }}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" style={{ background: 'linear-gradient(90deg,#E85D75,#F7A8B8)', zIndex: 1 }} />

      {producto.badge && (
        <span style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: '#E85D75', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.5px', zIndex: 2 }}>
          {producto.badge}
        </span>
      )}

      {/* ── Recuadro imagen ── */}
      <div style={{ width: '100%', aspectRatio: '4/3', position: 'relative', background: 'rgba(247,168,184,0.05)', borderBottom: '1px solid rgba(247,168,184,0.1)', overflow: 'hidden', flexShrink: 0 }}>
        {producto.imagen ? (
          <Image
            src={producto.imagen}
            alt={producto.nombre}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '3.5rem', opacity: 0.5 }}>{producto.emoji}</span>
            <span style={{ fontSize: '0.65rem', color: 'rgba(247,168,184,0.4)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>Agregar foto</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(247,168,184,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div style={{ padding: '1.25rem 1.5rem 1.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.2rem' }}>{producto.nombre}</h3>
        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: '0.2rem', lineHeight: 1.5 }}>{producto.descripcion}</p>
        {producto.toppingsSugeridos && (
          <p style={{ fontSize: '0.72rem', color: 'rgba(247,168,184,0.55)', fontStyle: 'italic', marginBottom: '0.2rem' }}>{producto.toppingsSugeridos}</p>
        )}
        {producto.incluye && (
          <ul style={{ marginTop: '0.4rem', marginBottom: '0.4rem' }}>
            {producto.incluye.map((item) => (
              <li key={item} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>• {item}</li>
            ))}
          </ul>
        )}
        <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '2.8rem', fontWeight: 900, color: '#F7A8B8', display: 'block', margin: '0.75rem 0' }}>
          ${producto.precio}
        </span>
        <Button href={waUrl} variant="whatsapp" size="sm">💬 Pedir</Button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SECCIONES
// ══════════════════════════════════════════════════════════════════════════════

const HeroSection: React.FC = () => (
  <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem 1.5rem', position: 'relative', overflow: 'hidden', background: 'radial-gradient(ellipse at 60% 40%,#3a1020 0%,#1a0a10 40%,#111 100%)' }}>
    <div style={{ position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle,#F7A8B8 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
    <div className="animate-pulse" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(232,93,117,0.18) 0%,transparent 70%)', pointerEvents: 'none' }} />
    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span className="animate-fade-up" style={{ fontFamily: "'Great Vibes',cursive", fontSize: 'clamp(1.5rem,4vw,2.5rem)', color: '#F7A8B8', letterSpacing: 3, marginBottom: '0.5rem' }}>
        {BRAND.nombre}
      </span>
      {/* ── Hero image ── */}
      {(() => {
        const HERO_IMAGEN = true;
        return (
          <div
            className="animate-fade-up"
            style={{ width: 'clamp(240px,40vw,420px)', height: 'clamp(240px,40vw,420px)', borderRadius: '50%', border: '2px solid rgba(247,168,184,0.3)', boxShadow: '0 0 80px rgba(232,93,117,0.3),0 30px 80px rgba(0,0,0,0.6)', position: 'relative', overflow: 'hidden', marginBottom: '2rem', background: 'rgba(247,168,184,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', animationDelay: '150ms' }}
          >
            {HERO_IMAGEN ? (
              <Image src={heroFreses} alt="Fresas Dolce Seli" fill style={{ objectFit: 'cover' }} priority />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: 'clamp(4rem,12vw,7rem)', opacity: 0.45 }}>🍓</span>
                <span style={{ fontSize: '0.65rem', color: 'rgba(247,168,184,0.4)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>Foto hero</span>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(247,168,184,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
            )}
          </div>
        );
      })()}
      <h1 className="animate-fade-up" style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(2.2rem,6vw,5.5rem)', fontWeight: 900, lineHeight: 1.1, color: '#fff', maxWidth: 800, marginBottom: '1rem', animationDelay: '250ms' }}>
        Cuando se te antojaron…{' '}
        <em style={{ fontStyle: 'italic', color: '#E85D75' }}>ya no hay vuelta atrás.</em>
      </h1>
      <p className="animate-fade-up" style={{ fontSize: 'clamp(1rem,2vw,1.3rem)', color: 'rgba(255,255,255,0.6)', fontWeight: 300, marginBottom: '2.5rem', letterSpacing: 0.5, animationDelay: '400ms' }}>
        Fresas con crema que no se olvidan.
      </p>
      <div className="animate-fade-up" style={{ animationDelay: '550ms' }}>
        <Button href={buildWAUrl(WA_MENSAJE_HERO)} variant="primary" size="lg">🩷 Se me antojaron</Button>
      </div>
      <p className="animate-fade-up" style={{ marginTop: '1.25rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.38)', animationDelay: '700ms' }}>
        <span style={{ color: '#F7A8B8' }}>🛍 Domingos</span> en Mercadito San Gabriel &nbsp;·&nbsp;
        <span style={{ color: '#F7A8B8' }}>🚗 Viernes y sábado</span> a domicilio
      </p>
    </div>
  </section>
);

const ProductoEstrellaSection: React.FC = () => {
  const producto = PRODUCTOS.find((p) => p.id === 'duo-dolce')!;
  const waUrl = buildWAUrl(`Hola, quiero pedir el ${producto.nombre} 🍓`);
  return (
    <section style={{ padding: '5rem 1.5rem', background: '#1A1A1A' }}>
      <SectionHeader label="Nuestro favorito" title={producto.nombre} />
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '3rem', alignItems: 'center' }}>
        <div style={{ aspectRatio: '1', borderRadius: 20, background: 'rgba(247,168,184,0.05)', border: '1px solid rgba(247,168,184,0.15)', overflow: 'hidden', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
          {producto.imagen ? (
            <Image src={producto.imagen} alt={producto.nombre} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 50vw" priority />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', minHeight: 280 }}>
              <span style={{ fontSize: '6rem', opacity: 0.4 }}>{producto.emoji}</span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(247,168,184,0.4)', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>Agregar foto</span>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(247,168,184,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
          )}
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '5rem', fontWeight: 900, color: '#F7A8B8', display: 'block', marginBottom: '0.5rem' }}>${producto.precio}</span>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '1.25rem' }}>
            {producto.descripcion}. O para no compartir, no te juzgamos.
          </p>
          {producto.incluye && (
            <ul style={{ listStyle: 'none', marginBottom: '2rem' }}>
              {[...producto.incluye, 'Topping incluido'].map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem' }}>🍓</span> {item}
                </li>
              ))}
            </ul>
          )}
          <Button href={waUrl} variant="whatsapp">💬 Pedir por WhatsApp</Button>
        </div>
      </div>
    </section>
  );
};

// ── Edición Especial Oreo ─────────────────────────────────────────────────────
// Layout: imagen a la izquierda | info a la derecha (mismo patrón que ProductoEstrella)
const EdicionEspecialBanner: React.FC = () => {
  const OREO_IMAGEN = true; // 🔧 cambiar a false si aún no tienes la foto
  return (
    <section style={{ padding: '4rem 1.5rem', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,#8B0000,#c0304a,#8B0000)' }}>
      {/* Emojis decorativos de fondo */}
      <span style={{ position: 'absolute', top: '-1rem', left: '-1rem', fontSize: '8rem', opacity: 0.08, pointerEvents: 'none', userSelect: 'none' }}>❤️</span>
      <span style={{ position: 'absolute', bottom: '-1rem', right: '-1rem', fontSize: '8rem', opacity: 0.08, pointerEvents: 'none', userSelect: 'none' }}>❤️</span>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '3rem', alignItems: 'center' }}>

        {/* ── Recuadro imagen Oreo ── */}
        <div style={{ aspectRatio: '1', borderRadius: 20, overflow: 'hidden', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.2)' }}>
          {OREO_IMAGEN ? (
            <Image
              src={oreoEdicion}
              alt="Edición Especial Oreo – Dolce Seli"
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            /* Placeholder hasta tener la foto */
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', minHeight: 280 }}>
              <span style={{ fontSize: '6rem', opacity: 0.5 }}>🖤</span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>Agregar foto</span>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
            Edición limitada
          </span>
          <h3 style={{ fontFamily: "'Great Vibes',cursive", fontSize: 'clamp(2.5rem,6vw,4rem)', color: '#fff', marginBottom: '0.25rem', lineHeight: 1.1 }}>
            Edición Especial Oreo
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>
            Para la persona más dulce de tu vida 🤍<br />
            Fresas con crema y Oreo triturado
          </p>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '5rem', fontWeight: 900, color: '#fff', display: 'block', marginBottom: '1.5rem', lineHeight: 1 }}>
            $79
          </span>
          <Button href={buildWAUrl('Hola, quiero la Edición Especial Oreo 🖤🍓')} variant="whatsapp" size="lg">
            💬 Pedir por WhatsApp
          </Button>
        </div>
      </div>
    </section>
  );
};

const TestimoniosSection: React.FC = () => (
  <section style={{ padding: '5rem 1.5rem', background: '#111' }}>
    <SectionHeader label="Lo que dicen" title="Ellas ya probaron 🍓" />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '1.25rem', maxWidth: 960, margin: '0 auto' }}>
      {TESTIMONIOS.map((t) => (
        <div key={t.id} className="hover:-translate-y-1 hover:border-[rgba(247,168,184,0.35)]" style={{ background: 'rgba(247,168,184,0.07)', border: '1px solid rgba(247,168,184,0.15)', borderRadius: 18, padding: '1.75rem 1.5rem', textAlign: 'center', transition: 'transform 0.2s,border-color 0.2s' }}>
          <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', color: 'rgba(255,255,255,0.85)', fontSize: '1rem', lineHeight: 1.6 }}>
            &ldquo;{t.texto}&rdquo;
          </p>
          <div style={{ color: '#F7A8B8', fontSize: '0.8rem', marginTop: '0.75rem' }}>★★★★★</div>
        </div>
      ))}
    </div>
  </section>
);

const MenuSection: React.FC = () => (
  <section style={{ padding: '5rem 1.5rem', background: '#1A1A1A' }}>
    <SectionHeader label="Todo el sabor" title="Nuestro Menú" />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: '1.25rem', maxWidth: 1100, margin: '0 auto' }}>
      {PRODUCTOS.map((producto) => (
        <MenuCard key={producto.id} producto={producto} />
      ))}
    </div>
    <div style={{ marginTop: '3.5rem', textAlign: 'center' }}>
      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', marginBottom: '1rem' }}>✦ Todos los productos incluyen 1 topping</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center', maxWidth: 640, margin: '0 auto 1rem' }}>
        {TOPPINGS.map((topping) => (
          <span key={topping} style={{ background: 'rgba(247,168,184,0.08)', border: '1px solid rgba(247,168,184,0.2)', color: 'rgba(255,255,255,0.7)', padding: '0.35rem 1rem', borderRadius: 100, fontSize: '0.82rem' }}>
            {topping}
          </span>
        ))}
      </div>
      <span style={{ color: '#E85D75', fontSize: '0.85rem', fontWeight: 600 }}>+ Topping extra ${TOPPING_EXTRA_PRECIO}</span>
    </div>
  </section>
);

const CalidadSection: React.FC = () => (
  <section style={{ padding: '5rem 1.5rem', background: '#FFF3E8' }}>
    <SectionHeader label="Nuestra promesa" title="Calidad que se nota<br/>en cada cucharada" theme="light" />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '2.5rem', maxWidth: 900, margin: '0 auto' }}>
      {PASOS_CALIDAD.map((paso) => (
        <div key={paso.id} style={{ textAlign: 'center' }}>
          <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'rgba(214,40,57,0.08)', border: '1px solid rgba(214,40,57,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', margin: '0 auto 1rem' }}>
            {paso.emoji}
          </div>
          <h4 style={{ fontFamily: "'Playfair Display',serif", fontSize: '0.95rem', fontWeight: 700, color: '#D62839', marginBottom: '0.4rem' }}>{paso.titulo}</h4>
          <p style={{ fontSize: '0.82rem', color: '#4A4A4A', lineHeight: 1.7 }}>{paso.descripcion}</p>
        </div>
      ))}
    </div>
  </section>
);

const PedidosSection: React.FC = () => (
  <section style={{ padding: '5rem 1.5rem', background: '#1A1A1A' }}>
    <SectionHeader label="Elige tu forma" title="Pídelas como tú quieras" />
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', justifyContent: 'center', maxWidth: 700, margin: '0 auto' }}>
      {OPCIONES_PEDIDO.map((op) => (
        <a
          key={op.id}
          href={op.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`pedido-btn-${op.id} hover:-translate-y-1`}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem 2.25rem', borderRadius: 20, minWidth: 140, background: op.bgColor, color: op.textColor, border: `1px solid ${op.borderColor}`, fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', transition: 'transform 0.2s,box-shadow 0.2s' }}
        >
          <span style={{ fontSize: '2.5rem' }}>{op.emoji}</span>
          {op.nombre}
        </a>
      ))}
    </div>
  </section>
);

const UbicacionSection: React.FC = () => (
  <section style={{ padding: '5rem 1.5rem', background: '#0f0f0f' }}>
    <SectionHeader label="Encuéntranos" title="¿Dónde y cuándo?" />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
      {PUNTOS_VENTA.map((punto) => (
        <div key={punto.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(247,168,184,0.12)', borderRadius: 20, padding: '2rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', fontWeight: 700, color: '#F7A8B8' }}>
            {punto.emoji} {punto.titulo}
          </h3>
          {punto.direccion && (
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{punto.direccion}</p>
          )}
          <div>
            {punto.horarios.map((h) => (
              <p key={h} style={{ fontSize: '0.82rem', color: 'rgba(247,168,184,0.8)', fontWeight: 500, lineHeight: 1.8 }}>{h}</p>
            ))}
          </div>
          {punto.ctaTipo === 'plataforma' ? (
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {OPCIONES_PEDIDO.filter((o) => o.id !== 'whatsapp').map((op) => (
                <a key={op.id} href={op.href} target="_blank" rel="noopener noreferrer" style={{ padding: '0.4rem 1rem', borderRadius: 100, fontSize: '0.78rem', fontWeight: 600, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.12)', textDecoration: 'none' }}>
                  {op.emoji} {op.nombre}
                </a>
              ))}
            </div>
          ) : (
            <Button href={punto.ctaHref} variant={punto.ctaTipo === 'maps' ? 'maps' : 'whatsapp'} size="sm">
              {punto.ctaLabel}
            </Button>
          )}
        </div>
      ))}
    </div>
  </section>
);

const Footer: React.FC = () => (
  <footer style={{ background: '#0a0a0a', borderTop: '1px solid rgba(247,168,184,0.08)', textAlign: 'center', padding: '3rem 1.5rem' }}>
    <p style={{ fontFamily: "'Great Vibes',cursive", fontSize: '3rem', color: '#F7A8B8', marginBottom: '0.25rem' }}>{BRAND.nombre}</p>
    <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.28)', fontStyle: 'italic' }}>{BRAND.tagline}</p>
    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.18)', marginTop: '0.5rem' }}>{BRAND.ciudad} 🍓</p>
  </footer>
);

const StickyBar: React.FC = () => (
  <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(17,17,17,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(247,168,184,0.12)', display: 'flex', justifyContent: 'center', gap: '0.6rem', padding: '0.7rem 1rem' }}>
    {OPCIONES_PEDIDO.map((op) => (
      <a
        key={op.id}
        href={op.href}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:-translate-y-0.5 active:scale-95"
        style={{ flex: 1, maxWidth: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.6rem 0.75rem', borderRadius: 100, fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none', background: op.id === 'whatsapp' ? '#25D366' : op.id === 'didi' ? '#FF6600' : '#FF4400', color: '#fff', transition: 'transform 0.15s' }}
      >
        {op.emoji} {op.nombre}
      </a>
    ))}
  </div>
);

const GlobalStyles: React.FC = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Poppins:wght@300;400;500;600&family=Great+Vibes&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{font-family:'Poppins',sans-serif;background:#111;color:#fff;overflow-x:hidden}
    ::selection{background:rgba(247,168,184,0.3);color:#fff}
    @keyframes fade-up{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
    .animate-fade-up{animation:fade-up 0.75s ease both}
    .sticky-spacer{height:64px}
    .pedido-btn-whatsapp:hover{box-shadow:0 0 30px rgba(37,211,102,0.3)}
    .pedido-btn-didi:hover{box-shadow:0 0 30px rgba(255,102,0,0.3)}
    .pedido-btn-rappi:hover{box-shadow:0 0 30px rgba(255,68,0,0.3)}
  `}</style>
);

// ══════════════════════════════════════════════════════════════════════════════
// PAGE EXPORT
// ══════════════════════════════════════════════════════════════════════════════

export default function HomePage() {
  return (
    <>
      <GlobalStyles />
      <main>
        <HeroSection />
        <ProductoEstrellaSection />
        <EdicionEspecialBanner />
        <TestimoniosSection />
        <MenuSection />
        <CalidadSection />
        <PedidosSection />
        <UbicacionSection />
        <Footer />
        <div className="sticky-spacer" />
      </main>
      <StickyBar />
    </>
  );
}