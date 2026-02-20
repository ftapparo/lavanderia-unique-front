import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "@/components/ui/composites/date-picker";

vi.mock("@/components/ui/calendar", () => ({
  Calendar: ({ onSelect }: { onSelect?: (date?: Date) => void }) => (
    <button type="button" onClick={() => onSelect?.(new Date("2026-02-12T00:00:00"))}>pick-date</button>
  ),
}));

describe("DatePicker", () => {
  it("opens and triggers onChange", () => {
    const onChange = vi.fn();
    render(<DatePicker onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /Selecione a data/i }));
    fireEvent.click(screen.getByRole("button", { name: "pick-date" }));

    expect(onChange).toHaveBeenCalled();
  });

  it("respects disabled state", () => {
    render(<DatePicker disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
