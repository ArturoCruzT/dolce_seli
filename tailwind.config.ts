import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de colores oficial Dolce Seli
        'pink-seli': '#F7A8B8',
        'pink-deep': '#E85D75',
        'cream-dolce': '#FFF3E8',
        'chocolate-elegant': '#5A3A2E',
        'strawberry-intense': '#D62839',
        'green-natural': '#5E8C61',
        'white-pure': '#FFFFFF',
        'gray-soft': '#F4F4F4',
        'gray-text': '#4A4A4A',
      },
      fontFamily: {
        // Tipografía oficial
        playfair: ['Playfair Display', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
        allura: ['Allura', 'cursive'],
        'great-vibes': ['Great Vibes', 'cursive'],
      },
      borderRadius: {
        // Bordes redondeados característicos
        'dolce': '16px',
        'dolce-lg': '20px',
        'dolce-sm': '12px',
      },
      boxShadow: {
        // Sombras suaves de la marca
        'dolce': '0 8px 25px rgba(0, 0, 0, 0.05)',
        'dolce-lg': '0 12px 35px rgba(0, 0, 0, 0.08)',
        'dolce-hover': '0 12px 30px rgba(231, 93, 117, 0.15)',
      },
      backgroundImage: {
        'gradient-dolce': 'linear-gradient(135deg, #F7A8B8 0%, #E85D75 100%)',
        'gradient-cream': 'linear-gradient(135deg, #FFF3E8 0%, #F7A8B8 100%)',
      },
    },
  },
  plugins: [],
};

export default config;