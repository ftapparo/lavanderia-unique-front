import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TimePicker } from "@/components/ui/composites/time-picker";

describe("TimePicker", () => {
  it("changes value by click and does not change on scroll", () => {
    const onChange = vi.fn();
    render(<TimePicker value="14:30" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "14:30" }));

    const scrollers = document.querySelectorAll(".no-scrollbar");
    fireEvent.scroll(scrollers[0] as HTMLElement);
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getAllByRole("button", { name: "15" })[0]);
    expect(onChange).toHaveBeenCalledWith("15:30");
  }, 15000);

  it("renders looped lists with repeated hour options", () => {
    render(<TimePicker value="00:00" loop />);
    fireEvent.click(screen.getByRole("button", { name: "00:00" }));

    const repeatedHourButtons = screen.getAllByRole("button", { name: "00" });
    expect(repeatedHourButtons.length).toBeGreaterThan(1);
  }, 15000);
});
