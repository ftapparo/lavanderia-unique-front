import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

vi.mock("@/components/dashboard/AppSidebar", () => ({
  default: () => <aside>sidebar-mock</aside>,
}));

vi.mock("@/components/dashboard/AppBar", () => ({
  default: ({ children }: { children?: ReactNode }) => <header>appbar-mock{children}</header>,
}));

describe("DashboardLayout", () => {
  it("renders outlet content inside layout", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<div>outlet-content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("sidebar-mock")).toBeInTheDocument();
    expect(screen.getByText("appbar-mock")).toBeInTheDocument();
    expect(screen.getByText("outlet-content")).toBeInTheDocument();
  });
});
