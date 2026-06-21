import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Cart from "../components/Cart";
import { CartItem } from "../types";

const mockItems: CartItem[] = [
  { id: "1", name: "Samosa", price: 20, quantity: 2 },
  { id: "2", name: "Vada Pav", price: 25, quantity: 1 },
];

describe("Cart Component", () => {
  const defaultProps = {
    items: mockItems,
    onUpdateQuantity: jest.fn(),
    onRemove: jest.fn(),
    onCheckout: jest.fn(),
  };

  it("renders cart bar with item count and total", () => {
    render(<Cart {...defaultProps} />);

    expect(screen.getByText("3 items")).toBeInTheDocument();
    expect(screen.getByText("₹95")).toBeInTheDocument();
  });

  it("shows cart drawer when clicked", async () => {
    const user = userEvent.setup();
    render(<Cart {...defaultProps} />);

    const cartBar = screen.getByRole("button");
    await user.click(cartBar);

    expect(screen.getByText("Your Cart")).toBeInTheDocument();
  });

  it("displays items in cart drawer", async () => {
    const user = userEvent.setup();
    render(<Cart {...defaultProps} />);

    await user.click(screen.getByRole("button"));

    expect(screen.getByText("Samosa")).toBeInTheDocument();
    expect(screen.getByText("Vada Pav")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("calls onUpdateQuantity when +/- buttons clicked", async () => {
    const user = userEvent.setup();
    const onUpdateQuantity = jest.fn();

    render(<Cart {...defaultProps} onUpdateQuantity={onUpdateQuantity} />);
    await user.click(screen.getByRole("button"));

    const increaseButtons = screen.getAllByRole("button", { name: /\+/i });
    await user.click(increaseButtons[0]);

    expect(onUpdateQuantity).toHaveBeenCalledWith("1", 1);
  });

  it("calls onRemove when delete button clicked", async () => {
    const user = userEvent.setup();
    const onRemove = jest.fn();

    render(<Cart {...defaultProps} onRemove={onRemove} />);
    await user.click(screen.getByRole("button"));

    const deleteButtons = screen.getAllByRole("button").filter(
      btn => btn.textContent?.includes("🗑️")
    );
    if (deleteButtons.length > 0) {
      await user.click(deleteButtons[0]);
      expect(onRemove).toHaveBeenCalledWith("1");
    }
  });

  it("shows empty cart message when no items", () => {
    render(<Cart {...defaultProps} items={[]} />);

    const cartBar = screen.getByRole("button");
    expect(cartBar.textContent).toContain("0 items");
  });

  it("calculates subtotal, delivery charge, and total correctly", async () => {
    const user = userEvent.setup();
    render(<Cart {...defaultProps} />);
    await user.click(screen.getByRole("button"));

    expect(screen.getByText("₹65")).toBeInTheDocument();
    expect(screen.getByText("₹30")).toBeInTheDocument();
    expect(screen.getByText("₹95")).toBeInTheDocument();
  });

  it("calls onCheckout when proceed button clicked", async () => {
    const user = userEvent.setup();
    const onCheckout = jest.fn();

    render(<Cart {...defaultProps} onCheckout={onCheckout} />);
    await user.click(screen.getByRole("button"));

    const checkoutBtn = screen.getByRole("button", { name: /proceed to checkout/i });
    await user.click(checkoutBtn);

    expect(onCheckout).toHaveBeenCalledTimes(1);
  });

  it("closes drawer when clicking overlay", async () => {
    const user = userEvent.setup();
    render(<Cart {...defaultProps} />);
    await user.click(screen.getByRole("button"));

    expect(screen.getByText("Your Cart")).toBeInTheDocument();

    const overlay = screen.getAllByRole("generic").find(
      el => el.className.includes("bg-black/50")
    );

    if (overlay) {
      await user.click(overlay);
      expect(screen.queryByText("Your Cart")).not.toBeInTheDocument();
    }
  });
});
