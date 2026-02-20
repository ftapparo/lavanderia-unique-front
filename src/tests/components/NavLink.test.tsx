import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { NavLink } from "@/components/NavLink";

describe("NavLink", () => {
  it("applies activeClassName when route is active", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={<NavLink to="/dashboard" className="base" activeClassName="active">Dashboard</NavLink>}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveClass("base", "active");
  });
});
