export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category: string;
  featured: boolean;
  bestseller: boolean;
  valentineSpecial: boolean;
  rating: number;
  reviews: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  customerEmail: string;
  status: 'pending' | 'paid' | 'delivered' | 'failed';
  paymentId?: string;
  createdAt: Date;
}
