import { describe, expect, it } from "vitest";
import { sortMembershipsForColumns, validateMembershipRules } from "@/lib/membership-rules";

describe("membership rules", () => {
  it("blocks when unit already has 3 active memberships", () => {
    const memberships = [
      { userId: "1", profile: "PROPRIETARIO", startDate: "2026-01-01", endDate: null, active: true },
      { userId: "2", profile: "LOCATARIO", startDate: "2026-01-01", endDate: null, active: true },
      { userId: "3", profile: "ADMINISTRADOR", startDate: "2026-01-01", endDate: null, active: true },
    ];
    expect(validateMembershipRules(memberships, "PROPRIETARIO", null)).toContain("máximo de 3");
  });

  it("requires owner when creating tenant/admin/guest", () => {
    const memberships = [
      { userId: "1", profile: "ADMINISTRADOR", startDate: "2026-01-01", endDate: null, active: true },
    ];
    expect(validateMembershipRules(memberships, "LOCATARIO", null)).toContain("proprietário");
    expect(validateMembershipRules(memberships, "ADMINISTRADOR", null)).toContain("proprietário");
    expect(validateMembershipRules(memberships, "HOSPEDE", "2026-12-31")).toContain("proprietário");
  });

  it("blocks guest when unit has active tenant", () => {
    const memberships = [
      { userId: "1", profile: "PROPRIETARIO", startDate: "2026-01-01", endDate: null, active: true },
      { userId: "2", profile: "LOCATARIO", startDate: "2026-01-02", endDate: null, active: true },
    ];
    expect(validateMembershipRules(memberships, "HOSPEDE", "2026-12-31")).toContain("locatário");
  });

  it("requires end date for guest and allows optional end date for tenant/admin", () => {
    const memberships = [
      { userId: "1", profile: "PROPRIETARIO", startDate: "2026-01-01", endDate: null, active: true },
    ];
    expect(validateMembershipRules(memberships, "HOSPEDE", null)).toContain("data de fim");
    expect(validateMembershipRules(memberships, "LOCATARIO", null)).toBeNull();
    expect(validateMembershipRules(memberships, "ADMINISTRADOR", null)).toBeNull();
  });

  it("sorts for columns by profile priority and start date", () => {
    const sorted = sortMembershipsForColumns([
      { userId: "1", profile: "HOSPEDE", startDate: "2026-03-01", endDate: "2026-03-20", active: true },
      { userId: "2", profile: "LOCATARIO", startDate: "2026-02-01", endDate: null, active: true },
      { userId: "3", profile: "PROPRIETARIO", startDate: "2026-02-10", endDate: null, active: true },
      { userId: "4", profile: "ADMINISTRADOR", startDate: "2026-01-01", endDate: null, active: true },
      { userId: "5", profile: "PROPRIETARIO", startDate: "2026-01-01", endDate: null, active: true },
    ]);

    expect(sorted.map((m) => m.userId)).toEqual(["5", "3", "4", "2", "1"]);
  });
});
