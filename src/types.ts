export type FragranceCategory = "Men" | "Women" | "Unisex";

export type BottleSize = "30ml" | "50ml" | "100ml";

export type CollectionFilter =
  | "All"
  | "Men"
  | "Women"
  | "Unisex"
  | "Luxury"
  | "Best Sellers";

export type PageRoute =
  | "home"
  | "shop"
  | "product"
  | "checkout"
  | "about"
  | "contact"
  | "admin";

export interface Product {
  id: number;
  name: string;
  slug: string;
  category: FragranceCategory;
  is_luxury: number;
  is_bestseller: number;
  description: string;
  top_notes: string;
  middle_notes: string;
  base_notes: string;
  price_pkr: number;
  sizes: string;
  stock: number;
  image_url: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  size: BottleSize;
  quantity: number;
  unitPrice: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  size: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export type OrderStatus = "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";

export interface Order {
  id: number;
  order_number: string;
  customer_id: number;
  customer_name: string;
  email: string;
  phone: string;
  delivery_address: string;
  total_amount: number;
  payment_method: string;
  status: OrderStatus;
  created_at: string;
  items: OrderItem[];
}

export type EnquiryStatus = "New" | "Reviewed" | "Resolved";

export interface CustomerEnquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: EnquiryStatus;
  created_at: string;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  lowStockCount: number;
  newEnquiriesCount: number;
}
