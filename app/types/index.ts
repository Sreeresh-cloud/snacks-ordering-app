export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface MenuItemData {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

export interface Banner {
  id?: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  createdAt?: Date | unknown;
}

export interface Order {
  id?: string;
  name: string;
  phone: string;
  address: string;
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  status: "placed" | "preparing" | "out_for_delivery" | "delivered";
  createdAt: Date | unknown;
  userId?: string;
  userEmail?: string;
  userName?: string;
  userPhoto?: string;
}
