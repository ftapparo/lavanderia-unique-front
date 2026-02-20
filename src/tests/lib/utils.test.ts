import { describe, expect, it } from "vitest";
import { cn, humanizeLabel } from "@/lib/utils";

describe("utils", () => {
  it("merges class names with twMerge", () => {
    expect(cn("px-2", "px-4", "text-sm")).toBe("px-4 text-sm");
  });

  it("humanizes labels from mixed formats", () => {
    expect(humanizeLabel("user_name")).toBe("user name");
    expect(humanizeLabel("HTTPStatus200")).toBe("HTTP Status 200");
    expect(humanizeLabel("myValue2Text")).toBe("my Value 2 Text");
  });
});
