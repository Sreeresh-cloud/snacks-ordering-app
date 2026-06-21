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
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBanners, setIsLoadingBanners] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "banners">("orders");

  // Banner form state
  const [bannerName, setBannerName] = useState("");
  const [bannerPrice, setBannerPrice] = useState("");
  const [bannerDescription, setBannerDescription] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [bannerError, setBannerError] = useState("");
  const [isAddingBanner, setIsAddingBanner] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    const unsubscribeOrders = getOrders((fetchedOrders) => {
      setOrders(fetchedOrders);
      setIsLoading(false);
    });

    setIsLoadingBanners(true);
    const unsubscribeBanners = getBanners((fetchedBanners) => {
      setBanners(fetchedBanners);
      setIsLoadingBanners(false);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeBanners();
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

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerError("");

    if (!bannerName.trim()) {
      setBannerError("Please enter a name");
      return;
    }
    if (!bannerPrice.trim() || isNaN(Number(bannerPrice)) || Number(bannerPrice) <= 0) {
      setBannerError("Please enter a valid price");
      return;
    }
    if (!bannerDescription.trim()) {
      setBannerError("Please enter a description");
      return;
    }
    if (!bannerImageUrl.trim()) {
      setBannerError("Please enter an image URL");
      return;
    }

    setIsAddingBanner(true);
    try {
      await createBanner({
        name: bannerName.trim(),
        price: Number(bannerPrice),
        description: bannerDescription.trim(),
        imageUrl: bannerImageUrl.trim(),
      });
      setBannerName("");
      setBannerPrice("");
      setBannerDescription("");
      setBannerImageUrl("");
    } catch (err) {
      console.error("Error adding banner:", err);
      setBannerError("Failed to add banner. Please try again.");
    } finally {
      setIsAddingBanner(false);
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      await deleteBanner(bannerId);
    } catch (err) {
      console.error("Error deleting banner:", err);
      alert("Failed to delete banner.");
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
          onClick={() => setActiveTab("banners")}
          className={`flex-1 py-3 px-4 font-medium text-sm transition-colors ${
            activeTab === "banners"
              ? "text-[#FF6B35] border-b-2 border-[#FF6B35]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          🎪 Banners ({banners.length})
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

        {activeTab === "banners" && (
          <>
            {/* Add Banner Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Banner</h2>
              <form onSubmit={handleAddBanner}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dish Name *
                  </label>
                  <input
                    type="text"
                    value={bannerName}
                    onChange={(e) => setBannerName(e.target.value)}
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
                    value={bannerPrice}
                    onChange={(e) => setBannerPrice(e.target.value)}
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
                    value={bannerDescription}
                    onChange={(e) => setBannerDescription(e.target.value)}
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
                    value={bannerImageUrl}
                    onChange={(e) => setBannerImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent min-h-[48px]"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a public image URL. For actual uploads, use Firebase Storage.
                  </p>
                </div>

                {bannerError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                    {bannerError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAddingBanner}
                  className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors min-h-[48px]"
                >
                  {isAddingBanner ? "Adding..." : "Add Banner"}
                </button>
              </form>
            </div>

            {/* Banners List */}
            <h2 className="text-lg font-bold text-gray-800 mb-3">
              Existing Banners ({banners.length})
            </h2>
            {isLoadingBanners ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin text-3xl mb-2">⏳</div>
                Loading banners...
              </div>
            ) : banners.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="text-5xl block mb-3">🎪</span>
                <p>No banners yet. Add your first one above!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {banners.map((banner) => (
                  <div key={banner.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="h-40 bg-gray-100 overflow-hidden">
                      <img
                        src={banner.imageUrl}
                        alt={banner.name}
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
                        <h3 className="font-bold text-lg text-gray-900">{banner.name}</h3>
                        <span className="font-bold text-[#FF6B35]">₹{banner.price}</span>
                      </div>
                      <p className="text-gray-500 text-sm mb-3">{banner.description}</p>
                      <button
                        onClick={() => handleDeleteBanner(banner.id!)}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded-lg transition-colors min-h-[44px]"
                      >
                        Delete Banner
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
