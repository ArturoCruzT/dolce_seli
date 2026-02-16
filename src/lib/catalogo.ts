import { ProductoIndividual, Paquete, Topping } from './types';

// Toppings disponibles
export const TOPPINGS: Topping[] = [
  { id: 'nuez', nombre: 'Nuez', precioExtra: 5 },
  { id: 'coco', nombre: 'Coco rallado', precioExtra: 5 },
  { id: 'chocoreta', nombre: 'Chocoreta', precioExtra: 5 },
  { id: 'chococrispis', nombre: 'ChocoCrispis', precioExtra: 5 },
  { id: 'arroz-inflado', nombre: 'Arroz inflado', precioExtra: 5 },
  { id: 'krankys', nombre: 'Krankys', precioExtra: 5 },
  { id: 'fruti-lupis', nombre: 'Fruti Lupis', precioExtra: 5 },
];

// Productos Individuales
export const PRODUCTOS_INDIVIDUALES: ProductoIndividual[] = [
  {
    id: 'seli-clasico',
    tipo: 'clasico',
    nombre: 'Seli Clásico',
    descripcion: 'Fresas con crema (6 oz)',
    precio: 30,
    tamaño: '6 oz',
  },
  {
    id: 'seli-mediano',
    tipo: 'mediano',
    nombre: 'Seli Mediano',
    descripcion: 'Fresas con crema (12 oz)',
    precio: 50,
    tamaño: '12 oz',
  },
  {
    id: 'seli-choco',
    tipo: 'choco',
    nombre: 'Seli Choco',
    descripcion: 'Fresas con chocolate semiamargo',
    precio: 35,
    tamaño: '12 oz',
    toppingsSugeridos: ['coco', 'nuez'],
  },
];

// Paquetes
export const PAQUETES: Paquete[] = [
  {
    id: 'esencia-seli',
    nombre: 'Esencia Seli',
    descripcion: '1 Seli Clásico + 1 Seli Choco',
    precio: 65,
    items: [
      { tipo: 'clasico', cantidad: 1 },
      { tipo: 'choco', cantidad: 1 },
    ],
    incluye1Topping: true,
  },
  {
    id: 'duo-dolce',
    nombre: 'Dúo Dolce',
    descripcion: '1 Seli Mediano + 1 Seli Choco',
    precio: 90,
    items: [
      { tipo: 'mediano', cantidad: 1 },
      { tipo: 'choco', cantidad: 1 },
    ],
    incluye1Topping: true,
  },
  {
    id: 'para-compartir',
    nombre: 'Para Compartir',
    descripcion: '2 Seli Medianos',
    precio: 100,
    items: [
      { tipo: 'mediano', cantidad: 2 },
    ],
    incluye1Topping: true,
  },
  {
    id: 'familia-seli',
    nombre: 'Familia Seli',
    descripcion: '3 Seli Medianos',
    precio: 140,
    items: [
      { tipo: 'mediano', cantidad: 3 },
    ],
    incluye1Topping: true,
  },
  {
    id: 'momento-dolce',
    nombre: 'Momento Dolce',
    descripcion: '2 Seli Medianos',
    precio: 135,
    items: [
      { tipo: 'mediano', cantidad: 2 },
    ],
    incluye1Topping: true,
  },
];

// Productos especiales (edición Oreo)
export const PRODUCTOS_ESPECIALES = [
  {
    id: 'edicion-oreo',
    nombre: 'Edición Especial Oreo',
    descripcion: '2 Seli Medianos con Oreo',
    precio: 79,
    items: [
      { tipo: 'mediano', cantidad: 2 },
    ],
    toppingsIncluidos: ['Oreo'],
    esEdicionEspecial: true,
  },
];

// Precio del topping extra
export const PRECIO_TOPPING_EXTRA = 5;
