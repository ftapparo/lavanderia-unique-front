import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DateTimePicker } from "@/components/ui/composites/datetime-picker";

vi.mock("@/components/ui/calendar", () => ({
  Calendar: ({ onSelect }: { onSelect?: (date?: Date) => void }) => (
    <button type="button" onClick={() => onSelect?.(new Date("2026-02-12T00:00:00"))}>pick-date</button>
  ),
}));

describe("DateTimePicker", () => {
  it("syncs date and time into ISO value", () => {
    const onChange = vi.fn();
    render(<DateTimePicker value="2026-02-10T14:30" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /2026/i }));
    fireEvent.click(screen.getByRole("button", { name: "pick-date" }));

    fireEvent.click(screen.getAllByRole("button", { name: "15" })[0]);

    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.at(-1)?.[0]).toMatch(/^2026-02-12T15:/);
  }, 15000);
});
