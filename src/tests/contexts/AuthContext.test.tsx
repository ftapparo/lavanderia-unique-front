import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

function Harness() {
  const { isAuthenticated, user, login, logout } = useAuth();

  return (
    <div>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      <span data-testid="user">{user || ""}</span>
      <button type="button" onClick={() => { void login("admin", "admin", true); }}>login-remember</button>
      <button type="button" onClick={() => { void login("admin", "admin", false); }}>login-session</button>
      <button type="button" onClick={() => { void login("", "", false); }}>login-invalid</button>
      <button type="button" onClick={() => { void logout(); }}>logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("authenticates and persists in localStorage when rememberMe is true", async () => {
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

    expect(localStorage.getItem("tpl_auth")).toBe("true");
    expect(localStorage.getItem("tpl_user")).toBe("ADMIN");
    expect(sessionStorage.getItem("tpl_auth")).toBeNull();
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
      expect(screen.getByTestId("user")).toHaveTextContent("");
    });
  });

  it("persists in sessionStorage when rememberMe is false and clears on logout", async () => {
    render(
      <AuthProvider>
        <Harness />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "login-session" }));

    await waitFor(() => {
      expect(screen.getByTestId("auth")).toHaveTextContent("true");
    });

    expect(sessionStorage.getItem("tpl_auth")).toBe("true");
    expect(localStorage.getItem("tpl_auth")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "logout" }));

    await waitFor(() => {
      expect(screen.getByTestId("auth")).toHaveTextContent("false");
    });

    expect(sessionStorage.getItem("tpl_auth")).toBeNull();
    expect(localStorage.getItem("tpl_auth")).toBeNull();
  });
});
