import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import App from "@/App";

const authState = { isAuthenticated: false };

vi.mock("@/contexts/AuthContext", () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useAuth: () => authState,
}));

vi.mock("@/components/theme/ThemeProvider", () => ({
  ThemeProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/ui/primitives", async () => {
  const actual = await vi.importActual<object>("@/components/ui/primitives");
  return {
    ...actual,
    TooltipProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  };
});

vi.mock("@/components/ui/sonner", () => ({
  Toaster: () => <div data-testid="sonner" />,
}));

vi.mock("@/components/dashboard/DashboardLayout", () => ({
  default: () => <div>dashboard-layout</div>,
}));

vi.mock("@/pages/Login", () => ({
  default: () => <div>login-page</div>,
}));

vi.mock("@/pages/dashboard/DashboardHome", () => ({ default: () => <div>home-page</div> }));
vi.mock("@/pages/dashboard/SettingsPage", () => ({ default: () => <div>settings-page</div> }));
vi.mock("@/pages/dashboard/ComponentsShowcase", () => ({ default: () => <div>components-1</div> }));
vi.mock("@/pages/dashboard/ComponentsShowcaseTwo", () => ({ default: () => <div>components-2</div> }));
vi.mock("@/pages/dashboard/ComponentsShowcaseThree", () => ({ default: () => <div>components-3</div> }));
vi.mock("@/pages/dashboard/ComponentsShowcaseFour", () => ({ default: () => <div>components-4</div> }));
vi.mock("@/pages/dashboard/ComponentsShowcaseFive", () => ({ default: () => <div>components-5</div> }));
vi.mock("@/pages/dashboard/TypographyShowcase", () => ({ default: () => <div>typography-page</div> }));
vi.mock("@/pages/404", () => ({ default: () => <div>not-found-page</div> }));

describe("App routing guards", () => {
  beforeEach(() => {
    authState.isAuthenticated = false;
    window.history.replaceState({}, "", "/");
  });

  it("renders login on public route when unauthenticated", () => {
    render(<App />);
    expect(screen.getByText("login-page")).toBeInTheDocument();
  });

  it("redirects authenticated user from / to /dashboard", () => {
    authState.isAuthenticated = true;
    render(<App />);
    expect(screen.getByText("dashboard-layout")).toBeInTheDocument();
  });

  it("renders not found page on unknown route", () => {
    window.history.replaceState({}, "", "/unknown");
    render(<App />);
    expect(screen.getByText("not-found-page")).toBeInTheDocument();
  });

  it("blocks /dashboard when unauthenticated", () => {
    window.history.replaceState({}, "", "/dashboard");
    render(<App />);
    expect(screen.getByText("login-page")).toBeInTheDocument();
  });
});
