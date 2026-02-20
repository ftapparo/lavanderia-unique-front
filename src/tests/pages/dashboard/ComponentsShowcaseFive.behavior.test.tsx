import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ComponentsShowcaseFive from "@/pages/dashboard/ComponentsShowcaseFive";

vi.mock("@/components/ui/composites", async () => {
  const actual = await vi.importActual<object>("@/components/ui/composites");
  return {
    ...actual,
    DatePicker: ({ onChange }: { onChange?: (date: Date | undefined) => void }) => (
      <button type="button" onClick={() => onChange?.(new Date("2026-03-12T00:00:00"))}>
        mock-date-picker
      </button>
    ),
    TimePicker: ({ onChange }: { onChange?: (value: string) => void }) => (
      <button type="button" onClick={() => onChange?.("09:45")}>
        mock-time-picker
      </button>
    ),
    DateTimePicker: ({ onChange }: { onChange?: (value: string) => void }) => (
      <button type="button" onClick={() => onChange?.("2026-04-10T11:20")}>
        mock-datetime-picker
      </button>
    ),
  };
});

describe("ComponentsShowcaseFive behaviors", () => {
  it("updates preview values when date/time/datetime changes", () => {
    render(<ComponentsShowcaseFive />);

    fireEvent.click(screen.getByRole("button", { name: "mock-date-picker" }));
    expect(screen.getByText("2026-03-12")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "mock-time-picker" }));
    expect(screen.getByText("09:45")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "mock-datetime-picker" }));
    expect(screen.getByText("2026-04-10")).toBeInTheDocument();
    expect(screen.getByText("11:20")).toBeInTheDocument();
  });
});
