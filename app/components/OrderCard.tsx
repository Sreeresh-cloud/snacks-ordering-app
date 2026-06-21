"use client";

import { Order } from "../types";
import { updateOrderStatus } from "../lib/firestore";
import { useState } from "react";

interface OrderCardProps {
  order: Order;
}

const statusConfig: Record<string, any> = {
  placed: {
    label: "📋 Placed",
    color: "bg-blue-100 text-blue-700",
    nextLabel: "Mark Preparing",
    nextStatus: "preparing" as const,
    buttonColor: "bg-orange-500 hover:bg-orange-600",
  },
  preparing: {
    label: "👨‍🍳 Preparing",
    color: "bg-yellow-100 text-yellow-700",
    nextLabel: "Send for Delivery",
    nextStatus: "out_for_delivery" as const,
    buttonColor: "bg-blue-500 hover:bg-blue-600",
  },
  out_for_delivery: {
    label: "🚚 Out for Delivery",
    color: "bg-purple-100 text-purple-700",
    nextLabel: "Mark Delivered",
    nextStatus: "delivered" as const,
    buttonColor: "bg-green-500 hover:bg-green-600",
  },
  delivered: {
    label: "✅ Delivered",
    color: "bg-green-100 text-green-700",
    nextLabel: null,
    nextStatus: null,
    buttonColor: "",
  },
  // Backward compatibility for old orders
  pending: {
    label: "📋 Placed",
    color: "bg-blue-100 text-blue-700",
    nextLabel: "Mark Preparing",
    nextStatus: "preparing" as const,
    buttonColor: "bg-orange-500 hover:bg-orange-600",
  },
  completed: {
    label: "✅ Delivered",
    color: "bg-green-100 text-green-700",
    nextLabel: null,
    nextStatus: null,
    buttonColor: "",
  },
};

export default function OrderCard({ order }: OrderCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const config = statusConfig[order.status];

  const handleNextStatus = async () => {
    if (!order.id || !config.nextStatus) return;
    setIsUpdating(true);
    try {
      await updateOrderStatus(order.id, config.nextStatus);
    } catch (error) {
      console.error("Error updating order:", error);
    } finally {
      setIsUpdating(false);
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
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return "N/A";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-3">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900">{order.name}</h3>
          <p className="text-gray-500 text-sm">{order.phone}</p>
          {order.address && (
            <p className="text-gray-400 text-sm mt-1">{order.address}</p>
          )}
          {(order.userEmail || order.userName) && (
            <div className="mt-2 flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
              {order.userPhoto && (
                <img
                  src={order.userPhoto}
                  alt={order.userName || "User"}
                  className="w-6 h-6 rounded-full object-cover"
                />
              )}
              <div>
                {order.userName && (
                  <p className="text-sm font-medium text-blue-800">{order.userName}</p>
                )}
                {order.userEmail && (
                  <p className="text-xs text-blue-600">{order.userEmail}</p>
                )}
              </div>
            </div>
          )}
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

      <div className="border-t border-gray-100 pt-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal:</span>
          <span className="text-gray-900 font-medium">₹{order.subtotal || order.total}</span>
        </div>
        {(order.deliveryCharge ?? 0) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Delivery Charge:</span>
            <span className="text-gray-900 font-medium">₹{order.deliveryCharge}</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-1">
          <div>
            <span className="text-sm text-gray-500">Total: </span>
            <span className="font-bold text-[#FF6B35]">₹{order.total}</span>
          </div>
          <div className="text-xs text-gray-400">{formatDate(order.createdAt)}</div>
        </div>
      </div>

      {config.nextStatus && (
        <button
          onClick={handleNextStatus}
          disabled={isUpdating}
          className={`mt-3 w-full ${config.buttonColor} disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors min-h-[44px]`}
        >
          {isUpdating ? "Updating..." : config.nextLabel}
        </button>
      )}
    </div>
  );
}
