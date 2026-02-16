import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dolce Seli - Antojos que se disfrutan bonito',
  description: 'Fresas con crema y chocolate. Pide ahora tus productos favoritos.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen pb-20 md:pb-0">
          {children}
        </main>
        <Navigation />
      </body>
    </html>
  );
}
