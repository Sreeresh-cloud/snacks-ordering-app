"use client";

import { useState, useEffect } from "react";
import { Order } from "../types";
import { getOrders } from "../lib/firestore";
import OrderCard from "../components/OrderCard";
import Link from "next/link";

const ADMIN_PASSWORD = "admin123";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    const unsubscribe = getOrders((fetchedOrders) => {
      setOrders(fetchedOrders);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      setError("Incorrect password");
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <span className="text-4xl">🔐</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">Admin Login</h1>
            <p className="text-gray-500 text-sm mt-1">Enter password to continue</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent min-h-[48px]"
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-bold py-3 px-6 rounded-lg transition-colors min-h-[48px]"
            >
              Login
            </button>
          </form>

          <div className="text-center mt-4">
            <Link
              href="/"
              className="text-sm text-[#FF6B35] hover:underline"
            >
              ← Back to Menu
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const placedOrders = orders.filter((o) => o.status === "placed" || (o.status as string) === "pending");
  const preparingOrders = orders.filter((o) => o.status === "preparing");
  const outForDeliveryOrders = orders.filter((o) => o.status === "out_for_delivery");
  const deliveredOrders = orders.filter((o) => o.status === "delivered" || (o.status as string) === "completed");

  const activeCount = placedOrders.length + preparingOrders.length + outForDeliveryOrders.length;

  return (
    <main className="min-h-screen max-w-md mx-auto">
      <header className="sticky top-0 bg-white z-40 border-b border-gray-200 px-4 py-3">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">
              {orders.length} total • {activeCount} active
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-[#FF6B35] font-medium hover:underline min-h-[44px] flex items-center"
          >
            Menu →
          </Link>
        </div>
      </header>

      <div className="px-4 py-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            <div className="animate-spin text-3xl mb-2">⏳</div>
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl block mb-4">📭</span>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-500">
              Orders will appear here when customers place them.
            </p>
          </div>
        ) : (
          <>
            {placedOrders.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-3">
                  📋 Placed ({placedOrders.length})
                </h2>
                <div>
                  {placedOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              </div>
            )}

            {preparingOrders.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-3">
                  👨‍🍳 Preparing ({preparingOrders.length})
                </h2>
                <div>
                  {preparingOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              </div>
            )}

            {outForDeliveryOrders.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-3">
                  🚚 Out for Delivery ({outForDeliveryOrders.length})
                </h2>
                <div>
                  {outForDeliveryOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              </div>
            )}

            {deliveredOrders.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-3">
                  ✅ Delivered ({deliveredOrders.length})
                </h2>
                <div>
                  {deliveredOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
