import { describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToast, toast, reducer } from "@/hooks/use-toast";

describe("use-toast legacy hook", () => {
  it("reducer handles add/update/remove states", () => {
    const base = { toasts: [] as any[] };
    const added = reducer(base, { type: "ADD_TOAST", toast: { id: "1", open: true } as any });
    expect(added.toasts).toHaveLength(1);

    const updated = reducer(added, { type: "UPDATE_TOAST", toast: { id: "1", title: "x" } as any });
    expect(updated.toasts[0].title).toBe("x");

    const removed = reducer(updated, { type: "REMOVE_TOAST", toastId: "1" });
    expect(removed.toasts).toHaveLength(0);
  });

  it("exposes toast and dismiss handlers", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({ title: "hello" });
    });

    expect(result.current.toasts.length).toBeGreaterThan(0);

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.toasts.every((item) => item.open === false)).toBe(true);
  });

  it("covers dismiss/remove reducer branches", () => {
    const state = {
      toasts: [
        { id: "1", open: true } as any,
        { id: "2", open: true } as any,
      ],
    };

    const dismissedOne = reducer(state, { type: "DISMISS_TOAST", toastId: "1" });
    expect(dismissedOne.toasts.find((t) => t.id === "1")?.open).toBe(false);
    expect(dismissedOne.toasts.find((t) => t.id === "2")?.open).toBe(true);

    const dismissedAll = reducer(state, { type: "DISMISS_TOAST" });
    expect(dismissedAll.toasts.every((t) => t.open === false)).toBe(true);

    const removedAll = reducer(state, { type: "REMOVE_TOAST" });
    expect(removedAll.toasts).toHaveLength(0);
  });

  it("supports toast update/dismiss helpers and onOpenChange", () => {
    const { result } = renderHook(() => useToast());

    let controls: ReturnType<typeof toast> | undefined;
    act(() => {
      controls = toast({ title: "legacy" });
    });

    expect(controls).toBeDefined();
    const toastId = controls!.id;

    act(() => {
      controls!.update({ id: toastId, title: "updated", open: true } as any);
    });
    expect(result.current.toasts[0]?.title).toBe("updated");

    act(() => {
      result.current.toasts[0]?.onOpenChange?.(false);
    });
    expect(result.current.toasts[0]?.open).toBe(false);

    act(() => {
      controls!.dismiss();
    });
    expect(result.current.toasts[0]?.open).toBe(false);
  });
});
