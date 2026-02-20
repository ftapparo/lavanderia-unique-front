import { describe, expect, it } from "vitest";
import { toast, useToast } from "@/components/ui/use-toast";

describe("ui/use-toast re-export", () => {
  it("re-exports hook and toast function", () => {
    expect(typeof toast).toBe("function");
    expect(typeof useToast).toBe("function");
  });
});
