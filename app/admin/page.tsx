"use client";

import { useState, useEffect } from "react";
import { Order, Banner } from "../types";
import { getOrders, createBanner, getBanners, deleteBanner } from "../lib/firestore";
import OrderCard from "../components/OrderCard";
import Link from "next/link";

const ADMIN_PASSWORD = "admin123";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "items">("orders");

  // Item form state
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemImageUrl, setItemImageUrl] = useState("");
  const [itemError, setItemError] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    const unsubscribeOrders = getOrders((fetchedOrders) => {
      setOrders(fetchedOrders);
      setIsLoading(false);
    });

    setIsLoadingItems(true);
    const unsubscribeItems = getBanners((fetchedItems) => {
      setItems(fetchedItems);
      setIsLoadingItems(false);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeItems();
    };
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

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setItemError("");

    if (!itemName.trim()) {
      setItemError("Please enter a name");
      return;
    }
    if (!itemPrice.trim() || isNaN(Number(itemPrice)) || Number(itemPrice) <= 0) {
      setItemError("Please enter a valid price");
      return;
    }
    if (!itemDescription.trim()) {
      setItemError("Please enter a description");
      return;
    }
    if (!itemImageUrl.trim()) {
      setItemError("Please enter an image URL");
      return;
    }

    setIsAddingItem(true);
    try {
      await createBanner({
        name: itemName.trim(),
        price: Number(itemPrice),
        description: itemDescription.trim(),
        imageUrl: itemImageUrl.trim(),
      });
      setItemName("");
      setItemPrice("");
      setItemDescription("");
      setItemImageUrl("");
    } catch (err) {
      console.error("Error adding item:", err);
      setItemError("Failed to add item. Please try again.");
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteBanner(itemId);
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Failed to delete item.");
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

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 sticky top-[60px] bg-white z-30">
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex-1 py-3 px-4 font-medium text-sm transition-colors ${
            activeTab === "orders"
              ? "text-[#FF6B35] border-b-2 border-[#FF6B35]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          📋 Orders
        </button>
        <button
          onClick={() => setActiveTab("items")}
          className={`flex-1 py-3 px-4 font-medium text-sm transition-colors ${
            activeTab === "items"
              ? "text-[#FF6B35] border-b-2 border-[#FF6B35]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          ➕ Add Item ({items.length})
        </button>
      </div>

      <div className="px-4 py-4">
        {activeTab === "orders" && (
          <>
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
          </>
        )}

        {activeTab === "items" && (
          <>
            {/* Add Item Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Item</h2>
              <form onSubmit={handleAddItem}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dish Name *
                  </label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Samosa"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent min-h-[48px]"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    placeholder="e.g. 20"
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent min-h-[48px]"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    placeholder="Short description of the dish"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent resize-none"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photo URL *
                  </label>
                  <input
                    type="url"
                    value={itemImageUrl}
                    onChange={(e) => setItemImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent min-h-[48px]"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a public image URL. For actual uploads, use Firebase Storage.
                  </p>
                </div>

                {itemError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                    {itemError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAddingItem}
                  className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors min-h-[48px]"
                >
                  {isAddingItem ? "Adding..." : "Add Item"}
                </button>
              </form>
            </div>

            {/* Items List */}
            <h2 className="text-lg font-bold text-gray-800 mb-3">
              Existing Items ({items.length})
            </h2>
            {isLoadingItems ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin text-3xl mb-2">⏳</div>
                Loading items...
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="text-5xl block mb-3">🍽️</span>
                <p>No items yet. Add your first one above!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="h-40 bg-gray-100 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "";
                          (e.target as HTMLImageElement).style.display = "none";
                          const parent = (e.target as HTMLElement).parentElement;
                          if (parent) parent.innerHTML = `<div class="flex items-center justify-center h-full text-4xl">🍽️</div>`;
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                        <span className="font-bold text-[#FF6B35]">₹{item.price}</span>
                      </div>
                      <p className="text-gray-500 text-sm mb-3">{item.description}</p>
                      <button
                        onClick={() => handleDeleteItem(item.id!)}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded-lg transition-colors min-h-[44px]"
                      >
                        Delete Item
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
