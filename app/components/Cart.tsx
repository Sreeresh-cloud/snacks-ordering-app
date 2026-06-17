"use client";

import { useState } from "react";
import { CartItem } from "../types";

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

export default function Cart({
  items,
  onUpdateQuantity,
  onRemove,
  onCheckout,
}: CartProps) {
  const [isOpen, setIsOpen] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <>
      {/* Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:max-w-md md:left-1/2 md:-translate-x-1/2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 min-h-[56px]"
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛒</span>
            <span className="font-bold text-gray-900">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#FF6B35]">₹{totalPrice}</span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>
      </div>

      {/* Cart Drawer */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 md:max-w-md md:left-1/2 md:-translate-x-1/2 md:right-auto"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed bottom-[56px] left-0 right-0 bg-white rounded-t-xl shadow-2xl z-50 max-h-[70vh] overflow-y-auto md:max-w-md md:left-1/2 md:-translate-x-1/2">
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Your Cart</h2>

              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl block mb-2">🛒</span>
                  Your cart is empty
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-[#FF6B35] font-medium">
                            ₹{item.price * item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full text-gray-700 font-bold min-h-[32px]"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="w-8 h-8 flex items-center justify-center bg-[#FF6B35] rounded-full text-white font-bold min-h-[32px]"
                          >
                            +
                          </button>
                          <button
                            onClick={() => onRemove(item.id)}
                            className="ml-2 text-red-500 p-1 min-h-[32px] min-w-[32px]"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">
                        Total
                      </span>
                      <span className="text-xl font-bold text-[#FF6B35]">
                        ₹{totalPrice}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onCheckout();
                    }}
                    className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-bold py-4 px-6 rounded-lg transition-colors min-h-[56px] mb-4"
                  >
                    Proceed to Checkout
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
