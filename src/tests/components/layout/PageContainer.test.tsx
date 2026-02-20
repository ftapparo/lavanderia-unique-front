import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PageContainer from "@/components/layout/PageContainer";

describe("PageContainer", () => {
  it("supports wide size variant", () => {
    const { container } = render(<PageContainer size="wide" className="extra" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("max-w-6xl");
    expect(root.className).toContain("extra");
  });
});
