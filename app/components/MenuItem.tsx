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
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 flex flex-col">
      <div
        className={`h-32 ${colorMap[item.id]} flex items-center justify-center text-5xl`}
      >
        {emojiMap[item.id]}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
          <span className="font-bold text-[#FF6B35]">₹{item.price}</span>
        </div>
        <p className="text-gray-500 text-sm mb-3 flex-1">{item.description}</p>
        <button
          onClick={() => onAdd(item)}
          className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-bold py-3 px-4 rounded-lg transition-colors min-h-[44px]"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
