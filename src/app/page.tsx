import Link from 'next/link';
import { Sparkles, Heart, Package } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="text-6xl mb-4">🍓</div>
          <h1 className="text-5xl font-bold text-pink-600 mb-4">
            Dolce Seli
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Antojos que se disfrutan bonito
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/productos"
              className="bg-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-pink-600 transition flex items-center justify-center gap-2"
            >
              <ShoppingBag size={20} />
              Ver Productos
            </Link>
            <Link
              href="/fresas"
              className="bg-white text-pink-500 border-2 border-pink-500 px-8 py-3 rounded-full font-semibold hover:bg-pink-50 transition"
            >
              Paquetes Especiales
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="text-4xl mb-4">🍓</div>
            <h3 className="text-xl font-bold text-pink-600 mb-2">
              Fresas Frescas
            </h3>
            <p className="text-gray-600">
              Seleccionamos las mejores fresas del día
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="text-4xl mb-4">❤️</div>
            <h3 className="text-xl font-bold text-pink-600 mb-2">
              Hechas con Amor
            </h3>
            <p className="text-gray-600">
              Cada producto preparado con dedicación
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-pink-600 mb-2">
              Entrega Rápida
            </h3>
            <p className="text-gray-600">
              Recoge en tienda o recibe en tu domicilio
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-pink-400 to-pink-500 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para disfrutar?
          </h2>
          <p className="text-lg mb-6">
            Todos nuestros productos incluyen 1 topping
          </p>
          <Link
            href="/productos"
            className="bg-white text-pink-500 px-8 py-3 rounded-full font-semibold hover:bg-pink-50 transition inline-block"
          >
            Hacer Pedido
          </Link>
        </div>
      </section>
    </div>
  );
}

function ShoppingBag({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
