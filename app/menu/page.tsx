"use client";

import { useState, useEffect } from "react";
import MenuItemComponent from "../components/MenuItem";
import Cart from "../components/Cart";
import CheckoutForm from "../components/CheckoutForm";
import UserProfile from "../components/UserProfile";
import { MenuItemData, CartItem } from "../types";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { getBanners } from "../lib/firestore";

const defaultSnacks: MenuItemData[] = [
  { id: "1", name: "Samosa", price: 20, image: "/samosa.jpg", description: "Crispy potato-filled pastry" },
  { id: "2", name: "Vada Pav", price: 25, image: "/vadapav.jpg", description: "Mumbai's favorite street food" },
  { id: "3", name: "French Fries", price: 60, image: "/fries.jpg", description: "Golden crispy fries" },
  { id: "4", name: "Chilli Paneer", price: 120, image: "/paneer.jpg", description: "Spicy Indo-Chinese paneer" },
  { id: "5", name: "Chicken Wings", price: 150, image: "/wings.jpg", description: "Spicy grilled wings" },
  { id: "6", name: "Nachos", price: 90, image: "/nachos.jpg", description: "Loaded cheese nachos" },
  { id: "7", name: "Spring Rolls", price: 80, image: "/rolls.jpg", description: "Vegetable spring rolls" },
  { id: "8", name: "Pani Puri", price: 40, image: "/panipuri.jpg", description: "Tangy and spicy puris" },
];

export default function MenuPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemData[]>(defaultSnacks);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = getBanners((banners) => {
      if (banners.length > 0) {
        const dynamicItems: MenuItemData[] = banners.map((banner) => ({
          id: banner.id!,
          name: banner.name,
          price: banner.price,
          image: banner.imageUrl,
          description: banner.description,
        }));
        setMenuItems(dynamicItems);
      } else {
        setMenuItems(defaultSnacks);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addToCart = (item: MenuItemData) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0);
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = cart.length > 0 ? 30 : 0;
  const totalPrice = subtotal + deliveryCharge;

  return (
    <main className="min-h-screen pb-20 max-w-md mx-auto bg-[#259B37]">
      <header className="sticky top-0 bg-[#259B37] z-40 border-b-2 border-[#F3C623] px-4 py-3">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div>
            <h1 className="text-2xl font-extrabold text-white drop-shadow-md">Snacks 💎</h1>
            <p className="text-sm text-white/80 font-medium">Delicious bites delivered</p>
          </div>
          <div className="flex items-center gap-3">
            <UserProfile />
          </div>
        </div>
      </header>

      <div className="px-4 py-4">
        <h2 className="text-lg font-extrabold text-[#F3C623] mb-4 drop-shadow-sm">Popular Items</h2>
        {isLoading ? (
          <div className="text-center py-12 text-white/80">
            <div className="animate-spin text-3xl mb-2 text-[#F3C623]">💎</div>
            Loading menu...
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {menuItems.map((item) => (
              <MenuItemComponent key={item.id} item={item} onAdd={addToCart} />
            ))}
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <Cart
          items={cart}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          onCheckout={() => setShowCheckout(true)}
        />
      )}

      {showCheckout && (
        <CheckoutForm
          cartItems={cart}
          subtotal={subtotal}
          deliveryCharge={deliveryCharge}
          total={totalPrice}
          user={user}
          onSuccess={() => {
            setCart([]);
            setShowCheckout(false);
          }}
          onCancel={() => setShowCheckout(false)}
        />
      )}
    </main>
  );
}
