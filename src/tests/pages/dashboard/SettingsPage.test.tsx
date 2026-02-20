import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import SettingsPage from "@/pages/dashboard/SettingsPage";

const setThemeMock = vi.fn();
let currentTheme: "light" | "dark" | "system" = "system";
let resolvedTheme: "light" | "dark" = "light";

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: currentTheme,
    setTheme: setThemeMock,
    resolvedTheme,
  }),
}));

describe("SettingsPage", () => {
  beforeEach(() => {
    localStorage.clear();
    setThemeMock.mockReset();
    currentTheme = "system";
    resolvedTheme = "light";
  });

  it("applies palette/tone and persists selections", async () => {
    render(<SettingsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Suave" }));
    fireEvent.click(screen.getByRole("button", { name: "Verde" }));

    await waitFor(() => {
      expect(localStorage.getItem("template-theme-tone")).toBe("soft");
      expect(localStorage.getItem("template-theme-base")).toBe("green");
      expect(document.documentElement.style.getPropertyValue("--color-brand-primary")).toContain("oklch");
    });
  });

  it("changes theme mode and resets to defaults", async () => {
    render(<SettingsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Escuro" }));
    expect(setThemeMock).toHaveBeenCalledWith("dark");

    fireEvent.click(screen.getByRole("button", { name: /Restaurar padrao/i }));

    await waitFor(() => {
      expect(setThemeMock).toHaveBeenCalledWith("system");
      expect(localStorage.getItem("template-theme-tone")).toBeNull();
      expect(localStorage.getItem("template-theme-base")).toBeNull();
      expect(localStorage.getItem("template-theme-radius")).toBeNull();
    });
  });
});
