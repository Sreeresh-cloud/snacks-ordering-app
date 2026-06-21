import { CartItem, MenuItemData, Order, Banner } from "../types";

describe("Types", () => {
  it("CartItem type should accept valid data", () => {
    const item: CartItem = {
      id: "1",
      name: "Samosa",
      price: 20,
      quantity: 2,
    };

    expect(item.id).toBe("1");
    expect(item.name).toBe("Samosa");
    expect(item.price).toBe(20);
    expect(item.quantity).toBe(2);
  });

  it("MenuItemData type should accept valid data", () => {
    const item: MenuItemData = {
      id: "1",
      name: "Samosa",
      price: 20,
      image: "/samosa.jpg",
      description: "Crispy potato-filled pastry",
    };

    expect(item.image).toBe("/samosa.jpg");
    expect(item.description).toBe("Crispy potato-filled pastry");
  });

  it("Order type should accept valid data", () => {
    const order: Order = {
      id: "order-123",
      name: "John Doe",
      phone: "9876543210",
      address: "123 Main St",
      items: [
        { id: "1", name: "Samosa", price: 20, quantity: 2 },
      ],
      subtotal: 40,
      deliveryCharge: 30,
      total: 70,
      status: "placed",
      createdAt: new Date(),
      userId: "user-123",
      userEmail: "john@example.com",
      userName: "John Doe",
      userPhoto: "https://example.com/photo.jpg",
    };

    expect(order.status).toBe("placed");
    expect(order.total).toBe(70);
  });

  it("Order status should accept all valid values", () => {
    const statuses: Array<Order["status"]> = [
      "placed",
      "preparing",
      "out_for_delivery",
      "delivered",
    ];

    statuses.forEach((status) => {
      const order: Order = {
        name: "Test",
        phone: "1234567890",
        address: "Test Address",
        items: [],
        subtotal: 0,
        deliveryCharge: 0,
        total: 0,
        status,
        createdAt: new Date(),
      };
      expect(order.status).toBe(status);
    });
  });

  it("Banner type should accept valid data", () => {
    const banner: Banner = {
      id: "banner-1",
      name: "Special Samosa",
      price: 25,
      imageUrl: "https://example.com/samosa.jpg",
      description: "Special spicy samosa",
      createdAt: new Date(),
    };

    expect(banner.imageUrl).toBe("https://example.com/samosa.jpg");
  });

  it("should allow optional fields in Banner", () => {
    const banner: Banner = {
      name: "Simple Banner",
      price: 20,
      imageUrl: "/image.jpg",
      description: "Simple description",
    };

    expect(banner.id).toBeUndefined();
    expect(banner.createdAt).toBeUndefined();
  });

  it("should allow optional fields in Order", () => {
    const order: Order = {
      name: "Test",
      phone: "1234567890",
      address: "",
      items: [],
      subtotal: 0,
      deliveryCharge: 0,
      total: 0,
      status: "placed",
      createdAt: new Date(),
    };

    expect(order.id).toBeUndefined();
    expect(order.userId).toBeUndefined();
    expect(order.userEmail).toBeUndefined();
    expect(order.userName).toBeUndefined();
    expect(order.userPhoto).toBeUndefined();
  });
});
