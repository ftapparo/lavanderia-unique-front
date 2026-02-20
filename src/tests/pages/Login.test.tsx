import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import Login from "@/pages/Login";

const navigateMock = vi.fn();
const loginMock = vi.fn();
const registerMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<object>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ login: loginMock, register: registerMock }),
}));

vi.mock("@/components/BrandLogo", () => ({
  default: () => <div>logo</div>,
}));

describe("Login page", () => {
  beforeEach(() => {
    loginMock.mockReset();
    registerMock.mockReset();
    navigateMock.mockReset();
    localStorage.clear();
  });

  it("submits credentials and navigates on success", async () => {
    loginMock.mockResolvedValue({ success: true });
    render(<Login />);

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalled();
      expect(navigateMock).toHaveBeenCalledWith("/dashboard", { replace: true });
    });

    expect(localStorage.getItem("tpl_remember_me")).toBe("false");
  });

  it("shows error message on failed login", async () => {
    loginMock.mockResolvedValue({ success: false, error: "Falha" });
    render(<Login />);

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(screen.getByText("Falha")).toBeInTheDocument();
    });
  });

});
