"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { getUserOrders, updateOrderStatus } from "../lib/firestore";
import { Order } from "../types";
import { useRouter } from "next/navigation";
import Link from "next/link";

const statusConfig: Record<string, { label: string; color: string; step: number }> = {
  placed: { label: "Placed", color: "bg-blue-100 text-blue-700", step: 1 },
  preparing: { label: "Preparing", color: "bg-yellow-100 text-yellow-700", step: 2 },
  out_for_delivery: { label: "Out for Delivery", color: "bg-purple-100 text-purple-700", step: 3 },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700", step: 4 },
  // Backward compatibility
  pending: { label: "Placed", color: "bg-blue-100 text-blue-700", step: 1 },
  completed: { label: "Delivered", color: "bg-green-100 text-green-700", step: 4 },
};

export default function MyOrdersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = getUserOrders(user.uid, (userOrders) => {
      setOrders(userOrders);
    });
    return () => unsubscribe();
  }, [user]);

  const handleDelivered = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, "delivered");
    } catch (error) {
      console.error("Error marking delivered:", error);
    }
  };

  const formatDate = (date: Date | unknown) => {
    if (!date) return "N/A";
    if (date instanceof Date) {
      return date.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    const timestamp = date as { seconds?: number; toDate?: () => Date };
    if (timestamp?.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return "N/A";
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-white">
        <header className="sticky top-0 bg-[#4CAF50] z-40 px-4 py-2 shadow-md">
          <div className="flex justify-between items-center max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 relative">
                <Image
                  src="/logo.png"
                  alt="Crunch by Nadan"
                  fill
                  className="object-contain rounded-lg"
                  priority
                />
              </div>
              <Link href="/" className="text-xl font-extrabold text-white">← Orders</Link>
            </div>
          </div>
        </header>
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h1>
          <p className="text-gray-600 mb-6">Please sign in with Google to view your orders.</p>
          <Link href="/" className="inline-flex items-center justify-center bg-[#F3C623] hover:bg-[#d4ad1f] text-white font-bold py-3 px-6 rounded-lg transition-colors">
            Go to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-20">
      <header className="sticky top-0 bg-[#4CAF50] z-40 px-4 py-2 shadow-md">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative">
              <Image
                src="/logo.png"
                alt="Crunch by Nadan"
                fill
                className="object-contain rounded-lg"
                priority
              />
            </div>
            <Link href="/" className="text-xl font-extrabold text-white">← My Orders</Link>
          </div>
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || "User"} className="w-9 h-9 rounded-full object-cover border-2 border-[#F3C623]" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#F3C623] text-white flex items-center justify-center font-bold text-sm">
                {user.displayName?.[0] || user.email?.[0] || "?"}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-500 text-sm mb-6">
          {orders.length} {orders.length === 1 ? "order" : "orders"} found
        </p>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <Link href="/" className="inline-flex items-center justify-center bg-[#F3C623] hover:bg-[#d4ad1f] text-white font-bold py-3 px-6 rounded-lg transition-colors">
              Start Ordering
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const config = statusConfig[order.status];
              const currentStep = config.step;

              return (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Order #{order.id?.slice(-6).toUpperCase()}</p>
                      <h3 className="font-bold text-gray-900">{order.name}</h3>
                      <p className="text-gray-500 text-sm">{order.phone}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.color}`}>
                      {config.label}
                    </span>
                  </div>

                  <div className="border-t border-gray-100 pt-3 mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.name} x{item.quantity}</span>
                          <span className="text-gray-900 font-medium">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-sm text-gray-500">Total: </span>
                      <span className="font-bold text-[#F3C623]">₹{order.total}</span>
                    </div>
                    <div className="text-xs text-gray-400">{formatDate(order.createdAt)}</div>
                  </div>

                  {/* 4-step progress tracker */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-3">Order Progress:</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div key={step} className="flex-1 flex items-center">
                          <div className={`h-2 flex-1 rounded-full ${
                            step <= currentStep ? 'bg-[#F3C623]' : 'bg-gray-200'
                          }`} />
                          {step < 4 && (
                            <div className={`w-2 h-2 rounded-full mx-0.5 ${
                              step < currentStep ? 'bg-[#F3C623]' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs mt-2 text-gray-500">
                      <span>Placed</span>
                      <span>Preparing</span>
                      <span>On Way</span>
                      <span>Delivered</span>
                    </div>
                  </div>

                  {/* User action: Mark as Delivered */}
                  {order.status === "out_for_delivery" && (
                    <button
                      onClick={() => handleDelivered(order.id!)}
                      className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors min-h-[44px]"
                    >
                      ✅ Mark as Delivered
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
