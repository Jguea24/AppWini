// model/Product.ts
export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  image_url?: string;
  stock: number;
  description: string;
  category_id?: number;
  category?: string | { id?: number; name?: string };
  category_name?: string;
  categoryName?: string;
  type?: string;
  tipo?: string;
  is_promotion?: boolean;
}
