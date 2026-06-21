"use client";

import { useState, FormEvent } from "react";
import { CartItem, Order } from "../types";
import { createOrder } from "../lib/firestore";
import { User } from "firebase/auth";

interface CheckoutFormProps {
  cartItems: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  onSuccess: () => void;
  onCancel: () => void;
  user?: User | null;
}

export default function CheckoutForm({
  cartItems,
  subtotal,
  deliveryCharge,
  total,
  onSuccess,
  onCancel,
  user,
}: CheckoutFormProps) {
  const [name, setName] = useState(user?.displayName || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  const validatePhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 10;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!validatePhone(phone)) {
      setError("Please enter a valid phone number");
      return;
    }

    setIsSubmitting(true);
    try {
      await createOrder({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        items: cartItems,
        subtotal,
        deliveryCharge,
        total,
        userId: user?.uid || undefined,
        userEmail: user?.email || undefined,
        userName: user?.displayName || undefined,
        userPhoto: user?.photoURL || undefined,
      });
      setShowSuccess(true);
      setTimeout(() => {
        onSuccess();
        setShowSuccess(false);
        setName("");
        setPhone("");
        setAddress("");
      }, 2000);
    } catch (err) {
      console.error("Error placing order:", err);
      setError("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 md:max-w-md md:left-1/2 md:-translate-x-1/2">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order Placed!
          </h2>
          <p className="text-gray-600">
            Thank you, {name}. Your order is on its way!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end md:items-center justify-center p-0 md:p-4 md:max-w-md md:left-1/2 md:-translate-x-1/2">
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl min-h-[44px] min-w-[44px]"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent min-h-[48px]"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter 10-digit number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent min-h-[48px]"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address (Optional)
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Delivery address"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent resize-none"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900 font-medium">₹{subtotal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Delivery Charge</span>
                <span className="text-gray-900 font-medium">₹{deliveryCharge}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="font-bold text-gray-900">Order Total</span>
                <span className="text-xl font-bold text-[#FF6B35]">₹{total}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || cartItems.length === 0}
              className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors min-h-[56px]"
            >
              {isSubmitting ? "Placing Order..." : "Place Order"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
