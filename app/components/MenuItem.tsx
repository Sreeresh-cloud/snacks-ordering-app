"use client";

import { MenuItemData } from "../types";

interface MenuItemProps {
  item: MenuItemData;
  onAdd: (item: MenuItemData) => void;
}

const colorMap: Record<string, string> = {
  "1": "bg-orange-100",
  "2": "bg-yellow-100",
  "3": "bg-red-100",
  "4": "bg-green-100",
  "5": "bg-amber-100",
  "6": "bg-orange-200",
  "7": "bg-teal-100",
  "8": "bg-purple-100",
};

const emojiMap: Record<string, string> = {
  "1": "🥟",
  "2": "🍔",
  "3": "🍟",
  "4": "🧀",
  "5": "🍗",
  "6": "🌮",
  "7": "🌯",
  "8": "🍡",
};

export default function MenuItem({ item, onAdd }: MenuItemProps) {
  // Check if the item has a real image (not just a path like "/samosa.jpg")
  const hasRealImage = item.image && !item.image.startsWith("/") && item.image.length > 50;
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 flex flex-col">
      <div className="h-32 flex items-center justify-center relative overflow-hidden">
        {hasRealImage ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to colored background if image fails
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent) {
                parent.className = `h-32 ${colorMap[item.id] || "bg-gray-100"} flex items-center justify-center text-5xl`;
                parent.innerHTML = emojiMap[item.id] || "🍽️";
              }
            }}
          />
        ) : (
          <div className={`w-full h-full ${colorMap[item.id] || "bg-gray-100"} flex items-center justify-center text-5xl`}>
            {emojiMap[item.id] || "🍽️"}
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
          <span className="font-bold text-[#F3C623]">₹{item.price}</span>
        </div>
        <p className="text-gray-500 text-sm mb-3 flex-1">{item.description}</p>
        <button
          onClick={() => onAdd(item)}
          className="w-full bg-[#F3C623] hover:bg-[#d4ad1f] text-white font-bold py-3 px-4 rounded-lg transition-colors min-h-[44px]"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
