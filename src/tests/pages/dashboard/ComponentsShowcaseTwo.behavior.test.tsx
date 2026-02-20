import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ComponentsShowcaseTwo from "@/pages/dashboard/ComponentsShowcaseTwo";
import { TooltipProvider } from "@/components/ui/primitives";

describe("ComponentsShowcaseTwo behaviors", () => {
  it("updates slider/progress value with step buttons", () => {
    render(
      <TooltipProvider>
        <ComponentsShowcaseTwo />
      </TooltipProvider>,
    );

    expect(screen.getAllByText("35%").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "+10%" }));
    expect(screen.getAllByText("45%").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "-10%" }));
    expect(screen.getAllByText("35%").length).toBeGreaterThan(0);
  });
});
