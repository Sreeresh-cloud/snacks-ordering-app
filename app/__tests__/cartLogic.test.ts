import { CartItem } from "../types";

describe("Cart Logic", () => {
  const items: CartItem[] = [
    { id: "1", name: "Samosa", price: 20, quantity: 2 },
    { id: "2", name: "Vada Pav", price: 25, quantity: 1 },
    { id: "3", name: "Fries", price: 60, quantity: 3 },
  ];

  describe("Subtotal calculation", () => {
    it("calculates subtotal correctly", () => {
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      expect(subtotal).toBe(20 * 2 + 25 * 1 + 60 * 3);
      expect(subtotal).toBe(40 + 25 + 180);
      expect(subtotal).toBe(245);
    });

    it("returns 0 for empty cart", () => {
      const subtotal: number = [].reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
      expect(subtotal).toBe(0);
    });
  });

  describe("Total items calculation", () => {
    it("calculates total item count correctly", () => {
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      expect(totalItems).toBe(6);
    });

    it("returns 0 for empty cart", () => {
      const totalItems = [].reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
      expect(totalItems).toBe(0);
    });
  });

  describe("Total price calculation", () => {
    it("calculates total with delivery charge", () => {
      const deliveryCharge = 30;
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const total = subtotal + deliveryCharge;
      expect(total).toBe(275);
    });

    it("handles zero delivery charge for empty cart", () => {
      const emptyItems: CartItem[] = [];
      const deliveryCharge = emptyItems.length > 0 ? 30 : 0;
      const subtotal = 0;
      const total = subtotal + deliveryCharge;
      expect(total).toBe(0);
    });
  });

  describe("Quantity update logic", () => {
    it("increments quantity correctly", () => {
      const updated = items.map((item) =>
        item.id === "1" ? { ...item, quantity: item.quantity + 1 } : item
      );
      expect(updated[0].quantity).toBe(3);
    });

    it("decrements quantity correctly", () => {
      const updated = items.map((item) =>
        item.id === "1" ? { ...item, quantity: item.quantity - 1 } : item
      );
      expect(updated[0].quantity).toBe(1);
    });

    it("filters out items with zero quantity", () => {
      const updated = items
        .map((item) =>
          item.id === "1" ? { ...item, quantity: 0 } : item
        )
        .filter((item) => item.quantity > 0);
      
      expect(updated.length).toBe(2);
      expect(updated.find((item) => item.id === "1")).toBeUndefined();
    });
  });

  describe("Remove item logic", () => {
    it("removes item from cart", () => {
      const filtered = items.filter((item) => item.id !== "2");
      expect(filtered.length).toBe(2);
      expect(filtered.find((item) => item.id === "2")).toBeUndefined();
    });

    it("returns same array if item not found", () => {
      const filtered = items.filter((item) => item.id !== "999");
      expect(filtered.length).toBe(3);
    });
  });

  describe("Add item logic", () => {
    it("adds new item to cart", () => {
      const newItem: CartItem = { id: "4", name: "New Item", price: 50, quantity: 1 };
      const updated = [...items, newItem];
      expect(updated.length).toBe(4);
      expect(updated[3]).toEqual(newItem);
    });

    it("increments quantity for existing item", () => {
      const newItem: CartItem = { id: "1", name: "Samosa", price: 20, quantity: 1 };
      const existing = items.find((item) => item.id === newItem.id);
      
      if (existing) {
        const updated = items.map((item) =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + newItem.quantity } : item
        );
        expect(updated[0].quantity).toBe(3);
      }
    });
  });
});
