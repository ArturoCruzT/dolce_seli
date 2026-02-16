import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-3xl">🍓</span>
            <h1 className="text-2xl font-bold">Dolce Seli</h1>
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link href="/productos" className="hover:text-pink-100 transition">
              Productos
            </Link>
            <Link href="/fresas" className="hover:text-pink-100 transition">
              Fresas
            </Link>
            <Link href="/pedidos" className="hover:text-pink-100 transition">
              Mis Pedidos
            </Link>
          </nav>

          <Link 
            href="/carrito" 
            className="flex items-center space-x-2 bg-white text-pink-500 px-4 py-2 rounded-full hover:bg-pink-50 transition"
          >
            <ShoppingCart size={20} />
            <span className="font-semibold">Carrito</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
