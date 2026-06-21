import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OrderCard from "../components/OrderCard";
import { Order } from "../types";

jest.mock("../lib/firestore", () => ({
  updateOrderStatus: jest.fn(() => Promise.resolve()),
}));

const mockOrder: Order = {
  id: "order-123",
  name: "John Doe",
  phone: "9876543210",
  address: "123 Main St",
  items: [
    { id: "1", name: "Samosa", price: 20, quantity: 2 },
    { id: "2", name: "Vada Pav", price: 25, quantity: 1 },
  ],
  subtotal: 65,
  deliveryCharge: 30,
  total: 95,
  status: "placed",
  createdAt: new Date("2024-01-15T10:00:00"),
};

describe("OrderCard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders order details correctly", () => {
    render(<OrderCard order={mockOrder} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("9876543210")).toBeInTheDocument();
    expect(screen.getByText("123 Main St")).toBeInTheDocument();
    expect(screen.getByText(/placed/i)).toBeInTheDocument();
  });

  it("displays order items with quantities and prices", () => {
    render(<OrderCard order={mockOrder} />);

    expect(screen.getByText(/samosa x2/i)).toBeInTheDocument();
    expect(screen.getByText(/vada pav x1/i)).toBeInTheDocument();
    expect(screen.getByText("₹40")).toBeInTheDocument();
    expect(screen.getByText("₹25")).toBeInTheDocument();
  });

  it("shows subtotal, delivery charge, and total", () => {
    render(<OrderCard order={mockOrder} />);

    expect(screen.getByText("₹65")).toBeInTheDocument();
    expect(screen.getByText("₹30")).toBeInTheDocument();
    expect(screen.getByText("₹95")).toBeInTheDocument();
  });

  it("shows action button for placed orders", () => {
    render(<OrderCard order={mockOrder} />);

    expect(screen.getByRole("button", { name: /mark preparing/i })).toBeInTheDocument();
  });

  it("shows no action button for delivered orders", () => {
    const deliveredOrder = { ...mockOrder, status: "delivered" as const };
    render(<OrderCard order={deliveredOrder} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("updates order status when action button clicked", async () => {
    const user = userEvent.setup();
    const { updateOrderStatus } = jest.requireMock("../lib/firestore");

    render(<OrderCard order={mockOrder} />);

    const actionBtn = screen.getByRole("button", { name: /mark preparing/i });
    await user.click(actionBtn);

    await waitFor(() => {
      expect(updateOrderStatus).toHaveBeenCalledWith("order-123", "preparing");
    });
  });

  it("shows user info when available", () => {
    const orderWithUser = {
      ...mockOrder,
      userName: "John Doe",
      userEmail: "john@example.com",
      userPhoto: "https://example.com/photo.jpg",
    };

    render(<OrderCard order={orderWithUser} />);

    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("formats date correctly", () => {
    render(<OrderCard order={mockOrder} />);

    expect(screen.getByText(/jan 15, 2024/i)).toBeInTheDocument();
  });

  it("handles timestamp objects", () => {
    const orderWithTimestamp = {
      ...mockOrder,
      createdAt: {
        seconds: 1705312800,
        toDate: () => new Date("2024-01-15T10:00:00"),
      },
    };

    render(<OrderCard order={orderWithTimestamp as any} />);
    expect(screen.getByText(/jan 15, 2024/i)).toBeInTheDocument();
  });

  it("shows correct button for preparing status", () => {
    const preparingOrder = { ...mockOrder, status: "preparing" as const };
    render(<OrderCard order={preparingOrder} />);

    expect(screen.getByRole("button", { name: /send for delivery/i })).toBeInTheDocument();
  });

  it("shows correct button for out_for_delivery status", () => {
    const outForDeliveryOrder = { ...mockOrder, status: "out_for_delivery" as const };
    render(<OrderCard order={outForDeliveryOrder} />);

    expect(screen.getByRole("button", { name: /mark delivered/i })).toBeInTheDocument();
  });
});
