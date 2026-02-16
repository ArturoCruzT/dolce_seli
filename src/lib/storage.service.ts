import { ProductoIndividual, Paquete, Topping } from '@/types';

// Simulación de base de datos con localStorage
// En producción, esto se reemplazaría por llamadas a API

export class StorageService {
  private static KEYS = {
    PRODUCTOS_INDIVIDUALES: 'dolce_productos_individuales',
    PAQUETES: 'dolce_paquetes',
    TOPPINGS: 'dolce_toppings',
  };

  // Productos Individuales
  static getProductosIndividuales(): ProductoIndividual[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.KEYS.PRODUCTOS_INDIVIDUALES);
    if (!data) {
      // Primera vez, inicializar con defaults
      const defaults = this.getDefaultProductos();
      this.saveProductosIndividuales(defaults);
      return defaults;
    }
    return JSON.parse(data);
  }

  static saveProductosIndividuales(productos: ProductoIndividual[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.KEYS.PRODUCTOS_INDIVIDUALES, JSON.stringify(productos));
    }
  }

  // Paquetes
  static getPaquetes(): Paquete[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.KEYS.PAQUETES);
    if (!data) {
      const defaults = this.getDefaultPaquetes();
      this.savePaquetes(defaults);
      return defaults;
    }
    return JSON.parse(data);
  }

  static savePaquetes(paquetes: Paquete[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.KEYS.PAQUETES, JSON.stringify(paquetes));
    }
  }

  // Toppings
  static getToppings(): Topping[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.KEYS.TOPPINGS);
    if (!data) {
      const defaults = this.getDefaultToppings();
      this.saveToppings(defaults);
      return defaults;
    }
    return JSON.parse(data);
  }

  static saveToppings(toppings: Topping[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.KEYS.TOPPINGS, JSON.stringify(toppings));
    }
  }

  // Datos por defecto
  private static getDefaultProductos(): ProductoIndividual[] {
    return [
      {
        id: '1',
        nombre: 'Seli Clásico',
        descripcion: 'Fresas con crema (6 oz)',
        precio: 30,
        tipo: 'individual',
        emoji: '🍓',
        toppingsIncluidos: 1,
        activo: true,
      },
      {
        id: '2',
        nombre: 'Seli Mediano',
        descripcion: 'Fresas con crema (12 oz)',
        precio: 50,
        tipo: 'individual',
        emoji: '🍓',
        toppingsIncluidos: 1,
        activo: true,
      },
      {
        id: '3',
        nombre: 'Seli Choco',
        descripcion: 'Fresas con chocolate semiamargo',
        precio: 35,
        tipo: 'individual',
        emoji: '🍫',
        toppingsIncluidos: 1,
        activo: true,
      },
    ];
  }

  private static getDefaultPaquetes(): Paquete[] {
    return [
      {
        id: '1',
        nombre: 'Esencia Seli',
        descripcion: 'El paquete perfecto para probar nuestros sabores clásicos',
        precio: 65,
        tipo: 'paquete',
        productosIncluidos: [
          { productoId: '1', cantidad: 1 },
          { productoId: '3', cantidad: 1 },
        ],
        toppingsIncluidos: 1,
        activo: true,
      },
      {
        id: '2',
        nombre: 'Dúo Dolce',
        descripcion: 'Perfecto para compartir en pareja',
        precio: 90,
        tipo: 'paquete',
        productosIncluidos: [
          { productoId: '2', cantidad: 1 },
          { productoId: '3', cantidad: 1 },
        ],
        toppingsIncluidos: 1,
        activo: true,
      },
    ];
  }

  private static getDefaultToppings(): Topping[] {
    return [
      { id: '1', nombre: 'Nuez', emoji: '🌰', activo: true },
      { id: '2', nombre: 'Coco rallado', emoji: '🥥', activo: true },
      { id: '3', nombre: 'Chocoreta', emoji: '🍫', activo: true },
      { id: '4', nombre: 'ChocoCrispis', emoji: '🍪', activo: true },
      { id: '5', nombre: 'Arroz inflado', emoji: '🍚', activo: true },
      { id: '6', nombre: 'Krankys', emoji: '🥨', activo: true },
      { id: '7', nombre: 'Fruti Lupis', emoji: '🍬', activo: true },
    ];
  }
}