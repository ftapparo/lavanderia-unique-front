import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import AppSidebar from "@/components/dashboard/AppSidebar";

vi.mock("@/components/theme/ThemeSwitcher", () => ({
  default: ({ compact }: { compact?: boolean }) => <div>{compact ? "theme-compact" : "theme-full"}</div>,
}));

vi.mock("@/components/BrandLogo", () => ({
  default: () => <div>brand</div>,
}));

vi.mock("@/components/ui/primitives", () => ({
  Sidebar: ({ children, className }: { children: any; className?: string }) => <div data-testid="sidebar" className={className}>{children}</div>,
  SidebarContent: ({ children }: { children: any }) => <div>{children}</div>,
  SidebarGroup: ({ children }: { children: any }) => <div>{children}</div>,
  SidebarGroupContent: ({ children }: { children: any }) => <div>{children}</div>,
  SidebarGroupLabel: ({ children }: { children: any }) => <div>{children}</div>,
  SidebarMenu: ({ children }: { children: any }) => <div>{children}</div>,
  SidebarMenuButton: ({ children }: { children: any }) => <div>{children}</div>,
  SidebarMenuItem: ({ children }: { children: any }) => <div>{children}</div>,
  SidebarHeader: ({ children }: { children: any }) => <div>{children}</div>,
  SidebarFooter: ({ children }: { children: any }) => <div>{children}</div>,
  useSidebar: () => ({ state: "collapsed" }),
}));

describe("AppSidebar collapsed state", () => {
  it("renders compact footer mode when collapsed", () => {
    render(
      <MemoryRouter>
        <AppSidebar />
      </MemoryRouter>,
    );

    expect(screen.getByText("theme-compact")).toBeInTheDocument();
    expect(screen.queryByText("theme-full")).not.toBeInTheDocument();
    expect(screen.getByTestId("sidebar").className).toContain("bg-[var(--color-brand-primary)]");
  });
});
