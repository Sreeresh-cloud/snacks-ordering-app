import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CheckoutForm from "../components/CheckoutForm";
import { CartItem } from "../types";

jest.mock("../lib/firestore", () => ({
  createOrder: jest.fn(() => Promise.resolve("order-123")),
}));

const mockCartItems: CartItem[] = [
  { id: "1", name: "Samosa", price: 20, quantity: 2 },
];

const defaultProps = {
  cartItems: mockCartItems,
  subtotal: 40,
  deliveryCharge: 30,
  total: 70,
  onSuccess: jest.fn(),
  onCancel: jest.fn(),
  user: null,
};

describe("CheckoutForm Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders checkout form with all fields", () => {
    render(<CheckoutForm {...defaultProps} />);

    expect(screen.getByText("Checkout")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter 10-digit number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/delivery address/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /place order/i })).toBeInTheDocument();
  });

  it("shows order summary correctly", () => {
    render(<CheckoutForm {...defaultProps} />);

    expect(screen.getByText("₹40")).toBeInTheDocument();
    expect(screen.getByText("₹30")).toBeInTheDocument();
    expect(screen.getByText("₹70")).toBeInTheDocument();
  });

  it("validates name field is required", async () => {
    const user = userEvent.setup();
    render(<CheckoutForm {...defaultProps} />);

    const submitBtn = screen.getByRole("button", { name: /place order/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/please enter your name/i)).toBeInTheDocument();
    });
  });

  it("validates phone number format", async () => {
    const user = userEvent.setup();
    render(<CheckoutForm {...defaultProps} />);

    await user.type(screen.getByPlaceholderText(/enter your name/i), "John Doe");
    await user.type(screen.getByPlaceholderText(/enter 10-digit number/i), "123");

    const submitBtn = screen.getByRole("button", { name: /place order/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid phone number/i)).toBeInTheDocument();
    });
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();
    const { createOrder } = jest.requireMock("../lib/firestore");

    render(<CheckoutForm {...defaultProps} onSuccess={onSuccess} />);

    await user.type(screen.getByPlaceholderText(/enter your name/i), "John Doe");
    await user.type(screen.getByPlaceholderText(/enter 10-digit number/i), "9876543210");
    await user.type(screen.getByPlaceholderText(/delivery address/i), "123 Main St");

    const submitBtn = screen.getByRole("button", { name: /place order/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "John Doe",
          phone: "9876543210",
          address: "123 Main St",
          items: mockCartItems,
          subtotal: 40,
          deliveryCharge: 30,
          total: 70,
        })
      );
    });
  });

  it("calls onCancel when cancel button clicked", async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    render(<CheckoutForm {...defaultProps} onCancel={onCancel} />);

    const closeBtn = screen.getByRole("button", { name: /✕/i });
    await user.click(closeBtn);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("pre-fills name when user is provided", () => {
    const mockUser = {
      displayName: "Jane Doe",
      email: "jane@example.com",
      uid: "user-123",
    } as any;

    render(<CheckoutForm {...defaultProps} user={mockUser} />);

    const nameInput = screen.getByDisplayValue("Jane Doe") as HTMLInputElement;
    expect(nameInput.value).toBe("Jane Doe");
  });

  it("disables submit button when submitting", async () => {
    const user = userEvent.setup();
    const { createOrder } = jest.requireMock("../lib/firestore");
    createOrder.mockImplementation(() => new Promise(() => {}));

    render(<CheckoutForm {...defaultProps} />);

    await user.type(screen.getByPlaceholderText(/enter your name/i), "John Doe");
    await user.type(screen.getByPlaceholderText(/enter 10-digit number/i), "9876543210");

    const submitBtn = screen.getByRole("button", { name: /place order/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /placing order/i })).toBeDisabled();
    });
  });

  it("displays error when order creation fails", async () => {
    const user = userEvent.setup();
    const { createOrder } = jest.requireMock("../lib/firestore");
    createOrder.mockRejectedValue(new Error("Network error"));

    render(<CheckoutForm {...defaultProps} />);

    await user.type(screen.getByPlaceholderText(/enter your name/i), "John Doe");
    await user.type(screen.getByPlaceholderText(/enter 10-digit number/i), "9876543210");

    const submitBtn = screen.getByRole("button", { name: /place order/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/failed to place order/i)).toBeInTheDocument();
    });
  });
});
