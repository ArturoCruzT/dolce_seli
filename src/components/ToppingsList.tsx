'use client';

import { Topping } from '@/types';

interface ToppingsListProps {
  toppings: Topping[];
}

export default function ToppingsList({ toppings }: ToppingsListProps) {
  return (
    <section className="bg-gradient-to-br from-pink-50 via-white to-cream-50 rounded-[24px] p-8 shadow-[0_8px_25px_rgba(0,0,0,0.05)]">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-pink-deep mb-2 font-playfair">
          ✨ Toppings Disponibles
        </h2>
        <p className="text-gray-600 text-sm">
          Personaliza tu experiencia Dolce Seli
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {toppings.map((topping) => (
          <div
            key={topping.id}
            className="bg-white rounded-[16px] p-4 text-center shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-pink-100"
          >
            <div className="text-3xl mb-2">
              {getToppingEmoji(topping.nombre)}
            </div>
            <p className="text-gray-800 font-medium text-sm">
              {topping.nombre}
            </p>
            {topping.descripcion && (
              <p className="text-xs text-gray-500 mt-1">
                {topping.descripcion}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          💝 Cada producto incluye <span className="font-bold text-pink-deep">1 topping gratis</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Toppings adicionales: <span className="font-semibold">$5 c/u</span>
        </p>
      </div>
    </section>
  );
}

// Helper para emojis según el nombre del topping
function getToppingEmoji(nombre: string): string {
  const emojiMap: Record<string, string> = {
    'Nuez': '🌰',
    'Coco rallado': '🥥',
    'Chocoreta': '🍫',
    'ChocoCrispis': '🍪',
    'Arroz inflado': '🍚',
    'Krankys': '🥨',
    'Fruti Lupis': '🍬',
  };
  
  return emojiMap[nombre] || '✨';
}