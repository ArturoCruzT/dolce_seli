// src/app/page.tsx

import Link from 'next/link';

interface BusinessLine {
  id: 'fresas' | 'mayoreo' | 'mesas';
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  href: string;
  emoji: string;
}

export default function HomePage() {
  const businessLines: BusinessLine[] = [
    {
      id: 'fresas',
      title: 'Fresas con crema',
      subtitle: 'Detalles premium listos para regalar',
      description:
        'Presentaciones cuidadas, toppings deliciosos y ediciones especiales para sorprender en cualquier ocasión.',
      features: [
        'Presentación tipo regalo',
        'Frases personalizadas',
        'Ediciones especiales',
        'Listo para entregar',
      ],
      href: '/fresas',
      emoji: '🍓',
    },
    {
      id: 'mayoreo',
      title: 'Dulces por mayoreo',
      subtitle: 'Precios competitivos por volumen',
      description:
        'Venta por volumen para negocios, eventos y mesas de dulces. Calidad constante y precios accesibles.',
      features: ['Precios de mayoreo', 'Compra por volumen', 'Ideal para reventa', 'Stock constante'],
      href: '/mayoreo',
      emoji: '🍬',
    },
    {
      id: 'mesas',
      title: 'Mesa de dulces',
      subtitle: 'Montajes para eventos inolvidables',
      description:
        'Diseñamos mesas personalizadas para XV años, bodas, cumpleaños y eventos corporativos.',
      features: ['Diseño temático', 'Montaje incluido', 'Personalización', 'Cotización rápida'],
      href: '/eventos',
      emoji: '🎉',
    },
  ];

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* HERO */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="py-12 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-sm text-gray-600">🍓🍬🎉 Tres vertientes · Una sola marca</p>

              <h1 className="text-3xl md:text-5xl font-bold mt-2 leading-tight">
                Todo lo dulce <span className="text-gray-900">en un solo lugar</span>
              </h1>

              <p className="text-gray-700 mt-4 text-base md:text-lg leading-relaxed">
                Dolce Seli une <strong>detalles premium</strong>, <strong>mayoreo</strong> y{' '}
                <strong>eventos</strong>. Elige lo que necesitas hoy y te ayudamos a hacerlo fácil.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/fresas"
                  className="px-5 py-3 rounded-xl bg-black text-white hover:opacity-90 transition"
                >
                  Ver fresas
                </Link>

                <Link
                  href="/eventos"
                  className="px-5 py-3 rounded-xl bg-gray-900 text-white hover:opacity-90 transition"
                >
                  Cotizar evento
                </Link>

                <Link
                  href="/mayoreo"
                  className="px-5 py-3 rounded-xl bg-gray-100 text-gray-900 hover:bg-gray-200 transition"
                >
                  Comprar mayoreo
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">Presentación premium</span>
                <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">Precio accesible</span>
                <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">Listo para regalar</span>
                <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">Listo para eventos</span>
              </div>
            </div>

            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6 md:p-8">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Lo más pedido</p>
                <span className="text-xs px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
                  Ediciones especiales
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="p-4 rounded-xl bg-white border border-gray-200">
                  <p className="font-semibold">Fresas con crema</p>
                  <p className="text-sm text-gray-600 mt-1">Perfectas para un detalle rápido y bonito.</p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-gray-200">
                  <p className="font-semibold">Mayoreo para mesas</p>
                  <p className="text-sm text-gray-600 mt-1">Volumen, variedad y precio para tu evento.</p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-gray-200">
                  <p className="font-semibold">Mesa de dulces</p>
                  <p className="text-sm text-gray-600 mt-1">Montaje completo y personalizado.</p>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                * Aquí puedes colocar fotos reales cuando las tengas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BUSINESS LINES */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="py-12 md:py-16">
            <h2 className="text-2xl md:text-3xl font-bold">Elige tu experiencia Dolce Seli</h2>
            <p className="text-gray-700 mt-2">
              Tres formas de disfrutar lo dulce: <strong>detalle</strong>, <strong>volumen</strong> o{' '}
              <strong>evento</strong>.
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {businessLines.map((line) => (
                <article key={line.id} className="p-6 rounded-2xl shadow-sm bg-white border border-gray-200">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">{line.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{line.subtitle}</p>
                    </div>

                    <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                      {line.emoji}
                    </span>
                  </div>

                  <p className="text-gray-700 mt-4 leading-relaxed">{line.description}</p>

                  <ul className="mt-4 space-y-2">
                    {line.features.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Link href={line.href} className="inline-block mt-6 font-semibold underline">
                    Explorar →
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="py-12 md:py-16">
            <div className="p-8 rounded-2xl bg-gray-900 text-white">
              <h2 className="text-2xl md:text-3xl font-bold">¿Qué estás buscando hoy?</h2>
              <p className="mt-2 text-white/80">
                Un detalle rápido, surtir para vender o una mesa que se vea espectacular.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link href="/fresas" className="px-5 py-3 rounded-xl bg-white text-gray-900 hover:opacity-90 transition">
                  🍓 Detalle
                </Link>
                <Link href="/mayoreo" className="px-5 py-3 rounded-xl bg-white text-gray-900 hover:opacity-90 transition">
                  🍬 Mayoreo
                </Link>
                <Link href="/eventos" className="px-5 py-3 rounded-xl bg-white text-gray-900 hover:opacity-90 transition">
                  🎉 Evento
                </Link>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              Tip: si aún no existen las páginas /mayoreo o /eventos, créalas para que los links no den 404.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
