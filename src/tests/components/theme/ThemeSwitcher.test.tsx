import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import ThemeSwitcher from "@/components/theme/ThemeSwitcher";

const { setThemeMock } = vi.hoisted(() => ({ setThemeMock: vi.fn() }));
let currentTheme: "light" | "dark" | "system" = "system";

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: currentTheme,
    setTheme: setThemeMock,
  }),
}));

vi.mock("@/components/ui/primitives", async () => {
  const actual = await vi.importActual<object>("@/components/ui/primitives");
  return {
    ...actual,
    DropdownMenu: ({ children }: { children: any }) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: { children: any }) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: { children: any }) => <div>{children}</div>,
    DropdownMenuItem: ({ children, onSelect }: { children: any; onSelect?: () => void }) => (
      <button type="button" onClick={onSelect}>{children}</button>
    ),
  };
});

describe("ThemeSwitcher", () => {
  beforeEach(() => {
    currentTheme = "system";
    setThemeMock.mockReset();
  });

  it("renders active theme label", () => {
    render(<ThemeSwitcher />);

    const trigger = screen.getByRole("button", { name: /Alternar tema/i });
    expect(trigger).toBeInTheDocument();
    expect(within(trigger).getByText("Sistema")).toBeInTheDocument();
  });

  it("changes theme when option is selected", () => {
    render(<ThemeSwitcher compact />);
    fireEvent.click(screen.getByRole("button", { name: "Escuro" }));
    expect(setThemeMock).toHaveBeenCalledWith("dark");
  });
});

