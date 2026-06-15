import { supabase } from './supabase';
import type { ProductWithCategory, Category, Order, Setting } from '@/types';

// ========================
// PRODUCTS
// ========================

/** Fetch active products for storefront */
export async function getProducts(): Promise<ProductWithCategory[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ProductWithCategory[];
}

/** Fetch single product by ID */
export async function getProductById(id: string): Promise<ProductWithCategory | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  return data as ProductWithCategory | null;
}

/** Fetch featured products (latest N) */
export async function getFeaturedProducts(limit = 4): Promise<ProductWithCategory[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as ProductWithCategory[];
}

/** Admin: fetch ALL products including inactive */
export async function getAllProducts(): Promise<ProductWithCategory[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ProductWithCategory[];
}

/** Admin: create product */
export async function createProduct(product: {
  name: string;
  price: number;
  weight: number;
  stock: number;
  category_id: string | null;
  images: string[];
  description: string;
  is_active: boolean;
}) {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Admin: update product */
export async function updateProduct(id: string, updates: Partial<{
  name: string;
  price: number;
  weight: number;
  stock: number;
  category_id: string | null;
  images: string[];
  description: string;
  is_active: boolean;
}>) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Admin: delete product */
export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ========================
// CATEGORIES
// ========================

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function createCategory(category: { name: string; slug: string; image?: string }) {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ========================
// ORDERS
// ========================

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Order[];
}

export async function createOrder(
  order: { customer_name: string; phone: string; address: string; notes: string; total: number },
  items: { product_id: string; qty: number; price_snapshot: number }[]
) {
  const { data: newOrder, error: orderError } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single();

  if (orderError) throw orderError;

  const orderItems = items.map((item) => ({
    ...item,
    order_id: newOrder.id,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return newOrder;
}

export async function updateOrderStatus(id: string, status: string) {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
}

// ========================
// SETTINGS
// ========================

export async function getSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('settings')
    .select('*');

  if (error) throw error;

  const settings: Record<string, string> = {};
  (data as Setting[] | null)?.forEach((s) => {
    settings[s.key] = s.value;
  });
  return settings;
}

export async function updateSetting(key: string, value: string) {
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value }, { onConflict: 'key' });

  if (error) throw error;
}

// ========================
// STORAGE (Image Upload)
// ========================

/**
 * Upload image to Supabase Storage bucket `product-images`.
 * Make sure the bucket exists and is set to public in your Supabase dashboard.
 */
export async function uploadImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file);

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

// ========================
// SHIPPING ZONES
// ========================

export interface ShippingZone {
  id: string;
  zone_name: string;
  districts: string[];
  fee: number;
  estimated_days: string | null;
  is_active: boolean;
  created_at: string;
}

export async function getShippingZones(): Promise<ShippingZone[]> {
  const { data, error } = await supabase
    .from('shipping_zones')
    .select('*')
    .eq('is_active', true)
    .order('fee');

  if (error) throw error;
  return (data ?? []) as ShippingZone[];
}

export async function getAllShippingZones(): Promise<ShippingZone[]> {
  const { data, error } = await supabase
    .from('shipping_zones')
    .select('*')
    .order('fee');

  if (error) throw error;
  return (data ?? []) as ShippingZone[];
}

export async function createShippingZone(zone: {
  zone_name: string;
  districts: string[];
  fee: number;
  estimated_days: string;
}) {
  const { data, error } = await supabase
    .from('shipping_zones')
    .insert(zone)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateShippingZone(id: string, updates: Partial<{
  zone_name: string;
  districts: string[];
  fee: number;
  estimated_days: string;
  is_active: boolean;
}>) {
  const { data, error } = await supabase
    .from('shipping_zones')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteShippingZone(id: string) {
  const { error } = await supabase
    .from('shipping_zones')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function findShippingZone(district: string): Promise<ShippingZone | null> {
  const { data, error } = await supabase
    .from('shipping_zones')
    .select('*')
    .eq('is_active', true)
    .contains('districts', [district]);

  if (error) throw error;
  return (data?.[0] ?? null) as ShippingZone | null;
}

// ========================
// DASHBOARD STATS
// ========================

export async function getDashboardStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  const { count: newOrderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth);

  const { data: revenueData } = await supabase
    .from('orders')
    .select('total')
    .eq('status', 'Selesai')
    .gte('created_at', startOfMonth);

  const revenue = revenueData?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0;

  const { data: pendingOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'Menunggu Konfirmasi')
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    productCount: productCount ?? 0,
    newOrderCount: newOrderCount ?? 0,
    revenue,
    pendingOrders: (pendingOrders ?? []) as Order[],
  };
}
