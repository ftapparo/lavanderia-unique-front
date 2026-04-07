import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import ChangePasswordPage from "@/pages/ChangePasswordPage";

const navigateMock = vi.fn();
const clearMustChangePasswordMock = vi.fn();
const logoutMock = vi.fn();

const authState = {
  hasPin: false,
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<object>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    clearMustChangePassword: clearMustChangePasswordMock,
    logout: logoutMock,
    profile: { hasPin: authState.hasPin },
  }),
}));

vi.mock("@/services/api", () => ({
  api: {
    auth: {
      changePassword: vi.fn(),
    },
  },
}));

vi.mock("@/lib/notify", () => ({
  notify: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe("ChangePasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.hasPin = false;
  });

  it("shows current-password input when user has no pin", () => {
    render(<ChangePasswordPage />, { wrapper: createWrapper() });
    expect(screen.getByText("Senha atual")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Digite sua senha atual")).toBeInTheDocument();
  });

  it("shows pin input mode when user has pin", () => {
    authState.hasPin = true;
    render(<ChangePasswordPage />, { wrapper: createWrapper() });
    expect(screen.getByText("PIN de acesso")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Digite sua senha atual")).not.toBeInTheDocument();
  });

});
