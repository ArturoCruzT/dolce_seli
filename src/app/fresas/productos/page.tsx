import { obtenerProductosPorCategoria } from '@/lib/productos.service';
import { obtenerToppings } from '@/lib/toppings.service';
import ProductCard from '@/components/ProductCard';
import ToppingsList from '@/components/ToppingsList';

export const revalidate = 60; // Revalidar cada 60 segundos

export default async function ProductosPage() {
  // Cargar productos y toppings desde la base de datos
  const [paquetes, individuales, toppings] = await Promise.all([
    obtenerProductosPorCategoria('paquete'),
    obtenerProductosPorCategoria('individual'),
    obtenerToppings(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-pink-50/30 to-cream-50/50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-5xl">🍓</span>
            <h1 className="text-5xl md:text-6xl font-bold text-pink-deep font-playfair">
              Dolce Seli
            </h1>
            <span className="text-5xl">🍓</span>
          </div>
          
          <p className="text-xl text-gray-700 italic mb-3 font-allura" style={{ fontFamily: 'cursive' }}>
            Antojos que se disfrutan bonito
          </p>
          
          <div className="inline-block bg-gradient-to-r from-pink-seli to-pink-deep text-white px-6 py-3 rounded-full shadow-lg">
            <p className="text-sm font-medium">
              ✨ Todos los productos incluyen 1 topping • Topping extra $5
            </p>
          </div>
        </div>

        {/* Paquetes Dolce */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-pink-300 to-pink-deep rounded-full"></div>
            <h2 className="text-3xl md:text-4xl font-bold text-pink-deep font-playfair flex items-center gap-3">
              💝 Paquetes Dolce
            </h2>
            <div className="h-1 flex-1 bg-gradient-to-l from-transparent via-pink-300 to-pink-deep rounded-full"></div>
          </div>
          
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Momentos especiales presentados en una caja elegante. Perfectos para compartir o consentirte.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paquetes.map((paquete) => (
              <ProductCard
                key={paquete.id}
                producto={paquete}
                toppings={toppings}
              />
            ))}
          </div>
        </section>

        {/* Productos Individuales */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-pink-300 to-pink-deep rounded-full"></div>
            <h2 className="text-3xl md:text-4xl font-bold text-pink-deep font-playfair flex items-center gap-3">
              💝 Individuales
            </h2>
            <div className="h-1 flex-1 bg-gradient-to-l from-transparent via-pink-300 to-pink-deep rounded-full"></div>
          </div>

          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Disfruta de nuestros deliciosos Selis en porciones individuales. La dulzura perfecta en cada bocado.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {individuales.map((producto) => (
              <ProductCard
                key={producto.id}
                producto={producto}
                toppings={toppings}
              />
            ))}
          </div>
        </section>

        {/* Toppings Disponibles */}
        <ToppingsList toppings={toppings} />

        {/* Footer decorativo */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
            <span>🍓</span>
            <span>Hecho con amor</span>
            <span>•</span>
            <span>Dolce Seli</span>
            <span>•</span>
            <span>2025</span>
            <span>🍓</span>
          </div>
        </div>
      </div>
    </div>
  );
}