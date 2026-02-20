import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ComponentsShowcaseFour from "@/pages/dashboard/ComponentsShowcaseFour";
import { TooltipProvider } from "@/components/ui/primitives";

const { notifyMock, toastMock } = vi.hoisted(() => ({
  notifyMock: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
  toastMock: Object.assign(vi.fn(), {
    loading: vi.fn(() => "job-1"),
    success: vi.fn(),
    promise: vi.fn(),
  }),
}));

vi.mock("@/lib/notify", () => ({ notify: notifyMock }));
vi.mock("@/components/ui/sonner", () => ({ toast: toastMock }));

describe("ComponentsShowcaseFour behaviors", () => {
  it("runs loading/promise/action toast flows", () => {
    vi.useFakeTimers();

    render(
      <TooltipProvider>
        <ComponentsShowcaseFour />
      </TooltipProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Loading para Success" }));
    expect(toastMock.loading).toHaveBeenCalled();

    vi.advanceTimersByTime(1600);
    expect(toastMock.success).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Promise Toast" }));
    expect(toastMock.promise).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Toast com acao" }));
    expect(toastMock).toHaveBeenCalled();

    const actionConfig = toastMock.mock.calls.at(-1)?.[1];
    expect(actionConfig).toBeDefined();
    actionConfig.action.onClick();
    expect(notifyMock.success).toHaveBeenCalledWith("Atualizacao iniciada");

    vi.useRealTimers();
  });
});
