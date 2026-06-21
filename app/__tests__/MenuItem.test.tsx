import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MenuItem from "../components/MenuItem";
import { MenuItemData } from "../types";

const mockItem: MenuItemData = {
  id: "1",
  name: "Samosa",
  price: 20,
  image: "/samosa.jpg",
  description: "Crispy potato-filled pastry",
};

describe("MenuItem Component", () => {
  it("renders item details correctly", () => {
    render(<MenuItem item={mockItem} onAdd={jest.fn()} />);

    expect(screen.getByText("Samosa")).toBeInTheDocument();
    expect(screen.getByText("₹20")).toBeInTheDocument();
    expect(screen.getByText("Crispy potato-filled pastry")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add to cart/i })).toBeInTheDocument();
  });

  it("calls onAdd when add button is clicked", async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();

    render(<MenuItem item={mockItem} onAdd={onAdd} />);

    const addButton = screen.getByRole("button", { name: /add to cart/i });
    await user.click(addButton);

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(mockItem);
  });

  it("displays emoji based on item id", () => {
    render(<MenuItem item={mockItem} onAdd={jest.fn()} />);
    expect(screen.getByText("🥟")).toBeInTheDocument();
  });

  it("renders different emoji for different items", () => {
    const burgerItem: MenuItemData = { ...mockItem, id: "2", name: "Vada Pav" };
    render(<MenuItem item={burgerItem} onAdd={jest.fn()} />);
    expect(screen.getByText("🍔")).toBeInTheDocument();
  });
});
