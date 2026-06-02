export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  weight: number;
  stock: number;
  category_id: string | null;
  images: string[];
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ProductWithCategory extends Product {
  categories: Pick<Category, 'name' | 'slug'> | null;
}

export interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  notes: string | null;
  total: number;
  status: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  qty: number;
  price_snapshot: number;
  created_at: string;
}

export interface OrderWithItems extends Order {
  items: (OrderItem & {
    products: Pick<Product, 'name' | 'images'> | null;
  })[];
}

export interface Setting {
  key: string;
  value: string;
  created_at: string;
}
