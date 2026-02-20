import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

const { loginMock, meMock } = vi.hoisted(() => ({
  loginMock: vi.fn(),
  meMock: vi.fn(),
}));

vi.mock("@/services/api", () => ({
  api: {
    auth: {
      login: loginMock,
      me: meMock,
      register: vi.fn(),
    },
    units: { list: vi.fn() },
    memberships: { list: vi.fn() },
  },
  setApiAuthToken: vi.fn(),
}));

function Harness() {
  const { isAuthenticated, user, login, logout } = useAuth();

  return (
    <div>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      <span data-testid="user">{user || ""}</span>
      <button type="button" onClick={() => { void login("admin@unique.local", "admin123", true); }}>login-remember</button>
      <button type="button" onClick={() => { void login("admin@unique.local", "admin123", false); }}>login-session</button>
      <button type="button" onClick={() => { void login("", "", false); }}>login-invalid</button>
      <button type="button" onClick={() => { void logout(); }}>logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    loginMock.mockReset();
    meMock.mockReset();
    meMock.mockResolvedValue({
      id: "u1",
      name: "ADMIN",
      cpf: "00000000000",
      email: "admin@unique.local",
      phone: null,
      role: "ADMIN",
    });
  });

  it("authenticates and persists in localStorage when rememberMe is true", async () => {
    loginMock.mockResolvedValue({
      accessToken: "access",
      refreshToken: "refresh",
      user: {
        id: "u1",
        name: "ADMIN",
        cpf: "00000000000",
        email: "admin@unique.local",
        phone: null,
        role: "ADMIN",
      },
    });

    render(
      <AuthProvider>
        <Harness />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "login-remember" }));

    await waitFor(() => {
      expect(screen.getByTestId("auth")).toHaveTextContent("true");
      expect(screen.getByTestId("user")).toHaveTextContent("ADMIN");
    });

    expect(localStorage.getItem("template_auth_auth")).toBe("access");
    expect(localStorage.getItem("template_auth_user")).toBe("ADMIN");
    expect(sessionStorage.getItem("template_auth_auth")).toBeNull();
  });

  it("returns failure on invalid credentials and does not authenticate", async () => {
    render(
      <AuthProvider>
        <Harness />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "login-invalid" }));

    await waitFor(() => {
      expect(screen.getByTestId("auth")).toHaveTextContent("false");
    });
  });

  it("persists in sessionStorage when rememberMe is false and clears on logout", async () => {
    loginMock.mockResolvedValue({
      accessToken: "access",
      refreshToken: "refresh",
      user: {
        id: "u1",
        name: "ADMIN",
        cpf: "00000000000",
        email: "admin@unique.local",
        phone: null,
        role: "ADMIN",
      },
    });

    render(
      <AuthProvider>
        <Harness />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "login-session" }));

    await waitFor(() => {
      expect(screen.getByTestId("auth")).toHaveTextContent("true");
    });

    expect(sessionStorage.getItem("template_auth_auth")).toBe("access");
    expect(localStorage.getItem("template_auth_auth")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "logout" }));

    await waitFor(() => {
      expect(screen.getByTestId("auth")).toHaveTextContent("false");
    });

    expect(sessionStorage.getItem("template_auth_auth")).toBeNull();
    expect(localStorage.getItem("template_auth_auth")).toBeNull();
  });
});
