import { describe, expect, it, vi } from "vitest";

const { toastMock } = vi.hoisted(() => ({
  toastMock: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("@/components/ui/sonner", () => ({
  toast: toastMock,
}));

import { notify } from "@/lib/notify";

describe("notify", () => {
  it("maps helper methods to sonner toast", () => {
    notify.success("ok", { description: "done" });
    notify.error("err");
    notify.warning("warn");
    notify.info("info");

    expect(toastMock.success).toHaveBeenCalledWith("ok", { description: "done" });
    expect(toastMock.error).toHaveBeenCalledWith("err", undefined);
    expect(toastMock.warning).toHaveBeenCalledWith("warn", undefined);
    expect(toastMock.info).toHaveBeenCalledWith("info", undefined);
  });
});
