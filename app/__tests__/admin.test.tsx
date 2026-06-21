import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminPage from "../admin/page";

describe("AdminPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders login form initially", () => {
    render(<AdminPage />);

    expect(screen.getByText("Admin Login")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("shows error for incorrect password", async () => {
    const user = userEvent.setup();
    render(<AdminPage />);

    const passwordInput = screen.getByPlaceholderText(/password/i);
    await user.type(passwordInput, "wrongpassword");

    const loginBtn = screen.getByRole("button", { name: /login/i });
    await user.click(loginBtn);

    await waitFor(() => {
      expect(screen.getByText(/incorrect password/i)).toBeInTheDocument();
    });
  });

  it("authenticates with correct password", async () => {
    const user = userEvent.setup();
    render(<AdminPage />);

    const passwordInput = screen.getByPlaceholderText(/password/i);
    await user.type(passwordInput, "admin123");

    const loginBtn = screen.getByRole("button", { name: /login/i });
    await user.click(loginBtn);

    await waitFor(() => {
      expect(screen.queryByText("Admin Login")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
  });

  it("shows back to menu link on login page", () => {
    render(<AdminPage />);

    expect(screen.getByText(/back to menu/i)).toBeInTheDocument();
  });

  it("displays tabs for orders and banners after login", async () => {
    const user = userEvent.setup();
    render(<AdminPage />);

    await user.type(screen.getByPlaceholderText(/password/i), "admin123");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/orders/i)).toBeInTheDocument();
      expect(screen.getByText(/banners/i)).toBeInTheDocument();
    });
  });
});
