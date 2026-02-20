import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime, isValidDate, joinDateTime, splitDateTime, toIsoDate } from "@/components/ui/foundation/date-time.utils";

describe("date-time.utils", () => {
  it("formats and parses date values", () => {
    const date = new Date("2026-02-12T00:00:00");
    expect(toIsoDate(date)).toBe("2026-02-12");
    expect(formatDate(date, "pt-BR")).toContain("2026");
  });

  it("joins and splits datetime string", () => {
    expect(joinDateTime("2026-02-12", "17:35")).toBe("2026-02-12T17:35");
    expect(splitDateTime("2026-02-12T17:35:00")).toEqual({ date: "2026-02-12", time: "17:35" });
  });

  it("handles validation and invalid datetime format", () => {
    expect(isValidDate("2026-02-12")).toBe(true);
    expect(isValidDate("not-a-date")).toBe(false);
    expect(formatDateTime("not-a-date", "pt-BR")).toBe("Data invalida");
  });
});
