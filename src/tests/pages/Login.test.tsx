import { fireEvent, render, screen, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import Login from "@/pages/Login";

const navigateMock = vi.fn();
const loginMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<object>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ login: loginMock }),
}));

vi.mock("@/components/BrandLogo", () => ({
  default: () => <div>logo</div>,
}));

describe("Login page", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    loginMock.mockReset();
    navigateMock.mockReset();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("submits credentials and navigates on success", async () => {
    loginMock.mockResolvedValue({ success: true });
    render(<Login />);

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(loginMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith("/dashboard", { replace: true });
    expect(localStorage.getItem("tpl_remember_me")).toBe("false");
  });

  it("shows error message on failed login", async () => {
    loginMock.mockResolvedValue({ success: false, error: "Falha" });
    render(<Login />);

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(screen.getByText("Falha")).toBeInTheDocument();
  });

  it("persists remember-me when toggled", async () => {
    loginMock.mockResolvedValue({ success: true });
    render(<Login />);

    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(localStorage.getItem("tpl_remember_me")).toBe("true");
  });
});
