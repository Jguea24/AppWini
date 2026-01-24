export type Product = {
  id: number;
  name: string;
  type: 'oscuro' | 'leche' | 'blanco' | 'mixto';
  cacao_percent: number;
  description: string;
  ingredients: string;
  price: number;
};
