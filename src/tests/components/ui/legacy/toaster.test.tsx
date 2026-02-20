import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Toaster } from "@/components/ui/toaster";

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toasts: [{ id: "1", title: "Toast 1", description: "Desc", open: true }],
  }),
}));

describe("Toaster legacy component", () => {
  it("renders toasts from hook state", () => {
    render(<Toaster />);
    expect(screen.getByText("Toast 1")).toBeInTheDocument();
    expect(screen.getByText("Desc")).toBeInTheDocument();
  });
});
